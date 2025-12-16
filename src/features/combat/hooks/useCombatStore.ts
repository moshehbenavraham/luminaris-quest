/* eslint-disable react-hooks/set-state-in-effect -- SSR hydration pattern */

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

import { useCallback, useState, useEffect } from 'react';
import {
  useCombatStore as useStore,
  selectCanUseAction,
  selectActionCost,
  selectActionDescription,
} from '@/features/combat/store/combat-store';
import type { CombatAction } from '@/types';

/**
 * useCombatStore - Custom hook for accessing combat state with selectors
 *
 * This hook provides:
 * - Optimized selectors to prevent unnecessary re-renders
 * - Derived state calculations
 * - Helper functions for common operations
 * - SSR/Hydration safety
 */
export const useCombatStore = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Core state
  const isActive = useStore((state) => state.isActive);
  const enemy = useStore((state) => state.enemy);
  const resources = useStore((state) => state.resources);
  const playerHealth = useStore((state) => state.playerHealth);
  const playerLevel = useStore((state) => state.playerLevel);
  const playerEnergy = useStore((state) => state.playerEnergy);
  const turn = useStore((state) => state.turn);
  const isPlayerTurn = useStore((state) => state.isPlayerTurn);
  const combatEndStatus = useStore((state) => state.combatEndStatus);
  const statusEffects = useStore((state) => state.statusEffects);
  const log = useStore((state) => state.log);
  const preferredActions = useStore((state) => state.preferredActions);
  const flags = useStore((state) => state.flags);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Actions
  const startCombat = useStore((state) => state.startCombat);
  const executeAction = useStore((state) => state.executeAction);
  const endTurn = useStore((state) => state.endTurn);
  const surrender = useStore((state) => state.surrender);
  const endCombat = useStore((state) => state.endCombat);
  const clearCombatEnd = useStore((state) => state.clearCombatEnd);
  const addLogEntry = useStore((state) => state.addLogEntry);
  const updateStatusEffect = useStore((state) => state.updateStatusEffect);

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

  // Hydration Check
  if (!hasMounted || !hasHydrated) {
    return {
      // Safe Defaults
      isActive: false,
      enemy: null,
      resources: { lp: 10, sp: 0 },
      playerHealth: 100,
      playerLevel: 1,
      playerEnergy: 100,
      turn: 0,
      isPlayerTurn: true,
      combatEndStatus: { isEnded: false, victory: false, reason: '' },
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: 0,
        lpGenerationBlocked: 0,
        skipNextTurn: false,
        consecutiveEndures: 0,
      },
      log: [],
      preferredActions: {},
      flags: { newCombatUI: true },
      hasHydrated: false,

      // Actions & Helpers (Safe to pass through)
      startCombat,
      executeAction,
      endTurn,
      surrender,
      endCombat,
      clearCombatEnd,
      addLogEntry,
      updateStatusEffect,
      canUseAction,
      getActionCost,
      getActionDescription,
      getMostUsedAction,
      getTherapeuticInsight,
    };
  }

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

// Individual selectors for specific use cases - with hydration safety
// These hooks include hydration checks to prevent SSR mismatches

/**
 * Hydration-safe selector for combat active state
 * Returns false during hydration to prevent SSR mismatches
 */
export const useCombatActive = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const isActive = useStore((state) => state.isActive);
  const hasHydrated = useStore((state) => state._hasHydrated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return safe default during hydration
  if (!hasMounted || !hasHydrated) return false;
  return isActive;
};

/**
 * Hydration-safe selector for combat enemy
 * Returns null during hydration to prevent SSR mismatches
 */
export const useCombatEnemy = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const enemy = useStore((state) => state.enemy);
  const hasHydrated = useStore((state) => state._hasHydrated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return safe default during hydration
  if (!hasMounted || !hasHydrated) return null;
  return enemy;
};

/**
 * Hydration-safe selector for combat resources (LP/SP)
 * Returns safe defaults during hydration to prevent SSR mismatches
 */
export const useCombatResources = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const resources = useStore((state) => state.resources);
  const hasHydrated = useStore((state) => state._hasHydrated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return safe default during hydration
  if (!hasMounted || !hasHydrated) return { lp: 10, sp: 0 };
  return resources;
};

/**
 * Hydration-safe selector for combat feature flags
 * Returns safe defaults during hydration to prevent SSR mismatches
 */
export const useCombatFlags = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const flags = useStore((state) => state.flags);
  const hasHydrated = useStore((state) => state._hasHydrated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return safe default during hydration
  if (!hasMounted || !hasHydrated) return { newCombatUI: true };
  return flags;
};

// Legacy combat system removed - always use new combat UI
export const useNewCombatUI = () => true;
