import type { 
  CombatState, 
  CombatAction, 
  ShadowManifestation, 
  ShadowAbility, 
  CombatLogEntry,
  LightShadowResources 
} from '../store/game-store';

/**
 * Combat Engine - Core combat logic for Light & Shadow Combat System
 * 
 * This module implements the therapeutic combat mechanics where players
 * use emotional regulation techniques to overcome shadow manifestations
 * representing inner struggles.
 */

// Combat balance constants
export const COMBAT_BALANCE = {
  // Base damage values
  ILLUMINATE_BASE_DAMAGE: 3,
  ILLUMINATE_TRUST_SCALING: 4, // damage = base + floor(trust / scaling)

  // Resource costs
  ILLUMINATE_LP_COST: 2,
  REFLECT_SP_COST: 3,
  ENDURE_LP_THRESHOLD: 0.5, // 50% of max LP

  // Healing amounts
  REFLECT_HEAL_AMOUNT: 1,
  ENDURE_DAMAGE_REDUCTION: 0.5, // 50% damage reduction

  // Shadow AI thresholds
  SHADOW_AGGRESSIVE_HP_THRESHOLD: 0.3, // 30% HP
  SHADOW_DEFENSIVE_LP_THRESHOLD: 5,

  // Status effect durations
  DAMAGE_MULTIPLIER_DURATION: 3,
  HEALING_BLOCK_DURATION: 2,
  LP_GENERATION_BLOCK_DURATION: 2,

  // Combat limits
  MAX_COMBAT_TURNS: 20, // Maximum turns before automatic resolution

  // Shadow damage calculation
  SHADOW_BASE_DAMAGE: 8, // Base damage shadows deal to player health
  DEFENSE_FROM_LP: 0.5, // Each LP provides 0.5 defense
  DEFENSE_FROM_TRUST: 0.1, // Each trust point provides 0.1 defense
  MIN_SHADOW_DAMAGE: 1, // Minimum damage shadows can deal
} as const;

/**
 * Calculate damage for ILLUMINATE action
 * 
 * Therapeutic insight: Awareness and understanding reduce emotional pain.
 * The more trust the player has built with their guardian, the more effective
 * their ability to illuminate and understand their inner struggles becomes.
 * 
 * @param guardianTrust - Current guardian trust level (0-100)
 * @returns Calculated damage amount
 * 
 * @example
 * ```typescript
 * const damage = calculateIlluminateDamage(75);
 * console.log(damage); // 21 (3 + floor(75/4))
 * ```
 */
export function calculateIlluminateDamage(guardianTrust: number): number {
  const baseDamage = COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE;
  const trustBonus = Math.floor(guardianTrust / COMBAT_BALANCE.ILLUMINATE_TRUST_SCALING);
  return baseDamage + trustBonus;
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
  // Embrace converts shadow points to damage (1 SP = 2 damage)
  // Minimum 1 damage even with 0 SP
  return Math.max(1, Math.floor(shadowPoints / 2));
}

/**
 * Calculate player's total defense value
 *
 * Defense reduces incoming shadow damage. It's calculated from:
 * - Light Points: Each LP provides defensive energy
 * - Guardian Trust: Higher trust provides spiritual protection
 * - Damage Reduction status effects: Temporary defensive bonuses
 *
 * @param state - Current combat state
 * @param guardianTrust - Current guardian trust level
 * @returns Total defense value
 *
 * @example
 * ```typescript
 * const defense = calculatePlayerDefense(combatState, 75);
 * console.log(defense); // 12.5 (10 LP * 0.5 + 75 trust * 0.1)
 * ```
 */
export function calculatePlayerDefense(state: CombatState, guardianTrust: number): number {
  const lpDefense = state.resources.lp * COMBAT_BALANCE.DEFENSE_FROM_LP;
  const trustDefense = guardianTrust * COMBAT_BALANCE.DEFENSE_FROM_TRUST;
  const statusDefense = state.damageReduction > 1 ? (state.damageReduction - 1) * 5 : 0;
  const totalDefense = lpDefense + trustDefense + statusDefense;

  // Debug logging for defense calculation
  console.log('Player Defense Calculation:', {
    lp: state.resources.lp,
    lpDefense,
    guardianTrust,
    trustDefense,
    damageReduction: state.damageReduction,
    statusDefense,
    totalDefense
  });

  return totalDefense;
}

