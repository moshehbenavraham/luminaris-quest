# Guardian Trust System Documentation

**The Core Progression Mechanic of Luminari's Quest**

---

## Overview

The Guardian Trust system is the central therapeutic progression mechanic in Luminari's Quest. It represents the growing bond between the player and their guardian spirit, serving as both a gameplay mechanic and a metaphor for building trust in therapeutic relationships.

**Key Characteristics:**
- Range: 0-100 (strictly bounded)
- Starting Value: 50 (middle ground)
- Persistent across sessions
- Affects combat effectiveness, story outcomes, and milestone unlocks
- Therapeutic metaphor for relationship building and self-trust

---

## System Design

### State Management

**Location:** `src/store/game-store.ts`

```typescript
// Guardian Trust in GameState interface
export interface GameState {
  guardianTrust: number;  // Current trust level (0-100)
  milestones: Milestone[]; // Achievement markers at 25, 50, 75
  setGuardianTrust: (trust: number) => void;
  updateMilestone: (level: number) => void;
}

// Initial state
guardianTrust: 50,
milestones: [
  { id: 'milestone-25', level: 25, label: 'Inner Strength', achieved: false },
  { id: 'milestone-50', level: 50, label: 'Finding Balance', achieved: false },
  { id: 'milestone-75', level: 75, label: 'Deep Connection', achieved: false },
]
```

### Data Storage

**Database Table:** `game_states`

```sql
CREATE TABLE game_states (
  user_id UUID PRIMARY KEY,
  guardian_trust INTEGER NOT NULL DEFAULT 50 CHECK (guardian_trust >= 0 AND guardian_trust <= 100),
  -- other fields...
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Constraints:**
- NOT NULL: Trust must always have a value
- DEFAULT 50: New players start at middle trust
- CHECK (guardian_trust >= 0 AND guardian_trust <= 100): Enforces bounds

---

## How Trust Changes

### Trust Modification Sources

#### 1. Scene Outcomes

**Success (Base: +5)**
```typescript
// Source: src/components/ChoiceList.tsx lines 142-149
const baseTrustChange = diceResult.success ? 5 : -5;
const levelBenefits = getLevelBenefits(playerLevel);

// Apply trust gain multiplier only to positive changes
const multipliedTrustChange = baseTrustChange > 0 
  ? Math.round(baseTrustChange * levelBenefits.trustGainMultiplier)
  : baseTrustChange;

const newTrust = Math.min(100, Math.max(0, guardianTrust + multipliedTrustChange));
```

**Failure (Base: -5)**
- No multiplier applied to negative changes
- Minimum trust is 0 (cannot go below)

**Level-Based Multipliers:**
```typescript
// Source: src/store/game-store.ts lines 353
trustGainMultiplier: 1 + (Math.floor((level - 1) / 5) * 0.2)

