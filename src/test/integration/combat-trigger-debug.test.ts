/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Debug test to verify combat trigger mechanism works correctly
 * when failing DC checks on combat-type scenes.
 */

import { describe, it, expect } from 'vitest';
import { getScene, handleSceneOutcome, rollDice } from '@/engine/scene-engine';
import { createShadowManifestation, SHADOW_IDS } from '@/data/shadowManifestations';

describe('Combat Trigger Debug Tests', () => {
  it('should identify combat scenes correctly', () => {
    // Find all combat scenes
    const scenes = [];
    for (let i = 0; i < 20; i++) {
      try {
        const scene = getScene(i);
        if (scene.type === 'combat') {
          scenes.push({ index: i, scene });
        }
      } catch (_e) {
        break;
      }
    }

    console.log('Combat scenes found:', scenes.map(s => ({
      index: s.index,
      id: s.scene.id,
      shadowType: s.scene.shadowType,
      dc: s.scene.dc
    })));

    expect(scenes.length).toBeGreaterThan(0);
  });

  it('should trigger combat on failed combat scene checks', () => {
    // Test combat-encounter scene (index 2)
    const scene = getScene(2);
    expect(scene.type).toBe('combat');
    expect(scene.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);

    // Simulate failed DC check
    const outcome = handleSceneOutcome(scene, false, 1); // Roll 1, guaranteed failure

    console.log('Combat scene outcome:', {
      sceneId: scene.id,
      sceneType: scene.type,
      success: false,
      triggeredCombat: outcome.triggeredCombat,
      shadowType: outcome.shadowType,
      resourceChanges: outcome.resourceChanges
    });

    expect(outcome.triggeredCombat).toBe(true);
    expect(outcome.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
    expect(outcome.resourceChanges).toEqual({}); // No immediate resource changes for combat
  });

  it('should create shadow manifestations correctly', () => {
    const shadowId = SHADOW_IDS.WHISPER_OF_DOUBT;
    const shadow = createShadowManifestation(shadowId);

    console.log('Created shadow manifestation:', {
      id: shadow?.id,
      name: shadow?.name,
      type: shadow?.type,
      currentHP: shadow?.currentHP,
      maxHP: shadow?.maxHP
    });

    expect(shadow).toBeTruthy();
    expect(shadow?.id).toBe('whisper-of-doubt');
    expect(shadow?.name).toBe('The Whisper of Doubt');
    expect(shadow?.currentHP).toBe(shadow?.maxHP);
  });

  it('should handle all combat scene types correctly', () => {
    const combatScenes = [
      { index: 2, expectedShadow: SHADOW_IDS.WHISPER_OF_DOUBT },
      { index: 7, expectedShadow: SHADOW_IDS.VEIL_OF_ISOLATION },
      { index: 12, expectedShadow: SHADOW_IDS.STORM_OF_OVERWHELM },
      { index: 17, expectedShadow: SHADOW_IDS.ECHO_OF_PAST_PAIN }
    ];

    combatScenes.forEach(({ index, expectedShadow }) => {
      const scene = getScene(index);
      expect(scene.type).toBe('combat');
      
      const outcome = handleSceneOutcome(scene, false, 1); // Failed check
      
      console.log(`Scene ${index} (${scene.id}):`, {
        triggeredCombat: outcome.triggeredCombat,
        shadowType: outcome.shadowType,
        expectedShadow
      });

      expect(outcome.triggeredCombat).toBe(true);
      expect(outcome.shadowType).toBe(expectedShadow);
    });
  });

  it('should not trigger combat on successful combat scenes', () => {
    const scene = getScene(2); // combat-encounter
    const outcome = handleSceneOutcome(scene, true, 20); // Successful check

    console.log('Successful combat scene outcome:', {
      sceneId: scene.id,
      success: true,
      triggeredCombat: outcome.triggeredCombat,
      resourceChanges: outcome.resourceChanges
    });

    expect(outcome.triggeredCombat).toBe(false);
    expect(outcome.resourceChanges?.lpChange).toBe(4); // LP reward for combat success
  });

  it('should simulate realistic dice roll failure rates', () => {
    const scene = getScene(2); // DC 14 combat scene
    let failureCount = 0;
    let combatTriggeredCount = 0;
    const trials = 100;

    for (let i = 0; i < trials; i++) {
      const diceResult = rollDice(scene.dc);
      if (!diceResult.success) {
        failureCount++;
        const outcome = handleSceneOutcome(scene, false, diceResult.roll);
        if (outcome.triggeredCombat) {
          combatTriggeredCount++;
        }
      }
    }

    console.log(`Dice roll simulation (DC ${scene.dc}):`, {
      trials,
      failures: failureCount,
      combatTriggered: combatTriggeredCount,
      failureRate: (failureCount / trials * 100).toFixed(1) + '%',
      expectedFailureRate: ((20 - scene.dc + 1) / 20 * 100).toFixed(1) + '%'
    });

    // Should have some failures for DC 14 (35% expected failure rate)
    expect(failureCount).toBeGreaterThan(0);
    // Every failure should trigger combat
    expect(combatTriggeredCount).toBe(failureCount);
  });
});