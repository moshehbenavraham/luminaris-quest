/**
 * Combat Sync Transaction Tests
 * 
 * Tests the transaction-like sync operations for atomic state changes
 * between the game store and combat store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createSyncTransaction,
  validateSyncTransaction,
  useCombatStore,
  type SyncTransaction,
  type SyncTransactionResult
} from '@/features/combat/store/combat-store';
import { createShadowManifestation } from '@/data/shadowManifestations';

describe('Combat Sync Transaction System', () => {
  beforeEach(() => {
    // Reset combat store state before each test
    const store = useCombatStore.getState();
    store.clearCombatEnd();
    store.setHasHydrated(true);
    
    // Reset sync validation and transaction state
    useCombatStore.setState({
      ...useCombatStore.getState(),
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
      isActive: false,
    });
  });

  describe('Transaction Creation and Validation', () => {
    it('should create valid sync transactions', () => {
      const sourceState = { lp: 10, sp: 5, playerHealth: 80, playerEnergy: 60 };
      const targetState = { lp: 12, sp: 3, playerHealth: 100, playerEnergy: 70 };
      
      const transaction = createSyncTransaction('game-to-combat', sourceState, targetState);
      
      expect(transaction.id).toMatch(/^sync-\d+-[a-z0-9]{9}$/);
      expect(transaction.type).toBe('game-to-combat');
      expect(transaction.status).toBe('pending');
      expect(transaction.sourceState).toEqual(sourceState);
      expect(transaction.targetState).toEqual(targetState);
      expect(transaction.validation.source).toBe('game');
      expect(transaction.validation.lp).toBe(targetState.lp);
      expect(transaction.validation.sp).toBe(targetState.sp);
    });

    it('should validate reasonable state transitions', () => {
      const sourceState = { lp: 10, sp: 5, playerHealth: 80, playerEnergy: 60 };
      const targetState = { lp: 12, sp: 3, playerHealth: 100, playerEnergy: 70 };
      
      const transaction = createSyncTransaction('combat-to-game', sourceState, targetState);
      
      expect(validateSyncTransaction(transaction)).toBe(true);
    });

    it('should reject extreme state changes', () => {
      const sourceState = { lp: 10, sp: 5, playerHealth: 80, playerEnergy: 60 };
      const targetState = { lp: 150, sp: 3, playerHealth: 100, playerEnergy: 70 }; // Extreme LP change
      
      const transaction = createSyncTransaction('game-to-combat', sourceState, targetState);
      
      expect(validateSyncTransaction(transaction)).toBe(false);
    });

    it('should reject invalid health values', () => {
      const sourceState = { lp: 10, sp: 5, playerHealth: 80, playerEnergy: 60 };
      const targetState = { lp: 12, sp: 3, playerHealth: 150, playerEnergy: 70 }; // Invalid health
      
      const transaction = createSyncTransaction('game-to-combat', sourceState, targetState);
      
      expect(validateSyncTransaction(transaction)).toBe(false);
    });
  });

  describe('Transaction Lifecycle Management', () => {
    it('should successfully begin and commit a valid transaction', () => {
      const combatStore = useCombatStore.getState();
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      const targetState = { lp: 12, sp: 3, playerHealth: 100, playerEnergy: 95 };
      
      // Begin transaction
      const beginResult = combatStore.beginSyncTransaction('game-to-combat', sourceState, targetState);
      
      expect(beginResult.success).toBe(true);
      expect(beginResult.transaction.status).toBe('pending');
      
      // Check transaction is in pending list
      let state = useCombatStore.getState();
      expect(state.syncTransactions.pending).toHaveLength(1);
      expect(state.syncTransactions.pending[0].id).toBe(beginResult.transaction.id);
      
      // Commit transaction
      const commitResult = combatStore.commitSyncTransaction(beginResult.transaction.id);
      
      expect(commitResult.success).toBe(true);
      expect(commitResult.transaction.status).toBe('committed');
      
      // Check transaction moved to history
      state = useCombatStore.getState();
      expect(state.syncTransactions.pending).toHaveLength(0);
      expect(state.syncTransactions.history).toHaveLength(1);
      expect(state.syncTransactions.history[0].status).toBe('committed');
      
      // Check state was updated for game-to-combat transaction
      expect(state.resources.lp).toBe(targetState.lp);
      expect(state.resources.sp).toBe(targetState.sp);
      expect(state.playerHealth).toBe(targetState.playerHealth);
      expect(state.playerEnergy).toBe(targetState.playerEnergy);
    });

    it('should handle transaction rollback', () => {
      const combatStore = useCombatStore.getState();
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      const targetState = { lp: 8, sp: 7, playerHealth: 90, playerEnergy: 80 };
      
      // Begin transaction
      const beginResult = combatStore.beginSyncTransaction('combat-to-game', sourceState, targetState);
      expect(beginResult.success).toBe(true);
      
      // Rollback transaction
      const rollbackResult = combatStore.rollbackSyncTransaction(beginResult.transaction.id);
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.transaction.status).toBe('rolled-back');
      
      // Check transaction moved to history
      const state = useCombatStore.getState();
      expect(state.syncTransactions.pending).toHaveLength(0);
      expect(state.syncTransactions.history).toHaveLength(1);
      expect(state.syncTransactions.history[0].status).toBe('rolled-back');
    });

    it('should reject invalid transactions at begin stage', () => {
      const combatStore = useCombatStore.getState();
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      const targetState = { lp: 200, sp: 3, playerHealth: 100, playerEnergy: 95 }; // Invalid extreme change
      
      const beginResult = combatStore.beginSyncTransaction('game-to-combat', sourceState, targetState);
      
      expect(beginResult.success).toBe(false);
      expect(beginResult.errorMessage).toContain('Transaction validation failed');
      
      // Check no transaction was added to pending
      const state = useCombatStore.getState();
      expect(state.syncTransactions.pending).toHaveLength(0);
      expect(state.syncValidation.syncErrors.length).toBeGreaterThan(0);
    });

    it('should handle non-existent transaction operations', () => {
      const combatStore = useCombatStore.getState();
      
      const commitResult = combatStore.commitSyncTransaction('non-existent-id');
      expect(commitResult.success).toBe(false);
      expect(commitResult.errorMessage).toContain('not found');
      
      const rollbackResult = combatStore.rollbackSyncTransaction('non-existent-id');
      expect(rollbackResult.success).toBe(false);
      expect(rollbackResult.errorMessage).toContain('not found');
    });
  });

  describe('Transaction History Management', () => {
    it('should maintain transaction history', () => {
      const combatStore = useCombatStore.getState();
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      
      // Create and commit multiple transactions
      for (let i = 0; i < 3; i++) {
        const targetState = { lp: 10 + i, sp: 5 - i, playerHealth: 100, playerEnergy: 100 - i * 5 };
        const beginResult = combatStore.beginSyncTransaction('game-to-combat', sourceState, targetState);
        combatStore.commitSyncTransaction(beginResult.transaction.id);
      }
      
      const history = combatStore.getSyncTransactionHistory();
      expect(history).toHaveLength(3);
      
      history.forEach((transaction, index) => {
        expect(transaction.status).toBe('committed');
        expect(transaction.targetState.lp).toBe(10 + index);
        expect(transaction.targetState.sp).toBe(5 - index);
      });
    });

    it('should limit history size', () => {
      const combatStore = useCombatStore.getState();
      
      // Set a small max history size for testing
      useCombatStore.setState({
        ...useCombatStore.getState(),
        syncTransactions: {
          pending: [],
          history: [],
          maxHistorySize: 2,
        },
      });
      
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      
      // Create more transactions than the history limit
      for (let i = 0; i < 5; i++) {
        const targetState = { lp: 10 + i, sp: 5, playerHealth: 100, playerEnergy: 100 };
        const beginResult = combatStore.beginSyncTransaction('game-to-combat', sourceState, targetState);
        combatStore.commitSyncTransaction(beginResult.transaction.id);
      }
      
      const history = combatStore.getSyncTransactionHistory();
      expect(history).toHaveLength(2); // Should be limited to maxHistorySize
      
      // Should contain the most recent transactions
      expect(history[0].targetState.lp).toBe(13); // 4th transaction (index 3)
      expect(history[1].targetState.lp).toBe(14); // 5th transaction (index 4)
    });

    it('should clear transaction history', () => {
      const combatStore = useCombatStore.getState();
      const sourceState = { lp: 10, sp: 5, playerHealth: 100, playerEnergy: 100 };
      const targetState = { lp: 12, sp: 3, playerHealth: 100, playerEnergy: 95 };
      
      // Create a transaction
      const beginResult = combatStore.beginSyncTransaction('game-to-combat', sourceState, targetState);
      combatStore.commitSyncTransaction(beginResult.transaction.id);
      
      expect(combatStore.getSyncTransactionHistory()).toHaveLength(1);
      
      // Clear history
      combatStore.clearSyncTransactionHistory();
      
      expect(combatStore.getSyncTransactionHistory()).toHaveLength(0);
    });
  });

  describe('Integration with Combat Flow', () => {
    it('should use transactions during combat start', () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      const gameResources = {
        lightPoints: 15,
        shadowPoints: 2,
        playerHealth: 80,
        playerLevel: 1,
        playerEnergy: 90,
        maxPlayerEnergy: 100
      };
      
      // Start combat (should use transaction system internally)
      combatStore.startCombat(enemy!, gameResources);
      
      // Check that combat state was set correctly
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.resources.lp).toBe(gameResources.lightPoints);
      expect(state.resources.sp).toBe(gameResources.shadowPoints);
      expect(state.playerHealth).toBe(gameResources.playerHealth);
      expect(state.playerEnergy).toBe(gameResources.playerEnergy);
      
      // Check that a transaction was processed
      expect(state.syncTransactions.history.length).toBeGreaterThan(0);
      const lastTransaction = state.syncTransactions.history[state.syncTransactions.history.length - 1];
      expect(lastTransaction.type).toBe('game-to-combat');
      expect(lastTransaction.status).toBe('committed');
    });

    it('should handle invalid game resources during combat start', () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      const invalidGameResources = {
        lightPoints: 250, // Extreme value that should be rejected
        shadowPoints: 2,
        playerHealth: 80,
        playerLevel: 1,
        playerEnergy: 90,
        maxPlayerEnergy: 100
      };
      
      // Start combat (should handle invalid resources gracefully)
      combatStore.startCombat(enemy!, invalidGameResources);
      
      // Check that combat still started with safe defaults
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.resources.lp).toBe(10); // Should fallback to safe default
      expect(state.resources.sp).toBe(0);  // Should fallback to safe default
      
      // Check that errors were logged
      expect(state.syncValidation.syncErrors.length).toBeGreaterThan(0);
    });
  });
});