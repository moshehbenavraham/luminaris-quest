import type { CombatAction, ShadowManifestation } from '@/types';

export type CombatActor = 'PLAYER' | 'SHADOW';

export interface CombatResources {
  lp: number;
  sp: number;
}

/**
 * Status effects tracked by the NEW combat system.
 *
 * Note: In the current new combat runtime, these are primarily used for UI display.
 * Enforcement of these effects is intentionally minimal to match existing behavior.
 */
export interface StatusEffects {
  damageMultiplier: number;
  damageReduction: number;
  healingBlocked: number;
  lpGenerationBlocked: number;
  skipNextTurn: boolean;
  consecutiveEndures: number;
}

/**
 * Engine log entries are timestamp-free; the store is responsible for stamping.
 */
export interface CombatLogEntry {
  turn: number;
  actor: CombatActor;
  action: string;
  effect: string;
  message: string;
}

/**
 * Engine-facing combat state aligned to `src/features/combat/store/combat-store.ts`.
 * This allows the store to delegate combat math to the engine without reshaping data.
 */
export interface CombatEngineState {
  enemy: ShadowManifestation | null;
  resources: CombatResources;
  playerHealth: number;
  playerLevel: number;
  playerEnergy: number;
  maxPlayerEnergy: number;
  turn: number;
  isPlayerTurn: boolean;
  statusEffects: StatusEffects;
  preferredActions: Record<CombatAction, number>;
}

export interface CanPerformActionResult {
  canPerform: boolean;
  reason?: string;
}

export interface EnergyCostContext {
  /**
   * Energy cost for ENDURE. Other actions currently cost 0 energy in the new system.
   */
  endureEnergyCost?: number;
}

export interface ExecutePlayerActionOptions extends EnergyCostContext {
  rng?: () => number;
  maxPlayerHealth?: number;
}

export interface ExecutePlayerActionResult {
  newState: CombatEngineState;
  logEntry: CombatLogEntry;
  damage?: number;
  healthHeal?: number;
  energyCost?: number;
}

export interface ExecuteEnemyTurnResult {
  newState: CombatEngineState;
  logEntry: CombatLogEntry;
  damage: number;
  enemyAction: string;
}

/**
 * Combat Engine - Core combat logic for Light & Shadow Combat System
 *
 * This module implements the therapeutic combat mechanics where players
 * use emotional regulation techniques to overcome shadow manifestations
 * representing inner struggles.
 */

// Combat balance constants
export const COMBAT_BALANCE = {
  // Player action resource costs
  ILLUMINATE_LP_COST: 2,
  REFLECT_SP_COST: 3,
  REFLECT_LP_GAIN: 1,
  ENDURE_LP_GAIN: 1,
  EMBRACE_SP_THRESHOLD: 5,

  // Player action damage/heal formulas (NEW combat store truth)
  ILLUMINATE_BASE_DAMAGE: 3,
  ILLUMINATE_LEVEL_SCALING: 1.5, // damage = base + floor(level * scaling)
  EMBRACE_DAMAGE_DIVISOR: 2, // damage = floor(sp / divisor)
  EMBRACE_MIN_DAMAGE: 1,

  // Enemy turn (NEW combat store truth)
  SHADOW_BASE_DAMAGE: 8,
  DEFENSE_PER_LP: 0.5, // defense = floor(lp * DEFENSE_PER_LP)
  MIN_SHADOW_DAMAGE: 1,
  SP_GAIN_ON_HIT: 1,
  MAX_SP: 10,
  DESPERATE_STRIKE_HP_THRESHOLD: 0.5, // if enemy HP% < threshold => "Desperate Strike"

  // Current UI assumption (combat UI still hardcodes 100 max health)
  MAX_PLAYER_HEALTH: 100,
} as const;

export type ActionCost = {
  lp?: number;
  sp?: number;
  energy?: number;
};

/**
 * Get the resource/energy costs for an action in the NEW combat system.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 */