// Examples:
Level 1-4:  1.0x (+5 trust)
Level 5-9:  1.2x (+6 trust)
Level 10-14: 1.4x (+7 trust)
Level 15-19: 1.6x (+8 trust)
Level 20+:  1.8x (+9 trust)
```

#### 2. Combat Outcomes

**Victory:**
- Trust increase varies by shadow type
- Typically +10 to +15
- Additional bonus from victory rewards
- Applied automatically at combat end

**Defeat:**
- Trust decrease (typically -5 to -10)
- Gentler penalty than scene failure
- Guardian still provides encouragement

#### 3. Direct Manipulation

```typescript
// Manual trust setting (with bounds enforcement)
setGuardianTrust: (trust: number) => {
  const clampedTrust = Math.max(0, Math.min(100, trust));
  set((state) => ({
    guardianTrust: clampedTrust,
    saveState: { ...state.saveState, hasUnsavedChanges: true }
  }));

  // Check for milestone achievements
  get().updateMilestone(clampedTrust);
}
```

**Bounds Enforcement:**
- Math.max(0, ...) ensures trust ≥ 0
- Math.min(100, ...) ensures trust ≤ 100
- Cannot exceed boundaries even with multipliers

---

## Milestones

### Milestone Structure

```typescript
export interface Milestone {
  id: string;              // Unique identifier
  level: number;           // Trust level threshold (25, 50, 75)
  label: string;           // Achievement name
  achieved: boolean;       // Has player reached this?
  achievedAt?: number;     // Timestamp of achievement (milliseconds)
}
```

### Milestone Definitions

| Level | ID | Label | Meaning |
|-------|---|-------|---------|
| 25 | milestone-25 | Inner Strength | First breakthrough in self-trust |
| 50 | milestone-50 | Finding Balance | Establishing equilibrium |
| 75 | milestone-75 | Deep Connection | Strong therapeutic alliance |
| 100 | - | Perfect Bond | Story completion (implied) |

### Milestone Detection & Achievement

```typescript
// Source: src/store/game-store.ts lines 507-564
updateMilestone: (trustLevel: number) => {
  set((state) => {
    // Check which milestones need to be achieved
    const milestonesToAchieve = state.milestones.filter(
      (milestone) => trustLevel >= milestone.level && !milestone.achieved
    );
    
    // If no milestones to achieve, return unchanged state
    if (milestonesToAchieve.length === 0) {
      return state;
    }
    
    // Check if we actually need to add new pending journals
    const levelsToAdd = milestonesToAchieve
      .map(m => m.level)
      .filter(level => !state.pendingMilestoneJournals.has(level));
    
    // Create new Set with pending journals
    const newPendingJournals = new Set(state.pendingMilestoneJournals);
    levelsToAdd.forEach(level => newPendingJournals.add(level));
    
    // Update milestones with achievement data
    const updatedMilestones = state.milestones.map((milestone) => {
      if (trustLevel >= milestone.level && !milestone.achieved) {
        return {
          ...milestone,
          achieved: true,
          achievedAt: Date.now(),
        };
      }
      return milestone;
    });

    return {
      milestones: updatedMilestones,
      pendingMilestoneJournals: newPendingJournals,
      saveState: { ...state.saveState, hasUnsavedChanges: true }
    };
  });
}
```

**Achievement Flow:**
1. Trust level changes via `setGuardianTrust()`
2. `updateMilestone()` called automatically
3. Check all milestones for threshold crossing
4. Mark achieved milestones with timestamp
5. Add milestone level to `pendingMilestoneJournals` Set
6. UI detects pending journal and opens modal
7. Player writes reflection
8. Milestone marked as shown via `markMilestoneJournalShown()`
9. Journal entry saved with milestone metadata

### Milestone Rewards

**Immediate Rewards:**
- **+50 XP** bonus
- **Journal prompt** (mandatory reflection)
- **Achievement badge** (Progress page)
- **Guardian message** (special congratulations)

**Long-Term Benefits:**
- **Narrative unlocks** (story progression gates)
- **Combat bonuses** (higher trust = more damage)
- **Psychological satisfaction** (sense of progress)

---

## Trust Effects on Gameplay

### 1. Combat Effectiveness

#### Illuminate Damage Scaling

```typescript
// Source: src/engine/combat-engine.ts lines 54-68
export function calculateIlluminateDamage(guardianTrust: number): number {
  const baseDamage = COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE; // 3
  const trustScaling = COMBAT_BALANCE.ILLUMINATE_TRUST_SCALING; // 4
  const trustBonus = Math.floor(guardianTrust / trustScaling);
  return baseDamage + trustBonus;
}

