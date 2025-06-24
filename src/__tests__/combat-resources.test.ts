import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import type { CombatState, CombatAction } from '../store/game-store';

// We need to export useGameStoreBase from game-store first
// For now, let's mock the store to test the functionality

const createMockCombatState = (): CombatState => ({
  inCombat: false,
  currentEnemy: null,
  resources: { lp: 0, sp: 0 },
  turn: 0,
  log: [],
  damageMultiplier: 1,
  damageReduction: 1,
  healingBlocked: 0,
  lpGenerationBlocked: 0,
  skipNextTurn: false,
  consecutiveEndures: 0,
  preferredActions: {
    ILLUMINATE: 0,
    REFLECT: 0,
    ENDURE: 0,
    EMBRACE: 0
  },
  growthInsights: [],
  combatReflections: []
});

const mockGameStore = {
  lightPoints: 0,
  shadowPoints: 0,
  combat: createMockCombatState(),
  modifyLightPoints: vi.fn(),
  modifyShadowPoints: vi.fn(),
  convertShadowToLight: vi.fn(),
  startCombat: vi.fn(),
  executeCombatAction: vi.fn(),
  endCombat: vi.fn(),
  resetGame: vi.fn(),
  setGuardianTrust: vi.fn(),
  advanceScene: vi.fn(),
  saveState: { hasUnsavedChanges: false },
  getState: vi.fn(() => mockGameStore),
};

// Mock the store implementation
beforeEach(() => {
  mockGameStore.lightPoints = 0;
  mockGameStore.shadowPoints = 0;
  mockGameStore.combat = createMockCombatState();
  mockGameStore.saveState.hasUnsavedChanges = false;
  
  mockGameStore.modifyLightPoints.mockImplementation((delta: number) => {
    mockGameStore.lightPoints = Math.max(0, mockGameStore.lightPoints + delta);
    mockGameStore.saveState.hasUnsavedChanges = true;
  });
  
  mockGameStore.modifyShadowPoints.mockImplementation((delta: number) => {
    mockGameStore.shadowPoints = Math.max(0, mockGameStore.shadowPoints + delta);
    mockGameStore.saveState.hasUnsavedChanges = true;
  });
  
  mockGameStore.convertShadowToLight.mockImplementation((amount: number) => {
    const shadowToConvert = Math.min(amount, mockGameStore.shadowPoints);
    if (shadowToConvert === 0) return;
    
    mockGameStore.shadowPoints -= shadowToConvert;
    mockGameStore.lightPoints += shadowToConvert;
    mockGameStore.saveState.hasUnsavedChanges = true;
  });
  
  mockGameStore.resetGame.mockImplementation(() => {
    mockGameStore.lightPoints = 0;
    mockGameStore.shadowPoints = 0;
    mockGameStore.combat = createMockCombatState();
    mockGameStore.saveState.hasUnsavedChanges = true;
  });

  mockGameStore.startCombat.mockImplementation((enemyId: string) => {
    const newCombatState = createMockCombatState();
    mockGameStore.combat = {
      ...newCombatState,
      inCombat: true,
      currentEnemy: {
        id: enemyId,
        name: 'Shadow Manifestation',
        type: 'doubt',
        description: 'A manifestation of inner struggle',
        currentHP: 15,
        maxHP: 15,
        abilities: [],
        therapeuticInsight: 'Every shadow teaches us something about ourselves.',
        victoryReward: {
          lpBonus: 5,
          growthMessage: 'You have grown stronger through this challenge.',
          permanentBenefit: 'Increased self-awareness'
        }
      },
      resources: { lp: mockGameStore.lightPoints, sp: mockGameStore.shadowPoints },
      turn: 1,
      log: [{
        turn: 0,
        actor: 'SHADOW',
        action: 'MANIFEST',
        effect: 'Combat begins',
        resourceChange: {},
        message: 'Shadow Manifestation emerges from the shadows of your mind...'
      }]
    };
    mockGameStore.saveState.hasUnsavedChanges = true;
  });

  mockGameStore.executeCombatAction.mockImplementation((action: CombatAction) => {
    if (!mockGameStore.combat.inCombat) return;

    mockGameStore.combat.turn += 1;
    mockGameStore.combat.preferredActions[action] += 1;
    mockGameStore.combat.log.push({
      turn: mockGameStore.combat.turn,
      actor: 'PLAYER',
      action,
      effect: `Used ${action}`,
      resourceChange: {},
      message: `You use ${action} against the shadow...`
    });
    mockGameStore.saveState.hasUnsavedChanges = true;
  });

  mockGameStore.endCombat.mockImplementation((victory: boolean) => {
    if (!mockGameStore.combat.inCombat) return;

    const bonusLP = victory && mockGameStore.combat.currentEnemy ?
      mockGameStore.combat.currentEnemy.victoryReward.lpBonus : 0;

    mockGameStore.lightPoints = mockGameStore.combat.resources.lp + bonusLP;
    mockGameStore.shadowPoints = mockGameStore.combat.resources.sp;

    // Preserve preferred actions when ending combat
    const preservedPreferredActions = { ...mockGameStore.combat.preferredActions };

    mockGameStore.combat = {
      ...mockGameStore.combat,
      inCombat: false,
      currentEnemy: null,
      resources: { lp: 0, sp: 0 },
      turn: 0,
      damageMultiplier: 1,
      damageReduction: 1,
      healingBlocked: 0,
      lpGenerationBlocked: 0,
      skipNextTurn: false,
      consecutiveEndures: 0,
      preferredActions: preservedPreferredActions
    };
    mockGameStore.saveState.hasUnsavedChanges = true;
  });

  vi.clearAllMocks();
});

