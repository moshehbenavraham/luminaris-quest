// Built with Bolt.new
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
import type { CombatAction, ShadowManifestation } from '@/store/game-store';
import { getEnvironmentConfig } from '@/lib/environment';

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
  // Validation checksum to ensure sync integrity
  syncChecksum?: string;
}

// Sync validation utilities
export interface SyncValidation {
  checksum: string;
  timestamp: number;
  source: 'game' | 'combat';
  lp: number;
  sp: number;
}

// Transaction-like sync operations
export interface SyncTransaction {
  id: string;
  type: 'game-to-combat' | 'combat-to-game';
  timestamp: number;
  sourceState: {
    lp: number;
    sp: number;
    playerHealth: number;
    playerEnergy: number;
  };
  targetState: {
    lp: number;
    sp: number;
    playerHealth: number;
    playerEnergy: number;
  };
  validation: SyncValidation;
  status: 'pending' | 'committed' | 'rolled-back' | 'failed';
  errorMessage?: string;
}

export interface SyncTransactionResult {
  success: boolean;
  transaction: SyncTransaction;
  errorMessage?: string;
}

/**
 * Generates a validation checksum for LP/SP sync operations
 * Uses a simple hash of the values + timestamp for integrity checking
 */
export const generateSyncChecksum = (lp: number, sp: number, timestamp: number = Date.now()): string => {
  // Create a simple hash based on the values and timestamp
  const dataString = `${lp}:${sp}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Validates the integrity of synced LP/SP values
 */
export const validateSyncChecksum = (validation: SyncValidation): boolean => {
  const expectedChecksum = generateSyncChecksum(validation.lp, validation.sp, validation.timestamp);
  return expectedChecksum === validation.checksum;
};

/**
 * Creates a new sync transaction with validation
 */
export const createSyncTransaction = (
  type: 'game-to-combat' | 'combat-to-game',
  sourceState: SyncTransaction['sourceState'],
  targetState: SyncTransaction['targetState']
): SyncTransaction => {
  const timestamp = Date.now();
  const validation: SyncValidation = {
    checksum: generateSyncChecksum(targetState.lp, targetState.sp, timestamp),
    timestamp,
    source: type === 'game-to-combat' ? 'game' : 'combat',
    lp: targetState.lp,
    sp: targetState.sp
  };
  
  return {
    id: `sync-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp,
    sourceState,
    targetState,
    validation,
    status: 'pending'
  };
};

/**
 * Validates a sync transaction before committing
 */
export const validateSyncTransaction = (transaction: SyncTransaction): boolean => {
  // Check if validation checksum is correct
  if (!validateSyncChecksum(transaction.validation)) {
    return false;
  }
  
  // Check if state changes are within reasonable bounds
  const lpDelta = Math.abs(transaction.targetState.lp - transaction.sourceState.lp);
  const spDelta = Math.abs(transaction.targetState.sp - transaction.sourceState.sp);
  
  // Prevent extreme changes (safety check)
  if (lpDelta > 100 || spDelta > 100) {
    return false;
  }
  
  // Check for valid health values
  if (transaction.targetState.playerHealth < 0 || transaction.targetState.playerHealth > 100) {
    return false;
  }
  
  return true;
};

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
  
  // Sync validation tracking
  syncValidation: {
    lastGameStoreSync: SyncValidation | null;
    lastCombatStoreSync: SyncValidation | null;
    syncErrors: string[];
  };
  
  // Transaction management
  syncTransactions: {
    pending: SyncTransaction[];
    history: SyncTransaction[];
    maxHistorySize: number;
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
  
  // Sync validation actions
  validateGameStoreSync: (gameResources: GameResources) => boolean;
  createSyncValidation: (source: 'game' | 'combat') => SyncValidation;
  logSyncError: (error: string) => void;
  getSyncStatus: () => { isValid: boolean; errors: string[] };
  
  // Transaction-like sync actions
  beginSyncTransaction: (type: 'game-to-combat' | 'combat-to-game', sourceState: SyncTransaction['sourceState'], targetState: SyncTransaction['targetState']) => SyncTransactionResult;
  commitSyncTransaction: (transactionId: string) => SyncTransactionResult;
  rollbackSyncTransaction: (transactionId: string) => SyncTransactionResult;
  getSyncTransactionHistory: () => SyncTransaction[];
  clearSyncTransactionHistory: () => void;
  
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
  syncValidation: {
    lastGameStoreSync: null,
    lastCombatStoreSync: null,
    syncErrors: [],
  },
  syncTransactions: {
    pending: [],
    history: [],
    maxHistorySize: 50,
  },
  _hasHydrated: false,
};