// Examples:
Trust 0:   3 + floor(0/4) = 3 damage
Trust 25:  3 + floor(25/4) = 3 + 6 = 9 damage
Trust 50:  3 + floor(50/4) = 3 + 12 = 15 damage
Trust 75:  3 + floor(75/4) = 3 + 18 = 21 damage
Trust 100: 3 + floor(100/4) = 3 + 25 = 28 damage
```

**Impact:** 933% damage increase from 0 to 100 trust!

#### Player Defense Calculation

```typescript
// Source: src/engine/combat-engine.ts lines 126-148
export function calculatePlayerDefense(
  state: CombatState,
  guardianTrust: number
): number {
  const lpDefense = state.resources.lp * COMBAT_BALANCE.DEFENSE_FROM_LP; // 0.5 per LP
  const trustDefense = guardianTrust * COMBAT_BALANCE.DEFENSE_FROM_TRUST; // 0.1 per trust
  return lpDefense + trustDefense;
}

// Examples:
LP: 10, Trust: 50 → (10 * 0.5) + (50 * 0.1) = 5 + 5 = 10 defense
LP: 15, Trust: 75 → (15 * 0.5) + (75 * 0.1) = 7.5 + 7.5 = 15 defense
LP: 20, Trust: 100 → (20 * 0.5) + (100 * 0.1) = 10 + 10 = 20 defense
```

**Impact:** Higher trust significantly reduces damage taken.

### 2. Scene Success Rates

**Dice Roll Modification:**
```typescript
// Player level provides bonus to rolls
// Higher trust → faster leveling → better rolls

Level 1 (Trust ~50): +0 to rolls
Level 5 (Trust ~60): +4 to rolls
Level 10 (Trust ~75): +9 to rolls

// Indirect trust benefit through faster progression
```

**Trust Gain Multiplier:**
```typescript
// Higher level → better trust multiplier → faster trust growth
// Positive feedback loop for engaged players

Level 1: +5 trust per success
Level 5: +6 trust per success (+20% more)
Level 10: +7 trust per success (+40% more)
```

### 3. Narrative Progression

**Story Gates (Not yet implemented, planned):**
```typescript
// Potential trust-gated content:
if (guardianTrust >= 25) {
  // Unlock: Guardian reveals personal story
}
if (guardianTrust >= 50) {
  // Unlock: Advanced combat techniques
}
if (guardianTrust >= 75) {
  // Unlock: Guardian's true name
}
if (guardianTrust >= 100) {
  // Unlock: Story completion, endgame content
}
```

---

## UI Display

### Trust Bar Component

**Location:** `src/components/StatsBar.tsx` and `src/components/GuardianText.tsx`

```typescript
// Trust display features:
- Progress bar (0-100 visual)
- Numeric value (e.g., "Trust: 67/100")
- Color coding based on level:
  - 0-24:   Red/Critical (needs work)
  - 25-49:  Yellow/Warning (building)
  - 50-74:  Blue/Good (established)
  - 75-100: Green/Excellent (strong bond)
```

### Guardian Message Correlation

```typescript
// Source: src/components/GuardianText.tsx lines 13-87
export function GuardianText({ trust, message, className, 'data-testid': testId }: GuardianTextProps) {
  // Trust level affects guardian's tone and styling
  // Lower trust: More concerned, supportive messages
  // Higher trust: More confident, empowering messages
  
  // Visual styling changes based on trust:
  - Border color
  - Text emphasis
  - Guardian avatar expression (future feature)
}
```

---

## Therapeutic Design Rationale

### Why 0-100 Scale?

**Advantages:**
1. **Intuitive**: Percentage-based, universally understood
2. **Bounded**: Clear start and end points
3. **Granular**: 100 discrete levels for meaningful progress
4. **Forgiving**: Starting at 50 allows movement in both directions

**Therapeutic Parallel:**
- **0-25**: Crisis/broken trust (needs significant work)
- **25-50**: Building trust (early therapeutic relationship)
- **50-75**: Established trust (working alliance formed)
- **75-100**: Deep trust (strong therapeutic bond)

### Why Start at 50?

**Design Decision:**
```typescript
guardianTrust: 50,  // Not 0 or 100
```

**Rationale:**
1. **Neutral Starting Point**: Neither distrusting nor fully trusting
2. **Both Directions**: Can increase or decrease based on choices
3. **Realistic**: Real therapeutic relationships start neutral
4. **Forgiving**: Early mistakes don't drop trust to zero
5. **Motivating**: Players see immediate progress (not starting from scratch)

### Milestone Placement

**Why 25, 50, 75?**
- **25**: Quarter mark, first breakthrough
- **50**: Midpoint, balanced state
- **75**: Three-quarters, approaching mastery
- **100**: Completion (implied but not required milestone)

**Therapeutic Stages:**
1. **Pre-25**: Resistance, uncertainty, testing
2. **25-50**: Opening up, tentative trust, early progress
3. **50-75**: Working alliance, active processing, growth
4. **75-100**: Deep work, integration, transformation

---

## Data Flow Diagram

```
User Action (Scene/Combat)
         ↓
   Calculate Outcome
         ↓
   Determine Trust Change (+/-5 base)
         ↓
   Apply Level Multiplier (positive only)
         ↓
   Clamp to Bounds (0-100)
         ↓
   setGuardianTrust(newTrust)
         ↓
   Update Game State
         ↓
   updateMilestone(newTrust)
         ↓
   Check Milestone Thresholds
         ↓
   [If crossed] Mark Achieved + Trigger Journal
         ↓
   Save to Database (auto-save)
         ↓
   UI Re-renders (trust bar updates)
