import { useMemo, useCallback } from 'react';
import { useGameStore } from '../store/game-store';
import type { CombatAction, ShadowManifestation } from '../store/game-store';
import {
  canPerformAction,
  checkCombatEnd,
  COMBAT_BALANCE
} from '../engine/combat-engine';
import { useCombatSounds } from './useCombatSounds';

/**
 * useCombat Hook - Interface between combat engine and UI components
 * 
 * This hook provides a clean API for combat interactions, handling:
 * - Action validation and execution
 * - Derived state calculations
 * - Combat flow management
 * - Real-time combat status
 */

export interface CombatHookReturn {
  // Combat state
  isActive: boolean;
  enemy: ShadowManifestation | null;
  resources: { lp: number; sp: number };
  turn: number;
  log: Array<{
    turn: number;
    actor: 'PLAYER' | 'SHADOW';
    action: string;
    effect: string;
    message: string;
  }>;
  
  // Status effects
  statusEffects: {
    damageMultiplier: number;
    damageReduction: number;
    healingBlocked: boolean;
    lpGenerationBlocked: boolean;
    skipNextTurn: boolean;
    consecutiveEndures: number;
  };
  
  // Derived state
  canUseAction: (_action: CombatAction) => boolean;
  getActionCost: (_action: CombatAction) => { lp?: number; sp?: number };
  getActionDescription: (_action: CombatAction) => string;
  isPlayerTurn: boolean;
  combatEndStatus: {
    isEnded: boolean;
    victory?: boolean;
    reason?: string;
  };
  playerHealth: number;
  playerLevel: number;

  // Actions
  executeAction: (_action: CombatAction) => void;
  startCombat: (_enemyId: string) => void;
  endTurn: () => void;
  endCombat: (_victory: boolean) => void;
  
  // Therapeutic insights
  preferredActions: Record<CombatAction, number>;
  growthInsights: string[];
  getMostUsedAction: () => CombatAction | null;
  getTherapeuticInsight: () => string;
}