/**
 * Calculate shadow damage to player health based on scene DC minus defenses
 *
 * This implements the core mechanic where shadows deal health damage each round.
 * The damage is based on the scene's difficulty check (representing the shadow's power)
 * minus the player's current defenses.
 *
 * @param sceneDC - The difficulty check of the current scene (shadow's base power)
 * @param state - Current combat state
 * @param guardianTrust - Current guardian trust level
 * @returns Final damage amount (minimum 1)
 *
 * @example
 * ```typescript
 * const damage = calculateShadowHealthDamage(14, combatState, 60);
 * console.log(damage); // 8 (14 base - 6 defense = 8 damage)
 * ```
 */
export function calculateShadowHealthDamage(
  sceneDC: number,
  state: CombatState,
  guardianTrust: number
): number {
  const baseDamage = sceneDC || COMBAT_BALANCE.SHADOW_BASE_DAMAGE;
  const playerDefense = calculatePlayerDefense(state, guardianTrust);
  const finalDamage = Math.max(COMBAT_BALANCE.MIN_SHADOW_DAMAGE, baseDamage - playerDefense);

  // Apply damage multiplier if active
  const result = Math.floor(finalDamage * state.damageMultiplier);

  // Debug logging for health damage calculation
  console.log('Shadow Health Damage Calculation:', {
    sceneDC,
    baseDamage,
    playerDefense,
    finalDamage,
    damageMultiplier: state.damageMultiplier,
    result,
    guardianTrust,
    resources: state.resources
  });

  return result;
}

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
  state: CombatState,
  _guardianTrust: number
): { canPerform: boolean; reason?: string } {
  const { resources, healingBlocked } = state;
  
  switch (action) {
    case 'ILLUMINATE':
      if (resources.lp < COMBAT_BALANCE.ILLUMINATE_LP_COST) {
        return { canPerform: false, reason: 'Not enough Light Points' };
      }
      break;
      
    case 'REFLECT':
      if (resources.sp < COMBAT_BALANCE.REFLECT_SP_COST) {
        return { canPerform: false, reason: 'Not enough Shadow Points' };
      }
      if (healingBlocked > 0) {
        return { canPerform: false, reason: 'Healing is blocked' };
      }
      break;
      
    case 'ENDURE':
      // Endure can always be used but has diminishing returns
      break;
      
    case 'EMBRACE':
      if (resources.sp === 0) {
        return { canPerform: false, reason: 'No Shadow Points to embrace' };
      }
      break;
      
    default:
      return { canPerform: false, reason: 'Unknown action' };
  }
  
  return { canPerform: true };
}

/**
 * Execute a player combat action and return the updated state
 * 
 * This is the core function that processes player actions in combat,
 * applying therapeutic mechanics and updating the combat state accordingly.
 * Each action represents a different emotional regulation strategy.
 * 
 * @param action - The combat action to execute ('ILLUMINATE', 'REFLECT', 'ENDURE', 'EMBRACE')
 * @param state - Current combat state
 * @param guardianTrust - Current guardian trust level affecting action effectiveness
 * @param playerLevel - Current player level used for healing calculations
 * @returns Object containing updated state, combat log entry, and optional damage dealt
 * 
 * @throws {Error} When an unknown action is provided
 * 
 * @example
 * ```typescript
 * const result = executePlayerAction('ILLUMINATE', combatState, 75, 5);
 * console.log(result.logEntry.message); // "You illuminate the shadow's doubt..."
 * console.log(result.damage); // 21
 * ```
 * 
 * @see {@link canPerformAction} - Use this first to validate the action
 * @see {@link calculateIlluminateDamage} - For ILLUMINATE damage calculation
 * @see {@link calculateEmbraceDamage} - For EMBRACE damage calculation
 */