export function getActionCost(action: CombatAction, context: EnergyCostContext = {}): ActionCost {
  const endureEnergyCost = context.endureEnergyCost ?? 0;

  switch (action) {
    case 'ILLUMINATE':
      return { lp: COMBAT_BALANCE.ILLUMINATE_LP_COST };
    case 'REFLECT':
      return { sp: COMBAT_BALANCE.REFLECT_SP_COST };
    case 'ENDURE':
      return { energy: endureEnergyCost };
    case 'EMBRACE':
      return { sp: COMBAT_BALANCE.EMBRACE_SP_THRESHOLD };
    default:
      return {};
  }
}

/**
 * Human-readable action description aligned to the NEW combat system behavior.
 */
export function getActionDescription(action: CombatAction): string {
  switch (action) {
    case 'ILLUMINATE':
      return 'Shine light on your shadow, dealing damage based on your level';
    case 'REFLECT':
      return 'Convert 3 shadow points into 1 light point and heal 1d(level) health';
    case 'ENDURE':
      return 'Build inner strength, gaining 1 light point (costs energy)';
    case 'EMBRACE':
      return 'Embrace your shadows, consuming all SP to deal damage based on SP';
    default:
      return '';
  }
}

/**
 * Calculate damage for ILLUMINATE action.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 *
 * \(damage = 3 + \lfloor level \cdot 1.5 \rfloor\)
 */
export function calculateIlluminateDamage(playerLevel: number): number {
  const level = Math.max(1, playerLevel || 1);
  return (
    COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE +
    Math.floor(level * COMBAT_BALANCE.ILLUMINATE_LEVEL_SCALING)
  );
}

/**
 * Calculate damage for EMBRACE action
 *
 * Therapeutic insight: Accepting difficult emotions reduces their power.
 * The Shadow Embrace action represents the therapeutic concept of integrating
 * one's shadow self - acknowledging and accepting difficult emotions rather
 * than fighting them, which paradoxically reduces their negative impact.
 *
 * @param shadowPoints - Current shadow points available
 * @returns Calculated damage amount (minimum 1)
 *
 * @example
 * ```typescript
 * const damage = calculateEmbraceDamage(8);
 * console.log(damage); // 4 (8/2)
 * ```
 */
export function calculateEmbraceDamage(shadowPoints: number): number {
  // Embrace converts shadow points to damage (2 SP = 1 damage), minimum 1.
  const sp = Math.max(0, shadowPoints);
  return Math.max(
    COMBAT_BALANCE.EMBRACE_MIN_DAMAGE,
    Math.floor(sp / COMBAT_BALANCE.EMBRACE_DAMAGE_DIVISOR),
  );
}

/**
 * Calculate the integer defense value derived from LP.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 *
 * \(defense = \lfloor lp \cdot 0.5 \rfloor\)
 */
export function calculatePlayerDefense(state: Pick<CombatEngineState, 'resources'>): number {
  return Math.floor(state.resources.lp * COMBAT_BALANCE.DEFENSE_PER_LP);
}

/**
 * Calculate shadow damage dealt to player health for the enemy turn.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 *
 * \(damage = \\max(1, 8 - defense)\)
 */
export function calculateShadowDamage(state: Pick<CombatEngineState, 'resources'>): number {
  const defense = calculatePlayerDefense(state);
  return Math.max(COMBAT_BALANCE.MIN_SHADOW_DAMAGE, COMBAT_BALANCE.SHADOW_BASE_DAMAGE - defense);
}

/**
 * @deprecated Use `calculateShadowDamage` (legacy name kept for compatibility).
 */
export const calculateShadowHealthDamage = calculateShadowDamage;

/**
 * Validate if a combat action can be performed
 *
 * Checks whether the player has sufficient resources and is not blocked
 * from performing a specific combat action. This ensures fair gameplay
 * and prevents invalid actions that could break the combat flow.
 *
 * @param action - The combat action to validate
 * @param state - Current combat state including resources and status effects
 * @param _guardianTrust - Guardian trust level (currently unused but reserved for future features)
 * @returns Object containing validation result and optional reason for failure
 *
 * @example
 * ```typescript
 * const result = canPerformAction('ILLUMINATE', combatState, 50);
 * if (result.canPerform) {
 *   // Execute the action
 * } else {
 *   console.log(result.reason); // "Not enough Light Points"
 * }
 * ```
 */
