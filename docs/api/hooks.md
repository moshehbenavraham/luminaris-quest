# Custom Hooks API Reference

**Reusable Logic Hooks for Luminaris Quest**

---

## Overview

Luminaris Quest uses **10 custom React hooks** to extract reusable logic from components. Hooks follow the React Hooks naming convention (`use*`) and enable clean, testable, and composable code.

---

## Hook Categories

### State Management (2)
- `useGameStore` - Main game state access
- `useGameStoreBase` - Direct store access (no hydration safety)

### Combat System (2)
- `useCombat` - Combat interface and derived state
- `useCombatSounds` - Audio integration for combat actions

### System Utilities (3)
- `use-auto-save` - Automatic game state persistence
- `use-database-health` - Database connection monitoring
- `use-energy-regeneration` - Passive energy recovery

### UI Utilities (2)
- `use-mobile` - Responsive breakpoint detection
- `useImpactfulImage` - Image optimization and loading

### Framework Integration (1)
- `use-toast` - shadcn/ui toast notifications

---

## State Management Hooks

### `useGameStore()`

**File:** `src/store/game-store.ts`

**Purpose:** Hydration-safe access to game state

**Signature:**
```typescript
export const useGameStore = (): GameState => {
  // Returns safe defaults until hydration complete
  // Then returns actual store state
}
```

**Usage:**
```typescript
// Full state access
const state = useGameStore();

// Selective subscription (recommended)
const guardianTrust = useGameStore(state => state.guardianTrust);

// Multiple values
const { setGuardianTrust, addJournalEntry } = useGameStore();
```

**Returns:** `GameState` interface with all state and actions

**Hydration Safety:** Returns default values until `_hasHydrated: true`

---

### `useGameStoreBase()`

**File:** `src/store/game-store.ts`

**Purpose:** Direct Zustand store access (no hydration safety)

**Usage:**
```typescript
import { useGameStoreBase } from '@/store/game-store';

// Use in non-rendering contexts or when hydration doesn't matter
const saveToSupabase = useGameStoreBase(state => state.saveToSupabase);
```

**Warning:** May cause hydration mismatches if used in SSR contexts

---

## Combat System Hooks

### `useCombat()`

**File:** `src/hooks/useCombat.ts`

**Purpose:** Combat interface with derived state and validation

**Signature:**
```typescript
export interface CombatHookReturn {
  // Combat state
  isActive: boolean;
  enemy: ShadowManifestation | null;
  resources: { lp: number; sp: number };
  turn: number;
  log: CombatLogEntry[];
  
  // Status effects
  statusEffects: {
    damageMultiplier: number;
    damageReduction: number;
    healingBlocked: boolean;
    lpGenerationBlocked: boolean;
    skipNextTurn: boolean;
    consecutiveEndures: number;
  };
  
  // Actions
  performAction: (action: CombatAction) => void;
  endTurn: () => void;
  
  // Validation
  canUseAction: (action: CombatAction) => boolean;
  getActionCost: (action: CombatAction) => { lp?: number; sp?: number };
  getActionDescription: (action: CombatAction) => string;
  
  // Derived state
  isPlayerTurn: boolean;
  combatStatus: 'ongoing' | 'victory' | 'defeat';
  getTherapeuticInsight: () => string;
}

export function useCombat(): CombatHookReturn {
  // Implementation
}
```

**Usage:**
```typescript
function CombatUI() {
  const combat = useCombat();
  
  const handleAttack = () => {
    if (combat.canUseAction('ILLUMINATE')) {
      combat.performAction('ILLUMINATE');
    }
  };
  
  return (
    <div>
      <p>LP: {combat.resources.lp}</p>
      <p>SP: {combat.resources.sp}</p>
      <button onClick={handleAttack} disabled={!combat.canUseAction('ILLUMINATE')}>
        ILLUMINATE (Cost: {combat.getActionCost('ILLUMINATE').lp} LP)
      </button>
    </div>
  );
}
```

