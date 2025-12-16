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
 */

// ✅✅✅ THIS IS THE NEW COMBAT SYSTEM - USE THIS ✅✅✅
// This is the ACTIVE combat store for all new development
// Located in: /src/features/combat/
// DO NOT confuse with OLD system in /src/store/game-store.ts
// See docs/archive/COMBAT_MIGRATION_GUIDE.md for details

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CombatAction, ShadowManifestation } from '@/types';
import { getEnvironmentConfig } from '@/lib/environment';
import { usePlayerResources } from '@/store/slices';
import {
  canPerformAction as engineCanPerformAction,
  executeEnemyTurn as engineExecuteEnemyTurn,
  executePlayerAction as engineExecutePlayerAction,
  getActionCost as engineGetActionCost,
  getActionDescription as engineGetActionDescription,
  type CombatEngineState,
} from '@/engine/combat-engine';

export interface CombatResources {
  lp: number;
  sp: number;
}

export interface GameResources {
  lightPoints: number;
  shadowPoints: number;
  playerHealth: number;
  playerLevel: number;
  playerEnergy: number;
  maxPlayerEnergy: number;
}

export interface StatusEffects {
  damageMultiplier: number;
  damageReduction: number;
  healingBlocked: number;
  lpGenerationBlocked: number;
  skipNextTurn: boolean;
  consecutiveEndures: number;
}

export interface CombatLogEntry {
  turn: number;
  actor: 'PLAYER' | 'SHADOW';
  action: string;
  effect: string;
  message: string;
  timestamp: number;
}

export interface CombatState {
  // Core state
  isActive: boolean;
  enemy: ShadowManifestation | null;
  resources: CombatResources;
  playerHealth: number;
  playerLevel: number;
  playerEnergy: number;
  maxPlayerEnergy: number;
  turn: number;
  isPlayerTurn: boolean;

  // Combat flow
  combatEndStatus: {
    isEnded: boolean;
    victory: boolean;
    reason: string;
  };

  // Status effects
  statusEffects: StatusEffects;

  // Combat log
  log: CombatLogEntry[];

  // Action tracking
  preferredActions: Record<CombatAction, number>;

  // Feature flags
  flags: {
    newCombatUI: boolean;
  };

  // Actions
  startCombat: (enemy: ShadowManifestation, gameResources?: GameResources) => void;
  executeAction: (action: CombatAction) => void;
  endTurn: () => void;
  surrender: () => void;
  endCombat: (victory: boolean) => void;
  clearCombatEnd: () => void;

  // Helper actions
  addLogEntry: (entry: Omit<CombatLogEntry, 'timestamp'>) => void;
  updateStatusEffect: (effect: keyof StatusEffects, value: number | boolean) => void;
  _executeEnemyTurn: () => void;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const initialState = {
  isActive: false,
  enemy: null,
  resources: { lp: 10, sp: 0 },
  playerHealth: 100,
  playerLevel: 1,
  playerEnergy: 100,
  maxPlayerEnergy: 100,
  turn: 0,
  isPlayerTurn: true,
  combatEndStatus: {
    isEnded: false,
    victory: false,
    reason: '',
  },
  statusEffects: {
    damageMultiplier: 1,
    damageReduction: 1,
    healingBlocked: 0,
    lpGenerationBlocked: 0,
    skipNextTurn: false,
    consecutiveEndures: 0,
  },
  log: [],
  preferredActions: {
    ILLUMINATE: 0,
    REFLECT: 0,
    ENDURE: 0,
    EMBRACE: 0,
  } as Record<CombatAction, number>,
  flags: {
    newCombatUI: true, // Default to new UI
  },
  _hasHydrated: false,
};

const toEngineState = (state: CombatState): CombatEngineState => ({
  enemy: state.enemy,
  resources: state.resources,
  playerHealth: state.playerHealth,
  playerLevel: state.playerLevel,
  playerEnergy: state.playerEnergy,
  maxPlayerEnergy: state.maxPlayerEnergy,
  turn: state.turn,
  isPlayerTurn: state.isPlayerTurn,
  statusEffects: state.statusEffects,
  preferredActions: state.preferredActions,
});

export const useCombatStore = create<CombatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startCombat: (enemy, gameResources) => {
        // Get shared resource store (single source of truth)
        const sharedResources = usePlayerResources.getState();

        // If gameResources provided, sync them to shared store first (for backward compatibility)
        if (gameResources) {
          sharedResources.setAllResources({
            lightPoints: gameResources.lightPoints,
            shadowPoints: gameResources.shadowPoints,
            playerHealth: gameResources.playerHealth,
            playerEnergy: gameResources.playerEnergy,
            maxPlayerEnergy: gameResources.maxPlayerEnergy,
          });
        }

        // Now read from shared store (either updated or existing values)
        const resourceSnapshot = sharedResources.getResourceSnapshot();
        const lp = resourceSnapshot.lightPoints;
        const sp = resourceSnapshot.shadowPoints;
        const playerHealth = resourceSnapshot.playerHealth;
        const playerEnergy = resourceSnapshot.playerEnergy;
        const maxPlayerEnergy = resourceSnapshot.maxPlayerEnergy;
        const playerLevel = gameResources?.playerLevel ?? initialState.playerLevel;

        set({
          isActive: true,
          enemy,
          resources: { lp, sp },
          playerHealth,
          playerLevel,
          playerEnergy,
          maxPlayerEnergy,
          turn: 1,
          isPlayerTurn: true,
          combatEndStatus: {
            isEnded: false,
            victory: false,
            reason: '',
          },
          log: [],
          statusEffects: initialState.statusEffects,
        });

        get().addLogEntry({
          turn: 1,
          actor: 'SHADOW',
          action: 'Combat Started',
          effect: `${enemy.name} emerges from your inner shadows...`,
          message: enemy.description,
        });
      },