export function canPerformAction(
  action: CombatAction,
  state: CombatEngineState,
  context: EnergyCostContext = {},
): CanPerformActionResult {
  const { resources, playerEnergy } = state;
  const endureEnergyCost = context.endureEnergyCost ?? 0;

  switch (action) {
    case 'ILLUMINATE':
      if (resources.lp < COMBAT_BALANCE.ILLUMINATE_LP_COST) {
        return { canPerform: false, reason: 'Not enough Light Points' };
      }
      return { canPerform: true };

    case 'REFLECT':
      if (resources.sp < COMBAT_BALANCE.REFLECT_SP_COST) {
        return { canPerform: false, reason: 'Not enough Shadow Points' };
      }
      return { canPerform: true };

    case 'ENDURE':
      // New combat system: only ENDURE currently consumes energy (store passes cost in).
      if (endureEnergyCost > 0 && playerEnergy < endureEnergyCost) {
        return { canPerform: false, reason: 'Not enough Energy' };
      }
      return { canPerform: true };

    case 'EMBRACE':
      if (resources.sp < COMBAT_BALANCE.EMBRACE_SP_THRESHOLD) {
        return { canPerform: false, reason: 'Not enough Shadow Points' };
      }
      return { canPerform: true };

    default:
      return { canPerform: false, reason: 'Unknown action' };
  }
}

/**
 * Execute a player combat action and return the updated state + an engine log entry.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 */
export function executePlayerAction(
  action: CombatAction,
  state: CombatEngineState,
  options: ExecutePlayerActionOptions = {},
): ExecutePlayerActionResult {
  const rng = options.rng ?? Math.random;
  const maxPlayerHealth = options.maxPlayerHealth ?? COMBAT_BALANCE.MAX_PLAYER_HEALTH;
  const endureEnergyCost = options.endureEnergyCost ?? 0;

  const nextResources: CombatResources = { ...state.resources };
  const nextEnemy = state.enemy ? { ...state.enemy } : null;
  const nextPreferredActions: Record<CombatAction, number> = {
    ...state.preferredActions,
    [action]: (state.preferredActions[action] ?? 0) + 1,
  };

  let playerHealth = state.playerHealth;
  let playerEnergy = state.playerEnergy;
  let damage = 0;
  let healthHeal = 0;
  let energyCost = 0;
  let effect = '';
  let message = '';

  switch (action) {
    case 'ILLUMINATE': {
      nextResources.lp = Math.max(0, nextResources.lp - COMBAT_BALANCE.ILLUMINATE_LP_COST);

      damage = calculateIlluminateDamage(state.playerLevel);
      if (nextEnemy) {
        nextEnemy.currentHP = Math.max(0, nextEnemy.currentHP - damage);
      }

      effect = `Dealt ${damage} damage`;
      message = 'You shine light on your inner shadow, seeing it clearly for what it is.';
      break;
    }

    case 'REFLECT': {
      nextResources.sp = Math.max(0, nextResources.sp - COMBAT_BALANCE.REFLECT_SP_COST);
      nextResources.lp += COMBAT_BALANCE.REFLECT_LP_GAIN;

      const level = Math.max(1, state.playerLevel || 1);
      healthHeal = Math.floor(rng() * level) + 1;
      playerHealth = Math.min(maxPlayerHealth, playerHealth + healthHeal);

      effect = `Converted ${COMBAT_BALANCE.REFLECT_SP_COST} SP to ${COMBAT_BALANCE.REFLECT_LP_GAIN} LP and healed ${healthHeal} health`;
      message = 'You reflect on your shadows, transforming them into understanding and healing.';
      break;
    }

    case 'ENDURE': {
      nextResources.lp += COMBAT_BALANCE.ENDURE_LP_GAIN;

      energyCost = Math.max(0, endureEnergyCost);
      playerEnergy = Math.max(0, playerEnergy - energyCost);

      const baseEffect = 'Gained 1 LP from endurance';
      effect = energyCost > 0 ? `${baseEffect} | -${energyCost} Energy` : baseEffect;
      message = 'You endure the challenge, building inner strength.';
      break;
    }

    case 'EMBRACE': {
      const startingSp = nextResources.sp;
      damage = calculateEmbraceDamage(startingSp);

      nextResources.sp = 0; // NEW combat system: embrace consumes all SP
      if (nextEnemy) {
        nextEnemy.currentHP = Math.max(0, nextEnemy.currentHP - damage);
      }

      effect = `Dealt ${damage} damage, consumed all SP`;
      message = 'You embrace your shadows, accepting them as part of your strength.';
      break;
    }

    default: {
      return {
        newState: state,
        logEntry: { turn: state.turn, actor: 'PLAYER', action, effect: '', message: '' },
      };
    }
  }

  const newState: CombatEngineState = {
    ...state,
    enemy: nextEnemy,
    resources: nextResources,
    playerHealth,
    playerEnergy,
    preferredActions: nextPreferredActions,
  };

  return {
    newState,
    logEntry: {
      turn: state.turn,
      actor: 'PLAYER',
      action,
      effect,
      message,
    },
    damage: damage > 0 ? damage : undefined,
    healthHeal: healthHeal > 0 ? healthHeal : undefined,
    energyCost: energyCost > 0 ? energyCost : undefined,
  };
}

