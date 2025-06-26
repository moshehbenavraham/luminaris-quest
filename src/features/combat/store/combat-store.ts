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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CombatAction, ShadowManifestation } from '@/store/game-store';

export interface CombatResources {
  lp: number;
  sp: number;
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
  startCombat: (enemy: ShadowManifestation) => void;
  executeAction: (action: CombatAction) => void;
  endTurn: () => void;
  surrender: () => void;
  endCombat: (victory: boolean) => void;
  
  // Helper actions
  addLogEntry: (entry: Omit<CombatLogEntry, 'timestamp'>) => void;
  updateStatusEffect: (effect: keyof StatusEffects, value: number | boolean) => void;
  
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

export const useCombatStore = create<CombatState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startCombat: (enemy) => {
        set({
          isActive: true,
          enemy,
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
        
        // Track action usage
        set((state) => ({
          preferredActions: {
            ...state.preferredActions,
            [action]: state.preferredActions[action] + 1,
          },
        }));
        
        // Add action to log
        get().addLogEntry({
          turn: state.turn,
          actor: 'PLAYER',
          action,
          effect: 'Action executed', // This will be updated by combat engine
          message: `You use ${action}!`,
        });
        
        // Action execution will be handled by combat engine integration
      },
      
      endTurn: () => {
        const state = get();
        if (!state.isActive || !state.isPlayerTurn) return;
        
        set({ isPlayerTurn: false });
        
        // Enemy turn will be handled by combat engine
        setTimeout(() => {
          if (get().isActive) {
            set((state) => ({
              turn: state.turn + 1,
              isPlayerTurn: true,
            }));
          }
        }, 1500); // Enemy turn delay
      },
      
      surrender: () => {
        get().endCombat(false);
      },
      
      endCombat: (victory) => {
        const state = get();
        const reason = victory 
          ? `You've overcome ${state.enemy?.name}!`
          : 'You retreat to gather your strength...';
          
        set({
          isActive: false,
          combatEndStatus: {
            isEnded: true,
            victory,
            reason,
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
        preferredActions: state.preferredActions,
        flags: state.flags,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selectors for common derived state
export const selectCanUseAction = (action: CombatAction) => (state: CombatState) => {
  if (!state.isActive || !state.isPlayerTurn) return false;
  
  const { resources } = state;
  
  switch (action) {
    case 'ILLUMINATE':
      return resources.lp >= 2;
    case 'REFLECT':
      return resources.sp >= 1;
    case 'ENDURE':
      return true; // Always available
    case 'EMBRACE':
      return resources.sp >= 5;
    default:
      return false;
  }
};

export const selectActionCost = (action: CombatAction) => () => {
  switch (action) {
    case 'ILLUMINATE':
      return { lp: 2 };
    case 'REFLECT':
      return { sp: 1 };
    case 'ENDURE':
      return {};
    case 'EMBRACE':
      return { sp: 5 };
    default:
      return {};
  }
};

export const selectActionDescription = (action: CombatAction) => () => {
  switch (action) {
    case 'ILLUMINATE':
      return 'Shine light on your fears, dealing damage based on your trust level';
    case 'REFLECT':
      return 'Transform shadow points into light points and heal yourself';
    case 'ENDURE':
      return 'Weather the storm, reducing damage and building resilience';
    case 'EMBRACE':
      return 'Accept your shadows as strength, dealing massive damage at a cost';
    default:
      return '';
  }
};