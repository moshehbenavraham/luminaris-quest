# Game Engine API Documentation

**Core Game Logic: Combat and Scene Engines**

---

## Overview

The game engines are pure functions implementing core game mechanics. They are separated from React components to enable easy testing, portability, and clarity of game logic.

**Key Principles:**
- Pure functions (deterministic, no side effects)
- Thoroughly tested (100% code coverage)
- Well-documented with examples
- Engine functions are called by components, not vice versa

---

## Combat Engine

**File:** `src/engine/combat-engine.ts`

### Balance Constants

```typescript
export const COMBAT_BALANCE = {
  // Base damage
  ILLUMINATE_BASE_DAMAGE: 3,
  ILLUMINATE_TRUST_SCALING: 4,  // damage = 3 + floor(trust/4)
  
  // Resource costs
  ILLUMINATE_LP_COST: 2,
  REFLECT_SP_COST: 3,
  ENDURE_LP_THRESHOLD: 0.5,
  
  // Healing
  REFLECT_HEAL_AMOUNT: 1,
  ENDURE_DAMAGE_REDUCTION: 0.5,
  
  // Shadow mechanics
  SHADOW_BASE_DAMAGE: 8,
  DEFENSE_FROM_LP: 0.5,  // Each LP = 0.5 defense
  DEFENSE_FROM_TRUST: 0.1,  // Each trust = 0.1 defense
  MIN_SHADOW_DAMAGE: 1,
  
  // Limits
  MAX_COMBAT_TURNS: 20,
} as const;
```

### Core Functions

#### `calculateIlluminateDamage(guardianTrust: number): number`

Calculate damage for ILLUMINATE action based on trust.

**Formula:** `3 + floor(guardianTrust / 4)`

**Examples:**
```typescript
calculateIlluminateDamage(0)   // 3
calculateIlluminateDamage(50)  // 15
calculateIlluminateDamage(100) // 28
```

**Use Case:** Determining attack damage in combat.

---

#### `calculatePlayerDefense(state: CombatState, guardianTrust: number): number`

Calculate player's defensive value against shadow attacks.

**Formula:** `(LP * 0.5) + (Trust * 0.1)`

**Examples:**
```typescript
// 10 LP, 50 Trust
calculatePlayerDefense({ resources: { lp: 10 } }, 50) // 10 defense

// 15 LP, 75 Trust
calculatePlayerDefense({ resources: { lp: 15 } }, 75) // 15 defense
```

**Use Case:** Reducing incoming shadow damage.

---

#### `calculateShadowHealthDamage(sceneDC: number, state: CombatState, guardianTrust: number): number`

Calculate health damage dealt by shadow to player.

**Formula:** `max(1, (sceneDC - defense) * damageMultiplier)`

**Example:**
```typescript
// Scene DC: 14, LP: 10, Trust: 60, Multiplier: 1.0
calculateShadowHealthDamage(14, state, 60)
// Defense: (10 * 0.5) + (60 * 0.1) = 11
// Damage: max(1, 14 - 11) = 3
```

**Use Case:** Shadow attack damage calculation.

---

#### `canPerformAction(action: CombatAction, state: CombatState, guardianTrust: number): ValidationResult`

Validate if a combat action can be performed.

**Returns:**
```typescript
interface ValidationResult {
  canPerform: boolean;
  reason?: string;
}
```

**Checks:**
- ILLUMINATE: `LP >= 2`
- REFLECT: `SP >= 3` AND `healingBlocked === 0`
- ENDURE: Always allowed
- EMBRACE: `SP > 0`

**Example:**
```typescript
canPerformAction('ILLUMINATE', { resources: { lp: 1 } }, 50)
// { canPerform: false, reason: 'Not enough Light Points' }

canPerformAction('ENDURE', state, 50)
// { canPerform: true }
```

---

#### `executePlayerAction(action: CombatAction, state: CombatState, guardianTrust: number, playerLevel: number): ExecutionResult`

Execute a player combat action and return new state.

**Returns:**
```typescript
interface ExecutionResult {
  newState: CombatState;
  logEntry: CombatLogEntry;
  healthHeal?: number;  // For REFLECT action
}
```

**Actions:**

**ILLUMINATE:**
- Cost: 2 LP
- Effect: Damage shadow (3 + floor(trust/4))
- Resources: `lp -= 2`