/**
 * Decide which enemy action label to display for this turn.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 */
export function decideEnemyAction(enemy: ShadowManifestation): string {
  return enemy.currentHP < enemy.maxHP * COMBAT_BALANCE.DESPERATE_STRIKE_HP_THRESHOLD
    ? 'Desperate Strike'
    : 'Shadow Attack';
}

/**
 * Execute the enemy turn (damage + SP gain) and return the updated state + a log entry.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 */
export function executeEnemyTurn(state: CombatEngineState): ExecuteEnemyTurnResult {
  if (!state.enemy) {
    return {
      newState: state,
      enemyAction: 'Shadow Attack',
      damage: 0,
      logEntry: {
        turn: state.turn,
        actor: 'SHADOW',
        action: 'Shadow Attack',
        effect: '',
        message: '',
      },
    };
  }

  const enemyAction = decideEnemyAction(state.enemy);
  const damage = calculateShadowDamage(state);
  const newPlayerHealth = Math.max(0, state.playerHealth - damage);
  const newSp = Math.min(COMBAT_BALANCE.MAX_SP, state.resources.sp + COMBAT_BALANCE.SP_GAIN_ON_HIT);

  // Match current store behavior: if player is defeated, do NOT advance turn or return control.
  const playerDefeated = newPlayerHealth <= 0;
  const newState: CombatEngineState = playerDefeated
    ? {
        ...state,
        playerHealth: newPlayerHealth,
        resources: { ...state.resources, sp: newSp },
        isPlayerTurn: false,
      }
    : {
        ...state,
        playerHealth: newPlayerHealth,
        resources: { ...state.resources, sp: newSp },
        turn: state.turn + 1,
        isPlayerTurn: true,
      };

  return {
    enemyAction,
    damage,
    newState,
    logEntry: {
      turn: state.turn,
      actor: 'SHADOW',
      action: enemyAction,
      effect: `Dealt ${damage} damage to you`,
      message: `${state.enemy.name} strikes at your resolve, but you gain insight from the challenge.`,
    },
  };
}

/**
 * Determine whether combat should end.
 *
 * Source of truth: `src/features/combat/store/combat-store.ts`
 */
export function checkCombatEnd(state: CombatEngineState): {
  isEnded: boolean;
  victory?: boolean;
  reason?: string;
} {
  if (state.enemy && state.enemy.currentHP <= 0) {
    return { isEnded: true, victory: true, reason: `You've overcome ${state.enemy.name}!` };
  }

  if (state.playerHealth <= 0) {
    return { isEnded: true, victory: false, reason: 'You retreat to gather your strength...' };
  }

  return { isEnded: false };
}
