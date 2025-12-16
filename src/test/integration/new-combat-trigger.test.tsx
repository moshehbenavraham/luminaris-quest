/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */

/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * Test to verify NEW combat system triggers correctly on failed DC checks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChoiceList } from '@/components/organisms/ChoiceList';
import { useGameStoreBase } from '@/store/game-store';
import { useCombatStore } from '@/features/combat/store/combat-store';

// Mock the scene engine to force specific outcomes
vi.mock('@/engine/scene-engine', async () => {
  const actual = await vi.importActual('@/engine/scene-engine');
  return {
    ...actual,
    rollDice: vi.fn(() => ({ roll: 1, dc: 14, success: false })), // Force failure
    getScene: vi.fn(() => ({
      id: 'combat-encounter',
      type: 'combat',
      title: 'Test Combat Scene',
      text: 'A test combat scenario',
      dc: 14,
      successText: 'Success!',
      failureText: 'Failed combat!',
      choices: { bold: 'Attack!', cautious: 'Defend!' },
      shadowType: 'whisper-of-doubt',
      lpReward: 4,
      spPenalty: 3,
    })),
    isLastScene: vi.fn(() => false),
  };
});

// Mock shadow manifestation creation
vi.mock('@/data/shadowManifestations', () => ({
  SHADOW_IDS: {
    WHISPER_OF_DOUBT: 'whisper-of-doubt',
    VEIL_OF_ISOLATION: 'veil-of-isolation',
    STORM_OF_OVERWHELM: 'storm-of-overwhelm',
    ECHO_OF_PAST_PAIN: 'echo-of-past-pain',
  },
  createShadowManifestation: vi.fn((id) => ({
    id,
    name: 'The Whisper of Doubt',
    type: 'doubt',
    maxHP: 30,
    currentHP: 30,
    damage: 8,
    description: 'A shadow that feeds on uncertainty',
    abilities: [],
    weaknesses: ['ILLUMINATE'],
    resistances: [],
  })),
}));

// Mock the new combat overlay
vi.mock('@/features/combat', async () => {
  const actual = await vi.importActual<typeof import('@/features/combat')>('@/features/combat');
  return {
    ...actual,
    CombatOverlay: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
      <div data-testid={testId || 'new-combat-overlay'}>New Combat Active</div>
    ),
    useNewCombatUI: () => true,
  };
});

describe('NEW Combat System Trigger Tests', () => {
  beforeEach(() => {
    // Reset game store state using actual store
    useGameStoreBase.setState({
      currentSceneIndex: 2,
      guardianTrust: 50,
      lightPoints: 10,
      shadowPoints: 5,
      combat: { inCombat: false },
    });

    // Reset combat store state using actual store
    useCombatStore.setState({
      isActive: false,
      enemy: null,
      _hasHydrated: true,
      flags: { newCombatUI: true },
      combatEndStatus: {
        isEnded: false,
        victory: false,
        reason: '',
      },
    });
  });

  it('should call NEW combat store startCombat when failing a combat scene DC check', async () => {
    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={setGuardianTrust}
        setGuardianMessage={setGuardianMessage}
      />,
    );

    // Verify combat scene is displayed
    expect(screen.getByText('Test Combat Scene')).toBeInTheDocument();
    expect(screen.getByText('Combat on failure')).toBeInTheDocument();

    // Click a choice button
    const choiceButton = screen.getByText('Attack!');
    fireEvent.click(choiceButton);

    // Wait for dice roll overlay to appear
    await waitFor(() => {
      expect(screen.getByText('Rolling...')).toBeInTheDocument();
    });

    // Now use fake timers to advance past the 1.5s dice roll animation delay
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(1500);
    vi.useRealTimers();

    // Find and close the dice overlay
    const continueButton = await waitFor(() => screen.getByText('Continue'), { timeout: 2000 });
    fireEvent.click(continueButton);

    // Verify combat was started by checking store state
    await waitFor(() => {
      const combatState = useCombatStore.getState();
      expect(combatState.isActive).toBe(true);
      expect(combatState.enemy).toBeTruthy();
      expect(combatState.enemy?.id).toBe('whisper-of-doubt');
    });

    // Verify failure message was set
    expect(setGuardianMessage).toHaveBeenCalledWith('Failed combat!');
  });

  it('should render NEW combat overlay when combat is active', async () => {
    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={setGuardianTrust}
        setGuardianMessage={setGuardianMessage}
      />,
    );

    // Click choice and fail the DC check
    fireEvent.click(screen.getByText('Attack!'));

    // Wait for dice overlay to appear, then use fake timers to skip the animation
    await waitFor(() => screen.getByText('Rolling...'));
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(1500);
    vi.useRealTimers();

    const continueButton = await waitFor(() => screen.getByText('Continue'), { timeout: 2000 });
    fireEvent.click(continueButton);

    // Wait and check that combat was started
    await waitFor(() => {
      const combatState = useCombatStore.getState();
      expect(combatState.isActive).toBe(true);
      expect(combatState.enemy).toBeTruthy();
    });
  });

  it('should not trigger combat on successful combat scene', async () => {
    const { rollDice } = await import('@/engine/scene-engine');
    const setGuardianMessage = vi.fn();

    // Mock successful roll
    vi.mocked(rollDice).mockReturnValueOnce({ roll: 20, dc: 14, success: true });

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={vi.fn()}
        setGuardianMessage={setGuardianMessage}
      />,
    );

    // Click choice and complete dice roll
    fireEvent.click(screen.getByText('Attack!'));

    // Wait for dice overlay to appear, then use fake timers to skip the animation
    await waitFor(() => screen.getByText('Rolling...'));
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(1500);
    vi.useRealTimers();

    const continueButton = await waitFor(() => screen.getByText('Continue'), { timeout: 2000 });
    fireEvent.click(continueButton);

    // Should not start combat (verify by checking combat state remains inactive)
    await waitFor(() => {
      const combatState = useCombatStore.getState();
      expect(combatState.isActive).toBe(false);
      expect(combatState.enemy).toBeNull();
    });

    // Verify success message was set (may be called asynchronously)
    await waitFor(
      () => {
        expect(setGuardianMessage).toHaveBeenCalledWith('Success!');
      },
      { timeout: 2000 },
    );
  });

  it('should handle missing shadow manifestation gracefully', async () => {
    // Access the mocked function directly
    const createShadowManifestation = vi.fn();
    (createShadowManifestation as any).mockReturnValueOnce(null);

    render(
      <ChoiceList guardianTrust={50} setGuardianTrust={vi.fn()} setGuardianMessage={vi.fn()} />,
    );

    // Click choice and fail DC
    fireEvent.click(screen.getByText('Attack!'));

    // Wait for dice overlay to appear, then use fake timers to skip the animation
    await waitFor(() => screen.getByText('Rolling...'));
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(1500);
    vi.useRealTimers();

    const continueButton = await waitFor(() => screen.getByText('Continue'), { timeout: 2000 });
    fireEvent.click(continueButton);

    // Should not start combat if shadow creation failed (verify by checking state)
    await waitFor(() => {
      const combatState = useCombatStore.getState();
      expect(combatState.isActive).toBe(false);
      expect(combatState.enemy).toBeNull();
    });
  });
});