**Key Features:**
- Action validation before execution
- Derived combat status
- Real-time resource tracking
- Status effect management
- Therapeutic insight generation

---

### `useCombatSounds()`

**File:** `src/hooks/useCombatSounds.ts`

**Purpose:** Play sound effects for combat actions

**Signature:**
```typescript
export function useCombatSounds(): {
  playActionSound: (action: CombatAction) => void;
  playVictorySound: () => void;
  playDefeatSound: () => void;
  playShadowAttackSound: () => void;
}
```

**Usage:**
```typescript
function CombatComponent() {
  const { playActionSound, playVictorySound } = useCombatSounds();
  
  const handleAction = (action: CombatAction) => {
    executeCombatAction(action);
    playActionSound(action);
  };
  
  useEffect(() => {
    if (combatEnded && victory) {
      playVictorySound();
    }
  }, [combatEnded, victory]);
}
```

**Sound Mapping:**
- ILLUMINATE → 'illuminate-action'
- REFLECT → 'reflect-action'
- ENDURE → 'endure-action'
- EMBRACE → 'embrace-action'
- Shadow attack → 'shadow-attack'
- Victory → 'combat-victory'
- Defeat → 'combat-defeat'

---

## System Utility Hooks

### `use-auto-save()`

**File:** `src/hooks/use-auto-save.ts`

**Purpose:** Automatic game state persistence to Supabase

**Signature:**
```typescript
interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number;        // Default: 30000ms (30s)
  debounceDelay?: number;  // Default: 5000ms (5s)
}

export function useAutoSave(options?: AutoSaveOptions): {
  saveNow: () => Promise<void>;
  isSaving: boolean;
  lastSaveTime: number | null;
  saveError: string | null;
}
```

**Usage:**
```typescript
function App() {
  const { saveNow, isSaving } = useAutoSave({
    enabled: true,
    interval: 30000
  });
  
  // Manual save
  const handleSaveButton = async () => {
    await saveNow();
  };
  
  return (
    <div>
      {isSaving && <Spinner />}
      <button onClick={handleSaveButton}>Save Now</button>
    </div>
  );
}
```

**Triggers:**
- Interval: Every 30 seconds (if changes)
- Debounce: 5 seconds after last change
- Visibility: Tab focus/blur
- Unload: Before page close
- Manual: `saveNow()` call

**Retry Logic:** Up to 3 attempts with exponential backoff

---

### `use-database-health()`

**File:** `src/hooks/use-database-health.ts`

**Purpose:** Monitor database connection status

**Signature:**
```typescript
export function useDatabaseHealth(): {
  isConnected: boolean;
  responseTime: number;
  lastChecked: number;
  error: string | null;
  environment: 'development' | 'production' | 'test';
  performCheck: () => Promise<void>;
}
```

**Usage:**
```typescript
function StatusBar() {
  const { isConnected, responseTime } = useDatabaseHealth();
  
  return (
    <div>
      Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}
      {isConnected && <span>({responseTime}ms)</span>}
    </div>
  );
}
```

**Check Frequency:**
- Development: Every 60 seconds
- Production: Every 5 minutes

---

### `use-energy-regeneration()`

**File:** `src/hooks/use-energy-regeneration.ts`

**Purpose:** Passive energy recovery outside combat

**Signature:**
```typescript
export function useEnergyRegeneration(): {
  isActive: boolean;
  currentEnergy: number;
  maxEnergy: number;
  regenRate: number; // Energy per minute
}
```

**Usage:**
```typescript
// Automatically starts on component mount
function Adventure() {
  useEnergyRegeneration(); // That's it!
  
  // Energy regenerates automatically in background
}
```

**Regeneration:**
- Rate: 1 energy per minute
- Paused: During combat
- Capped: At `maxPlayerEnergy`

---

## UI Utility Hooks

### `use-mobile()`

**File:** `src/hooks/use-mobile.tsx`

**Purpose:** Detect mobile breakpoint for responsive design

**Signature:**
```typescript
export function useIsMobile(): boolean;
```

