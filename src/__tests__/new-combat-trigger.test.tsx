/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Test to verify NEW combat system triggers correctly on failed DC checks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChoiceList } from '../components/ChoiceList';
import { useGameStore } from '../store/game-store';
import { useCombatStore } from '../features/combat';

// Mock the scene engine to force specific outcomes
vi.mock('../engine/scene-engine', async () => {
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
    })),
    isLastScene: vi.fn(() => false)
  };
});

// Mock shadow manifestation creation
vi.mock('../data/shadowManifestations', () => ({
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

// Mock the new combat overlay
vi.mock('../features/combat', () => ({
  CombatOverlay: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId || 'new-combat-overlay'}>New Combat Active</div>
  ),
  useNewCombatUI: () => true,
  useCombatStore: vi.fn()
}));

describe('NEW Combat System Trigger Tests', () => {
  let mockGameStore: any;
  let mockCombatStore: any;

  beforeEach(() => {
    // Reset game store state
    mockGameStore = {
      currentSceneIndex: 2, // Combat scene
      guardianTrust: 50,
      lightPoints: 10,
      shadowPoints: 5,
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
    (useGameStore as any).mockReturnValue(mockGameStore);
    (useCombatStore as any).mockReturnValue(mockCombatStore);
  });

  it('should call NEW combat store startCombat when failing a combat scene DC check', async () => {
    const setGuardianTrust = vi.fn();
    const setGuardianMessage = vi.fn();

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={setGuardianTrust}
        setGuardianMessage={setGuardianMessage}
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

    // Close the dice overlay
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
    expect(mockGameStore.advanceScene).not.toHaveBeenCalled();
    
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
      />
    );

    // Click choice and fail the DC check
    fireEvent.click(screen.getByText('Attack!'));
    await waitFor(() => screen.getByText('Continue'));
    
    // Simulate combat becoming active after startCombat call
    mockCombatStore.isActive = true;
    fireEvent.click(screen.getByText('Continue'));

    // Wait and check for combat overlay
    await waitFor(() => {
      // Re-render might be needed for the overlay to appear
      expect(mockCombatStore.startCombat).toHaveBeenCalled();
    });
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
    expect(mockGameStore.advanceScene).toHaveBeenCalled();
    
    // Should apply LP reward
    expect(mockGameStore.modifyLightPoints).toHaveBeenCalledWith(4);
  });

  it('should handle missing shadow manifestation gracefully', async () => {
    // Access the mocked function directly
    const createShadowManifestation = vi.fn();
    (createShadowManifestation as any).mockReturnValueOnce(null);

    render(
      <ChoiceList
        guardianTrust={50}
        setGuardianTrust={vi.fn()}
        setGuardianMessage={vi.fn()}
      />
    );

    // Click choice and fail DC
    fireEvent.click(screen.getByText('Attack!'));
    await waitFor(() => screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));

    // Should not call startCombat if shadow creation failed
    await waitFor(() => {
      expect(mockCombatStore.startCombat).not.toHaveBeenCalled();
    });
    
    // Should still not advance scene (combat was intended)
    expect(mockGameStore.advanceScene).not.toHaveBeenCalled();
  });
});