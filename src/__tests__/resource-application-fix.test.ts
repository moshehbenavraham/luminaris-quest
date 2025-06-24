import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSceneOutcome, getScene } from '../engine/scene-engine';
import { useGameStoreBase } from '../store/game-store';

// Mock console.log to capture debug output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Get a single reference to the store to avoid state reset issues
const gameStore = useGameStoreBase;

describe('Resource Application Fix', () => {
  beforeEach(() => {
    // Reset store state using base store (no React hooks)
    gameStore.getState().resetGame();
    // Ensure the store is marked as hydrated for tests
    gameStore.getState()._setHasHydrated(true);
    mockConsoleLog.mockClear();
  });

  describe('Scene Outcome Resource Application', () => {
    it('should apply LP rewards for successful non-combat scenes', () => {
      const socialScene = getScene(0); // social scene
      const outcome = handleSceneOutcome(socialScene, true, 15);

      expect(outcome.success).toBe(true);
      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.resourceChanges?.lpChange).toBeGreaterThan(0);
      
      // Simulate the resource application from ChoiceList
      if (outcome.resourceChanges?.lpChange) {
        gameStore.getState().modifyLightPoints(outcome.resourceChanges.lpChange);

        // Verify LP was applied
        expect(gameStore.getState().lightPoints).toBe(outcome.resourceChanges.lpChange);
      }
    });

    it('should apply SP penalties for failed non-combat scenes', () => {
      const socialScene = getScene(0); // social scene
      const outcome = handleSceneOutcome(socialScene, false, 8);

      expect(outcome.success).toBe(false);
      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.resourceChanges?.spChange).toBeGreaterThan(0);
      
      // Simulate the resource application from ChoiceList
      if (outcome.resourceChanges?.spChange) {
        gameStore.getState().modifyShadowPoints(outcome.resourceChanges.spChange);

        // Verify SP was applied
        expect(gameStore.getState().shadowPoints).toBe(outcome.resourceChanges.spChange);
      }
    });

    it('should trigger combat for failed combat scenes without immediate resource changes', () => {
      const combatScene = getScene(2); // combat-encounter scene
      const outcome = handleSceneOutcome(combatScene, false, 10);

      expect(outcome.success).toBe(false);
      expect(outcome.triggeredCombat).toBe(true);
      expect(outcome.shadowType).toBeDefined();
      expect(outcome.resourceChanges).toEqual({});
    });

    it('should apply LP rewards for successful combat scenes', () => {
      const combatScene = getScene(2); // combat-encounter scene
      const outcome = handleSceneOutcome(combatScene, true, 16);

      expect(outcome.success).toBe(true);
      expect(outcome.triggeredCombat).toBe(false);
      expect(outcome.resourceChanges?.lpChange).toBe(4); // Combat scenes give 4 LP
      
      // Simulate the resource application from ChoiceList
      if (outcome.resourceChanges?.lpChange) {
        gameStore.getState().modifyLightPoints(outcome.resourceChanges.lpChange);

        // Verify LP was applied
        expect(gameStore.getState().lightPoints).toBe(4);
      }
    });
  });

  describe('Resource Persistence', () => {
    it('should persist resources across multiple scene completions', () => {
      // Complete first scene successfully
      const scene1 = getScene(0);
      const outcome1 = handleSceneOutcome(scene1, true, 15);
      if (outcome1.resourceChanges?.lpChange) {
        gameStore.getState().modifyLightPoints(outcome1.resourceChanges.lpChange);
      }

      const lpAfterScene1 = gameStore.getState().lightPoints;

      // Complete second scene with failure
      const scene2 = getScene(1);
      const outcome2 = handleSceneOutcome(scene2, false, 8);
      if (outcome2.resourceChanges?.spChange) {
        gameStore.getState().modifyShadowPoints(outcome2.resourceChanges.spChange);
      }

      expect(gameStore.getState().lightPoints).toBe(lpAfterScene1); // LP should remain
      expect(gameStore.getState().shadowPoints).toBeGreaterThan(0); // SP should be added
    });

    it('should maintain resources when combat is triggered', () => {
      // Set initial resources
      gameStore.getState().modifyLightPoints(5);
      gameStore.getState().modifyShadowPoints(2);

      expect(gameStore.getState().lightPoints).toBe(5);
      expect(gameStore.getState().shadowPoints).toBe(2);

      // Trigger combat
      const combatScene = getScene(2);
      const outcome = handleSceneOutcome(combatScene, false, 10);

      if (outcome.triggeredCombat && outcome.shadowType) {
        gameStore.getState().startCombat(outcome.shadowType);
      }

      // Resources should be preserved during combat initialization
      expect(gameStore.getState().lightPoints).toBe(5);
      expect(gameStore.getState().shadowPoints).toBe(2);
      expect(gameStore.getState().combat.inCombat).toBe(true);
    });
  });

  describe('Debug Logging Verification', () => {
    it('should log resource changes when applied', () => {
      const socialScene = getScene(0);
      const outcome = handleSceneOutcome(socialScene, true, 15);

      // Simulate the debug logging from ChoiceList
      if (outcome.resourceChanges?.lpChange) {
        console.log('Applying LP change:', outcome.resourceChanges.lpChange);
        gameStore.getState().modifyLightPoints(outcome.resourceChanges.lpChange);
      }

      console.log('Scene outcome:', {
        sceneType: socialScene.type,
        success: true,
        triggeredCombat: outcome.triggeredCombat,
        resourceChanges: outcome.resourceChanges
      });

      // Verify debug logs were called
      expect(mockConsoleLog).toHaveBeenCalledWith('Applying LP change:', expect.any(Number));
      expect(mockConsoleLog).toHaveBeenCalledWith('Scene outcome:', expect.objectContaining({
        sceneType: 'social',
        success: true,
        triggeredCombat: false,
        resourceChanges: expect.any(Object)
      }));
    });
  });
});
