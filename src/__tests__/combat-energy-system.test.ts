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

  describe('Energy Cost Validation (Updated: Only ENDURE consumes energy)', () => {
    it('should only prevent ENDURE when insufficient energy', () => {
      const store = useCombatStore.getState();
      
      // Start combat with low energy
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 0, // No energy
        maxPlayerEnergy: 100
      });

      const state = useCombatStore.getState();
      
      // Should be able to use ILLUMINATE (no energy cost)
      expect(selectCanUseAction('ILLUMINATE')(state)).toBe(true);
      
      // Should be able to use EMBRACE (no energy cost) if has SP
      expect(selectCanUseAction('EMBRACE')(state)).toBe(true);
      
      // Should NOT be able to use ENDURE (costs 1 energy)
      expect(selectCanUseAction('ENDURE')(state)).toBe(false);
    });

    it('should allow all actions when sufficient resources', () => {
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
      
      // All actions should be available with sufficient resources
      expect(selectCanUseAction('ILLUMINATE')(state)).toBe(true); // Has LP (no energy cost)
      expect(selectCanUseAction('REFLECT')(state)).toBe(true);    // Has SP (no energy cost)
      expect(selectCanUseAction('ENDURE')(state)).toBe(true);     // Has energy
      expect(selectCanUseAction('EMBRACE')(state)).toBe(true);    // Has SP (no energy cost)
    });
  });

  describe('Energy Consumption During Combat (Updated: Only ENDURE)', () => {
    it('should NOT consume energy when executing ILLUMINATE action', () => {
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
      expect(finalEnergy).toBe(initialEnergy); // ILLUMINATE no longer costs energy
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

  describe('Low Energy Penalties (Updated: Not applicable to non-ENDURE actions)', () => {
    it('should NOT apply damage penalty to ILLUMINATE when energy is low', () => {
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
      // No energy penalty applied since ILLUMINATE doesn't consume energy
      expect(damage).toBe(4);
    });

    it('should maintain consistent damage for ILLUMINATE regardless of energy', () => {
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
      // No energy factor since ILLUMINATE doesn't consume energy
      expect(damage).toBe(4);
    });

    it('should NOT show low energy message for ILLUMINATE since it does not consume energy', () => {
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
      
      expect(lastEntry.message).not.toContain('flickers weakly due to exhaustion');
      expect(lastEntry.effect).not.toContain('reduced by low energy');
    });
  });

  describe('Action Cost Selector (Updated: Only ENDURE shows energy cost)', () => {
    it('should return correct costs with energy only for ENDURE', () => {
      expect(selectActionCost('ILLUMINATE')()).toEqual({ lp: 2 }); // No energy cost shown
      expect(selectActionCost('REFLECT')()).toEqual({ sp: 3 }); // No energy cost shown
      expect(selectActionCost('ENDURE')()).toEqual({ energy: 1 }); // Only ENDURE shows energy
      expect(selectActionCost('EMBRACE')()).toEqual({ sp: 5 }); // No energy cost shown
    });
  });

  describe('Combat Log Integration (Updated: Only ENDURE shows energy cost)', () => {
    it('should NOT log energy costs for ILLUMINATE actions', () => {
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
      
      expect(lastEntry.effect).not.toContain('Energy'); // Should not show energy cost
      expect(lastEntry.actor).toBe('PLAYER');
      expect(lastEntry.action).toBe('ILLUMINATE');
    });
    
    it('should log energy costs only for ENDURE actions', () => {
      const store = useCombatStore.getState();
      
      store.startCombat(mockShadowEnemy, {
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 50,
        maxPlayerEnergy: 100
      });

      store.executeAction('ENDURE');
      
      const log = useCombatStore.getState().log;
      const lastEntry = log[log.length - 1];
      
      expect(lastEntry.effect).toContain('-1 Energy'); // Should show energy cost for ENDURE
      expect(lastEntry.actor).toBe('PLAYER');
      expect(lastEntry.action).toBe('ENDURE');
    });
  });
}); 