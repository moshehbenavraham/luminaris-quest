/**
 * Combat Sync Validation Tests
 * 
 * Tests the validation checksum system for LP/SP synchronization
 * between the game store and combat store to prevent data corruption.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateSyncChecksum, 
  validateSyncChecksum,
  useCombatStore,
  type SyncValidation,
  type GameResources
} from '../features/combat/store/combat-store';
import { createShadowManifestation } from '../data/shadowManifestations';

describe('Combat Sync Validation System', () => {
  beforeEach(() => {
    // Reset combat store state before each test
    const store = useCombatStore.getState();
    store.clearCombatEnd();
    store.setHasHydrated(true);
    
    // Reset sync validation state
    useCombatStore.setState({
      ...useCombatStore.getState(),
      syncValidation: {
        lastGameStoreSync: null,
        lastCombatStoreSync: null,
        syncErrors: [],
      },
      isActive: false,
    });
  });

  describe('Checksum Generation and Validation', () => {
    it('should generate consistent checksums for same values', () => {
      const timestamp = Date.now();
      const checksum1 = generateSyncChecksum(10, 5, timestamp);
      const checksum2 = generateSyncChecksum(10, 5, timestamp);
      
      expect(checksum1).toBe(checksum2);
      expect(checksum1).toMatch(/^[a-z0-9]+$/); // Alphanumeric base36
    });

    it('should generate different checksums for different values', () => {
      const timestamp = Date.now();
      const checksum1 = generateSyncChecksum(10, 5, timestamp);
      const checksum2 = generateSyncChecksum(10, 6, timestamp);
      const checksum3 = generateSyncChecksum(11, 5, timestamp);
      
      expect(checksum1).not.toBe(checksum2);
      expect(checksum1).not.toBe(checksum3);
      expect(checksum2).not.toBe(checksum3);
    });

    it('should validate correct checksums', () => {
      const lp = 15;
      const sp = 3;
      const timestamp = Date.now();
      const checksum = generateSyncChecksum(lp, sp, timestamp);
      
      const validation: SyncValidation = {
        checksum,
        timestamp,
        source: 'game',
        lp,
        sp
      };
      
      expect(validateSyncChecksum(validation)).toBe(true);
    });

    it('should reject invalid checksums', () => {
      const validation: SyncValidation = {
        checksum: 'invalid_checksum_123',
        timestamp: Date.now(),
        source: 'game',
        lp: 15,
        sp: 3
      };
      
      expect(validateSyncChecksum(validation)).toBe(false);
    });
  });

  describe('Combat Start Sync Validation', () => {
    // Use separate beforeEach for these tests to avoid resetting sync errors we want to test
    beforeEach(() => {
      // Only reset combat active state, not sync validation
      useCombatStore.setState({
        ...useCombatStore.getState(),
        isActive: false,
      });
    });
    
    it('should successfully start combat with valid sync checksum', () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      const lp = 12;
      const sp = 4;
      const syncChecksum = generateSyncChecksum(lp, sp);
      
      const gameResources: GameResources = {
        lightPoints: lp,
        shadowPoints: sp,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 80,
        maxPlayerEnergy: 100,
        syncChecksum
      };
      
      combatStore.startCombat(enemy!, gameResources);
      
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.resources.lp).toBe(lp);
      expect(state.resources.sp).toBe(sp);
      expect(state.syncValidation.lastGameStoreSync).not.toBeNull();
      expect(state.syncValidation.syncErrors).toHaveLength(0);
    });

    it('should log error for invalid sync checksum but still start combat', () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      const gameResources: GameResources = {
        lightPoints: 12,
        shadowPoints: 4,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 80,
        maxPlayerEnergy: 100,
        syncChecksum: 'invalid_checksum'
      };
      
      combatStore.startCombat(enemy!, gameResources);
      
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true); // Combat should still start
      expect(state.syncValidation.syncErrors.length).toBeGreaterThan(0);
      expect(state.syncValidation.syncErrors[0]).toContain('Invalid sync checksum');
    });

    it('should log warning for missing sync checksum', () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      const gameResources: GameResources = {
        lightPoints: 12,
        shadowPoints: 4,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 80,
        maxPlayerEnergy: 100
        // No syncChecksum provided
      };
      
      combatStore.startCombat(enemy!, gameResources);
      
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true); // Combat should still start
      expect(state.syncValidation.syncErrors.length).toBeGreaterThan(0);
      expect(state.syncValidation.syncErrors[0]).toContain('No sync checksum provided');
    });
  });

  describe('Sync Validation API', () => {
    it('should create valid sync validation records', () => {
      const combatStore = useCombatStore.getState();
      
      // Set up combat state first
      const enemy = createShadowManifestation('whisper-of-doubt');
      combatStore.startCombat(enemy!, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
        syncChecksum: generateSyncChecksum(10, 5)
      });
      
      const validation = combatStore.createSyncValidation('combat');
      
      expect(validation.source).toBe('combat');
      expect(validation.lp).toBe(10);
      expect(validation.sp).toBe(5);
      expect(validation.checksum).toMatch(/^[a-z0-9]+$/);
      expect(validation.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it('should track sync status correctly', () => {
      const combatStore = useCombatStore.getState();
      
      // Initial state should be valid (no errors)
      let status = combatStore.getSyncStatus();
      expect(status.isValid).toBe(true);
      expect(status.errors).toHaveLength(0);
      
      // Add a sync error
      combatStore.logSyncError('Test error');
      
      status = combatStore.getSyncStatus();
      expect(status.isValid).toBe(false);
      expect(status.errors).toHaveLength(1);
      expect(status.errors[0]).toContain('Test error');
    });

    it('should maintain error history with timestamps', () => {
      const combatStore = useCombatStore.getState();
      
      combatStore.logSyncError('First error');
      combatStore.logSyncError('Second error');
      
      const status = combatStore.getSyncStatus();
      expect(status.errors).toHaveLength(2);
      
      // Check that both errors have timestamps
      status.errors.forEach(error => {
        expect(error).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero values correctly', () => {
      const checksum = generateSyncChecksum(0, 0);
      const validation: SyncValidation = {
        checksum,
        timestamp: Date.now(),
        source: 'game',
        lp: 0,
        sp: 0
      };
      
      expect(validateSyncChecksum(validation)).toBe(true);
    });

    it('should handle large values correctly', () => {
      const lp = 999;
      const sp = 999;
      const checksum = generateSyncChecksum(lp, sp);
      const validation: SyncValidation = {
        checksum,
        timestamp: Date.now(),
        source: 'combat',
        lp,
        sp
      };
      
      expect(validateSyncChecksum(validation)).toBe(true);
    });

    it('should handle floating point precision issues', () => {
      // Test with values that might have floating point precision issues
      const lp = Math.floor(10.7);  // 10
      const sp = Math.floor(5.9);   // 5
      
      const checksum = generateSyncChecksum(lp, sp);
      const validation: SyncValidation = {
        checksum,
        timestamp: Date.now(),
        source: 'game',
        lp,
        sp
      };
      
      expect(validateSyncChecksum(validation)).toBe(true);
    });
  });

  describe('Integration with Combat Flow', () => {
    it('should maintain sync validation through complete combat cycle', async () => {
      const combatStore = useCombatStore.getState();
      const enemy = createShadowManifestation('whisper-of-doubt');
      
      // Start combat with valid sync
      const initialLP = 10;
      const initialSP = 3;
      const syncChecksum = generateSyncChecksum(initialLP, initialSP);
      
      combatStore.startCombat(enemy!, {
        lightPoints: initialLP,
        shadowPoints: initialSP,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
        syncChecksum
      });
      
      // Verify initial sync validation
      let state = useCombatStore.getState();
      expect(state.syncValidation.lastGameStoreSync).not.toBeNull();
      expect(state.syncValidation.syncErrors).toHaveLength(0);
      
      // Execute some actions that modify resources
      combatStore.executeAction('ILLUMINATE'); // -2 LP
      
      // Check LP after first action
      let currentState = useCombatStore.getState();
      expect(currentState.resources.lp).toBe(initialLP - 2); // Should be 8
      console.log('After ILLUMINATE: LP=', currentState.resources.lp, 'Energy=', currentState.playerEnergy);
      
      combatStore.executeAction('ENDURE');     // +1 LP
      
      // Check LP after second action
      currentState = useCombatStore.getState();
      console.log('After ENDURE: LP=', currentState.resources.lp, 'Energy=', currentState.playerEnergy);
      // The issue might be that ENDURE didn't execute due to insufficient energy
      expect(currentState.resources.lp).toBeGreaterThanOrEqual(initialLP - 2); // At least 8
      
      // Wait for enemy turns to complete (they add SP)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create sync validation for end of combat
      const finalValidation = combatStore.createSyncValidation('combat');
      expect(finalValidation.lp).toBe(initialLP - 2 + 1); // 9
      // SP might vary based on enemy actions during turns
      expect(finalValidation.sp).toBeGreaterThanOrEqual(initialSP);
      
      // Verify validation is consistent
      expect(validateSyncChecksum(finalValidation)).toBe(true);
    });
  });
});