import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlayerDefense,
  calculateShadowDamage,
  executeEnemyTurn,
  COMBAT_BALANCE,
} from '@/engine/combat-engine';
import type { CombatEngineState } from '@/engine/combat-engine';
import type { ShadowManifestation } from '@/types';

describe('Shadow Health Damage System', () => {
  let mockCombatState: CombatEngineState;
  let mockEnemy: ShadowManifestation;

  beforeEach(() => {
    mockCombatState = {
      resources: { lp: 10, sp: 5 },
      turn: 1,
      enemy: null,
      playerHealth: 100,
      playerLevel: 1,
      playerEnergy: 100,
      maxPlayerEnergy: 100,
      isPlayerTurn: false,
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: 0,
        lpGenerationBlocked: 0,
        skipNextTurn: false,
        consecutiveEndures: 0,
      },
      preferredActions: {
        ILLUMINATE: 0,
        REFLECT: 0,
        ENDURE: 0,
        EMBRACE: 0,
      },
    };

    mockEnemy = {
      id: 'test-shadow',
      name: 'Test Shadow',
      type: 'doubt',
      description: 'A test shadow',
      currentHP: 20,
      maxHP: 20,
      abilities: [],
      therapeuticInsight: 'Test insight',
      victoryReward: {
        lpBonus: 5,
        growthMessage: 'Growth',
        permanentBenefit: 'Benefit',
      },
    };
  });

  describe('calculatePlayerDefense', () => {
    it('should calculate defense from light points', () => {
      const defense = calculatePlayerDefense({ resources: { lp: 10, sp: 0 } });
      expect(defense).toBe(5); // floor(10 * 0.5)
    });

    it('should handle zero resources', () => {
      const defense = calculatePlayerDefense({ resources: { lp: 0, sp: 0 } });
      expect(defense).toBe(0);
    });
  });

  describe('calculateShadowDamage', () => {
    it('should apply minimum damage when defenses are high', () => {
      const damage = calculateShadowDamage({ resources: { lp: 50, sp: 0 } });
      expect(damage).toBe(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });

    it('should calculate damage as base damage minus defense', () => {
      const damage = calculateShadowDamage({ resources: { lp: 10, sp: 0 } });
      // base 8 - floor(10*0.5)=5 => 3
      expect(damage).toBe(3);
    });
  });

  describe('executeEnemyTurn', () => {
    it('should apply damage, grant SP, advance turn, and return control to player', () => {
      mockCombatState.enemy = { ...mockEnemy, currentHP: 20 };
      const result = executeEnemyTurn(mockCombatState);

      expect(result.damage).toBe(3); // base 8 - floor(10*0.5)=5
      expect(result.newState.playerHealth).toBe(97);
      expect(result.newState.resources.sp).toBe(6); // +1 SP on hit, capped at 10
      expect(result.newState.turn).toBe(2);
      expect(result.newState.isPlayerTurn).toBe(true);
      expect(result.logEntry.actor).toBe('SHADOW');
      expect(result.logEntry.action).toBe('Shadow Attack');
    });

    it('should use Desperate Strike when enemy HP is below 50%', () => {
      mockCombatState.enemy = { ...mockEnemy, maxHP: 20, currentHP: 9 };
      const result = executeEnemyTurn(mockCombatState);
      expect(result.enemyAction).toBe('Desperate Strike');
      expect(result.logEntry.action).toBe('Desperate Strike');
    });

    it('should not advance the turn if the player is defeated', () => {
      mockCombatState.enemy = { ...mockEnemy };
      mockCombatState.playerHealth = 1;
      mockCombatState.resources = { lp: 0, sp: 0 };

      const result = executeEnemyTurn(mockCombatState);
      expect(result.newState.playerHealth).toBe(0);
      expect(result.newState.turn).toBe(1); // unchanged on defeat
      expect(result.newState.isPlayerTurn).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative damage calculations gracefully', () => {
      const damage = calculateShadowDamage({ resources: { lp: 100, sp: 0 } });
      expect(damage).toBe(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });
  });
});