      executeAction: (action) => {
        const state = get();
        if (!state.isActive || !state.enemy || !state.isPlayerTurn) return;

        const config = getEnvironmentConfig();

        // Calculate energy cost for this action - only ENDURE consumes energy in combat

        const energyCost =
          action === 'ENDURE'
            ? config.combatEnergyCosts[
                action.toLowerCase() as keyof typeof config.combatEnergyCosts
              ] || 0
            : 0;

        // Delegate validation + resolution to the combat engine (single source of truth)
        const engineState = toEngineState(state);
        const { canPerform } = engineCanPerformAction(action, engineState, {
          endureEnergyCost: energyCost,
        });
        if (!canPerform) return;

        const result = engineExecutePlayerAction(action, engineState, {
          endureEnergyCost: energyCost,
        });

        // Play action sound effect
        (async () => {
          try {
            // Import the sound manager dynamically to avoid circular dependencies
            const { soundManager } = await import('@/utils/sound-manager');
            const soundId = action.toLowerCase(); // Convert ILLUMINATE to illuminate, etc.
            await soundManager.playSound(soundId, 2);
          } catch (error) {
            console.warn(`Failed to play sound for action ${action}:`, error);
          }
        })();

        // Update state
        set({
          resources: result.newState.resources,
          playerHealth: result.newState.playerHealth,
          playerEnergy: result.newState.playerEnergy,
          enemy: result.newState.enemy,
          preferredActions: result.newState.preferredActions,
        });

        // Add action to log
        get().addLogEntry({
          turn: result.logEntry.turn,
          actor: result.logEntry.actor,
          action: result.logEntry.action,
          effect: result.logEntry.effect,
          message: result.logEntry.message,
        });

        // Check if enemy is defeated
        if (
          result.newState.enemy?.currentHP !== undefined &&
          result.newState.enemy.currentHP <= 0
        ) {
          get().endCombat(true);
          return;
        }

        // Automatically trigger enemy turn after player action
        get()._executeEnemyTurn();
      },

      endTurn: () => {
        const state = get();
        if (!state.isActive || !state.isPlayerTurn) return;

        // Pass turn to enemy without taking any action
        get()._executeEnemyTurn();
      },

