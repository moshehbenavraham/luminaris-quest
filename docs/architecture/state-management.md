# State Management Documentation

**Zustand Store Architecture and Implementation**

---

## Overview

Luminaris Quest uses **Zustand 5.0+** for centralized state management. Zustand provides a simple, performant, and type-safe alternative to Redux with built-in persistence and optimistic updates.

**Why Zustand?**
- Minimal boilerplate
- Excellent TypeScript support
- Built-in persistence middleware
- Selective subscriptions (no unnecessary re-renders)
- DevTools integration
- Small bundle size (~1 KB)

---

## Store Structure

### Location

**File:** `src/store/game-store.ts` (1,837 lines)

### Core State

```typescript
export interface GameState {
  // Player progression
  guardianTrust: number;              // 0-100
  playerLevel: number;                // 1+
  currentSceneIndex: number;          // 0-39
  experiencePoints: number;           // 0+
  experienceToNext: number;           // XP needed for next level
  
  // Resources
  playerHealth: number;               // 0-100
  maxPlayerHealth: number;            // 100
  playerEnergy: number;               // 0-100
  maxPlayerEnergy: number;            // 100+
  lightPoints: number;                // 0+
  shadowPoints: number;               // 0+
  
  // Collections
  journalEntries: JournalEntry[];
  milestones: Milestone[];
  sceneHistory: CompletedScene[];
  pendingMilestoneJournals: Set<number>;
  
  // Combat state
  combat: CombatState;
  
  // System state
  saveState: SaveState;
  healthStatus: DatabaseHealthStatus;
  
  // Internal flags
  _hasHydrated: boolean;
  _isHealthMonitoringActive: boolean;
  _isEnergyRegenActive: boolean;
}
```

---

## State Actions

### Guardian Trust

```typescript
setGuardianTrust: (trust: number) => void
updateMilestone: (level: number) => void
markMilestoneJournalShown: (level: number) => void
```

### Journal

```typescript
addJournalEntry: (entry: JournalEntry) => void
updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void
deleteJournalEntry: (id: string) => void
```

### Combat

```typescript
startCombat: (enemyId: string, sceneDC?: number) => void
executeCombatAction: (action: CombatAction) => void
endTurn: () => void
endCombat: (victory: boolean) => void
```

### Resources

```typescript
modifyPlayerHealth: (delta: number) => void
healPlayerHealth: (amount: number) => void
setPlayerHealth: (health: number) => void
modifyPlayerEnergy: (delta: number) => void
setPlayerEnergy: (energy: number) => void
modifyLightPoints: (delta: number) => void
modifyShadowPoints: (delta: number) => void
convertShadowToLight: (amount: number) => void
```

### Persistence

```typescript
saveToSupabase: () => Promise<void>
loadFromSupabase: () => Promise<void>
resetGame: () => void
checkUnsavedChanges: () => boolean
clearSaveError: () => void
```

---

## Persistence Strategy

### Three-Layer Persistence

**Layer 1: Memory (Zustand)**
- Immediate updates
- Synchronous access
- Lost on page refresh

**Layer 2: localStorage**
- Automatic persistence via middleware
- Survives page refresh
- Single-device only

**Layer 3: Supabase Database**
- Cloud persistence
- Cross-device sync
- Long-term backup

### Persistence Flow

```typescript
// Writing data
User Action → Zustand Update → localStorage (immediate) → Supabase (30s delay or trigger)

// Reading data
Page Load → localStorage Hydration → Zustand → Supabase Sync (if authenticated)
```

### Configuration

```typescript
persist(
  (set, get) => ({ /* state and actions */ }),
  {
    name: 'luminari-game-state',
    
    // Only persist these fields
    partialize: (state) => ({
      guardianTrust: state.guardianTrust,
      playerLevel: state.playerLevel,
      currentSceneIndex: state.currentSceneIndex,
      journalEntries: state.journalEntries.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(), // Convert Date to string
      })),
      // ... other fields
    }),
    
    // Transform data on rehydration
    merge: (persistedState: any, currentState) => {
      return {
        ...currentState,
        ...persistedState,
        journalEntries: persistedState.journalEntries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp), // Convert string back to Date
        })),
      };
    },
    
    // Mark hydration complete
    onRehydrateStorage: () => (state) => {
      state?._setHasHydrated(true);
    },
  }
)
```

---

## Hydration Safety

### The Problem

React's server-side rendering (SSR) and hydration can cause mismatches:

```typescript
// Server: renders with initial state
<div>Trust: 50</div>

// Client: hydrates with localStorage state
<div>Trust: 67</div>

// Result: React hydration error!
```

### The Solution

```typescript
export const useGameStore = () => {
  const store = useGameStoreBase();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return safe initial values until hydration complete
  if (!hasMounted || !store._hasHydrated) {
    return {
      guardianTrust: 50,
      playerLevel: 1,
      // ... safe defaults
      
      // BUT allow real-time values for combat
      lightPoints: store.lightPoints,
      shadowPoints: store.shadowPoints,
      // ... (prevents combat UI flicker)
    };
  }

  return store; // Return actual store after hydration
};
```

**Benefits:**
- No hydration mismatches
- Prevents UI flicker
- Real-time combat updates still work
- Safe default values shown during load