export const useCombatStore = create<CombatState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startCombat: (enemy, gameResources) => {
        // Validate game store sync if resources provided
        if (gameResources && !get().validateGameStoreSync(gameResources)) {
          get().logSyncError('Game store sync validation failed during combat start');
          console.warn('Combat sync validation failed - proceeding with default values');
        }
        
        // Prepare source and target states for transaction
        const sourceState = {
          lp: get().resources.lp,
          sp: get().resources.sp,
          playerHealth: get().playerHealth,
          playerEnergy: get().playerEnergy
        };
        
        const targetState = {
          lp: gameResources?.lightPoints ?? initialState.resources.lp,
          sp: gameResources?.shadowPoints ?? initialState.resources.sp,
          playerHealth: gameResources?.playerHealth ?? initialState.playerHealth,
          playerEnergy: gameResources?.playerEnergy ?? initialState.playerEnergy
        };
        
        // Begin transaction for game-to-combat sync
        const transactionResult = get().beginSyncTransaction('game-to-combat', sourceState, targetState);
        
        if (!transactionResult.success) {
          get().logSyncError(`Combat start failed: ${transactionResult.errorMessage}`);
          // Fall back to safe defaults
          targetState.lp = initialState.resources.lp;
          targetState.sp = initialState.resources.sp;
          targetState.playerHealth = initialState.playerHealth;
          targetState.playerEnergy = initialState.playerEnergy;
        }
        
        const playerLevel = gameResources?.playerLevel ?? initialState.playerLevel;
        const maxPlayerEnergy = gameResources?.maxPlayerEnergy ?? initialState.maxPlayerEnergy;
        
        // Create sync validation record for this import from game store
        const gameStoreValidation = get().createSyncValidation('game');
        
        set({
          isActive: true,
          enemy,
          resources: { lp: targetState.lp, sp: targetState.sp },
          playerHealth: targetState.playerHealth,
          playerLevel,
          playerEnergy: targetState.playerEnergy,
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
          syncValidation: {
            lastGameStoreSync: gameStoreValidation,
            lastCombatStoreSync: null,
            syncErrors: get().syncValidation.syncErrors, // Preserve existing errors
          },
        });
        
        // Commit the transaction if it was successful
        if (transactionResult.success) {
          get().commitSyncTransaction(transactionResult.transaction.id);
        }
        
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
        
        // Check if action can be performed (including energy cost)
        const canPerform = selectCanUseAction(action)(state);
        if (!canPerform) return;
        
        const config = getEnvironmentConfig();
        
        // Calculate energy cost for this action - only ENDURE consumes energy in combat
        const energyCost = action === 'ENDURE' ? config.combatEnergyCosts[action.toLowerCase() as keyof typeof config.combatEnergyCosts] || 0 : 0;
        const newPlayerEnergy = Math.max(0, state.playerEnergy - energyCost);
        
        // Note: Low-energy penalties removed from combat actions except ENDURE
        
        // Execute action and apply resource costs
        let newResources = { ...state.resources };
        let enemyHP = state.enemy.currentHP;
        let damage = 0;
        let effect = '';
        let message = '';
        
        switch (action) {
          case 'ILLUMINATE':
            if (newResources.lp >= 2) {
              newResources.lp -= 2;
              // Simple damage calculation - no energy penalty for ILLUMINATE
              const baseDamage = 3 + Math.floor((state.playerLevel || 1) * 1.5);
              damage = baseDamage; // No energy multiplier applied
              enemyHP = Math.max(0, enemyHP - damage);
              effect = `Dealt ${damage} damage`;
              message = 'You shine light on your inner shadow, seeing it clearly for what it is.';
            }
            break;
            
          case 'REFLECT':
            if (newResources.sp >= 3) {
              newResources.sp -= 3;
              newResources.lp += 1;
              
              // Add health healing: 1d(playerLevel) - roll a dice from 1 to playerLevel
              const healthHeal = Math.floor(Math.random() * state.playerLevel) + 1;
              const newHealth = Math.min(100, state.playerHealth + healthHeal);
              
              effect = `Converted 3 SP to 1 LP and healed ${healthHeal} health`;
              message = 'You reflect on your shadows, transforming them into understanding and healing.';
              
              // Update player health
              set({ playerHealth: newHealth });
            }
            break;
            
          case 'ENDURE':
            newResources.lp += 1;
            effect = 'Gained 1 LP from endurance';
            message = 'You endure the challenge, building inner strength.';
            break;
            
          case 'EMBRACE':
            if (newResources.sp >= 5) {
              const baseDamage = Math.max(1, Math.floor(newResources.sp / 2));
              damage = baseDamage; // No energy multiplier applied to EMBRACE
              newResources.sp = 0; // Embrace consumes all SP
              enemyHP = Math.max(0, enemyHP - damage);
              effect = `Dealt ${damage} damage, consumed all SP`;
              message = 'You embrace your shadows, accepting them as part of your strength.';
            }
            break;
        }
        
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
          resources: newResources,
          playerEnergy: newPlayerEnergy,
          enemy: state.enemy ? { ...state.enemy, currentHP: enemyHP } : null,
          preferredActions: {
            ...state.preferredActions,
            [action]: state.preferredActions[action] + 1,
          },
        });
        
        // Add action to log
        get().addLogEntry({
          turn: state.turn,
          actor: 'PLAYER',
          action,
          // Only show energy cost for ENDURE action to avoid UI confusion
          effect: (action === 'ENDURE' && energyCost > 0) ? `${effect} | -${energyCost} Energy` : effect,
          message,
        });
        
        // Check if enemy is defeated
        if (enemyHP <= 0) {
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
          
          // Simple enemy AI - deal damage to player
          const baseDamage = 8;
          const defense = Math.floor(currentState.resources.lp * 0.5);
          const actualDamage = Math.max(1, baseDamage - defense);
          const newPlayerHealth = Math.max(0, currentState.playerHealth - actualDamage);
          
          // Enemy action
          const enemyAction = currentState.enemy.currentHP < (currentState.enemy.maxHP * 0.5) 
            ? 'Desperate Strike' 
            : 'Shadow Attack';
          
          set({ 
            playerHealth: newPlayerHealth,
            resources: {
              ...currentState.resources,
              sp: Math.min(10, currentState.resources.sp + 1) // Gain 1 SP from being attacked
            }
          });
          
          // Add enemy action to log
          get().addLogEntry({
            turn: currentState.turn,
            actor: 'SHADOW',
            action: enemyAction,
            effect: `Dealt ${actualDamage} damage to you`,
            message: `${currentState.enemy.name} strikes at your resolve, but you gain insight from the challenge.`,
          });
          
          // Check if player is defeated
          if (newPlayerHealth <= 0) {
            get().endCombat(false);
            return;
          }
          
          // Start next turn
          set((state) => ({
            turn: state.turn + 1,
            isPlayerTurn: true,
          }));
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
          
        // Update combat state immediately
        set({
          isActive: false,
          combatEndStatus: {
            isEnded: true,
            victory,
            reason,
          },
        });
        
        // Note: Resource synchronization will be handled by CombatEndModal
        // to avoid circular dependency issues between stores
        
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
            console.warn(`Failed to play combat end sound for ${victory ? 'victory' : 'defeat'}:`, error);
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
      
      // Sync validation implementation
      validateGameStoreSync: (gameResources) => {
        if (!gameResources.syncChecksum) {
          // If no checksum provided, skip validation but log warning
          get().logSyncError('No sync checksum provided from game store');
          return false;
        }
        
        const validation: SyncValidation = {
          checksum: gameResources.syncChecksum,
          timestamp: Date.now(),
          source: 'game',
          lp: gameResources.lightPoints,
          sp: gameResources.shadowPoints,
        };
        
        const isValid = validateSyncChecksum(validation);
        if (!isValid) {
          get().logSyncError(`Invalid sync checksum: expected ${generateSyncChecksum(validation.lp, validation.sp, validation.timestamp)}, got ${validation.checksum}`);
        }
        
        return isValid;
      },
      
      createSyncValidation: (source) => {
        const state = get();
        const timestamp = Date.now();
        const checksum = generateSyncChecksum(state.resources.lp, state.resources.sp, timestamp);
        
        return {
          checksum,
          timestamp,
          source,
          lp: state.resources.lp,
          sp: state.resources.sp,
        };
      },
      
      logSyncError: (error) => {
        set((state) => ({
          syncValidation: {
            ...state.syncValidation,
            syncErrors: [...state.syncValidation.syncErrors, `${new Date().toISOString()}: ${error}`],
          },
        }));
        console.warn('Combat Store Sync Error:', error);
      },
      
      getSyncStatus: () => {
        const state = get();
        return {
          isValid: state.syncValidation.syncErrors.length === 0,
          errors: state.syncValidation.syncErrors,
        };
      },
      
      // Transaction-like sync implementation
      beginSyncTransaction: (type, sourceState, targetState) => {
        const transaction = createSyncTransaction(type, sourceState, targetState);
        
        // Validate the transaction before adding it to pending
        if (!validateSyncTransaction(transaction)) {
          const errorMsg = `Transaction validation failed: Invalid state transition from ${JSON.stringify(sourceState)} to ${JSON.stringify(targetState)}`;
          transaction.status = 'failed';
          transaction.errorMessage = errorMsg;
          get().logSyncError(errorMsg);
          
          return {
            success: false,
            transaction,
            errorMessage: errorMsg
          };
        }
        
        // Add to pending transactions
        set((state) => ({
          syncTransactions: {
            ...state.syncTransactions,
            pending: [...state.syncTransactions.pending, transaction]
          }
        }));
        
        console.log(`Sync transaction ${transaction.id} created and validated:`, {
          type: transaction.type,
          sourceLP: sourceState.lp,
          targetLP: targetState.lp,
          validation: transaction.validation.checksum
        });
        
        return {
          success: true,
          transaction
        };
      },
      
      commitSyncTransaction: (transactionId) => {
        const state = get();
        const transaction = state.syncTransactions.pending.find(t => t.id === transactionId);
        
        if (!transaction) {
          const errorMsg = `Transaction ${transactionId} not found in pending transactions`;
          get().logSyncError(errorMsg);
          return {
            success: false,
            transaction: transaction!,
            errorMessage: errorMsg
          };
        }
        
        // Final validation before commit
        if (!validateSyncTransaction(transaction)) {
          const errorMsg = `Transaction ${transactionId} failed final validation`;
          transaction.status = 'failed';
          transaction.errorMessage = errorMsg;
          get().logSyncError(errorMsg);
          
          return {
            success: false,
            transaction,
            errorMessage: errorMsg
          };
        }
        
        // Commit the transaction: apply the changes to combat store
        if (transaction.type === 'game-to-combat') {
          set(() => ({
            resources: {
              lp: transaction.targetState.lp,
              sp: transaction.targetState.sp
            },
            playerHealth: transaction.targetState.playerHealth,
            playerEnergy: transaction.targetState.playerEnergy
          }));
        }
        // For combat-to-game, the changes are applied externally to game store
        
        // Update transaction status and move to history
        transaction.status = 'committed';
        
        set((state) => {
          const newHistory = [...state.syncTransactions.history, transaction];
          // Limit history size
          if (newHistory.length > state.syncTransactions.maxHistorySize) {
            newHistory.shift(); // Remove oldest
          }
          
          return {
            syncTransactions: {
              ...state.syncTransactions,
              pending: state.syncTransactions.pending.filter(t => t.id !== transactionId),
              history: newHistory
            }
          };
        });
        
        console.log(`Sync transaction ${transactionId} committed successfully`);
        
        return {
          success: true,
          transaction
        };
      },
      
      rollbackSyncTransaction: (transactionId) => {
        const state = get();
        const transaction = state.syncTransactions.pending.find(t => t.id === transactionId);
        
        if (!transaction) {
          const errorMsg = `Transaction ${transactionId} not found for rollback`;
          get().logSyncError(errorMsg);
          return {
            success: false,
            transaction: transaction!,
            errorMessage: errorMsg
          };
        }
        
        // Mark as rolled back and move to history
        transaction.status = 'rolled-back';
        
        set((state) => ({
          syncTransactions: {
            ...state.syncTransactions,
            pending: state.syncTransactions.pending.filter(t => t.id !== transactionId),
            history: [...state.syncTransactions.history, transaction]
          }
        }));
        
        console.log(`Sync transaction ${transactionId} rolled back`);
        
        return {
          success: true,
          transaction
        };
      },
      
      getSyncTransactionHistory: () => {
        return get().syncTransactions.history;
      },
      
      clearSyncTransactionHistory: () => {
        set((state) => ({
          syncTransactions: {
            ...state.syncTransactions,
            history: []
          }
        }));
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
    }
  )
);