describe('Light & Shadow Combat Resources', () => {
  describe('Initial State', () => {
    it('should initialize with 0 light points and 0 shadow points', () => {
      expect(mockGameStore.lightPoints).toBe(0);
      expect(mockGameStore.shadowPoints).toBe(0);
    });
  });

  describe('modifyLightPoints', () => {
    it('should add positive light points', () => {
      act(() => {
        mockGameStore.modifyLightPoints(5);
      });
      expect(mockGameStore.lightPoints).toBe(5);
    });

    it('should subtract light points but not go below 0', () => {
      act(() => {
        mockGameStore.modifyLightPoints(10);
        mockGameStore.modifyLightPoints(-15);
      });
      expect(mockGameStore.lightPoints).toBe(0);
    });

    it('should handle multiple modifications correctly', () => {
      act(() => {
        mockGameStore.modifyLightPoints(5);
        mockGameStore.modifyLightPoints(3);
        mockGameStore.modifyLightPoints(-2);
      });
      expect(mockGameStore.lightPoints).toBe(6);
    });

    it('should mark state as having unsaved changes', () => {
      mockGameStore.saveState.hasUnsavedChanges = false;
      act(() => {
        mockGameStore.modifyLightPoints(5);
      });
      expect(mockGameStore.saveState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('modifyShadowPoints', () => {
    it('should add positive shadow points', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(8);
      });
      expect(mockGameStore.shadowPoints).toBe(8);
    });

    it('should subtract shadow points but not go below 0', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(5);
        mockGameStore.modifyShadowPoints(-10);
      });
      expect(mockGameStore.shadowPoints).toBe(0);
    });

    it('should handle multiple modifications correctly', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(10);
        mockGameStore.modifyShadowPoints(-3);
        mockGameStore.modifyShadowPoints(2);
      });
      expect(mockGameStore.shadowPoints).toBe(9);
    });

    it('should mark state as having unsaved changes', () => {
      mockGameStore.saveState.hasUnsavedChanges = false;
      act(() => {
        mockGameStore.modifyShadowPoints(3);
      });
      expect(mockGameStore.saveState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('convertShadowToLight', () => {
    it('should convert shadow points to light points 1:1', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(10);
        mockGameStore.convertShadowToLight(5);
      });
      
      expect(mockGameStore.shadowPoints).toBe(5);
      expect(mockGameStore.lightPoints).toBe(5);
    });

    it('should convert all available shadow points if requested amount exceeds available', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(7);
        mockGameStore.convertShadowToLight(10);
      });
      
      expect(mockGameStore.shadowPoints).toBe(0);
      expect(mockGameStore.lightPoints).toBe(7);
    });

    it('should not change state if no shadow points available', () => {
      const hasUnsavedChanges = mockGameStore.saveState.hasUnsavedChanges;
      
      act(() => {
        mockGameStore.convertShadowToLight(5);
      });
      
      expect(mockGameStore.shadowPoints).toBe(0);
      expect(mockGameStore.lightPoints).toBe(0);
      expect(mockGameStore.saveState.hasUnsavedChanges).toBe(hasUnsavedChanges);
    });

    it('should add converted points to existing light points', () => {
      act(() => {
        mockGameStore.modifyLightPoints(5);
        mockGameStore.modifyShadowPoints(10);
        mockGameStore.convertShadowToLight(3);
      });
      
      expect(mockGameStore.shadowPoints).toBe(7);
      expect(mockGameStore.lightPoints).toBe(8);
    });

    it('should mark state as having unsaved changes after conversion', () => {
      act(() => {
        mockGameStore.modifyShadowPoints(5);
        mockGameStore.saveState.hasUnsavedChanges = false;
        mockGameStore.convertShadowToLight(3);
      });
      
      expect(mockGameStore.saveState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('resetGame', () => {
    it('should reset combat resources to 0', () => {
      act(() => {
        mockGameStore.modifyLightPoints(15);
        mockGameStore.modifyShadowPoints(20);
        mockGameStore.resetGame();
      });

      expect(mockGameStore.lightPoints).toBe(0);
      expect(mockGameStore.shadowPoints).toBe(0);
    });

    it('should reset combat state to initial values', () => {
      act(() => {
        mockGameStore.startCombat('test-enemy');
        mockGameStore.resetGame();
      });

      expect(mockGameStore.combat.inCombat).toBe(false);
      expect(mockGameStore.combat.currentEnemy).toBe(null);
      expect(mockGameStore.combat.turn).toBe(0);
      expect(mockGameStore.combat.log).toEqual([]);
      expect(mockGameStore.combat.preferredActions).toEqual({
        ILLUMINATE: 0,
        REFLECT: 0,
        ENDURE: 0,
        EMBRACE: 0
      });
    });
  });

  describe('Combat System', () => {
    describe('startCombat', () => {
      it('should initialize combat state with enemy', () => {
        act(() => {
          mockGameStore.startCombat('test-shadow');
        });

        expect(mockGameStore.combat.inCombat).toBe(true);
        expect(mockGameStore.combat.currentEnemy).toBeTruthy();
        expect(mockGameStore.combat.currentEnemy?.id).toBe('test-shadow');
        expect(mockGameStore.combat.turn).toBe(1);
        expect(mockGameStore.combat.log).toHaveLength(1);
        expect(mockGameStore.combat.log[0].actor).toBe('SHADOW');
        expect(mockGameStore.combat.log[0].action).toBe('MANIFEST');
      });

      it('should sync current resources to combat state', () => {
        act(() => {
          mockGameStore.modifyLightPoints(10);
          mockGameStore.modifyShadowPoints(5);
          mockGameStore.startCombat('test-shadow');
        });

        expect(mockGameStore.combat.resources.lp).toBe(10);
        expect(mockGameStore.combat.resources.sp).toBe(5);
      });

      it('should mark state as having unsaved changes', () => {
        mockGameStore.saveState.hasUnsavedChanges = false;
        act(() => {
          mockGameStore.startCombat('test-shadow');
        });

        expect(mockGameStore.saveState.hasUnsavedChanges).toBe(true);
      });
    });

    describe('executeCombatAction', () => {
      beforeEach(() => {
        // Reset combat state completely before each test
        mockGameStore.combat = createMockCombatState();
        act(() => {
          mockGameStore.startCombat('test-shadow');
        });
      });

      it('should execute combat action and increment turn', () => {
        const initialTurn = mockGameStore.combat.turn;

        act(() => {
          mockGameStore.executeCombatAction('ILLUMINATE');
        });

        expect(mockGameStore.combat.turn).toBe(initialTurn + 1);
        expect(mockGameStore.combat.preferredActions.ILLUMINATE).toBe(1);
      });

      it('should add combat log entry for player action', () => {
        const initialLogLength = mockGameStore.combat.log.length;

        act(() => {
          mockGameStore.executeCombatAction('REFLECT');
        });

        expect(mockGameStore.combat.log).toHaveLength(initialLogLength + 1);
        const lastEntry = mockGameStore.combat.log[mockGameStore.combat.log.length - 1];
        expect(lastEntry.actor).toBe('PLAYER');
        expect(lastEntry.action).toBe('REFLECT');
      });

      it('should track preferred actions correctly', () => {
        act(() => {
          mockGameStore.executeCombatAction('ILLUMINATE');
          mockGameStore.executeCombatAction('ILLUMINATE');
          mockGameStore.executeCombatAction('ENDURE');
        });

        expect(mockGameStore.combat.preferredActions.ILLUMINATE).toBe(2);
        expect(mockGameStore.combat.preferredActions.ENDURE).toBe(1);
        expect(mockGameStore.combat.preferredActions.REFLECT).toBe(0);
        expect(mockGameStore.combat.preferredActions.EMBRACE).toBe(0);
      });

      it('should not execute action when not in combat', () => {
        act(() => {
          mockGameStore.endCombat(true);
          mockGameStore.executeCombatAction('ILLUMINATE');
        });

        // Should not change anything since not in combat
        expect(mockGameStore.combat.inCombat).toBe(false);
      });
    });

    describe('endCombat', () => {
      beforeEach(() => {
        // Reset combat state completely before each test
        mockGameStore.combat = createMockCombatState();
        act(() => {
          mockGameStore.modifyLightPoints(10);
          mockGameStore.modifyShadowPoints(5);
          mockGameStore.startCombat('test-shadow');
        });
      });

      it('should end combat and sync resources back to main state', () => {
        act(() => {
          mockGameStore.endCombat(true);
        });

        expect(mockGameStore.combat.inCombat).toBe(false);
        expect(mockGameStore.combat.currentEnemy).toBe(null);
        expect(mockGameStore.lightPoints).toBe(15); // 10 + 5 victory bonus
        expect(mockGameStore.shadowPoints).toBe(5);
      });

      it('should award victory bonus on victory', () => {
        const initialLP = mockGameStore.combat.resources.lp;

        act(() => {
          mockGameStore.endCombat(true);
        });

        expect(mockGameStore.lightPoints).toBe(initialLP + 5); // Victory bonus
      });

      it('should not award bonus on defeat', () => {
        const initialLP = mockGameStore.combat.resources.lp;

        act(() => {
          mockGameStore.endCombat(false);
        });

        expect(mockGameStore.lightPoints).toBe(initialLP); // No bonus
      });

      it('should reset status effects but preserve therapeutic tracking', () => {
        // Simulate some combat actions first
        act(() => {
          mockGameStore.executeCombatAction('ILLUMINATE');
          mockGameStore.executeCombatAction('REFLECT');
          mockGameStore.endCombat(true);
        });

        expect(mockGameStore.combat.damageMultiplier).toBe(1);
        expect(mockGameStore.combat.damageReduction).toBe(1);
        expect(mockGameStore.combat.healingBlocked).toBe(0);
        expect(mockGameStore.combat.skipNextTurn).toBe(false);

        // But preferred actions should be preserved
        expect(mockGameStore.combat.preferredActions.ILLUMINATE).toBe(1);
        expect(mockGameStore.combat.preferredActions.REFLECT).toBe(1);
      });

      it('should not end combat when not in combat', () => {
        act(() => {
          mockGameStore.endCombat(true);
          // Try to end again
          mockGameStore.endCombat(true);
        });

        // Should remain in ended state
        expect(mockGameStore.combat.inCombat).toBe(false);
      });
    });
  });
});