/**
 * MIT License 
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Integration test to verify combat triggers work in the full UI flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChoiceList } from '@/components/ChoiceList';
import { useGameStore } from '@/store/game-store';

// Mock the scene engine to force specific outcomes
vi.mock('@/engine/scene-engine', async () => {
  const actual = await vi.importActual('../engine/scene-engine');
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

// Need to import this before mocking
import { useCombatStore } from '@/features/combat';

vi.mock('@/features/combat', () => ({
  CombatOverlay: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId || 'new-combat-overlay'}>New Combat Active</div>
  ),
  useNewCombatUI: () => true,
  useCombatStore: vi.fn()
}));


describe('Combat Trigger Integration Tests', () => {
  let mockStore: any;
  let mockCombatStore: any;

  beforeEach(() => {
    // Reset store state before each test
    mockStore = {
      currentSceneIndex: 2, // Combat scene
      guardianTrust: 50,
      combat: { inCombat: false },
      completeScene: vi.fn(),
      advanceScene: vi.fn(),
      modifyLightPoints: vi.fn(),
      modifyShadowPoints: vi.fn(),
      resetGame: vi.fn()
    };

    // Reset NEW combat store state
    mockCombatStore = {
      isActive: false,
      enemy: null,
      startCombat: vi.fn(),
      _hasHydrated: true,
      flags: { newCombatUI: true }
    };

    // Mock the stores
    (useGameStore as any).mockReturnValue(mockStore);
    (useCombatStore as any).mockReturnValue(mockCombatStore);
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

    // Find and close the dice overlay
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Verify NEW combat store startCombat was called with shadow manifestation
    await waitFor(() => {
      expect(mockCombatStore.startCombat).toHaveBeenCalledWith({
        id: 'whisper-of-doubt',
        name: 'The Whisper of Doubt',
        type: 'doubt',
        maxHP: 30,
        currentHP: 30,
        damage: 8,
        description: 'A shadow that feeds on uncertainty',
        abilities: [],
        weaknesses: ['ILLUMINATE'],
        resistances: []
      });
    });

    // Verify scene didn't advance (should stay in combat)
    expect(mockStore.advanceScene).not.toHaveBeenCalled();
    
    // Verify failure message was set
    expect(setGuardianMessage).toHaveBeenCalledWith('Failed combat!');
    
    console.log('startCombat calls:', mockStore.startCombat.mock.calls);
  });

  it('should render combat overlay when NEW combat is active', () => {
    // Set NEW combat state to active
    mockCombatStore.isActive = true;
    mockCombatStore.enemy = {
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
    };
    
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
    const { rollDice } = await import('../engine/scene-engine');
    // Mock successful roll
    vi.mocked(rollDice).mockReturnValueOnce({ roll: 20, dc: 14, success: true });

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={vi.fn()}
        setGuardianMessage={vi.fn()}
      />
    );

    // Click choice and complete dice roll
    fireEvent.click(screen.getByText('Attack!'));
    await waitFor(() => screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));

    // Should not call NEW combat store startCombat
    await waitFor(() => {
      expect(mockCombatStore.startCombat).not.toHaveBeenCalled();
    });
    
    // Should advance scene
    expect(mockStore.advanceScene).toHaveBeenCalled();
    
    // Should apply LP reward
    expect(mockStore.modifyLightPoints).toHaveBeenCalledWith(4);
  });
});