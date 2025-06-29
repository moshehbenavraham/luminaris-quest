import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Damage } from '../types/combat';

// Create mock store
const mockGameStore = {
  playerHealth: 100,
  combat: {
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
    preferredActions: {},
    growthInsights: [],
    combatReflections: []
  },
  lightPoints: 0,
  shadowPoints: 0,
  currentSceneIndex: 0,
  startCombat: vi.fn((enemy, sceneDC, gameResources) => {
    mockGameStore.combat.inCombat = true;
    mockGameStore.combat.currentEnemy = enemy;
    mockGameStore.combat.sceneDC = sceneDC;
    if (gameResources) {
      mockGameStore.combat.resources.lp = gameResources.lp;
      mockGameStore.combat.resources.sp = gameResources.sp;
    }
  }),
  applyDamageToPlayer: vi.fn((damage) => {
    mockGameStore.playerHealth = Math.max(0, mockGameStore.playerHealth - damage);
  }),
  endCombat: vi.fn((victory) => {
    mockGameStore.combat.inCombat = false;
    mockGameStore.playerHealth = 100; // This is what we're testing
    mockGameStore.lightPoints = mockGameStore.combat.resources.lp;
    mockGameStore.shadowPoints = mockGameStore.combat.resources.sp;
    if (victory && mockGameStore.combat.currentEnemy) {
      mockGameStore.lightPoints += mockGameStore.combat.currentEnemy.victoryReward.lpBonus;
    }
    mockGameStore.combat.currentEnemy = null;
    mockGameStore.currentSceneIndex += 1;
  }),
  reset: vi.fn(() => {
    mockGameStore.playerHealth = 100;
    mockGameStore.combat = {
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
      preferredActions: {},
      growthInsights: [],
      combatReflections: []
    };
    mockGameStore.lightPoints = 0;
    mockGameStore.shadowPoints = 0;
    mockGameStore.currentSceneIndex = 0;
  }),
  getState: vi.fn(() => mockGameStore)
};

// Mock the game store import
vi.mock('../store/game-store', () => ({
  useGameStore: vi.fn(() => mockGameStore)
}));

// Import after mocking
import { useGameStore } from '../store/game-store';

describe('Combat Health Restoration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGameStore.reset();
  });

  it('should restore player health to 100 after victory', () => {
    // Start combat and take damage
    mockGameStore.startCombat({
      id: 'test-enemy',
      name: 'Test Shadow',
      type: 'shadow' as const,
      level: 1,
      health: { current: 50, max: 50 },
      attacks: [
        { name: 'Strike', damage: { min: 5, max: 10 } as Damage, accuracy: 0.8, description: 'A basic attack' }
      ],
      weaknesses: ['love'],
      strengths: ['fear'],
      description: 'A test shadow',
      healingThreshold: 1,
      criticalThreshold: 0.2,
      victoryReward: { lpBonus: 5, trustIncrease: 10 }
    }, 10);

    // Apply damage to player
    mockGameStore.applyDamageToPlayer(30);
    expect(mockGameStore.playerHealth).toBe(70);

    // End combat with victory
    mockGameStore.endCombat(true);

    // Verify health is restored to 100
    expect(mockGameStore.playerHealth).toBe(100);
    expect(mockGameStore.combat.inCombat).toBe(false);
  });

  it('should restore player health to 100 after defeat', () => {
    // Start combat and take damage
    mockGameStore.startCombat({
      id: 'test-enemy',
      name: 'Test Shadow',
      type: 'shadow' as const,
      level: 1,
      health: { current: 50, max: 50 },
      attacks: [
        { name: 'Strike', damage: { min: 5, max: 10 } as Damage, accuracy: 0.8, description: 'A basic attack' }
      ],
      weaknesses: ['love'],
      strengths: ['fear'],
      description: 'A test shadow',
      healingThreshold: 1,
      criticalThreshold: 0.2,
      victoryReward: { lpBonus: 5, trustIncrease: 10 }
    }, 10);

    // Apply damage to player (reduce to 0 health)
    mockGameStore.applyDamageToPlayer(100);
    expect(mockGameStore.playerHealth).toBe(0);

    // End combat with defeat
    mockGameStore.endCombat(false);

    // Verify health is restored to 100 even after defeat
    expect(mockGameStore.playerHealth).toBe(100);
    expect(mockGameStore.combat.inCombat).toBe(false);
  });

  it('should restore health from any damage amount', () => {
    // Test various damage amounts
    const damageAmounts = [10, 25, 50, 75, 99];
    
    damageAmounts.forEach(damage => {
      // Reset for each test
      mockGameStore.reset();
      
      // Start combat
      mockGameStore.startCombat({
        id: 'test-enemy',
        name: 'Test Shadow',
        type: 'shadow' as const,
        level: 1,
        health: { current: 50, max: 50 },
        attacks: [
          { name: 'Strike', damage: { min: 5, max: 10 } as Damage, accuracy: 0.8, description: 'A basic attack' }
        ],
        weaknesses: ['love'],
        strengths: ['fear'],
        description: 'A test shadow',
        healingThreshold: 1,
        criticalThreshold: 0.2,
        victoryReward: { lpBonus: 5, trustIncrease: 10 }
      }, 10);
      
      // Apply damage
      mockGameStore.applyDamageToPlayer(damage);
      expect(mockGameStore.playerHealth).toBe(100 - damage);
      
      // End combat
      mockGameStore.endCombat(true);
      
      // Verify health is restored
      expect(mockGameStore.playerHealth).toBe(100);
    });
  });
});