export function executePlayerAction(
  action: CombatAction,
  state: CombatState,
  guardianTrust: number,
  playerLevel: number = 1  // Default to 1 for backwards compatibility
): {
  newState: CombatState;
  logEntry: CombatLogEntry;
  damage?: number;
  healthHeal?: number;  // Added to track health healing
} {
  const newState = { ...state };
  let damage = 0;
  let healthHeal = 0;
  let effect = '';
  let message = '';
  const resourceChange: Partial<LightShadowResources> & { enemyHP?: number; healthHeal?: number } = {};

  switch (action) {
    case 'ILLUMINATE': {
      damage = calculateIlluminateDamage(guardianTrust);
      newState.resources.lp -= COMBAT_BALANCE.ILLUMINATE_LP_COST;
      
      if (newState.currentEnemy) {
        newState.currentEnemy.currentHP = Math.max(0, newState.currentEnemy.currentHP - damage);
        resourceChange.enemyHP = newState.currentEnemy.currentHP;
      }
      
      resourceChange.lp = -COMBAT_BALANCE.ILLUMINATE_LP_COST;
      effect = `Dealt ${damage} damage`;
      message = `You shine light on your inner shadow, seeing it clearly for what it is. The truth illuminates and weakens its hold on you.`;
      break;
    }
    
    case 'REFLECT': {
      const spCost = COMBAT_BALANCE.REFLECT_SP_COST;  // Now 3 SP
      const lpHealAmount = COMBAT_BALANCE.REFLECT_HEAL_AMOUNT;  // Still 1 LP
      
      // Calculate health healing: 1d(playerLevel) - roll a dice from 1 to playerLevel
      healthHeal = Math.floor(Math.random() * playerLevel) + 1;
      
      newState.resources.sp = Math.max(0, newState.resources.sp - spCost);
      newState.resources.lp += lpHealAmount;
      
      resourceChange.sp = -spCost;
      resourceChange.lp = lpHealAmount;
      resourceChange.healthHeal = healthHeal;
      effect = `Converted ${spCost} SP to ${lpHealAmount} LP and healed ${healthHeal} health`;
      message = `You find wisdom in your struggle, transforming pain into understanding and healing. Your inner light grows stronger as wounds begin to mend.`;
      break;
    }
    
    case 'ENDURE': {
      newState.consecutiveEndures += 1;
      newState.damageReduction = COMBAT_BALANCE.ENDURE_DAMAGE_REDUCTION;
      
      effect = `Gained ${Math.round((1 - COMBAT_BALANCE.ENDURE_DAMAGE_REDUCTION) * 100)}% damage reduction`;
      message = `You steel yourself against the shadow's influence, finding strength in resilience. You are prepared to weather the storm.`;
      break;
    }
    
    case 'EMBRACE': {
      damage = calculateEmbraceDamage(newState.resources.sp);
      const spUsed = Math.min(newState.resources.sp, 2); // Use up to 2 SP
      
      newState.resources.sp = Math.max(0, newState.resources.sp - spUsed);
      
      if (newState.currentEnemy) {
        newState.currentEnemy.currentHP = Math.max(0, newState.currentEnemy.currentHP - damage);
        resourceChange.enemyHP = newState.currentEnemy.currentHP;
      }
      
      resourceChange.sp = -spUsed;
      effect = `Dealt ${damage} damage by embracing shadow`;
      message = `You accept your difficult emotions without judgment, reducing their power over you. In acceptance, you find peace.`;
      break;
    }
  }

  const logEntry: CombatLogEntry = {
    turn: state.turn,
    actor: 'PLAYER',
    action,
    effect,
    resourceChange,
    message
  };

  return { newState, logEntry, damage, healthHeal };
}

/**
 * Shadow AI decision making - determines which ability to use
 * Therapeutic insight: Shadows represent patterns of negative thinking
 */
export function decideShadowAction(
  enemy: ShadowManifestation,
  state: CombatState
): ShadowAbility | null {
  console.log('Shadow Action Decision:', {
    enemyName: enemy.name,
    totalAbilities: enemy.abilities?.length || 0,
    abilities: enemy.abilities?.map(a => ({ name: a.name, cooldown: a.currentCooldown }))
  });

  if (!enemy.abilities || enemy.abilities.length === 0) {
    console.log('No abilities available for shadow');
    return null;
  }

  // Filter abilities that are off cooldown
  const availableAbilities = enemy.abilities.filter(ability => ability.currentCooldown === 0);

  console.log('Available abilities:', availableAbilities.map(a => a.name));

  if (availableAbilities.length === 0) {
    console.log('All abilities on cooldown');
    return null; // No abilities available
  }

  // Priority 1: Use signature ability if player is vulnerable (low LP)
  const playerVulnerable = state.resources.lp < COMBAT_BALANCE.SHADOW_DEFENSIVE_LP_THRESHOLD;
  if (playerVulnerable && availableAbilities.includes(enemy.abilities[0])) {
    return enemy.abilities[0];
  }

  // Priority 2: Use aggressive abilities when shadow is low on HP
  const shadowHP = enemy.currentHP / enemy.maxHP;
  if (shadowHP < COMBAT_BALANCE.SHADOW_AGGRESSIVE_HP_THRESHOLD) {
    const aggressiveAbilities = availableAbilities.filter(ability =>
      ability.description.toLowerCase().includes('damage') ||
      ability.description.toLowerCase().includes('drain')
    );
    if (aggressiveAbilities.length > 0) {
      return aggressiveAbilities[Math.floor(Math.random() * aggressiveAbilities.length)];
    }
  }

  // Priority 3: Counter player's preferred strategy
  const mostUsedAction = Object.entries(state.preferredActions)
    .sort(([,a], [,b]) => b - a)[0]?.[0] as CombatAction;

  if (mostUsedAction) {
    // Counter strategies based on player behavior
    const counterAbilities = availableAbilities.filter(ability => {
      switch (mostUsedAction) {
        case 'ILLUMINATE':
          return ability.description.toLowerCase().includes('block') ||
                 ability.description.toLowerCase().includes('reduce');
        case 'REFLECT':
          return ability.description.toLowerCase().includes('healing') ||
                 ability.description.toLowerCase().includes('prevent');
        case 'ENDURE':
          return ability.description.toLowerCase().includes('pierce') ||
                 ability.description.toLowerCase().includes('ignore');
        case 'EMBRACE':
          return ability.description.toLowerCase().includes('multiply') ||
                 ability.description.toLowerCase().includes('amplify');
        default:
          return false;
      }
    });

    if (counterAbilities.length > 0) {
      return counterAbilities[Math.floor(Math.random() * counterAbilities.length)];
    }
  }

  // Default: Use random available ability
  const selectedAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
  console.log('Shadow selected ability:', selectedAbility?.name || 'none');
  return selectedAbility;
}

