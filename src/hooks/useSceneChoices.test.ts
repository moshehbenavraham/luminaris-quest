/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSceneChoices } from '@/hooks/useSceneChoices';

const sceneEngine = vi.hoisted(() => ({
  getScene: vi.fn(),
  getSceneProgress: vi.fn(),
  isLastScene: vi.fn(),
  rollDice: vi.fn(),
  handleSceneOutcome: vi.fn(),
  getLevelRollBonus: vi.fn(() => 0),
  getChoiceModifiers: vi.fn(() => ({
    dcModifier: 0,
    lpBonus: 0,
    trustBonus: 0,
    spPenaltyBonus: 0,
  })),
}));

vi.mock('@/engine/scene-engine', () => sceneEngine);

const gameStore = vi.hoisted(() => ({
  useGameStore: vi.fn(),
  getLevelBenefits: vi.fn(() => ({
    energyCostReduction: 0,
    trustGainMultiplier: 1,
  })),
}));

vi.mock('@/store/game-store', () => gameStore);

const combatFeature = vi.hoisted(() => ({
  useCombatStore: vi.fn(() => ({ startCombat: vi.fn() })),
}));

vi.mock('@/features/combat', () => combatFeature);

vi.mock('@/data/shadowManifestations', () => ({
  createShadowManifestation: vi.fn(),
}));

vi.mock('@/store/slices', () => {
  const usePlayerResources = Object.assign(() => ({}), {
    getState: () => ({
      getResourceSnapshot: () => ({
        lightPoints: 10,
        shadowPoints: 5,
        playerHealth: 100,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      }),
    }),
  });

  return { usePlayerResources };
});

describe('useSceneChoices', () => {
  const baseScene = {
    id: 'scene-1',
    type: 'social',
    title: 'Test Scene',
    text: 'Scene text',
    dc: 10,
    successText: 'Success!',
    failureText: 'Failed!',
    choices: { bold: 'Bold', cautious: 'Cautious' },
  } as any;

  const mockGameStore = {
    completeScene: vi.fn(),
    resetGame: vi.fn(),
    currentSceneIndex: 0,
    advanceScene: vi.fn(),
    modifyLightPoints: vi.fn(),
    modifyShadowPoints: vi.fn(),
    modifyPlayerEnergy: vi.fn(),
    modifyExperiencePoints: vi.fn(),
    playerLevel: 1,
    playerEnergy: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sceneEngine.getScene.mockReturnValue(baseScene);
    sceneEngine.getSceneProgress.mockReturnValue({ current: 1, total: 20 });
    sceneEngine.isLastScene.mockReturnValue(false);
    sceneEngine.rollDice.mockReturnValue({ roll: 15, dc: 10, success: true });
    sceneEngine.handleSceneOutcome.mockReturnValue({
      scene: baseScene,
      success: true,
      triggeredCombat: false,
      energyChanges: { energyCost: -10, energyReward: 3 },
      resourceChanges: { lpChange: 3 },
      experienceChanges: { xpGained: 25, reason: 'test' },
      trustModifiers: {},
    });

    gameStore.useGameStore.mockReturnValue(mockGameStore);
  });

  it('blocks choice selection when player lacks required energy', () => {
    mockGameStore.playerEnergy = 5;

    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();

    const { result } = renderHook(() =>
      useSceneChoices({
        guardianTrust: 50,
        setGuardianTrust,
        setGuardianMessage,
      }),
    );

    act(() => {
      result.current.handleChoice('bold');
    });

    expect(setGuardianMessage).toHaveBeenCalledWith(expect.stringContaining('You need 10 energy'));
    expect(result.current.showDiceRoll).toBe(false);
    expect(result.current.isProcessing).toBe(false);
  });

  it('runs a dice roll and advances the scene on non-combat outcomes', () => {
    mockGameStore.playerEnergy = 100;

    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();
    const onSceneComplete = vi.fn();

    const { result } = renderHook(() =>
      useSceneChoices({
        guardianTrust: 50,
        setGuardianTrust,
        setGuardianMessage,
        onSceneComplete,
      }),
    );

    act(() => {
      result.current.handleChoice('bold');
    });

    expect(result.current.showDiceRoll).toBe(true);
    expect(result.current.diceResult).toEqual({ roll: 15, dc: 10, success: true });

    act(() => {
      result.current.handleDiceRollClose();
    });

    expect(setGuardianTrust).toHaveBeenCalledWith(55);
    expect(setGuardianMessage).toHaveBeenCalledWith('Success!');

    // Energy cost + reward applied
    expect(mockGameStore.modifyPlayerEnergy).toHaveBeenCalledWith(-10);
    expect(mockGameStore.modifyPlayerEnergy).toHaveBeenCalledWith(3);

    // Resources + XP applied, scene advanced, scene recorded
    expect(mockGameStore.modifyLightPoints).toHaveBeenCalledWith(3);
    expect(mockGameStore.modifyExperiencePoints).toHaveBeenCalledWith(25, 'test');
    expect(mockGameStore.advanceScene).toHaveBeenCalled();
    expect(mockGameStore.completeScene).toHaveBeenCalled();

    expect(onSceneComplete).toHaveBeenCalledWith('scene-1', true);
  });
});
