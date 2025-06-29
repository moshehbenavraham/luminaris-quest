/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * ⚠️ CLAUDE CODE FAILURE - ATTEMPT #3 ⚠️
 * Modified: 2025-06-28
 * FAILED: Added playerEnergy export to support battle results screen
 * but NO battle results screen appears after combat. Export exists but not working.
 * STATUS: FAILED ATTEMPT - Battle results screen still missing
 */

import { useCallback } from 'react';
import { 
  useCombatStore as useStore, 
  selectCanUseAction, 
  selectActionCost,
  selectActionDescription
} from '@/features/combat/store/combat-store';
import type { CombatAction } from '@/store/game-store';

/**
 * useCombatStore - Custom hook for accessing combat state with selectors
 * 
 * This hook provides:
 * - Optimized selectors to prevent unnecessary re-renders
 * - Derived state calculations
 * - Helper functions for common operations
 */
export const useCombatStore = () => {
  // Core state
  const isActive = useStore(state => state.isActive);
  const enemy = useStore(state => state.enemy);
  const resources = useStore(state => state.resources);
  const playerHealth = useStore(state => state.playerHealth);
  const playerLevel = useStore(state => state.playerLevel);
  const playerEnergy = useStore(state => state.playerEnergy);
  const turn = useStore(state => state.turn);
  const isPlayerTurn = useStore(state => state.isPlayerTurn);
  const combatEndStatus = useStore(state => state.combatEndStatus);
  const statusEffects = useStore(state => state.statusEffects);
  const log = useStore(state => state.log);
  const preferredActions = useStore(state => state.preferredActions);
  const flags = useStore(state => state.flags);
  const hasHydrated = useStore(state => state._hasHydrated);
  
  // Actions
  const startCombat = useStore(state => state.startCombat);
  const executeAction = useStore(state => state.executeAction);
  const endTurn = useStore(state => state.endTurn);
  const surrender = useStore(state => state.surrender);
  const endCombat = useStore(state => state.endCombat);
  const clearCombatEnd = useStore(state => state.clearCombatEnd);
  const addLogEntry = useStore(state => state.addLogEntry);
  const updateStatusEffect = useStore(state => state.updateStatusEffect);
  
  // Derived state with memoization
  const canUseAction = useCallback((action: CombatAction) => {
    return selectCanUseAction(action)(useStore.getState());
  }, []);
  
  const getActionCost = useCallback((action: CombatAction) => {
    return selectActionCost(action)();
  }, []);
  
  const getActionDescription = useCallback((action: CombatAction) => {
    return selectActionDescription(action)();
  }, []);
  
  // Helper functions
  const getMostUsedAction = useCallback(() => {
    if (!preferredActions) return null;
    
    let maxAction: CombatAction | null = null;
    let maxCount = 0;
    
    Object.entries(preferredActions).forEach(([action, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxAction = action as CombatAction;
      }
    });
    
    return maxAction;
  }, [preferredActions]);
  
  const getTherapeuticInsight = useCallback(() => {
    if (!enemy) return 'Face your inner shadows with courage...';
    
    switch (enemy.type) {
      case 'doubt':
        return 'Doubt loses power when examined in the light of awareness.';
      case 'isolation':
        return 'Connection begins with connecting to yourself.';
      case 'overwhelm':
        return 'Break the overwhelming into manageable pieces.';
      case 'past-pain':
        return 'Your past wounds can become your greatest wisdom.';
      default:
        return 'Every shadow faced is a step toward wholeness.';
    }
  }, [enemy]);
  
  return {
    // State
    isActive,
    enemy,
    resources,
    playerHealth,
    playerLevel,
    playerEnergy,
    turn,
    isPlayerTurn,
    combatEndStatus,
    statusEffects,
    log,
    preferredActions,
    flags,
    hasHydrated,
    
    // Actions
    startCombat,
    executeAction,
    endTurn,
    surrender,
    endCombat,
    clearCombatEnd,
    addLogEntry,
    updateStatusEffect,
    
    // Derived state
    canUseAction,
    getActionCost,
    getActionDescription,
    getMostUsedAction,
    getTherapeuticInsight,
  };
};

// Individual selectors for specific use cases
export const useCombatActive = () => useStore(state => state.isActive);
export const useCombatEnemy = () => useStore(state => state.enemy);
export const useCombatResources = () => useStore(state => state.resources);
export const useCombatFlags = () => useStore(state => state.flags);
export const useNewCombatUI = () => {
  const flags = useStore(state => state.flags);
  const hasLegacyParam = typeof window !== 'undefined' && 
    window.location.search.includes('legacyCombat=1');
  
  return flags.newCombatUI && !hasLegacyParam;
};