**Usage:**
```typescript
function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

**Breakpoint:** 768px (matches Tailwind's `md:` breakpoint)

**SSR-Safe:** Returns `false` until hydration complete

---

### `useImpactfulImage()`

**File:** `src/hooks/useImpactfulImage.ts`

**Purpose:** Optimize image loading with modern formats

**Signature:**
```typescript
export function useImpactfulImage(imageConfig: ImageConfig): {
  sources: Array<{ srcset: string; type: string }>;
  fallbackSrc: string;
  isLoading: boolean;
  hasError: boolean;
}
```

**Usage:**
```typescript
const heroImage = imageRegistry.homeHero;
const { sources, fallbackSrc, isLoading } = useImpactfulImage(heroImage);

return (
  <picture>
    {sources.map((source, i) => (
      <source key={i} srcSet={source.srcset} type={source.type} />
    ))}
    <img src={fallbackSrc} alt={heroImage.alt} loading="eager" />
  </picture>
);
```

**Supported Formats:**
1. AVIF (best compression, 50-80% smaller)
2. WebP (good compression, 30-50% smaller)
3. JPEG/PNG (fallback)

---

### `use-toast()`

**File:** `src/hooks/use-toast.ts`

**Purpose:** Display toast notifications (shadcn/ui wrapper)

**Signature:**
```typescript
export function useToast(): {
  toast: (options: ToastOptions) => void;
  dismiss: (toastId?: string) => void;
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}
```

**Usage:**
```typescript
function SaveButton() {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      await saveToSupabase();
      toast({
        title: 'Saved!',
        description: 'Your progress has been saved.',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
}
```

---

## Hook Testing Examples

### Testing `useCombat()`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCombat } from '@/hooks/useCombat';

describe('useCombat', () => {
  it('validates action costs', () => {
    const { result } = renderHook(() => useCombat());
    
    // ILLUMINATE costs 2 LP
    expect(result.current.canUseAction('ILLUMINATE')).toBe(false);
    
    act(() => {
      // Give player resources
      modifyLightPoints(5);
    });
    
    expect(result.current.canUseAction('ILLUMINATE')).toBe(true);
  });
});
```

### Testing `use-auto-save()`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';

describe('useAutoSave', () => {
  it('saves after interval', async () => {
    const { result } = renderHook(() => useAutoSave({ interval: 1000 }));
    
    // Make changes
    act(() => {
      setGuardianTrust(60);
    });
    
    // Wait for auto-save
    await waitFor(() => {
      expect(result.current.lastSaveTime).not.toBeNull();
    }, { timeout: 2000 });
  });
});
```

---

## Best Practices

### 1. Use Hooks at Top Level

```typescript
// ✅ GOOD: At component top level
function MyComponent() {
  const combat = useCombat();
  const isMobile = useIsMobile();
  
  return <div>...</div>;
}

// ❌ BAD: Inside conditional
function MyComponent() {
  if (condition) {
    const combat = useCombat(); // ❌ Violates Rules of Hooks
  }
}
```

### 2. Prefer Selective Subscriptions

```typescript
// ✅ GOOD: Subscribe to specific state
const guardianTrust = useGameStore(state => state.guardianTrust);

// ❌ BAD: Subscribe to entire store
const store = useGameStore();
const trust = store.guardianTrust;
```

### 3. Extract Complex Logic to Hooks

```typescript
// ✅ GOOD: Reusable hook
function useSceneProgress() {
  const currentIndex = useGameStore(state => state.currentSceneIndex);
  const totalScenes = 20;
  const percentage = (currentIndex / totalScenes) * 100;
  return { currentIndex, totalScenes, percentage };
}

// Use in multiple components
function Component1() {
  const { percentage } = useSceneProgress();
  return <Progress value={percentage} />;
}
```

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [State Management](../architecture/state-management.md)
- [Game Engine API](./game-engine.md)
- [Testing Guide](../guides/testing.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: src/hooks/ directory*

