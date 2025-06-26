import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatOverlay } from '../components/combat/CombatOverlay';

// Mock the hooks and dependencies
vi.mock('../hooks/useCombat', () => ({
  useCombat: () => ({
    isActive: true,
    enemy: {
      id: 'test-enemy',
      name: 'Test Shadow Enemy',
      description: 'A test shadow for testing purposes',
      type: 'doubt',
      maxHP: 20,
      currentHP: 15,
      therapeuticInsight: 'Test insight'
    },
    resources: { lp: 10, sp: 5 },
    turn: 1,
    log: [],
    statusEffects: {
      healingBlocked: false,
      lpGenerationBlocked: false,
      skipNextTurn: false
    },
    canUseAction: vi.fn(() => true),
    getActionCost: vi.fn(() => ({ lp: 2, sp: 0 })),
    getActionDescription: vi.fn(() => 'Test action description'),
    isPlayerTurn: true,
    combatEndStatus: { isEnded: false, victory: false },
    executeAction: vi.fn(),
    playerHealth: 100,
    playerLevel: 1,
    endCombat: vi.fn(),
    endTurn: vi.fn(),
    getTherapeuticInsight: vi.fn(() => 'Test therapeutic insight')
  })
}));

vi.mock('../hooks/useCombatSounds', () => ({
  useCombatSounds: () => ({
    playVictorySound: vi.fn(),
    playDefeatSound: vi.fn()
  })
}));

vi.mock('../store/game-store', () => ({
  useGameStore: () => ({
    addJournalEntry: vi.fn(),
    combat: {
      isActive: true,
      enemy: null,
      turn: 1,
      log: [],
      statusEffects: {
        healingBlocked: false,
        lpGenerationBlocked: false,
        skipNextTurn: false
      }
    }
  })
}));

vi.mock('../components/combat/ActionSelector', () => ({
  ActionSelector: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId || 'action-selector'}>Mock Action Selector</div>
  )
}));

vi.mock('../components/combat/CombatReflectionModal', () => ({
  CombatReflectionModal: ({ isOpen, 'data-testid': testId }: { isOpen: boolean; 'data-testid'?: string }) => 
    isOpen ? <div data-testid={testId || 'combat-reflection-modal'}>Mock Reflection Modal</div> : null
}));

describe('Combat Overlay Backdrop Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Backdrop Blur Full Screen Coverage', () => {
    it('should apply backdrop blur to the full screen without padding gaps', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);

      // Find the main overlay element by its classes since it only renders when active
      const combatOverlay = container.querySelector('.fixed.inset-0.z-\\[60\\].bg-black\\/70.backdrop-blur-sm');
      expect(combatOverlay).toBeInTheDocument();

      // The main overlay should have backdrop blur and cover full screen
      expect(combatOverlay).toHaveClass('fixed', 'inset-0', 'backdrop-blur-sm');

      // Should NOT have padding on the main overlay (this was causing the strip)
      expect(combatOverlay).not.toHaveClass('p-4');

      // Should NOT have flex centering on the main overlay (moved to inner container)
      expect(combatOverlay).not.toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have proper inner container for content positioning', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);

      // Find the inner container that handles content positioning
      const innerContainer = container.querySelector('.fixed.inset-0.flex.items-center.justify-center.p-4');
      expect(innerContainer).toBeInTheDocument();

      // The inner container should have the positioning and padding
      expect(innerContainer).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center', 'p-4');
    });

    it('should maintain content container structure', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);
      
      // Find the content container
      const contentContainer = container.querySelector('.w-full.max-w-5xl.mx-auto.space-y-2');
      expect(contentContainer).toBeInTheDocument();
      
      // Content container should maintain its responsive sizing
      expect(contentContainer).toHaveClass('w-full', 'max-w-5xl', 'mx-auto', 'space-y-2');
    });

    it('should ensure backdrop covers entire viewport without visual strips', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);

      const combatOverlay = container.querySelector('.fixed.inset-0.z-\\[60\\].bg-black\\/70.backdrop-blur-sm');

      // Verify the backdrop styling that prevents visual strips
      expect(combatOverlay).toHaveClass('bg-black/70');
      expect(combatOverlay).toHaveClass('backdrop-blur-sm');
      expect(combatOverlay).toHaveClass('fixed');
      expect(combatOverlay).toHaveClass('inset-0');

      // Ensure z-index is appropriate (higher than navbar's z-50)
      expect(combatOverlay).toHaveClass('z-[60]');
    });
  });

  describe('Mobile Responsiveness Structure', () => {
    it('should maintain proper structure for mobile-first approach', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);

      // The main overlay should be full screen
      const mainOverlay = container.querySelector('.fixed.inset-0.z-\\[60\\].bg-black\\/70.backdrop-blur-sm');
      expect(mainOverlay).toHaveClass('fixed', 'inset-0');

      // Content should be properly contained and responsive
      const contentContainer = container.querySelector('.w-full.max-w-5xl');
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass('mx-auto'); // Centered
    });

    it('should have proper layering structure', () => {
      const { container } = render(<CombatOverlay data-testid="combat-overlay" />);

      // Verify the layering: backdrop -> positioning -> content
      const backdrop = container.querySelector('.fixed.inset-0.z-\\[60\\].bg-black\\/70.backdrop-blur-sm');
      const positioningLayer = container.querySelector('.fixed.inset-0.flex.items-center.justify-center');
      const contentLayer = container.querySelector('.w-full.max-w-5xl.mx-auto');

      expect(backdrop).toBeInTheDocument();
      expect(positioningLayer).toBeInTheDocument();
      expect(contentLayer).toBeInTheDocument();

      // Verify backdrop is the outermost layer
      expect(backdrop).toHaveClass('backdrop-blur-sm');
      expect(backdrop).toHaveClass('bg-black/70');
    });
  });
});