/**
 * Execute shadow action and return updated state
 *
 * This function now includes the critical health damage mechanic where
 * shadows deal damage to player health based on scene DC minus defenses
 * after each shadow ability is used.
 */
export function executeShadowAction(
  ability: ShadowAbility,
  state: CombatState,
  guardianTrust: number
): {
  newState: CombatState;
  logEntry: CombatLogEntry;
  healthDamage: number;
} {
  const newState = { ...state };

  // Apply the ability effect
  ability.effect(newState);

  // Set ability on cooldown
  if (newState.currentEnemy) {
    const abilityIndex = newState.currentEnemy.abilities.findIndex(a => a.id === ability.id);
    if (abilityIndex !== -1) {
      newState.currentEnemy.abilities[abilityIndex].currentCooldown = ability.cooldown;
    }
  }

  // Calculate health damage based on scene DC minus player defenses
  const healthDamage = calculateShadowHealthDamage(newState.sceneDC, newState, guardianTrust);

  const logEntry: CombatLogEntry = {
    turn: state.turn,
    actor: 'SHADOW',
    action: ability.name,
    effect: ability.description,
    resourceChange: { healthDamage }, // Track health damage in log
    message: `The shadow uses ${ability.name}: ${ability.description}. You take ${healthDamage} health damage!`
  };

  return { newState, logEntry, healthDamage };
}

/**
 * Process status effects and cooldowns at turn end
 */
export function processStatusEffects(state: CombatState): CombatState {
  const newState = { ...state };

  // Reduce status effect durations
  if (newState.healingBlocked > 0) {
    newState.healingBlocked -= 1;
  }

  if (newState.lpGenerationBlocked > 0) {
    newState.lpGenerationBlocked -= 1;
  }

  // Reset damage multiplier and reduction after one turn
  if (newState.damageMultiplier !== 1) {
    newState.damageMultiplier = 1;
  }

  if (newState.damageReduction !== 1) {
    newState.damageReduction = 1;
  }

  // Reset skip turn flag
  if (newState.skipNextTurn) {
    newState.skipNextTurn = false;
  }

  // Reduce ability cooldowns
  if (newState.currentEnemy) {
    newState.currentEnemy.abilities = newState.currentEnemy.abilities.map(ability => ({
      ...ability,
      currentCooldown: Math.max(0, ability.currentCooldown - 1)
    }));
  }

  return newState;
}

/**
 * Check if combat should end (victory/defeat conditions)
 */
export function checkCombatEnd(state: CombatState): {
  isEnded: boolean;
  victory?: boolean;
  reason?: string;
} {
  // Victory: Shadow defeated
  if (state.currentEnemy && state.currentEnemy.currentHP <= 0) {
    return {
      isEnded: true,
      victory: true,
      reason: `You have overcome ${state.currentEnemy.name}!`
    };
  }

  // Defeat: Player has no resources and cannot continue
  if (state.resources.lp <= 0 && state.resources.sp <= 0) {
    return {
      isEnded: true,
      victory: false,
      reason: 'You have been overwhelmed by the shadow...'
    };
  }

  // Turn limit reached: Shadow wins by default
  if (state.turn >= COMBAT_BALANCE.MAX_COMBAT_TURNS) {
    return {
      isEnded: true,
      victory: false,
      reason: `The shadow has outlasted your efforts. Combat ended after ${COMBAT_BALANCE.MAX_COMBAT_TURNS} turns.`
    };
  }

  // Combat continues
  return { isEnded: false };
}
