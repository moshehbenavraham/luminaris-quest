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
  REFLECT_SP_COST: 2,
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
} as const;

/**
 * Calculate damage for ILLUMINATE action
 * Therapeutic insight: Awareness and understanding reduce emotional pain
 */
export function calculateIlluminateDamage(guardianTrust: number): number {
  const baseDamage = COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE;
  const trustBonus = Math.floor(guardianTrust / COMBAT_BALANCE.ILLUMINATE_TRUST_SCALING);
  return baseDamage + trustBonus;
}

/**
 * Calculate damage for EMBRACE action
 * Therapeutic insight: Accepting difficult emotions reduces their power
 */
export function calculateEmbraceDamage(shadowPoints: number): number {
  // Embrace converts shadow points to damage (1 SP = 2 damage)
  // Minimum 1 damage even with 0 SP
  return Math.max(1, Math.floor(shadowPoints / 2));
}

/**
 * Validate if a combat action can be performed
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
 */
export function executePlayerAction(
  action: CombatAction,
  state: CombatState,
  guardianTrust: number
): {
  newState: CombatState;
  logEntry: CombatLogEntry;
  damage?: number;
} {
  const newState = { ...state };
  let damage = 0;
  let effect = '';
  let message = '';
  const resourceChange: Partial<LightShadowResources> & { enemyHP?: number } = {};

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
      const spCost = COMBAT_BALANCE.REFLECT_SP_COST;
      const healAmount = COMBAT_BALANCE.REFLECT_HEAL_AMOUNT;
      
      newState.resources.sp = Math.max(0, newState.resources.sp - spCost);
      newState.resources.lp += healAmount;
      
      resourceChange.sp = -spCost;
      resourceChange.lp = healAmount;
      effect = `Converted ${spCost} SP to ${healAmount} LP`;
      message = `You find wisdom in your struggle, transforming pain into understanding. Your inner light grows stronger.`;
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

  return { newState, logEntry, damage };
}

/**
 * Shadow AI decision making - determines which ability to use
 * Therapeutic insight: Shadows represent patterns of negative thinking
 */
export function decideShadowAction(
  enemy: ShadowManifestation,
  state: CombatState
): ShadowAbility | null {
  if (!enemy.abilities || enemy.abilities.length === 0) {
    return null;
  }

  // Filter abilities that are off cooldown
  const availableAbilities = enemy.abilities.filter(ability => ability.currentCooldown === 0);

  if (availableAbilities.length === 0) {
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
  return availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
}

/**
 * Execute shadow action and return updated state
 */
export function executeShadowAction(
  ability: ShadowAbility,
  state: CombatState
): {
  newState: CombatState;
  logEntry: CombatLogEntry;
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

  const logEntry: CombatLogEntry = {
    turn: state.turn,
    actor: 'SHADOW',
    action: ability.name,
    effect: ability.description,
    resourceChange: {},
    message: `The shadow uses ${ability.name}: ${ability.description}`
  };

  return { newState, logEntry };
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
