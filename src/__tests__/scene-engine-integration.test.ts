import { describe, it, expect } from 'vitest';
import {
  handleSceneOutcome,
  mapSceneToShadowType,
  getScene,
  type Scene,
  type SceneOutcome
} from '../engine/scene-engine';
import { SHADOW_IDS } from '../data/shadowManifestations';

describe('Scene Engine Combat Integration', () => {
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
        spPenalty: 3
      };

      const successOutcome = handleSceneOutcome(customScene, true);
      expect(successOutcome.resourceChanges?.lpChange).toBe(5);

      const failureOutcome = handleSceneOutcome(customScene, false);
      expect(failureOutcome.resourceChanges?.spChange).toBe(3);
    });

    it('should handle different scene types with appropriate default rewards', () => {
      const sceneTypes: Array<{ type: Scene['type'], expectedLP: number, expectedSP: number }> = [
        { type: 'social', expectedLP: 3, expectedSP: 2 },
        { type: 'skill', expectedLP: 2, expectedSP: 1 },
        { type: 'combat', expectedLP: 4, expectedSP: 3 },
        { type: 'journal', expectedLP: 2, expectedSP: 1 },
        { type: 'exploration', expectedLP: 3, expectedSP: 2 }
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
          choices: { bold: 'Bold', cautious: 'Cautious' }
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
      const scenes = [0, 1, 2, 3, 4].map(i => getScene(i));
      
      scenes.forEach(scene => {
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
});
