import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlayerDefense,
  calculateShadowHealthDamage,
  executeShadowAction,
  COMBAT_BALANCE
} from '@/engine/combat-engine';
import { shadowManifestations } from '@/data/shadowManifestations';
import type { CombatState } from '@/store/game-store';

describe('Shadow Health Damage System', () => {
  let mockCombatState: CombatState;

  beforeEach(() => {
    mockCombatState = {
      inCombat: true,
      currentEnemy: null,
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      sceneDC: 14, // Scene difficulty check
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
  });

  describe('calculatePlayerDefense', () => {
    it('should calculate defense from light points and trust', () => {
      const defense = calculatePlayerDefense(mockCombatState, 60);
      
      // 10 LP * 0.5 + 60 trust * 0.1 = 5 + 6 = 11
      expect(defense).toBe(11);
    });

    it('should include damage reduction status effects', () => {
      mockCombatState.damageReduction = 2; // 50% damage reduction
      const defense = calculatePlayerDefense(mockCombatState, 60);
      
      // 10 LP * 0.5 + 60 trust * 0.1 + (2-1) * 5 = 5 + 6 + 5 = 16
      expect(defense).toBe(16);
    });

    it('should handle zero resources', () => {
      mockCombatState.resources.lp = 0;
      const defense = calculatePlayerDefense(mockCombatState, 0);
      
      // 0 LP * 0.5 + 0 trust * 0.1 = 0
      expect(defense).toBe(0);
    });
  });

  describe('calculateShadowHealthDamage', () => {
    it('should calculate damage as scene DC minus player defenses', () => {
      const damage = calculateShadowHealthDamage(14, mockCombatState, 60);
      
      // Scene DC 14 - defense 11 = 3 damage
      expect(damage).toBe(3);
    });

    it('should apply minimum damage when defenses are high', () => {
      mockCombatState.resources.lp = 50; // Very high LP
      const damage = calculateShadowHealthDamage(14, mockCombatState, 100);
      
      // Should be minimum damage (1) even if defenses exceed scene DC
      expect(damage).toBe(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });

    it('should apply damage multiplier when active', () => {
      mockCombatState.damageMultiplier = 2;
      const damage = calculateShadowHealthDamage(14, mockCombatState, 60);
      
      // (14 - 11) * 2 = 6 damage
      expect(damage).toBe(6);
    });

    it('should use default base damage when scene DC is not provided', () => {
      const damage = calculateShadowHealthDamage(0, mockCombatState, 60);
      
      // Should use SHADOW_BASE_DAMAGE (8) - defense (11) = min damage (1)
      expect(damage).toBe(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });
  });

  describe('executeShadowAction with health damage', () => {
    it('should return health damage along with shadow action results', () => {
      const shadowAbility = shadowManifestations.whisperOfDoubt.abilities[0]; // Self-Questioning
      const guardianTrust = 60;

      const result = executeShadowAction(shadowAbility, mockCombatState, guardianTrust);

      expect(result).toHaveProperty('healthDamage');
      expect(result.healthDamage).toBeGreaterThan(0);
      expect(result.logEntry.resourceChange).toHaveProperty('healthDamage');
      expect(result.logEntry.message).toContain('health damage');
    });

    it('should calculate correct health damage based on scene DC', () => {
      const shadowAbility = shadowManifestations.whisperOfDoubt.abilities[0]; // Self-Questioning
      const guardianTrust = 60;

      const result = executeShadowAction(shadowAbility, mockCombatState, guardianTrust);

      // Expected: scene DC 14 - defense 11 = 3 damage
      expect(result.healthDamage).toBe(3);
    });

    it('should apply shadow ability effects and health damage', () => {
      const shadowAbility = shadowManifestations.whisperOfDoubt.abilities[0]; // Self-Questioning
      const guardianTrust = 60;

      const result = executeShadowAction(shadowAbility, mockCombatState, guardianTrust);

      // Verify shadow ability effect was applied (LP reduced by 1)
      expect(result.newState.resources.lp).toBe(9);

      // Verify LP generation is blocked
      expect(result.newState.lpGenerationBlocked).toBe(2);

      // Verify health damage is calculated
      expect(result.healthDamage).toBe(3);
    });
  });

  describe('Defense scaling', () => {
    it('should provide meaningful defense scaling with LP', () => {
      const lowLP = { ...mockCombatState, resources: { lp: 2, sp: 5 } };
      const highLP = { ...mockCombatState, resources: { lp: 20, sp: 5 } };
      
      const lowDefense = calculatePlayerDefense(lowLP, 60);
      const highDefense = calculatePlayerDefense(highLP, 60);
      
      // High LP should provide significantly more defense
      expect(highDefense - lowDefense).toBe(9); // (20-2) * 0.5 = 9
    });

    it('should provide meaningful defense scaling with trust', () => {
      const lowTrust = calculatePlayerDefense(mockCombatState, 20);
      const highTrust = calculatePlayerDefense(mockCombatState, 80);
      
      // High trust should provide more defense
      expect(highTrust - lowTrust).toBe(6); // (80-20) * 0.1 = 6
    });
  });

  describe('Edge cases', () => {
    it('should handle negative damage calculations gracefully', () => {
      mockCombatState.resources.lp = 100; // Extremely high LP
      const damage = calculateShadowHealthDamage(5, mockCombatState, 100);
      
      // Should never go below minimum damage
      expect(damage).toBe(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });

    it('should handle zero scene DC', () => {
      const damage = calculateShadowHealthDamage(0, mockCombatState, 60);
      
      // Should use base damage and still apply minimum
      expect(damage).toBeGreaterThanOrEqual(COMBAT_BALANCE.MIN_SHADOW_DAMAGE);
    });

    it('should handle maximum damage multiplier', () => {
      mockCombatState.damageMultiplier = 3;
      mockCombatState.resources.lp = 0; // No LP defense
      const damage = calculateShadowHealthDamage(20, mockCombatState, 0);
      
      // (20 - 0) * 3 = 60 damage
      expect(damage).toBe(60);
    });
  });
});
