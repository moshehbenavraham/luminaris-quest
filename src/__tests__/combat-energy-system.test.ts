import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCombatStore, selectCanUseAction, selectActionCost } from '../features/combat/store/combat-store';
import type { ShadowManifestation } from '../store/game-store';
import { getEnvironmentConfig } from '../lib/environment';

// Mock environment config for consistent testing
vi.mock('../lib/environment', () => ({
  getEnvironmentConfig: vi.fn(() => ({
    combatEnergyCosts: {
      illuminate: 3,
      reflect: 2,
      endure: 1,
      embrace: 5
    },
    lowEnergyThreshold: 20,
    lowEnergyPenalty: 0.5
  }))
}));

// Mock sound manager to avoid audio issues in tests
vi.mock('../utils/sound-manager', () => ({
  soundManager: {
    playSound: vi.fn().mockResolvedValue(undefined)
  }
}));

// Create mock shadow enemy
const mockShadowEnemy: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Test Shadow',
  description: 'A test shadow for combat',
  maxHP: 50,
  currentHP: 50,
  type: 'doubt',
  abilities: [],
  therapeuticInsight: 'Test insight',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'Test growth',
    permanentBenefit: 'Test benefit'
  }
};

describe('Combat Energy System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store state before each test
    const store = useCombatStore.getState();
    store.endCombat(false);
  });

  describe('Energy Cost Configuration', () => {
    it('should have correct energy costs for all actions', () => {
      const config = getEnvironmentConfig();
      expect(config.combatEnergyCosts.illuminate).toBe(3);
      expect(config.combatEnergyCosts.reflect).toBe(2);
      expect(config.combatEnergyCosts.endure).toBe(1);
      expect(config.combatEnergyCosts.embrace).toBe(5);
    });

    it('should have correct low energy threshold and penalty', () => {
      const config = getEnvironmentConfig();
      expect(config.lowEnergyThreshold).toBe(20);
      expect(config.lowEnergyPenalty).toBe(0.5);
    });
  });

  describe('Combat Initialization with Energy', () => {
    it('should sync energy from game resources when starting combat', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 75,
        maxPlayerEnergy: 100
      });

      const state = useCombatStore.getState();
      expect(state.playerEnergy).toBe(75);
      expect(state.maxPlayerEnergy).toBe(100);
      expect(state.isActive).toBe(true);
    });

    it('should use default energy values when no game resources provided', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy);

      const state = useCombatStore.getState();
      expect(state.playerEnergy).toBe(100);
      expect(state.maxPlayerEnergy).toBe(100);
    });
  });

  describe('Energy Cost Validation', () => {
    it('should prevent actions when insufficient energy', () => {
      const store = useCombatStore.getState();
      
      // Start combat with low energy
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 2, // Only 2 energy
        maxPlayerEnergy: 100
      });

      const state = useCombatStore.getState();
      
      // Should not be able to use ILLUMINATE (costs 3 energy)
      expect(selectCanUseAction('ILLUMINATE')(state)).toBe(false);
      
      // Should not be able to use EMBRACE (costs 5 energy)
      expect(selectCanUseAction('EMBRACE')(state)).toBe(false);
      
      // Should be able to use ENDURE (costs 1 energy)
      expect(selectCanUseAction('ENDURE')(state)).toBe(true);
    });

    it('should allow actions when sufficient energy', () => {
      const store = useCombatStore.getState();
      
      // Start combat with full energy
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100
      });

      const state = useCombatStore.getState();
      
      // All actions should be available with sufficient energy and resources
      expect(selectCanUseAction('ILLUMINATE')(state)).toBe(true); // Has LP and energy
      expect(selectCanUseAction('REFLECT')(state)).toBe(true);    // Has SP and energy
      expect(selectCanUseAction('ENDURE')(state)).toBe(true);     // Always available with energy
      expect(selectCanUseAction('EMBRACE')(state)).toBe(true);    // Has SP and energy
    });
  });

  describe('Energy Consumption During Combat', () => {
    it('should consume energy when executing ILLUMINATE action', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 50,
        maxPlayerEnergy: 100
      });

      const initialEnergy = useCombatStore.getState().playerEnergy;
      store.executeAction('ILLUMINATE');
      
      const finalEnergy = useCombatStore.getState().playerEnergy;
      expect(finalEnergy).toBe(initialEnergy - 3); // ILLUMINATE costs 3 energy
    });

    it('should consume energy when executing ENDURE action', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 50,
        maxPlayerEnergy: 100
      });

      const initialEnergy = useCombatStore.getState().playerEnergy;
      store.executeAction('ENDURE');
      
      const finalEnergy = useCombatStore.getState().playerEnergy;
      expect(finalEnergy).toBe(initialEnergy - 1); // ENDURE costs 1 energy
    });
  });

  describe('Low Energy Penalties', () => {
    it('should apply damage penalty when energy is below 20%', () => {
      const store = useCombatStore.getState();
      
      // Start combat with low energy (15% of max)
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 15, // 15% of 100
        maxPlayerEnergy: 100
      });

      const initialEnemyHP = useCombatStore.getState().enemy?.currentHP || 0;
      store.executeAction('ILLUMINATE');
      
      const finalEnemyHP = useCombatStore.getState().enemy?.currentHP || 0;
      const damage = initialEnemyHP - finalEnemyHP;
      
      // Base damage for level 1 ILLUMINATE is 3 + floor(1 * 1.5) = 4
      // With 50% penalty: floor(4 * 0.5) = 2
      expect(damage).toBe(2);
    });

    it('should not apply damage penalty when energy is above 20%', () => {
      const store = useCombatStore.getState();
      
      // Start combat with sufficient energy (25% of max)
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 25, // 25% of 100
        maxPlayerEnergy: 100
      });

      const initialEnemyHP = useCombatStore.getState().enemy?.currentHP || 0;
      store.executeAction('ILLUMINATE');
      
      const finalEnemyHP = useCombatStore.getState().enemy?.currentHP || 0;
      const damage = initialEnemyHP - finalEnemyHP;
      
      // Base damage for level 1 ILLUMINATE is 3 + floor(1 * 1.5) = 4
      // No penalty applied
      expect(damage).toBe(4);
    });

    it('should show low energy message when penalty is applied', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 10, // Very low energy
        maxPlayerEnergy: 100
      });

      store.executeAction('ILLUMINATE');
      
      const log = useCombatStore.getState().log;
      const lastEntry = log[log.length - 1];
      
      expect(lastEntry.message).toContain('flickers weakly due to exhaustion');
      expect(lastEntry.effect).toContain('reduced by low energy');
    });
  });

  describe('Action Cost Selector', () => {
    it('should return correct costs including energy for all actions', () => {
      expect(selectActionCost('ILLUMINATE')()).toEqual({ lp: 2, energy: 3 });
      expect(selectActionCost('REFLECT')()).toEqual({ sp: 1, energy: 2 });
      expect(selectActionCost('ENDURE')()).toEqual({ energy: 1 });
      expect(selectActionCost('EMBRACE')()).toEqual({ sp: 5, energy: 5 });
    });
  });

  describe('Combat Log Integration', () => {
    it('should log energy costs in combat actions', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 50,
        maxPlayerEnergy: 100
      });

      store.executeAction('ILLUMINATE');
      
      const log = useCombatStore.getState().log;
      const lastEntry = log[log.length - 1];
      
      expect(lastEntry.effect).toContain('-3 Energy');
      expect(lastEntry.actor).toBe('PLAYER');
      expect(lastEntry.action).toBe('ILLUMINATE');
    });
  });
}); 