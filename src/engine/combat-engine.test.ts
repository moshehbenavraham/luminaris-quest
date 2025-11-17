import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMBAT_BALANCE,
  calculateIlluminateDamage,
  calculateEmbraceDamage,
  canPerformAction,
  executePlayerAction,
  decideShadowAction,
  executeShadowAction,
  processStatusEffects,
  checkCombatEnd
} from '../engine/combat-engine';
import type { CombatState, ShadowManifestation, ShadowAbility } from '../store/game-store';

describe('Combat Engine', () => {
  let mockCombatState: CombatState;
  let mockShadowManifestation: ShadowManifestation;
  let mockShadowAbility: ShadowAbility;

  beforeEach(() => {
    mockCombatState = {
      inCombat: true,
      currentEnemy: null,
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      sceneDC: 12,
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

    mockShadowAbility = {
      id: 'test-ability',
      name: 'Test Ability',
      cooldown: 3,
      currentCooldown: 0,
      effect: (state) => {
        state.resources.lp = Math.max(0, state.resources.lp - 2);
      },
      description: 'Deals 2 damage to player'
    };

    mockShadowManifestation = {
      id: 'test-shadow',
      name: 'Test Shadow',
      type: 'doubt',
      description: 'A test shadow manifestation',
      currentHP: 15,
      maxHP: 15,
      abilities: [mockShadowAbility],
      therapeuticInsight: 'Test insight',
      victoryReward: {
        lpBonus: 5,
        growthMessage: 'Test growth',
        permanentBenefit: 'Test benefit'
      }
    };

    mockCombatState.currentEnemy = mockShadowManifestation;
  });

  describe('Damage Calculations', () => {
    describe('calculateIlluminateDamage', () => {
      it('should calculate base damage with no trust bonus', () => {
        const damage = calculateIlluminateDamage(0);
        expect(damage).toBe(COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE);
      });

      it('should add trust bonus correctly', () => {
        const guardianTrust = 20; // Should give floor(20/4) = 5 bonus
        const damage = calculateIlluminateDamage(guardianTrust);
        expect(damage).toBe(COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE + 5);
      });

      it('should handle high trust values', () => {
        const guardianTrust = 100; // Should give floor(100/4) = 25 bonus
        const damage = calculateIlluminateDamage(guardianTrust);
        expect(damage).toBe(COMBAT_BALANCE.ILLUMINATE_BASE_DAMAGE + 25);
      });
    });

    describe('calculateEmbraceDamage', () => {
      it('should return minimum 1 damage with 0 shadow points', () => {
        const damage = calculateEmbraceDamage(0);
        expect(damage).toBe(1);
      });

      it('should calculate damage from shadow points correctly', () => {
        const damage = calculateEmbraceDamage(6); // floor(6/2) = 3
        expect(damage).toBe(3);
      });

      it('should handle odd shadow point values', () => {
        const damage = calculateEmbraceDamage(5); // floor(5/2) = 2
        expect(damage).toBe(2);
      });
    });
  });

  describe('Action Validation', () => {
    describe('canPerformAction', () => {
      it('should allow ILLUMINATE with sufficient LP', () => {
        mockCombatState.resources.lp = 5;
        const result = canPerformAction('ILLUMINATE', mockCombatState, 50);
        expect(result.canPerform).toBe(true);
      });

      it('should block ILLUMINATE with insufficient LP', () => {
        mockCombatState.resources.lp = 1;
        const result = canPerformAction('ILLUMINATE', mockCombatState, 50);
        expect(result.canPerform).toBe(false);
        expect(result.reason).toBe('Not enough Light Points');
      });

      it('should allow REFLECT with sufficient SP and no healing block', () => {
        mockCombatState.resources.sp = 3;
        mockCombatState.healingBlocked = 0;
        const result = canPerformAction('REFLECT', mockCombatState, 50);
        expect(result.canPerform).toBe(true);
      });

      it('should block REFLECT with insufficient SP', () => {
        mockCombatState.resources.sp = 1;
        const result = canPerformAction('REFLECT', mockCombatState, 50);
        expect(result.canPerform).toBe(false);
        expect(result.reason).toBe('Not enough Shadow Points');
      });

      it('should block REFLECT when healing is blocked', () => {
        mockCombatState.resources.sp = 5;
        mockCombatState.healingBlocked = 2;
        const result = canPerformAction('REFLECT', mockCombatState, 50);
        expect(result.canPerform).toBe(false);
        expect(result.reason).toBe('Healing is blocked');
      });

      it('should always allow ENDURE', () => {
        mockCombatState.resources.lp = 0;
        mockCombatState.resources.sp = 0;
        const result = canPerformAction('ENDURE', mockCombatState, 50);
        expect(result.canPerform).toBe(true);
      });

      it('should block EMBRACE with no shadow points', () => {
        mockCombatState.resources.sp = 0;
        const result = canPerformAction('EMBRACE', mockCombatState, 50);
        expect(result.canPerform).toBe(false);
        expect(result.reason).toBe('No Shadow Points to embrace');
      });
    });
  });

  describe('Player Action Execution', () => {
    describe('executePlayerAction', () => {
      it('should execute ILLUMINATE action correctly', () => {
        mockCombatState.resources.lp = 10;
        const guardianTrust = 20;
        
        const result = executePlayerAction('ILLUMINATE', mockCombatState, guardianTrust, 1);
        
        expect(result.newState.resources.lp).toBe(8); // 10 - 2 cost
        expect(result.newState.currentEnemy?.currentHP).toBe(7); // 15 - 8 damage (3 base + 5 trust bonus)
        expect(result.logEntry.actor).toBe('PLAYER');
        expect(result.logEntry.action).toBe('ILLUMINATE');
        expect(result.damage).toBe(8);
      });

      it('should execute REFLECT action correctly', () => {
        mockCombatState.resources.sp = 5;
        mockCombatState.resources.lp = 8;
        
        const result = executePlayerAction('REFLECT', mockCombatState, 50, 5);  // playerLevel = 5
        
        expect(result.newState.resources.sp).toBe(2); // 5 - 3 cost (updated from 2)
        expect(result.newState.resources.lp).toBe(9); // 8 + 1 LP heal
        expect(result.healthHeal).toBeGreaterThanOrEqual(1); // At least 1 health healed
        expect(result.healthHeal).toBeLessThanOrEqual(5);    // At most playerLevel (5) health healed
        expect(result.logEntry.actor).toBe('PLAYER');
        expect(result.logEntry.action).toBe('REFLECT');
        expect(result.logEntry.effect).toMatch(/Converted 3 SP to 1 LP and healed \d+ health/);
      });

      it('should heal random health between 1 and playerLevel for REFLECT', () => {
        // Test multiple times to verify random range
        const healAmounts = new Set<number>();
        const playerLevel = 3;
        
        for (let i = 0; i < 20; i++) {
          mockCombatState.resources.sp = 10;
          mockCombatState.resources.lp = 5;
          
          const result = executePlayerAction('REFLECT', mockCombatState, 50, playerLevel);
          healAmounts.add(result.healthHeal!);
        }
        
        // Should have multiple different heal amounts between 1 and playerLevel
        expect(Math.min(...healAmounts)).toBe(1);
        expect(Math.max(...healAmounts)).toBe(playerLevel);
        expect(healAmounts.size).toBeGreaterThan(1); // Should have some randomness
      });

      it('should execute ENDURE action correctly', () => {
        const result = executePlayerAction('ENDURE', mockCombatState, 50, 1);
        
        expect(result.newState.consecutiveEndures).toBe(1);
        expect(result.newState.damageReduction).toBe(COMBAT_BALANCE.ENDURE_DAMAGE_REDUCTION);
        expect(result.logEntry.actor).toBe('PLAYER');
        expect(result.logEntry.action).toBe('ENDURE');
      });

      it('should execute EMBRACE action correctly', () => {
        mockCombatState.resources.sp = 6;
        
        const result = executePlayerAction('EMBRACE', mockCombatState, 50, 1);
        
        expect(result.newState.resources.sp).toBe(4); // 6 - 2 used
        expect(result.newState.currentEnemy?.currentHP).toBe(12); // 15 - 3 damage
        expect(result.logEntry.actor).toBe('PLAYER');
        expect(result.logEntry.action).toBe('EMBRACE');
        expect(result.damage).toBe(3);
      });
    });
  });

  describe('Shadow AI', () => {
    describe('decideShadowAction', () => {
      it('should return null when no abilities available', () => {
        mockShadowManifestation.abilities = [];
        const result = decideShadowAction(mockShadowManifestation, mockCombatState);
        expect(result).toBeNull();
      });

      it('should return null when all abilities on cooldown', () => {
        mockShadowManifestation.abilities[0].currentCooldown = 2;
        const result = decideShadowAction(mockShadowManifestation, mockCombatState);
        expect(result).toBeNull();
      });

      it('should prioritize signature ability when player is vulnerable', () => {
        mockCombatState.resources.lp = 3; // Below threshold
        const result = decideShadowAction(mockShadowManifestation, mockCombatState);
        expect(result).toBe(mockShadowManifestation.abilities[0]);
      });

      it('should return available ability when player is not vulnerable', () => {
        mockCombatState.resources.lp = 10; // Above threshold
        const result = decideShadowAction(mockShadowManifestation, mockCombatState);
        expect(result).toBe(mockShadowManifestation.abilities[0]);
      });
    });

    describe('executeShadowAction', () => {
      it('should execute shadow ability and set cooldown', () => {
        const result = executeShadowAction(mockShadowAbility, mockCombatState, 50);
        
        expect(result.newState.resources.lp).toBe(8); // 10 - 2 from ability effect
        expect(result.newState.currentEnemy?.abilities[0].currentCooldown).toBe(3);
        expect(result.logEntry.actor).toBe('SHADOW');
        expect(result.logEntry.action).toBe('Test Ability');
      });
    });
  });

  describe('Status Effects', () => {
    describe('processStatusEffects', () => {
      it('should reduce status effect durations', () => {
        mockCombatState.healingBlocked = 2;
        mockCombatState.lpGenerationBlocked = 1;
        
        const result = processStatusEffects(mockCombatState);
        
        expect(result.healingBlocked).toBe(1);
        expect(result.lpGenerationBlocked).toBe(0);
      });

      it('should reset damage modifiers', () => {
        mockCombatState.damageMultiplier = 2;
        mockCombatState.damageReduction = 0.5;
        
        const result = processStatusEffects(mockCombatState);
        
        expect(result.damageMultiplier).toBe(1);
        expect(result.damageReduction).toBe(1);
      });

      it('should reduce ability cooldowns', () => {
        mockCombatState.currentEnemy!.abilities[0].currentCooldown = 2;
        
        const result = processStatusEffects(mockCombatState);
        
        expect(result.currentEnemy?.abilities[0].currentCooldown).toBe(1);
      });
    });
  });

  describe('Combat End Conditions', () => {
    describe('checkCombatEnd', () => {
      it('should detect victory when enemy HP reaches 0', () => {
        mockCombatState.currentEnemy!.currentHP = 0;
        
        const result = checkCombatEnd(mockCombatState);
        
        expect(result.isEnded).toBe(true);
        expect(result.victory).toBe(true);
        expect(result.reason).toContain('overcome');
      });

      it('should detect defeat when player has no resources', () => {
        mockCombatState.resources.lp = 0;
        mockCombatState.resources.sp = 0;
        
        const result = checkCombatEnd(mockCombatState);
        
        expect(result.isEnded).toBe(true);
        expect(result.victory).toBe(false);
        expect(result.reason).toContain('overwhelmed');
      });

      it('should continue combat when conditions not met', () => {
        mockCombatState.resources.lp = 5;
        mockCombatState.resources.sp = 3;
        mockCombatState.currentEnemy!.currentHP = 10;
        mockCombatState.turn = 5; // Well below turn limit

        const result = checkCombatEnd(mockCombatState);

        expect(result.isEnded).toBe(false);
        expect(result.victory).toBeUndefined();
      });

      it('should detect defeat when turn limit is reached', () => {
        mockCombatState.resources.lp = 5;
        mockCombatState.resources.sp = 3;
        mockCombatState.currentEnemy!.currentHP = 10;
        mockCombatState.turn = 20; // At turn limit

        const result = checkCombatEnd(mockCombatState);

        expect(result.isEnded).toBe(true);
        expect(result.victory).toBe(false);
        expect(result.reason).toContain('outlasted');
        expect(result.reason).toContain('20 turns');
      });

      it('should continue combat when turn limit is not yet reached', () => {
        mockCombatState.resources.lp = 5;
        mockCombatState.resources.sp = 3;
        mockCombatState.currentEnemy!.currentHP = 10;
        mockCombatState.turn = 19; // One turn before limit

        const result = checkCombatEnd(mockCombatState);

        expect(result.isEnded).toBe(false);
        expect(result.victory).toBeUndefined();
      });
    });
  });
});
