import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CombatOverlay } from '@/components/combat/CombatOverlay';
import { useCombat } from '@/hooks/useCombat';
import { useCombatSounds } from '@/hooks/useCombatSounds';
import { useGameStore } from '@/store/game-store';
import { createShadowManifestation, SHADOW_IDS } from '@/data/shadowManifestations';

// Mock the hooks
vi.mock('@/hooks/useCombat');
vi.mock('@/hooks/useCombatSounds');
vi.mock('@/store/game-store');

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock CombatReflectionModal
vi.mock('@/components/combat/CombatReflectionModal', () => ({
  CombatReflectionModal: ({ isOpen, children, ...props }: any) =>
    isOpen ? <div data-testid="combat-reflection-modal" {...props}>{children}</div> : null
}));

const mockUseCombat = vi.mocked(useCombat);
const mockUseCombatSounds = vi.mocked(useCombatSounds);
const mockUseGameStore = vi.mocked(useGameStore);

describe('Combat UI Interaction Test', () => {
  const mockExecuteAction = vi.fn();
  const mockEndCombat = vi.fn();
  const mockAddJournalEntry = vi.fn();
  const mockPlayVictorySound = vi.fn();
  const mockPlayDefeatSound = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock combat sounds
    mockUseCombatSounds.mockReturnValue({
      playActionSound: vi.fn(),
      playVictorySound: mockPlayVictorySound,
      playDefeatSound: mockPlayDefeatSound,
      setSoundsEnabled: vi.fn(),
      setSoundVolume: vi.fn(),
      isSoundsEnabled: true,
    });

    // Mock game store
    mockUseGameStore.mockReturnValue({
      addJournalEntry: mockAddJournalEntry,
      combat: {
        inCombat: true,
        currentEnemy: createShadowManifestation(SHADOW_IDS.WHISPER_OF_DOUBT),
        resources: { lp: 10, sp: 5 },
        turn: 1,
        log: [],
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: 0,
        lpGenerationBlocked: 0,
        skipNextTurn: false,
        consecutiveEndures: 0,
        preferredActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
        growthInsights: [],
        combatReflections: []
      }
    } as any);
  });

  it('should render combat UI and allow player action execution', async () => {
    // Mock active combat state
    mockUseCombat.mockReturnValue({
      isActive: true,
      enemy: createShadowManifestation(SHADOW_IDS.WHISPER_OF_DOUBT),
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: false,
        lpGenerationBlocked: false,
        skipNextTurn: false,
        consecutiveEndures: 0
      },
      canUseAction: vi.fn(() => true),
      getActionCost: vi.fn((action) => {
        switch (action) {
          case 'ILLUMINATE': return { lp: 2 };
          case 'REFLECT': return { sp: 1 };
          case 'ENDURE': return {};
          case 'EMBRACE': return { sp: 2 };
          default: return {};
        }
      }),
      getActionDescription: vi.fn((action) => `Description for ${action}`),
      isPlayerTurn: true,
      combatEndStatus: { isEnded: false },
      executeAction: mockExecuteAction,
      startCombat: vi.fn(),
      endCombat: mockEndCombat,
      preferredActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
      growthInsights: [],
      getMostUsedAction: vi.fn(() => null),
      getTherapeuticInsight: vi.fn(() => 'Test therapeutic insight')
    });

    render(<CombatOverlay />);

    // Verify combat UI is rendered
    expect(screen.getByText('The Whisper of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Response')).toBeInTheDocument();

    // Verify action buttons are present
    expect(screen.getByTestId('action-illuminate')).toBeInTheDocument();
    expect(screen.getByTestId('action-reflect')).toBeInTheDocument();
    expect(screen.getByTestId('action-endure')).toBeInTheDocument();
    expect(screen.getByTestId('action-embrace')).toBeInTheDocument();

    // Test action execution
    fireEvent.click(screen.getByTestId('action-illuminate'));
    
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith('ILLUMINATE');
    });
  });

  it('should apply correct responsive classes to the combat overlay', () => {
    mockUseCombat.mockReturnValue({
      isActive: true,
      enemy: createShadowManifestation(SHADOW_IDS.WHISPER_OF_DOUBT),
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: false,
        lpGenerationBlocked: false,
        skipNextTurn: false,
        consecutiveEndures: 0
      },
      canUseAction: vi.fn(() => true),
      getActionCost: vi.fn(() => ({})),
      getActionDescription: vi.fn(() => ''),
      isPlayerTurn: true,
      combatEndStatus: { isEnded: false },
      executeAction: mockExecuteAction,
      startCombat: vi.fn(),
      endCombat: mockEndCombat,
      preferredActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
      growthInsights: [],
      getMostUsedAction: vi.fn(() => null),
      getTherapeuticInsight: vi.fn(() => 'Test therapeutic insight')
    });

    const { container } = render(<CombatOverlay />);

    // Check for the presence of the correct width and margin classes
    const overlayContent = container.querySelector('.w-full.max-w-3xl.mx-auto.space-y-2');
    expect(overlayContent).toBeInTheDocument();
  });

  it('should handle combat end and show reflection modal', async () => {
    // Mock combat end state
    mockUseCombat.mockReturnValue({
      isActive: true,
      enemy: createShadowManifestation(SHADOW_IDS.WHISPER_OF_DOUBT),
      resources: { lp: 15, sp: 3 },
      turn: 5,
      log: [
        { turn: 1, actor: 'PLAYER', action: 'ILLUMINATE', effect: 'Damage dealt', message: 'You illuminate the shadow' }
      ],
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: false,
        lpGenerationBlocked: false,
        skipNextTurn: false,
        consecutiveEndures: 0
      },
      canUseAction: vi.fn(() => false),
      getActionCost: vi.fn(() => ({})),
      getActionDescription: vi.fn(() => ''),
      isPlayerTurn: false,
      combatEndStatus: { isEnded: true, victory: true, reason: 'Enemy defeated' },
      executeAction: mockExecuteAction,
      startCombat: vi.fn(),
      endCombat: mockEndCombat,
      preferredActions: { ILLUMINATE: 3, REFLECT: 1, ENDURE: 1, EMBRACE: 0 },
      growthInsights: ['You showed courage in facing your doubts'],
      getMostUsedAction: vi.fn(() => 'ILLUMINATE'),
      getTherapeuticInsight: vi.fn(() => 'Victory brings growth')
    });

    render(<CombatOverlay />);

    // Should show reflection modal for combat end
    await waitFor(() => {
      expect(screen.getByTestId('combat-reflection-modal')).toBeInTheDocument();
    });

    // Verify victory sound was played
    expect(mockPlayVictorySound).toHaveBeenCalled();
  });
});
