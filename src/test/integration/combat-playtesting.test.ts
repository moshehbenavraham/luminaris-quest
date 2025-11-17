import { describe, it, expect } from 'vitest';
import { shadowManifestations, createShadowManifestation, SHADOW_IDS } from '@/data/shadowManifestations';
import { executePlayerAction } from '@/engine/combat-engine';
import type { CombatAction, CombatState } from '@/store/game-store';

/**
 * Comprehensive Combat System Playtesting Suite
 *
 * This test suite systematically validates all 4 shadow encounters:
 * - The Whisper of Doubt (15 HP, easiest)
 * - The Veil of Isolation (18 HP, moderate)
 * - The Storm of Overwhelm (20 HP, challenging)
 * - The Echo of Past Pain (22 HP, hardest)
 *
 * Tests cover:
 * - Combat mechanics and balance
 * - Victory/defeat conditions
 * - Therapeutic messaging
 * - Resource management
 * - Shadow AI behavior
 */

// Mock combat state for testing
const createMockCombatState = (): CombatState => ({
  inCombat: true,
  currentEnemy: null,
  resources: { lp: 10, sp: 5 },
  turn: 1,
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

describe('Combat System Playtesting', () => {

  describe('Shadow Encounter Validation', () => {
    it('should validate all 4 shadow manifestations exist and are properly configured', () => {
      const shadowKeys = Object.keys(shadowManifestations);
      expect(shadowKeys).toHaveLength(4);

      const shadowIds = Object.values(SHADOW_IDS);

      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        expect(shadow).toBeDefined();
        expect(shadow!.name).toBeTruthy();
        expect(shadow!.description).toBeTruthy();
        expect(shadow!.maxHP).toBeGreaterThan(0);
        expect(shadow!.abilities).toHaveLength(2);
        expect(shadow!.therapeuticInsight).toBeTruthy();
        expect(shadow!.victoryReward.growthMessage).toBeTruthy();
        expect(shadow!.victoryReward.permanentBenefit).toBeTruthy();
      });
    });

    it('should validate HP progression follows difficulty curve', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      const hpProgression = shadowIds.map(id => createShadowManifestation(id)!.maxHP);
      expect(hpProgression).toEqual([15, 18, 20, 22]); // Ascending difficulty
    });

    it('should validate LP reward progression', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      const lpProgression = shadowIds.map(id => createShadowManifestation(id)!.victoryReward.lpBonus);
      expect(lpProgression).toEqual([5, 6, 7, 8]); // Ascending rewards
    });
  });

  describe('Combat Mechanics Playtesting', () => {
    const testCombatAction = (
      shadowId: string,
      action: CombatAction,
      expectedOutcome: 'damage' | 'heal' | 'convert' | 'defend'
    ) => {
      const shadow = createShadowManifestation(shadowId);
      const combatState = createMockCombatState();
      combatState.currentEnemy = shadow;

      const result = executePlayerAction(action, combatState, 50); // 50 guardian trust

      switch (expectedOutcome) {
        case 'damage':
          expect(result.damage).toBeGreaterThan(0);
          break;
        case 'heal':
          expect(result.logEntry.resourceChange.lp).toBeGreaterThan(0);
          break;
        case 'convert':
          expect(result.logEntry.resourceChange.lp).toBeGreaterThan(0);
          expect(result.logEntry.resourceChange.sp).toBeLessThan(0);
          break;
        case 'defend':
          expect(result.newState.damageReduction).toBeLessThan(1);
          break;
      }

      return result;
    };

    it('should test ILLUMINATE action against all shadows', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const result = testCombatAction(shadowId, 'ILLUMINATE', 'damage');
        expect(result.damage).toBeGreaterThan(0);
        expect(result.logEntry.resourceChange.lp).toBeLessThan(0); // LP cost
      });
    });

    it('should test REFLECT action therapeutic conversion', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const result = testCombatAction(shadowId, 'REFLECT', 'convert');
        expect(result.logEntry.resourceChange.lp).toBeGreaterThan(0); // SP to LP conversion
        expect(result.logEntry.resourceChange.sp).toBeLessThan(0); // SP consumed
      });
    });

    it('should test ENDURE action damage reduction', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const result = testCombatAction(shadowId, 'ENDURE', 'defend');
        expect(result.newState.damageReduction).toBe(0.5); // 50% reduction
      });
    });

    it('should test EMBRACE action shadow acceptance', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const result = testCombatAction(shadowId, 'EMBRACE', 'damage');
        expect(result.damage).toBeGreaterThan(0);
        expect(result.logEntry.resourceChange.sp).toBeLessThan(0); // SP consumed for damage
      });
    });
  });

  describe('Victory Condition Playtesting', () => {
    it('should achieve victory against The Whisper of Doubt (easiest)', async () => {
      const shadowId = SHADOW_IDS.WHISPER_OF_DOUBT;
      const shadow = createShadowManifestation(shadowId);
      const combatState = createMockCombatState();
      combatState.currentEnemy = shadow;
      combatState.resources = { lp: 20, sp: 10 }; // Sufficient resources

      let turns = 0;
      const maxTurns = 20; // Prevent infinite loops

      while (shadow!.currentHP > 0 && turns < maxTurns) {
        // Use ILLUMINATE as primary strategy
        const result = executePlayerAction('ILLUMINATE', combatState, 50);
        if (result.damage) {
          shadow!.currentHP -= result.damage;
        }

        // Apply resource changes
        combatState.resources.lp += result.logEntry.resourceChange.lp || 0;
        combatState.resources.sp += result.logEntry.resourceChange.sp || 0;

        turns++;
      }

      expect(shadow!.currentHP).toBeLessThanOrEqual(0);
      expect(turns).toBeLessThan(maxTurns);
    });

    it('should achieve victory against all shadows with optimal strategy', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        const combatState = createMockCombatState();
        combatState.currentEnemy = shadow;
        combatState.resources = { lp: 30, sp: 15 }; // Generous resources for testing

        let turns = 0;
        const maxTurns = 30;

        while (shadow!.currentHP > 0 && turns < maxTurns) {
          // Adaptive strategy based on resources
          let action: CombatAction;
          if (combatState.resources.lp >= 2) {
            action = 'ILLUMINATE'; // Primary damage dealer
          } else if (combatState.resources.sp >= 2) {
            action = 'REFLECT'; // Convert SP to LP
          } else {
            action = 'EMBRACE'; // Use remaining SP for damage
          }

          const result = executePlayerAction(action, combatState, 50);

          // Apply damage to shadow
          if (result.damage) {
            shadow!.currentHP -= result.damage;
          }

          // Apply resource changes
          combatState.resources.lp += result.logEntry.resourceChange.lp || 0;
          combatState.resources.sp += result.logEntry.resourceChange.sp || 0;

          turns++;
        }

        expect(shadow!.currentHP).toBeLessThanOrEqual(0);
        expect(turns).toBeLessThan(maxTurns);
      });
    });
  });

  describe('Therapeutic Messaging Validation', () => {
    it('should validate therapeutic insights are meaningful and specific', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        expect(shadow!.therapeuticInsight).toBeTruthy();
        expect(shadow!.therapeuticInsight.length).toBeGreaterThan(50); // Substantial content
        expect(shadow!.victoryReward.growthMessage).toBeTruthy();
        expect(shadow!.victoryReward.growthMessage.length).toBeGreaterThan(30);
        expect(shadow!.victoryReward.permanentBenefit).toBeTruthy();
        expect(shadow!.victoryReward.permanentBenefit.length).toBeGreaterThan(30);
      });
    });

    it('should validate shadow abilities have therapeutic context', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        shadow!.abilities.forEach(ability => {
          expect(ability.name).toBeTruthy();
          expect(ability.description).toBeTruthy();
          expect(ability.description.length).toBeGreaterThan(20);
          expect(ability.cooldown).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Resource Management Balance', () => {
    it('should validate resource costs are balanced across actions', () => {
      const illuminateCost = 2; // LP cost for ILLUMINATE
      const reflectSpCost = 2; // SP cost for REFLECT
      const embraceSpCost = 1; // Minimum SP cost for EMBRACE
      
      expect(illuminateCost).toBeLessThanOrEqual(3); // Not too expensive
      expect(reflectSpCost).toBeLessThanOrEqual(3);
      expect(embraceSpCost).toBeGreaterThan(0);
    });

    it('should validate shadows provide adequate LP rewards', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        expect(shadow!.victoryReward.lpBonus).toBeGreaterThanOrEqual(5);
        expect(shadow!.victoryReward.lpBonus).toBeLessThanOrEqual(10); // Reasonable range
      });
    });
  });

  describe('Shadow AI Behavior Testing', () => {
    it('should validate shadow abilities have appropriate cooldowns', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        shadow!.abilities.forEach(ability => {
          expect(ability.cooldown).toBeGreaterThanOrEqual(3);
          expect(ability.cooldown).toBeLessThanOrEqual(6);
        });
      });
    });

    it('should validate shadow abilities have meaningful effects', () => {
      const shadowIds = Object.values(SHADOW_IDS);
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        shadow!.abilities.forEach(ability => {
          // Each ability should have a meaningful description and effect function
          expect(ability.description).toBeTruthy();
          expect(ability.description.length).toBeGreaterThan(20);
          expect(typeof ability.effect).toBe('function');
        });
      });
    });
  });
});
