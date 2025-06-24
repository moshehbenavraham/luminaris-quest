import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCombat } from '../hooks/useCombat';
import type { CombatState, ShadowManifestation } from '../store/game-store';

// Mock the game store
const mockGameStore = {
  combat: {
    inCombat: false,
    currentEnemy: null,
    resources: { lp: 10, sp: 5 },
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
  } as CombatState,
  guardianTrust: 50,
  startCombat: vi.fn(),
  executeCombatAction: vi.fn(),
  endCombat: vi.fn()
};

const mockShadowManifestation: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Test Shadow',
  type: 'doubt',
  description: 'A test shadow manifestation',
  currentHP: 15,
  maxHP: 15,
  abilities: [],
  therapeuticInsight: 'This is a test insight about facing your doubts.',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'You have grown stronger.',
    permanentBenefit: 'Increased self-awareness'
  }
};

vi.mock('../store/game-store', () => ({
  useGameStore: () => mockGameStore
}));

vi.mock('../engine/combat-engine', () => ({
  canPerformAction: vi.fn((action, state, trust) => {
    // Mock validation logic
    switch (action) {
      case 'ILLUMINATE':
        return state.resources.lp >= 2;
      case 'REFLECT':
        return state.resources.sp >= 2;
      case 'ENDURE':
        return true;
      case 'EMBRACE':
        return state.resources.sp > 0;
      default:
        return false;
    }
  }),
  checkCombatEnd: vi.fn((state) => {
    if (state.currentEnemy && state.currentEnemy.currentHP <= 0) {
      return { isEnded: true, victory: true, reason: 'Victory!' };
    }
    if (state.resources.lp <= 0 && state.resources.sp <= 0) {
      return { isEnded: true, victory: false, reason: 'Defeat!' };
    }
    return { isEnded: false };
  }),
  COMBAT_BALANCE: {
    ILLUMINATE_LP_COST: 2,
    REFLECT_SP_COST: 2
  }
}));

vi.mock('../hooks/useCombatSounds', () => ({
  useCombatSounds: () => ({
    playActionSound: vi.fn().mockResolvedValue(undefined),
    playShadowAttackSound: vi.fn().mockResolvedValue(undefined),
    playVictorySound: vi.fn().mockResolvedValue(undefined),
    playDefeatSound: vi.fn().mockResolvedValue(undefined),
    setSoundsEnabled: vi.fn(),
    setSoundVolume: vi.fn(),
    isSoundsEnabled: true
  })
}));