      _executeEnemyTurn: () => {
        const state = get();
        if (!state.isActive || !state.enemy) return;

        set({ isPlayerTurn: false });

        // Enemy turn logic with delay
        setTimeout(async () => {
          const currentState = get();
          if (!currentState.isActive || !currentState.enemy) return;

          // Play shadow attack sound effect
          try {
            // Import the sound manager dynamically to avoid circular dependencies
            const { soundManager } = await import('@/utils/sound-manager');
            await soundManager.playSound('shadow-attack', 2);
          } catch (error) {
            console.warn('Failed to play shadow attack sound:', error);
          }

          // Delegate enemy turn resolution to the combat engine (single source of truth)
          const engineState = toEngineState(currentState);
          const result = engineExecuteEnemyTurn(engineState);

          set({
            playerHealth: result.newState.playerHealth,
            resources: result.newState.resources,
            turn: result.newState.turn,
            isPlayerTurn: result.newState.isPlayerTurn,
          });

          // Add enemy action to log
          get().addLogEntry({
            turn: result.logEntry.turn,
            actor: result.logEntry.actor,
            action: result.logEntry.action,
            effect: result.logEntry.effect,
            message: result.logEntry.message,
          });

          // Check if player is defeated
          if (result.newState.playerHealth <= 0) {
            get().endCombat(false);
            return;
          }
        }, 2500); // Enemy turn delay - increased for better visibility
      },

      surrender: () => {
        get().endCombat(false);
      },

      endCombat: (victory) => {
        const state = get();
        const reason = victory
          ? `You've overcome ${state.enemy?.name}!`
          : 'You retreat to gather your strength...';

        // Sync resources back to shared store (single source of truth)
        const sharedResources = usePlayerResources.getState();
        sharedResources.setAllResources({
          lightPoints: state.resources.lp,
          shadowPoints: state.resources.sp,
          playerHealth: state.playerHealth,
          playerEnergy: state.playerEnergy,
        });

        // Update combat state immediately
        set({
          isActive: false,
          combatEndStatus: {
            isEnded: true,
            victory,
            reason,
          },
        });

        // Play victory or defeat sound asynchronously (don't block state update)
        (async () => {
          try {
            // Import the sound manager dynamically to avoid circular dependencies
            const { soundManager } = await import('@/utils/sound-manager');
            if (victory) {
              await soundManager.playSound('victory', 5);
            } else {
              await soundManager.playSound('defeat', 3);
            }
          } catch (error) {
            console.warn(
              `Failed to play combat end sound for ${victory ? 'victory' : 'defeat'}:`,
              error,
            );
          }
        })();
      },

      clearCombatEnd: () => {
        set({
          combatEndStatus: {
            isEnded: false,
            victory: false,
            reason: '',
          },
        });
      },

      addLogEntry: (entry) => {
        set((state) => ({
          log: [...state.log, { ...entry, timestamp: Date.now() }],
        }));
      },

      updateStatusEffect: (effect, value) => {
        set((state) => ({
          statusEffects: {
            ...state.statusEffects,
            [effect]: value,
          },
        }));
      },

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: 'combat-storage',
      partialize: (state) => ({
        // Only persist certain fields
        resources: state.resources,
        playerHealth: state.playerHealth,
        playerLevel: state.playerLevel,
        playerEnergy: state.playerEnergy,
        maxPlayerEnergy: state.maxPlayerEnergy,
        preferredActions: state.preferredActions,
        flags: state.flags,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Selectors for common derived state
export const selectCanUseAction = (action: CombatAction) => (state: CombatState) => {
  if (!state.isActive || !state.isPlayerTurn) return false;

  const config = getEnvironmentConfig();
  // Only ENDURE action consumes energy in combat
  const energyCost =
    action === 'ENDURE'
      ? config.combatEnergyCosts[action.toLowerCase() as keyof typeof config.combatEnergyCosts] || 0
      : 0;

  const engineState = toEngineState(state);
  return engineCanPerformAction(action, engineState, { endureEnergyCost: energyCost }).canPerform;
};

export const selectActionCost = (action: CombatAction) => () => {
  const config = getEnvironmentConfig();
  // Only ENDURE action shows energy cost in UI
  const energyCost =
    action === 'ENDURE'
      ? config.combatEnergyCosts[action.toLowerCase() as keyof typeof config.combatEnergyCosts] || 0
      : 0;

  return engineGetActionCost(action, { endureEnergyCost: energyCost });
};

export const selectActionDescription = (action: CombatAction) => () => {
  return engineGetActionDescription(action);
};