```

---

## Persistence

### Local Storage (Hydration)

```typescript
// Zustand persist middleware
// Source: src/store/game-store.ts lines 1672-1731

persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'luminari-game-state',
    partialize: (state) => ({
      guardianTrust: state.guardianTrust,
      milestones: state.milestones.map((milestone) => ({
        ...milestone,
        achievedAt: milestone.achievedAt
          ? new Date(milestone.achievedAt).toISOString()
          : undefined,
      })),
      // other fields...
    }),
  }
)
```

**Storage:**
- Key: `luminari-game-state`
- Location: `localStorage`
- Format: JSON string
- Auto-hydrates on page load

### Database Persistence

```typescript
// Source: src/store/game-store.ts lines 1203-1220

const gameState = {
  user_id: user.id,
  guardian_trust: currentState.guardianTrust,
  milestones: JSON.stringify(currentState.milestones),
  // other fields...
  updated_at: new Date().toISOString(),
};

await supabase.from('game_states')
  .upsert(gameState, { onConflict: 'user_id' })
  .select();
```

**Auto-Save Triggers:**
- Every 30 seconds (if unsaved changes)
- After trust changes
- After milestone achievements
- On page visibility change
- On page unload

---

## API Reference

### Functions

#### `setGuardianTrust(trust: number): void`

Sets the Guardian Trust level with automatic bounds enforcement and milestone checking.

**Parameters:**
- `trust` (number): New trust value (will be clamped to 0-100)

**Returns:** void

**Side Effects:**
- Updates `guardianTrust` in state
- Triggers `updateMilestone()` for achievement checking
- Marks state as having unsaved changes
- Triggers auto-save

**Example:**
```typescript
const { setGuardianTrust } = useGameStore();

// Increase trust after scene success
setGuardianTrust(currentTrust + 5);

// Decrease trust after failure
setGuardianTrust(currentTrust - 5);

// Set to specific value
setGuardianTrust(75); // Triggers milestone if not yet achieved
```

---

#### `updateMilestone(level: number): void`

Checks for milestone achievements at the specified trust level and triggers journal prompts.

**Parameters:**
- `level` (number): Current trust level to check against milestones

**Returns:** void

**Side Effects:**
- Marks milestones as achieved if threshold crossed
- Adds milestone levels to `pendingMilestoneJournals` Set
- Triggers journal modal (via UI detection of pending journals)
- Updates milestone `achievedAt` timestamp
- Marks state as having unsaved changes

**Example:**
```typescript
// Called automatically by setGuardianTrust()
// Manual call for testing:
const { updateMilestone } = useGameStore();
updateMilestone(50); // Check if Trust 50 milestone should be achieved
```

---

#### `markMilestoneJournalShown(level: number): void`

Marks a milestone journal as shown/completed, removing it from pending set.

**Parameters:**
- `level` (number): Milestone level to mark as shown (25, 50, or 75)

**Returns:** void

**Side Effects:**
- Removes level from `pendingMilestoneJournals` Set
- Prevents journal modal from reopening for this milestone
- Does not trigger auto-save (only UI state change)

**Example:**
```typescript
const { markMilestoneJournalShown } = useGameStore();

