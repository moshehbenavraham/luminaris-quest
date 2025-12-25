import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleSceneOutcome,
  mapSceneToShadowType,
  getScene,
  type Scene,
  isLastScene,
  getSceneProgress,
} from '../engine/scene-engine';
import { SHADOW_IDS, createShadowManifestation } from '../data/shadowManifestations';

// Mock the game store
const mockGameStore = {
  startCombat: vi.fn(),
  combat: {
    inCombat: false,
    currentEnemy: null,
    resources: { lp: 0, sp: 0 },
    turn: 0,
    log: [],
  },
};

vi.mock('../store/game-store', () => ({
  useGameStore: () => mockGameStore,
}));

describe('Scene Engine Combat Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('handleSceneOutcome', () => {
    it('should trigger combat for failed combat scenes', () => {
      const combatScene = getScene(2); // combat-encounter
      const outcome = handleSceneOutcome(combatScene, false, 10);

      expect(outcome.triggeredCombat).toBe(true);
      expect(outcome.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
      expect(outcome.success).toBe(false);
      expect(outcome.scene).toBe(combatScene);
      expect(outcome.resourceChanges).toEqual({});
    });

    it('should not trigger combat for successful combat scenes', () => {
      const combatScene = getScene(2); // combat-encounter
      const outcome = handleSceneOutcome(combatScene, true, 18);

      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.shadowType).toBeUndefined();
      expect(outcome.success).toBe(true);
      expect(outcome.resourceChanges?.lpChange).toBe(4); // Combat scene LP reward
    });

    it('should award LP for successful non-combat scenes', () => {
      const socialScene = getScene(0); // social-encounter
      const outcome = handleSceneOutcome(socialScene, true, 15);

      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.success).toBe(true);
      expect(outcome.resourceChanges?.lpChange).toBe(3); // Default social LP reward
      expect(outcome.resourceChanges?.spChange).toBeUndefined();
    });

    it('should award SP for failed non-combat scenes', () => {
      const skillScene = getScene(1); // skill-challenge
      const outcome = handleSceneOutcome(skillScene, false, 8);

      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.success).toBe(false);
      expect(outcome.resourceChanges?.spChange).toBe(1); // Default skill SP penalty
      expect(outcome.resourceChanges?.lpChange).toBeUndefined();
    });

    it('should use custom LP/SP values when provided', () => {
      const customScene: Scene = {
        id: 'custom-scene',
        type: 'social',
        title: 'Custom Scene',
        text: 'Test scene',
        dc: 12,
        successText: 'Success',
        failureText: 'Failure',
        choices: { bold: 'Bold', cautious: 'Cautious' },
        lpReward: 5,
        spPenalty: 3,
      };

      const successOutcome = handleSceneOutcome(customScene, true);
      expect(successOutcome.resourceChanges?.lpChange).toBe(5);

      const failureOutcome = handleSceneOutcome(customScene, false);
      expect(failureOutcome.resourceChanges?.spChange).toBe(3);
    });

    it('should handle different scene types with appropriate default rewards', () => {
      const sceneTypes: Array<{ type: Scene['type']; expectedLP: number; expectedSP: number }> = [
        { type: 'social', expectedLP: 3, expectedSP: 2 },
        { type: 'skill', expectedLP: 2, expectedSP: 1 },
        { type: 'combat', expectedLP: 4, expectedSP: 3 },
        { type: 'journal', expectedLP: 2, expectedSP: 1 },
        { type: 'exploration', expectedLP: 3, expectedSP: 2 },
      ];

      sceneTypes.forEach(({ type, expectedLP, expectedSP }) => {
        const testScene: Scene = {
          id: `test-${type}`,
          type,
          title: `Test ${type}`,
          text: 'Test',
          dc: 10,
          successText: 'Success',
          failureText: 'Failure',
          choices: { bold: 'Bold', cautious: 'Cautious' },
        };

        const successOutcome = handleSceneOutcome(testScene, true);
        const failureOutcome = handleSceneOutcome(testScene, false);

        if (type === 'combat') {
          // Combat failures trigger combat, not immediate SP penalty
          expect(failureOutcome.triggeredCombat).toBe(false); // No shadowType set in test scene
          expect(successOutcome.resourceChanges?.lpChange).toBe(expectedLP);
        } else {
          expect(successOutcome.resourceChanges?.lpChange).toBe(expectedLP);
          expect(failureOutcome.resourceChanges?.spChange).toBe(expectedSP);
        }
      });
    });
  });

  describe('mapSceneToShadowType', () => {
    it('should map combat-encounter to WHISPER_OF_DOUBT', () => {
      const shadowType = mapSceneToShadowType('combat-encounter');
      expect(shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
    });

    it('should default to WHISPER_OF_DOUBT for unknown scenes', () => {
      const shadowType = mapSceneToShadowType('unknown-scene');
      expect(shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
    });
  });

  describe('Scene Data Validation', () => {
    it('should have combat scene with proper shadow mapping', () => {
      const combatScene = getScene(2); // combat-encounter
      expect(combatScene.type).toBe('combat');
      expect(combatScene.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
      expect(combatScene.lpReward).toBe(4);
      expect(combatScene.spPenalty).toBe(3);
    });

    it('should have all required scene properties', () => {
      const scenes = [0, 1, 2, 3, 4].map((i) => getScene(i));

      scenes.forEach((scene) => {
        expect(scene).toHaveProperty('id');
        expect(scene).toHaveProperty('type');
        expect(scene).toHaveProperty('title');
        expect(scene).toHaveProperty('text');
        expect(scene).toHaveProperty('dc');
        expect(scene).toHaveProperty('successText');
        expect(scene).toHaveProperty('failureText');
        expect(scene).toHaveProperty('choices');
        expect(scene.choices).toHaveProperty('bold');
        expect(scene.choices).toHaveProperty('cautious');
      });
    });
  });

  describe('SceneOutcome Interface', () => {
    it('should create proper SceneOutcome structure', () => {
      const scene = getScene(0);
      const outcome = handleSceneOutcome(scene, true, 15);

      expect(outcome).toHaveProperty('scene');
      expect(outcome).toHaveProperty('success');
      expect(outcome).toHaveProperty('roll');
      expect(outcome).toHaveProperty('triggeredCombat');
      expect(outcome).toHaveProperty('resourceChanges');

      expect(typeof outcome.success).toBe('boolean');
      expect(typeof outcome.triggeredCombat).toBe('boolean');
      expect(typeof outcome.resourceChanges).toBe('object');
    });
  });

  describe('Combat Trigger Integration Fix', () => {
    it('should create valid shadow manifestation for combat trigger', () => {
      // Test that createShadowManifestation works with the shadow ID from combat scenes
      const combatScene = getScene(2); // combat-encounter
      const shadowId = combatScene.shadowType || SHADOW_IDS.WHISPER_OF_DOUBT;

      const shadowManifestation = createShadowManifestation(shadowId);

      expect(shadowManifestation).toBeDefined();
      expect(shadowManifestation).not.toBeNull();
      expect(shadowManifestation!.id).toBe(shadowId);
      expect(shadowManifestation!.name).toBe('The Whisper of Doubt');
      expect(shadowManifestation!.currentHP).toBe(shadowManifestation!.maxHP);
      expect(shadowManifestation!.abilities).toHaveLength(2);
      expect(shadowManifestation!.therapeuticInsight).toContain('doubt');
    });

    it('should properly trigger combat with valid shadow data', () => {
      const combatScene = getScene(2); // combat-encounter
      const outcome = handleSceneOutcome(combatScene, false); // Failed combat scene

      expect(outcome.triggeredCombat).toBe(true);
      expect(outcome.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);

      // Verify the shadow can be created with this ID
      const shadow = createShadowManifestation(outcome.shadowType!);
      expect(shadow).toBeDefined();
      expect(shadow!.name).toBe('The Whisper of Doubt');
    });

    it('should validate all shadow IDs used in combat scenes can create valid manifestations', () => {
      // Test all shadow IDs that might be used in combat scenes
      const shadowIds = [
        SHADOW_IDS.WHISPER_OF_DOUBT,
        SHADOW_IDS.VEIL_OF_ISOLATION,
        SHADOW_IDS.STORM_OF_OVERWHELM,
        SHADOW_IDS.ECHO_OF_PAST_PAIN,
      ];

      shadowIds.forEach((shadowId) => {
        const shadow = createShadowManifestation(shadowId);
        expect(shadow).toBeDefined();
        expect(shadow).not.toBeNull();
        expect(shadow!.id).toBe(shadowId);
        expect(shadow!.currentHP).toBeGreaterThan(0);
        expect(shadow!.maxHP).toBeGreaterThan(0);
        expect(shadow!.abilities.length).toBeGreaterThan(0);
        expect(shadow!.therapeuticInsight).toBeTruthy();
        expect(shadow!.victoryReward.lpBonus).toBeGreaterThan(0);
      });
    });
  });

  describe('Scene Array Validation', () => {
    it('should have exactly 40 scenes', () => {
      // Test that we can access all 40 scenes
      for (let i = 0; i < 40; i++) {
        const scene = getScene(i);
        expect(scene).toBeDefined();
        expect(scene.id).toBeDefined();
      }

      // Test that scene 41 is undefined
      expect(getScene(40)).toBeUndefined();
    });

    it('should follow the correct type pattern for all 40 scenes', () => {
      const expectedPattern = ['social', 'skill', 'combat', 'journal', 'exploration'];

      for (let i = 0; i < 40; i++) {
        const scene = getScene(i);
        const expectedType = expectedPattern[i % 5];
        expect(scene.type).toBe(expectedType);
      }
    });

    it('should have combat scenes at positions 2,7,12,17,22,27,32,37 (0-indexed)', () => {
      const combatPositions = [2, 7, 12, 17, 22, 27, 32, 37];

      combatPositions.forEach((pos) => {
        const scene = getScene(pos);
        expect(scene.type).toBe('combat');
        expect(scene.shadowType).toBeDefined();
      });
    });

    it('should use correct shadow manifestations in the right order', () => {
      // First set of combat scenes
      expect(getScene(2).shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
      expect(getScene(7).shadowType).toBe(SHADOW_IDS.VEIL_OF_ISOLATION);
      expect(getScene(12).shadowType).toBe(SHADOW_IDS.STORM_OF_OVERWHELM);
      expect(getScene(17).shadowType).toBe(SHADOW_IDS.ECHO_OF_PAST_PAIN);

      // Second set of combat scenes (new ones)
      expect(getScene(22).shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
      expect(getScene(27).shadowType).toBe(SHADOW_IDS.VEIL_OF_ISOLATION);
      expect(getScene(32).shadowType).toBe(SHADOW_IDS.STORM_OF_OVERWHELM);
      expect(getScene(37).shadowType).toBe(SHADOW_IDS.ECHO_OF_PAST_PAIN);
    });

    it('should have unique IDs for all 40 scenes', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 40; i++) {
        const scene = getScene(i);
        ids.add(scene.id);
      }

      expect(ids.size).toBe(40);
    });
  });

  describe('Extended Scene Progress', () => {
    it('should correctly report progress for all 40 scenes', () => {
      expect(getSceneProgress(0)).toEqual({ current: 1, total: 40 });
      expect(getSceneProgress(19)).toEqual({ current: 20, total: 40 });
      expect(getSceneProgress(39)).toEqual({ current: 40, total: 40 });
    });

    it('should correctly identify last scene at position 39', () => {
      expect(isLastScene(38)).toBe(false);
      expect(isLastScene(39)).toBe(true);
      expect(isLastScene(40)).toBe(true); // Out of bounds should also be true
    });
  });
});