// Selectors for common derived state
export const selectCanUseAction = (action: CombatAction) => (state: CombatState) => {
  if (!state.isActive || !state.isPlayerTurn) return false;
  
  const { resources, playerEnergy } = state;
  const config = getEnvironmentConfig();
  // Only ENDURE action consumes energy in combat
  const energyCost = action === 'ENDURE' ? config.combatEnergyCosts[action.toLowerCase() as keyof typeof config.combatEnergyCosts] || 0 : 0;
  
  // Check if player has enough energy (only applies to ENDURE)
  if (action === 'ENDURE' && playerEnergy < energyCost) return false;
  
  switch (action) {
    case 'ILLUMINATE':
      return resources.lp >= 2;
    case 'REFLECT':
      return resources.sp >= 3;
    case 'ENDURE':
      return true; // Always available (only costs energy)
    case 'EMBRACE':
      return resources.sp >= 5;
    default:
      return false;
  }
};

export const selectActionCost = (action: CombatAction) => () => {
  const config = getEnvironmentConfig();
  // Only ENDURE action shows energy cost in UI
  const energyCost = action === 'ENDURE' ? config.combatEnergyCosts[action.toLowerCase() as keyof typeof config.combatEnergyCosts] || 0 : 0;
  
  switch (action) {
    case 'ILLUMINATE':
      return { lp: 2 }; // No energy cost displayed
    case 'REFLECT':
      return { sp: 3 }; // No energy cost displayed
    case 'ENDURE':
      return { energy: energyCost }; // Only ENDURE shows energy cost
    case 'EMBRACE':
      return { sp: 5 }; // No energy cost displayed
    default:
      return {};
  }
};

export const selectActionDescription = (action: CombatAction) => () => {
  switch (action) {
    case 'ILLUMINATE':
      return 'Shine light on your fears, dealing damage based on your trust level';
    case 'REFLECT':
      return 'Transform 3 shadow points into light and heal 1d(level) health';
    case 'ENDURE':
      return 'Weather the storm, reducing damage and building resilience';
    case 'EMBRACE':
      return 'Accept your shadows as strength, dealing massive damage at a cost';
    default:
      return '';
  }
};