// Called after player completes milestone journal
markMilestoneJournalShown(50);
```

---

## Troubleshooting

### Issue: Trust stuck at 50

**Symptoms:**
- Guardian Trust not changing despite scene completions
- No visible increase/decrease in trust bar

**Causes:**
1. Trust change code not executing
2. Scene completion not calling setGuardianTrust()
3. Hydration issue (showing stale value)

**Solutions:**
```typescript
// Check if trust is actually changing
const { guardianTrust, setGuardianTrust } = useGameStore();
console.log('Current trust:', guardianTrust);

// Manually test trust change
setGuardianTrust(guardianTrust + 5);

// Verify scene outcome is applying trust change
// Check browser console for: "Modified guardian trust"
```

### Issue: Milestone not triggering

**Symptoms:**
- Trust reaches 25/50/75 but no journal prompt
- Milestone shows as not achieved in state

**Causes:**
1. Milestone already achieved (duplicate prevention)
2. Pending journal Set not being checked by UI
3. Modal already open (blocked from opening again)

**Solutions:**
```typescript
// Check milestone state
const { milestones, pendingMilestoneJournals } = useGameStore();
console.log('Milestones:', milestones);
console.log('Pending journals:', Array.from(pendingMilestoneJournals));

// Manually reset milestone (development only)
// WARNING: Use only for debugging, not in production
const { updateMilestone } = useGameStore();
updateMilestone(50); // Force check for Trust 50 milestone
```

### Issue: Trust exceeds 100 or goes negative

**Symptoms:**
- Trust bar shows values > 100 or < 0
- Invalid trust values in database

**Cause:** Bounds enforcement bypassed (should never happen with current code)

**Solution:**
```typescript
// Trust is clamped in setGuardianTrust()
// If this occurs, it's a critical bug

// Emergency fix:
const { guardianTrust, setGuardianTrust } = useGameStore();
if (guardianTrust > 100 || guardianTrust < 0) {
  const fixed = Math.max(0, Math.min(100, guardianTrust));
  setGuardianTrust(fixed);
  console.error('Trust bounds violated! Fixed to:', fixed);
}
```

---

## Best Practices for Developers

### 1. Always Use setGuardianTrust()

**Do:**
```typescript
const { setGuardianTrust } = useGameStore();
setGuardianTrust(currentTrust + 5);
```

**Don't:**
```typescript
// NEVER directly mutate state
useGameStore.setState({ guardianTrust: 55 }); // ❌ Bypasses milestone checking!
```

### 2. Never Assume Unbounded Trust

**Do:**
```typescript
const newTrust = Math.min(100, Math.max(0, calculatedTrust));
setGuardianTrust(newTrust);
```

**Don't:**
```typescript
setGuardianTrust(currentTrust + 1000); // ❌ Will be clamped but shows poor design
```

### 3. Respect Milestone Uniqueness

**Do:**
```typescript
// System already prevents duplicates in addJournalEntry()
// Just call updateMilestone() when trust changes
```

**Don't:**
```typescript
// Don't manually create milestone journal entries
// Let the system handle it automatically
```

---

## Related Documentation

- [Journal System](./journal.md) - Milestone journal integration
- [Combat System](./combat.md) - Trust effects on combat
- [User Guide - Trust Section](../guides/user-guide.md#trust-management)
- [State Management](../architecture/state-management.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: src/store/game-store.ts, src/components/ChoiceList.tsx, src/engine/combat-engine.ts*

