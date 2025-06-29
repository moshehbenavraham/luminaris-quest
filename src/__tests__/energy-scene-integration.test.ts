import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSceneOutcome, getScene } from '../engine/scene-engine';
import { getEnvironmentConfig } from '../lib/environment';

// Mock environment config for consistent testing
vi.mock('../lib/environment', () => ({
  getEnvironmentConfig: vi.fn(() => ({
    sceneCosts: {
      social: 8,
      skill: 12,
      combat: 15,
      journal: 5,
      exploration: 10
    },
    sceneRewards: {
      social: 3,
      skill: 5,
      combat: 8,
      journal: 2,
      exploration: 4
    }
  }))
}));

describe('Energy Scene Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scene Energy Costs', () => {
    it('should apply correct energy cost for social scenes', () => {
      const scene = getScene(0); // First scene is social
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyCost).toBe(-8);
    });

    it('should apply correct energy cost for skill scenes', () => {
      const scene = getScene(1); // Second scene is skill
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyCost).toBe(-12);
    });

    it('should apply correct energy cost for combat scenes', () => {
      const scene = getScene(2); // Third scene is combat
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyCost).toBe(-15);
    });

    it('should apply correct energy cost for journal scenes', () => {
      const scene = getScene(3); // Fourth scene is journal
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyCost).toBe(-5);
    });

    it('should apply correct energy cost for exploration scenes', () => {
      const scene = getScene(4); // Fifth scene is exploration
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyCost).toBe(-10);
    });
  });

  describe('Scene Energy Rewards', () => {
    it('should provide energy reward on successful social scene', () => {
      const scene = getScene(0); // Social scene
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyReward).toBe(3);
    });

    it('should provide energy reward on successful skill scene', () => {
      const scene = getScene(1); // Skill scene
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyReward).toBe(5);
    });

    it('should provide energy reward on successful combat scene', () => {
      const scene = getScene(2); // Combat scene
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyReward).toBe(8);
    });

    it('should provide energy reward on successful journal scene', () => {
      const scene = getScene(3); // Journal scene
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyReward).toBe(2);
    });

    it('should provide energy reward on successful exploration scene', () => {
      const scene = getScene(4); // Exploration scene
      const outcome = handleSceneOutcome(scene, true);
      
      expect(outcome.energyChanges?.energyReward).toBe(4);
    });

    it('should not provide energy reward on failed non-combat scenes', () => {
      const scene = getScene(0); // Social scene
      const outcome = handleSceneOutcome(scene, false);
      
      expect(outcome.energyChanges?.energyReward).toBeUndefined();
    });
  });

  describe('Combat Scene Energy Handling', () => {
    it('should apply energy cost even when combat is triggered', () => {
      const scene = getScene(2); // Combat scene
      const outcome = handleSceneOutcome(scene, false); // Failed combat triggers battle
      
      expect(outcome.energyChanges?.energyCost).toBe(-15);
      expect(outcome.triggeredCombat).toBe(true);
    });

    it('should not provide energy reward when combat is triggered', () => {
      const scene = getScene(2); // Combat scene
      const outcome = handleSceneOutcome(scene, false); // Failed combat triggers battle
      
      expect(outcome.energyChanges?.energyReward).toBeUndefined();
      expect(outcome.triggeredCombat).toBe(true);
    });

    it('should provide energy reward on successful combat scene without triggering combat', () => {
      const scene = getScene(2); // Combat scene
      const outcome = handleSceneOutcome(scene, true); // Successful combat
      
      expect(outcome.energyChanges?.energyCost).toBe(-15);
      expect(outcome.energyChanges?.energyReward).toBe(8);
      expect(outcome.triggeredCombat).toBe(false);
    });
  });

  describe('Energy Balance', () => {
    it('should ensure all scene types have net positive energy on success', () => {
      const sceneTypes = ['social', 'skill', 'combat', 'journal', 'exploration'];
      const config = getEnvironmentConfig();
      
      sceneTypes.forEach(type => {
        const cost = config.sceneCosts[type as keyof typeof config.sceneCosts];
        const reward = config.sceneRewards[type as keyof typeof config.sceneRewards];
        
        // Net energy change should be positive on success (reward > cost)
        expect(reward).toBeGreaterThan(0);
        // But cost should be higher than reward to encourage strategic play
        expect(cost).toBeGreaterThan(reward);
      });
    });

    it('should have energy costs within specified range (5-15)', () => {
      const config = getEnvironmentConfig();
      const costs = Object.values(config.sceneCosts);
      
      costs.forEach(cost => {
        expect(cost).toBeGreaterThanOrEqual(5);
        expect(cost).toBeLessThanOrEqual(15);
      });
    });

    it('should have reasonable energy rewards for recovery bonuses', () => {
      const config = getEnvironmentConfig();
      const rewards = Object.values(config.sceneRewards);
      
      rewards.forEach(reward => {
        expect(reward).toBeGreaterThan(0);
        expect(reward).toBeLessThanOrEqual(10); // Reasonable upper bound
      });
    });
  });

  describe('Scene Outcome Integration', () => {
    it('should include both resource changes and energy changes in outcome', () => {
      const scene = getScene(0); // Social scene
      const outcome = handleSceneOutcome(scene, true);
      
      // Should have both resource and energy changes
      expect(outcome.resourceChanges).toBeDefined();
      expect(outcome.energyChanges).toBeDefined();
      
      // Should have LP reward and energy cost/reward
      expect(outcome.resourceChanges?.lpChange).toBeGreaterThan(0);
      expect(outcome.energyChanges?.energyCost).toBeLessThan(0);
      expect(outcome.energyChanges?.energyReward).toBeGreaterThan(0);
    });

    it('should maintain existing resource change behavior', () => {
      const scene = getScene(0); // Social scene
      const successOutcome = handleSceneOutcome(scene, true);
      const failureOutcome = handleSceneOutcome(scene, false);
      
      // Success should give LP
      expect(successOutcome.resourceChanges?.lpChange).toBeGreaterThan(0);
      expect(successOutcome.resourceChanges?.spChange).toBeUndefined();
      
      // Failure should give SP
      expect(failureOutcome.resourceChanges?.lpChange).toBeUndefined();
      expect(failureOutcome.resourceChanges?.spChange).toBeGreaterThan(0);
    });
  });
}); 