/**
 * MIT License 
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Integration test to verify combat triggers work in the full UI flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Import stores BEFORE mocks so we get the actual stores with setState
import { useGameStoreBase } from '@/store/game-store';
import { useCombatStore } from '@/features/combat/store/combat-store';

import { ChoiceList } from '@/components/ChoiceList';

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
      spPenalty: 3
    }))
  };
});

// Mock shadow manifestation creation
vi.mock('@/data/shadowManifestations', () => ({
  SHADOW_IDS: {
    WHISPER_OF_DOUBT: 'whisper-of-doubt',
    VEIL_OF_ISOLATION: 'veil-of-isolation',
    STORM_OF_OVERWHELM: 'storm-of-overwhelm',
    ECHO_OF_PAST_PAIN: 'echo-of-past-pain'
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
    resistances: []
  }))
}));

// Mock combat overlays to track if they render
vi.mock('@/components/combat/CombatOverlay', () => ({
  CombatOverlay: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId || 'legacy-combat-overlay'}>Legacy Combat Active</div>
  )
}));

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


describe('Combat Trigger Integration Tests', () => {
  beforeEach(() => {
    // Reset game store state
    useGameStoreBase.setState({
      currentSceneIndex: 2,
      guardianTrust: 50,
      combat: { inCombat: false },
    });

    // Reset combat store state
    useCombatStore.setState({
      isActive: false,
      enemy: null,
      _hasHydrated: true,
      flags: { newCombatUI: true },
      combatEndStatus: {
        isEnded: false,
        victory: false,
        reason: ''
      }
    });
  });

  it('should call startCombat when failing a combat scene DC check', async () => {
    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();
    const onSceneComplete = vi.fn();
    const onLearningMoment = vi.fn();

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={setGuardianTrust}
        setGuardianMessage={setGuardianMessage}
        onSceneComplete={onSceneComplete}
        onLearningMoment={onLearningMoment}
      />
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

  it('should render combat overlay when NEW combat is active', () => {
    // Set NEW combat state to active using the actual store
    useCombatStore.setState({
      isActive: true,
      enemy: {
        id: 'test-shadow',
        name: 'Test Shadow',
        type: 'doubt',
        maxHP: 30,
        currentHP: 30,
        damage: 8,
        description: 'Test',
        abilities: [],
        weaknesses: [],
        resistances: []
      }
    });

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={vi.fn()}
        setGuardianMessage={vi.fn()}
      />
    );

    // Should render the new combat overlay
    expect(screen.getByTestId('combat-overlay')).toBeInTheDocument();
    expect(screen.getByText('New Combat Active')).toBeInTheDocument();
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
      />
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
    await waitFor(() => {
      expect(setGuardianMessage).toHaveBeenCalledWith('Success!');
    }, { timeout: 2000 });
  });
});