describe('useCombat Hook', () => {
  beforeEach(() => {
    // Reset mock store state
    mockGameStore.combat = {
      inCombat: false,
      currentEnemy: null,
      resources: { lp: 10, sp: 5 },
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
    };
    mockGameStore.guardianTrust = 50;
    vi.clearAllMocks();
  });

  describe('Basic State', () => {
    it('should return inactive combat state when not in combat', () => {
      const { result } = renderHook(() => useCombat());

      expect(result.current.isActive).toBe(false);
      expect(result.current.enemy).toBeNull();
      expect(result.current.resources).toEqual({ lp: 10, sp: 5 });
      expect(result.current.turn).toBe(0);
      expect(result.current.isPlayerTurn).toBe(false);
    });

    it('should return active combat state when in combat', () => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.currentEnemy = mockShadowManifestation;
      mockGameStore.combat.turn = 3;

      const { result } = renderHook(() => useCombat());

      expect(result.current.isActive).toBe(true);
      expect(result.current.enemy).toEqual(mockShadowManifestation);
      expect(result.current.turn).toBe(3);
      expect(result.current.isPlayerTurn).toBe(true);
    });
  });

  describe('Status Effects', () => {
    it('should correctly map status effects', () => {
      mockGameStore.combat.damageMultiplier = 1.5;
      mockGameStore.combat.damageReduction = 0.5;
      mockGameStore.combat.healingBlocked = 2;
      mockGameStore.combat.lpGenerationBlocked = 1;
      mockGameStore.combat.skipNextTurn = true;
      mockGameStore.combat.consecutiveEndures = 2;

      const { result } = renderHook(() => useCombat());

      expect(result.current.statusEffects).toEqual({
        damageMultiplier: 1.5,
        damageReduction: 0.5,
        healingBlocked: true,
        lpGenerationBlocked: true,
        skipNextTurn: true,
        consecutiveEndures: 2
      });
    });

    it('should handle zero status effect durations', () => {
      mockGameStore.combat.healingBlocked = 0;
      mockGameStore.combat.lpGenerationBlocked = 0;

      const { result } = renderHook(() => useCombat());

      expect(result.current.statusEffects.healingBlocked).toBe(false);
      expect(result.current.statusEffects.lpGenerationBlocked).toBe(false);
    });
  });

  describe('Action Validation', () => {
    beforeEach(() => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.skipNextTurn = false;
    });

    it('should validate ILLUMINATE action based on LP cost', () => {
      const { result } = renderHook(() => useCombat());

      expect(result.current.canUseAction('ILLUMINATE')).toBe(true);

      mockGameStore.combat.resources.lp = 1;
      const { result: result2 } = renderHook(() => useCombat());
      expect(result2.current.canUseAction('ILLUMINATE')).toBe(false);
    });

    it('should validate REFLECT action based on SP cost', () => {
      const { result } = renderHook(() => useCombat());

      expect(result.current.canUseAction('REFLECT')).toBe(true);

      mockGameStore.combat.resources.sp = 1;
      const { result: result2 } = renderHook(() => useCombat());
      expect(result2.current.canUseAction('REFLECT')).toBe(false);
    });

    it('should always allow ENDURE action', () => {
      mockGameStore.combat.resources.lp = 0;
      mockGameStore.combat.resources.sp = 0;

      const { result } = renderHook(() => useCombat());
      expect(result.current.canUseAction('ENDURE')).toBe(true);
    });

    it('should validate EMBRACE action based on SP availability', () => {
      const { result } = renderHook(() => useCombat());

      expect(result.current.canUseAction('EMBRACE')).toBe(true);

      mockGameStore.combat.resources.sp = 0;
      const { result: result2 } = renderHook(() => useCombat());
      expect(result2.current.canUseAction('EMBRACE')).toBe(false);
    });

    it('should prevent actions when not player turn', () => {
      mockGameStore.combat.skipNextTurn = true;

      const { result } = renderHook(() => useCombat());

      expect(result.current.canUseAction('ILLUMINATE')).toBe(false);
      expect(result.current.canUseAction('REFLECT')).toBe(false);
      expect(result.current.canUseAction('ENDURE')).toBe(false);
      expect(result.current.canUseAction('EMBRACE')).toBe(false);
    });
  });

  describe('Action Costs', () => {
    it('should return correct action costs', () => {
      mockGameStore.combat.resources.sp = 5;

      const { result } = renderHook(() => useCombat());

      expect(result.current.getActionCost('ILLUMINATE')).toEqual({ lp: 2 });
      expect(result.current.getActionCost('REFLECT')).toEqual({ sp: 2 });
      expect(result.current.getActionCost('ENDURE')).toEqual({});
      expect(result.current.getActionCost('EMBRACE')).toEqual({ sp: 2 });
    });

    it('should limit EMBRACE cost to available SP', () => {
      mockGameStore.combat.resources.sp = 1;

      const { result } = renderHook(() => useCombat());

      expect(result.current.getActionCost('EMBRACE')).toEqual({ sp: 1 });
    });
  });

  describe('Action Descriptions', () => {
    it('should provide therapeutic action descriptions', () => {
      mockGameStore.guardianTrust = 60;

      const { result } = renderHook(() => useCombat());

      expect(result.current.getActionDescription('ILLUMINATE')).toContain('18 damage');
      expect(result.current.getActionDescription('REFLECT')).toContain('Transform shadow energy');
      expect(result.current.getActionDescription('ENDURE')).toContain('Build resilience');
      expect(result.current.getActionDescription('EMBRACE')).toContain('Accept difficult emotions');
    });

    it('should scale ILLUMINATE damage with guardian trust', () => {
      mockGameStore.guardianTrust = 80;

      const { result } = renderHook(() => useCombat());

      expect(result.current.getActionDescription('ILLUMINATE')).toContain('23 damage');
    });
  });

  describe('Combat End Detection', () => {
    it('should detect victory when enemy HP reaches 0', () => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.currentEnemy = { ...mockShadowManifestation, currentHP: 0 };

      const { result } = renderHook(() => useCombat());

      expect(result.current.combatEndStatus).toEqual({
        isEnded: true,
        victory: true,
        reason: 'Victory!'
      });
    });

    it('should detect defeat when player has no resources', () => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.resources = { lp: 0, sp: 0 };

      const { result } = renderHook(() => useCombat());

      expect(result.current.combatEndStatus).toEqual({
        isEnded: true,
        victory: false,
        reason: 'Defeat!'
      });
    });

    it('should indicate combat continues when conditions not met', () => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.currentEnemy = mockShadowManifestation;
      mockGameStore.combat.resources = { lp: 5, sp: 3 };

      const { result } = renderHook(() => useCombat());

      expect(result.current.combatEndStatus).toEqual({
        isEnded: false
      });
    });
  });

  describe('Action Execution', () => {
    beforeEach(() => {
      mockGameStore.combat.inCombat = true;
      mockGameStore.combat.skipNextTurn = false;
      // Mutate existing object instead of replacing it
      mockGameStore.combat.resources.lp = 10;
      mockGameStore.combat.resources.sp = 5;
    });

    it('should execute valid actions', async () => {
      const { result } = renderHook(() => useCombat());

      await act(async () => {
        await result.current.executeAction('ILLUMINATE');
      });

      expect(mockGameStore.executeCombatAction).toHaveBeenCalledWith('ILLUMINATE');
    });

    it('should prevent execution of invalid actions', () => {
      mockGameStore.combat.resources.lp = 1; // Not enough for ILLUMINATE

      const { result } = renderHook(() => useCombat());

      act(() => {
        result.current.executeAction('ILLUMINATE');
      });

      expect(mockGameStore.executeCombatAction).not.toHaveBeenCalled();
    });
  });

  describe('Therapeutic Insights', () => {
    it('should identify most used action', () => {
      mockGameStore.combat.preferredActions = {
        ILLUMINATE: 5,
        REFLECT: 2,
        ENDURE: 8,
        EMBRACE: 1
      };

      const { result } = renderHook(() => useCombat());

      expect(result.current.getMostUsedAction()).toBe('ENDURE');
    });

    it('should return null when no actions used', () => {
      const { result } = renderHook(() => useCombat());

      expect(result.current.getMostUsedAction()).toBeNull();
    });

    it('should provide therapeutic insights based on preferred actions', () => {
      mockGameStore.combat.currentEnemy = mockShadowManifestation;
      mockGameStore.combat.preferredActions = {
        ILLUMINATE: 5,
        REFLECT: 0,
        ENDURE: 0,
        EMBRACE: 0
      };

      const { result } = renderHook(() => useCombat());

      expect(result.current.getTherapeuticInsight()).toContain('awareness and understanding');
    });

    it('should fallback to enemy insight when no preferred action', () => {
      mockGameStore.combat.currentEnemy = mockShadowManifestation;

      const { result } = renderHook(() => useCombat());

      expect(result.current.getTherapeuticInsight()).toBe(mockShadowManifestation.therapeuticInsight);
    });
  });

  describe('Store Integration', () => {
    it('should call store methods for combat management', () => {
      const { result } = renderHook(() => useCombat());

      act(() => {
        result.current.startCombat('test-enemy');
      });

      expect(mockGameStore.startCombat).toHaveBeenCalledWith('test-enemy');

      act(() => {
        result.current.endCombat(true);
      });

      expect(mockGameStore.endCombat).toHaveBeenCalledWith(true);
    });
  });
});
