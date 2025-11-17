/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Simple integration test to verify combat triggering works
 */

import { describe, it, expect } from 'vitest';
import { handleSceneOutcome } from '@/engine/scene-engine';
import { createShadowManifestation } from '@/data/shadowManifestations';

describe('Combat Trigger Simple Test', () => {
  it('should trigger combat on failed DC check for combat scenes', () => {
    const combatScene = {
      id: 'combat-encounter',
      type: 'combat' as const,
      title: 'Shadow Wolf',
      text: 'A creature of living shadow emerges...',
      dc: 14,
      successText: 'You stand firm...',
      failureText: 'Fear grips your heart...',
      choices: {
        bold: 'Face the wolf with courage',
        cautious: 'Seek to understand what the wolf represents',
      },
      shadowType: 'whisper-of-doubt',
      lpReward: 4,
      spPenalty: 3,
    };

    // Test failed DC check
    const outcome = handleSceneOutcome(combatScene, false, 10);

    expect(outcome.triggeredCombat).toBe(true);
    expect(outcome.shadowType).toBe('whisper-of-doubt');
    expect(outcome.success).toBe(false);
    expect(outcome.resourceChanges).toEqual({});
  });

  it('should not trigger combat on successful DC check', () => {
    const combatScene = {
      id: 'combat-encounter',
      type: 'combat' as const,
      title: 'Shadow Wolf',
      text: 'A creature of living shadow emerges...',
      dc: 14,
      successText: 'You stand firm...',
      failureText: 'Fear grips your heart...',
      choices: {
        bold: 'Face the wolf with courage',
        cautious: 'Seek to understand what the wolf represents',
      },
      shadowType: 'whisper-of-doubt',
      lpReward: 4,
      spPenalty: 3,
    };

    // Test successful DC check
    const outcome = handleSceneOutcome(combatScene, true, 18);

    expect(outcome.triggeredCombat).toBe(false);
    expect(outcome.shadowType).toBeUndefined();
    expect(outcome.success).toBe(true);
    expect(outcome.resourceChanges?.lpChange).toBe(4);
  });

  it('should create shadow manifestation correctly', () => {
    const shadow = createShadowManifestation('whisper-of-doubt');
    
    expect(shadow).toBeDefined();
    expect(shadow?.id).toBe('whisper-of-doubt');
    expect(shadow?.name).toBe('The Whisper of Doubt');
    expect(shadow?.type).toBe('doubt');
    expect(shadow?.maxHP).toBeGreaterThan(0);
  });
});