export function useCombat(): CombatHookReturn {
  const {
    combat,
    guardianTrust,
    playerHealth,
    playerLevel,
    startCombat: storeStartCombat,
    executeCombatAction: storeExecuteCombatAction,
    endTurn: storeEndTurn,
    endCombat: storeEndCombat
  } = useGameStore();

  // Initialize combat sounds
  const {
    playActionSound
  } = useCombatSounds();

  // Provide default combat state if undefined (defensive programming)
  const safeCombat = combat || {
    inCombat: false,
    currentEnemy: null,
    resources: { lp: 0, sp: 0 },
    turn: 0,
    log: [],
    sceneDC: 0,
    damageMultiplier: 1,
    damageReduction: 1,
    healingBlocked: 0,
    lpGenerationBlocked: 0,
    skipNextTurn: false,
    consecutiveEndures: 0,
    preferredActions: {
      ILLUMINATE: 0,
      REFLECT: 0,
      ENDURE: 0,
      EMBRACE: 0
    },
    growthInsights: [],
    combatReflections: []
  };

  // Derived state calculations
  const statusEffects = useMemo(() => ({
    damageMultiplier: safeCombat.damageMultiplier,
    damageReduction: safeCombat.damageReduction,
    healingBlocked: safeCombat.healingBlocked > 0,
    lpGenerationBlocked: safeCombat.lpGenerationBlocked > 0,
    skipNextTurn: safeCombat.skipNextTurn,
    consecutiveEndures: safeCombat.consecutiveEndures
  }), [safeCombat]);

  const combatEndStatus = useMemo(() => {
    if (!safeCombat.inCombat) {
      return { isEnded: true };
    }
    return checkCombatEnd(safeCombat);
  }, [safeCombat]);

  const isPlayerTurn = useMemo(() => {
    return safeCombat.inCombat && !safeCombat.skipNextTurn;
  }, [safeCombat.inCombat, safeCombat.skipNextTurn]);

  // Action validation
  const canUseAction = useCallback((action: CombatAction): boolean => {
    if (!safeCombat.inCombat || !isPlayerTurn) return false;
    return canPerformAction(action, safeCombat, guardianTrust).canPerform;
  }, [safeCombat, guardianTrust, isPlayerTurn]);

  // Action cost calculation
  const getActionCost = useCallback((action: CombatAction): { lp?: number; sp?: number } => {
    switch (action) {
      case 'ILLUMINATE':
        return { lp: COMBAT_BALANCE.ILLUMINATE_LP_COST };
      case 'REFLECT':
        return { sp: COMBAT_BALANCE.REFLECT_SP_COST };
      case 'ENDURE':
        return {}; // No resource cost
      case 'EMBRACE':
        return { sp: Math.min(safeCombat.resources.sp, 2) }; // Uses available SP up to 2
      default:
        return {};
    }
  }, [safeCombat.resources.sp]);

  // Action descriptions
  const getActionDescription = useCallback((action: CombatAction): string => {
    switch (action) {
      case 'ILLUMINATE':
        return `Shine light on the shadow with awareness and understanding. Deals ${3 + Math.floor(guardianTrust / 4)} damage.`;
      case 'REFLECT':
        return 'Transform shadow energy into light through wisdom and reframing. Converts 2 SP to 1 LP and heals.';
      case 'ENDURE':
        return 'Build resilience and reduce incoming damage by 50% for one turn.';
      case 'EMBRACE':
        return 'Accept difficult emotions without judgment, using shadow energy to deal damage.';
      default:
        return '';
    }
  }, [guardianTrust]);

  // Therapeutic insights
  const getMostUsedAction = useCallback((): CombatAction | null => {
    const actions = Object.entries(safeCombat.preferredActions) as [CombatAction, number][];
    if (actions.length === 0) return null;

    const mostUsed = actions.reduce((max, [action, count]) =>
      count > max[1] ? [action, count] : max
    );

    return mostUsed[1] > 0 ? mostUsed[0] : null;
  }, [safeCombat.preferredActions]);

  const getTherapeuticInsight = useCallback((): string => {
    if (!safeCombat.currentEnemy) return '';

    const mostUsed = getMostUsedAction();
    if (!mostUsed) return safeCombat.currentEnemy.therapeuticInsight;

    const insights = {
      ILLUMINATE: 'You prefer to face challenges with awareness and understanding. This shows your strength in seeking clarity.',
      REFLECT: 'You excel at finding wisdom in difficult situations. This demonstrates your ability to grow through adversity.',
      ENDURE: 'You show great resilience in the face of hardship. This reveals your inner strength and determination.',
      EMBRACE: 'You have learned to accept difficult emotions. This shows your emotional maturity and self-compassion.'
    };

    return insights[mostUsed] || safeCombat.currentEnemy.therapeuticInsight;
  }, [safeCombat.currentEnemy, getMostUsedAction]);

  // Action execution with full combat flow
  const executeAction = useCallback(async (action: CombatAction) => {
    if (!canUseAction(action)) {
      console.warn(`Cannot perform action ${action}:`, {
        inCombat: safeCombat.inCombat,
        isPlayerTurn,
        canPerform: canPerformAction(action, safeCombat, guardianTrust)
      });
      return;
    }

    // Play action sound effect
    try {
      await playActionSound(action);
    } catch (error) {
      console.warn(`Failed to play sound for action ${action}:`, error);
    }

    // Execute the action through the store
    storeExecuteCombatAction(action);
  }, [canUseAction, safeCombat, guardianTrust, isPlayerTurn, storeExecuteCombatAction, playActionSound]);

  const endTurn = useCallback(() => {
    if (!safeCombat.inCombat) return;
    storeEndTurn();
  }, [safeCombat.inCombat, storeEndTurn]);

  return {
    // Combat state
    isActive: safeCombat.inCombat,
    enemy: safeCombat.currentEnemy,
    resources: safeCombat.resources,
    turn: safeCombat.turn,
    log: safeCombat.log,
    playerHealth,
    playerLevel,

    // Status effects
    statusEffects,

    // Derived state
    canUseAction,
    getActionCost,
    getActionDescription,
    isPlayerTurn,
    combatEndStatus,

    // Actions
    executeAction,
    startCombat: storeStartCombat,
    endTurn,
    endCombat: storeEndCombat,

    // Therapeutic insights
    preferredActions: safeCombat.preferredActions,
    growthInsights: safeCombat.growthInsights,
    getMostUsedAction,
    getTherapeuticInsight
  };
}