**REFLECT:**
- Cost: 3 SP
- Effect: Convert SP to LP + heal 1 HP
- Resources: `sp -= 3`, `lp += 2`
- Health: `+1 HP`

**ENDURE:**
- Cost: None
- Effect: +2 LP, reduce damage 50%, stack bonus
- Resources: `lp += 2 + consecutiveEndures`
- Status: `damageReduction = 0.5`, `consecutiveEndures++`

**EMBRACE:**
- Cost: All SP
- Effect: Massive damage (2x SP) but hurts player
- Resources: `sp = 0`
- Damage to shadow: `SP * 2`
- Damage to player: `SP` (returned as negative healthHeal)

**Example:**
```typescript
const result = executePlayerAction('ILLUMINATE', state, 50, 1);
// result.newState.resources.lp = state.resources.lp - 2
// result.logEntry.message = "You used ILLUMINATE..."
// Shadow HP reduced by calculateIlluminateDamage(50)
```

---

#### `executeShadowAction(ability: ShadowAbility, state: CombatState, guardianTrust: number): ShadowExecutionResult`

Execute a shadow manifestation's combat action.

**Returns:**
```typescript
interface ShadowExecutionResult {
  newState: CombatState;
  logEntry: CombatLogEntry;
  healthDamage: number;
}
```

**Shadow Abilities:**
Each shadow type has unique abilities:
- **Doubt**: Reduces player damage
- **Isolation**: Blocks healing
- **Overwhelm**: Heavy damage attacks
- **Past Pain**: Status effect infliction

**Example:**
```typescript
const shadowAbility = currentEnemy.abilities[0];
const result = executeShadowAction(shadowAbility, state, 50);
// result.healthDamage = calculated damage to player
// result.newState = updated combat state with status effects
```

---

#### `decideShadowAction(enemy: ShadowManifestation, state: CombatState): ShadowAbility | null`

AI decision-making for shadow's next action.

**Logic:**
1. Check cooldowns (skip abilities on cooldown)
2. If HP < 30%: Use defensive/desperate abilities
3. If player LP < 5: Use aggressive abilities
4. Default: Use first available ability

**Returns:** Selected ability or `null` if none available

---

#### `checkCombatEnd(state: CombatState): CombatEndResult`

Check if combat has ended and determine outcome.

**Returns:**
```typescript
interface CombatEndResult {
  isEnded: boolean;
  victory?: boolean;
  reason?: string;
}
```

**End Conditions:**
- Shadow HP ≤ 0 → Victory
- Turn > 20 → Defeat (timeout)
- Player HP ≤ 0 → Defeat

**Example:**
```typescript
checkCombatEnd({ currentEnemy: { currentHP: 0 } })
// { isEnded: true, victory: true, reason: 'Enemy defeated' }
```

---

#### `processStatusEffects(state: CombatState): CombatState`

Process status effects at end of turn (decay/removal).

**Effects Processed:**
- Decrement `healingBlocked` (min 0)
- Decrement `lpGenerationBlocked` (min 0)
- Reset `damageMultiplier` to 1.0 if expired
- Reset `damageReduction` to 1.0
- Reset `skipNextTurn` to false
- Decrement shadow ability cooldowns

**Example:**
```typescript
const newState = processStatusEffects({
  healingBlocked: 2,
  lpGenerationBlocked: 1
});
// newState.healingBlocked = 1
// newState.lpGenerationBlocked = 0
```

---

## Scene Engine

**File:** `src/engine/scene-engine.ts`

### Scene Interface

```typescript
export interface Scene {
  id: string;
  type: 'social' | 'skill' | 'combat' | 'journal' | 'exploration';
  title: string;
  text: string;
  dc: number;  // Difficulty Check (10-20)
  successText: string;
  failureText: string;
  choices: {
    bold: string;
    cautious: string;
  };
  shadowType?: string;  // For combat scenes
  lpReward?: number;    // Override default LP reward
  spPenalty?: number;   // Override default SP penalty
}
```

### Core Functions

#### `getScenes(): Scene[]`

Returns all 20 therapeutic scenarios.

**Usage:**
```typescript
const allScenes = getScenes();
console.log(allScenes.length); // 20
```

---

#### `getScene(index: number): Scene`

Get a specific scene by index (0-19).