---

## Selective Subscriptions

### Optimization Pattern

```typescript
// ❌ BAD: Component re-renders on ANY state change
function MyComponent() {
  const state = useGameStore();
  return <div>{state.guardianTrust}</div>;
}

// ✅ GOOD: Component only re-renders when trust changes
function MyComponent() {
  const guardianTrust = useGameStore(state => state.guardianTrust);
  return <div>{guardianTrust}</div>;
}
```

**Performance Impact:**
- Bad: ~100 re-renders per minute (all state changes)
- Good: ~5 re-renders per minute (only trust changes)

### Derived State

```typescript
// ✅ Use selectors for derived state
const trustPercentage = useGameStore(
  state => Math.floor((state.guardianTrust / 100) * 100)
);

// ✅ Combine multiple values
const combatResources = useGameStore(
  state => ({ lp: state.lightPoints, sp: state.shadowPoints })
);

// ✅ Memoize complex calculations
const experienceProgress = useGameStore(state => {
  const { experiencePoints, experienceToNext } = state;
  return {
    current: experiencePoints,
    toNext: experienceToNext,
    percentage: (experiencePoints / (experiencePoints + experienceToNext)) * 100
  };
});
```

---

## Auto-Save System

### Hook: `useAutoSave()`

**Configuration:**
```typescript
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 5000;      // 5 seconds after last change
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;         // 2 seconds between retries
```

**Triggers:**
1. **Interval**: Every 30 seconds (if unsaved changes)
2. **Debounce**: 5 seconds after last state change
3. **Visibility**: On tab switch/focus
4. **Unload**: Before page close (best effort)
5. **Manual**: `saveNow()` function call

**Retry Logic:**
```typescript
// Exponential backoff on failure
Attempt 1: Immediate
Attempt 2: 2 seconds delay
Attempt 3: 4 seconds delay
Give up: Show error to user
```

**Error Handling:**
```typescript
export enum SaveErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',           // Retry
  PERMISSION_ERROR = 'PERMISSION_ERROR',     // Don't retry
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // Don't retry
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', // Don't retry
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'            // Retry
}
```

---

## Combat State Management

### Combat Sub-Store

```typescript
export interface CombatState {
  inCombat: boolean;
  currentEnemy: ShadowManifestation | null;
  resources: { lp: number; sp: number };
  turn: number;
  log: CombatLogEntry[];
  sceneDC: number;
  
  // Status effects
  damageMultiplier: number;
  damageReduction: number;
  healingBlocked: number;
  lpGenerationBlocked: number;
  skipNextTurn: boolean;
  consecutiveEndures: number;
  
  // Therapeutic tracking
  preferredActions: Record<CombatAction, number>;
  growthInsights: string[];
  combatReflections: JournalEntry[];
}
```

**Combat Flow:**
```typescript
1. startCombat(enemyId, sceneDC)
   → Set inCombat: true
   → Create shadow manifestation
   → Initialize resources

2. executeCombatAction(action)
   → Validate action
   → Execute player action
   → Add to combat log
   → Check combat end

3. endTurn()
   → Execute shadow action
   → Process status effects
   → Increment turn counter
   → Check combat end

4. endCombat(victory)
   → Apply rewards
   → Sync resources to main state
   → Reset combat state
   → Set inCombat: false
```

---

## Best Practices

### 1. Always Use Actions, Never Direct Mutation

```typescript
// ❌ BAD: Direct mutation
useGameStore.setState({ guardianTrust: 55 });

// ✅ GOOD: Use action
const { setGuardianTrust } = useGameStore();
setGuardianTrust(55);
```

**Why?**
- Actions include business logic
- Validation and bounds checking
- Triggers side effects (milestone checking, auto-save)
- Maintains consistency

### 2. Prefer Selective Subscriptions

```typescript
// ❌ BAD: Over-subscribing
const { guardianTrust, playerEnergy, lightPoints } = useGameStore();

// ✅ GOOD: Selective
const guardianTrust = useGameStore(state => state.guardianTrust);
```

### 3. Use Immutable Updates

```typescript
// ✅ GOOD: Create new arrays/objects
set((state) => ({
  journalEntries: [...state.journalEntries, newEntry],
}));

// ❌ BAD: Mutate existing array
set((state) => {
  state.journalEntries.push(newEntry); // Mutation!
  return state;
});
```

### 4. Mark Unsaved Changes

```typescript
// Always update saveState when changing game data
set((state) => ({
  guardianTrust: newTrust,
  saveState: { ...state.saveState, hasUnsavedChanges: true }
}));
```

---

## Testing State

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';

describe('useGameStore', () => {
  it('updates guardian trust', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setGuardianTrust(75);
    });
    
    expect(result.current.guardianTrust).toBe(75);
  });
  
  it('clamps trust to bounds', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setGuardianTrust(150); // Over 100
    });
    
    expect(result.current.guardianTrust).toBe(100); // Clamped
  });
});
```

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Database Schema](./database.md)
- [API Documentation](../api/index.md)
- [Journal System](../features/journal.md)
- [Guardian Trust System](../features/guardian-trust.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: src/store/game-store.ts*