**Example:**
```typescript
const firstScene = getScene(0);
// { id: 'social-encounter', title: 'The Worried Merchant', ... }
```

**Error:** Throws if index out of bounds

---

#### `isLastScene(index: number): boolean`

Check if scene is the last one (index 19).

**Usage:**
```typescript
if (isLastScene(currentSceneIndex)) {
  console.log('Final scene reached!');
}
```

---

#### `getScenesByType(type: Scene['type']): Scene[]`

Filter scenes by type.

**Example:**
```typescript
const combatScenes = getScenesByType('combat');
console.log(combatScenes.length); // 4 combat scenes
```

---

#### `calculateSceneOutcome(scene: Scene, roll: number, playerLevel: number): SceneOutcome`

Determine scene outcome based on dice roll.

**Formula:** `(roll + playerLevel - 1) >= scene.dc`

**Returns:**
```typescript
interface SceneOutcome {
  success: boolean;
  trustChange: number;
  resourceChange: { lp?: number; sp?: number };
  message: string;
}
```

**Example:**
```typescript
const outcome = calculateSceneOutcome(scene, 15, 3);
// Roll: 15, Level: 3, DC: 12
// Total: 15 + 2 = 17 >= 12
// { success: true, trustChange: +5, resourceChange: { lp: 3 }, ... }
```

---

## Shadow Manifestations

**File:** `src/data/shadowManifestations.ts`

### Shadow Types

```typescript
export const SHADOW_IDS = {
  DOUBT: 'shadowOfDoubt',
  ISOLATION: 'veilOfIsolation',
  OVERWHELM: 'tideOfOverwhelm',
  PAST_PAIN: 'echoOfPastPain',
} as const;
```

### Creating Shadows

#### `createShadowManifestation(id: string): ShadowManifestation`

Create a shadow enemy with abilities.

**Example:**
```typescript
const doubt = createShadowManifestation(SHADOW_IDS.DOUBT);
// {
//   id: 'shadowOfDoubt',
//   name: 'Shadow of Doubt',
//   type: 'doubt',
//   currentHP: 20,
//   maxHP: 20,
//   abilities: [...],
//   therapeuticInsight: "...",
//   victoryReward: { lpBonus: 5, ... }
// }
```

---

## Testing Examples

### Testing Combat Engine

```typescript
import { calculateIlluminateDamage } from '@/engine/combat-engine';

describe('calculateIlluminateDamage', () => {
  it('scales with trust', () => {
    expect(calculateIlluminateDamage(0)).toBe(3);
    expect(calculateIlluminateDamage(20)).toBe(8);
    expect(calculateIlluminateDamage(40)).toBe(13);
    expect(calculateIlluminateDamage(60)).toBe(18);
    expect(calculateIlluminateDamage(80)).toBe(23);
    expect(calculateIlluminateDamage(100)).toBe(28);
  });
  
  it('uses floor division', () => {
    expect(calculateIlluminateDamage(13)).toBe(6);  // floor(13/4) = 3
    expect(calculateIlluminateDamage(14)).toBe(6);  // floor(14/4) = 3
    expect(calculateIlluminateDamage(15)).toBe(6);  // floor(15/4) = 3
    expect(calculateIlluminateDamage(16)).toBe(7);  // floor(16/4) = 4
  });
});
```

### Testing Scene Engine

```typescript
import { calculateSceneOutcome, getScene } from '@/engine/scene-engine';

describe('calculateSceneOutcome', () => {
  const scene = getScene(0); // DC: 9
  
  it('succeeds when roll + level >= DC', () => {
    const outcome = calculateSceneOutcome(scene, 10, 1);
    // 10 + 0 = 10 >= 9
    expect(outcome.success).toBe(true);
    expect(outcome.trustChange).toBe(5);
  });
  
  it('fails when roll + level < DC', () => {
    const outcome = calculateSceneOutcome(scene, 5, 1);
    // 5 + 0 = 5 < 9
    expect(outcome.success).toBe(false);
    expect(outcome.trustChange).toBe(-5);
  });
});
```

---

## Related Documentation

- [Combat System](../features/combat.md)
- [Guardian Trust](../features/guardian-trust.md)
- [Hooks API](./hooks.md)
- [Architecture Overview](../architecture/overview.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: src/engine/*

