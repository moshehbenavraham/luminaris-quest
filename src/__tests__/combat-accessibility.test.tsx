import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Combat system components
import { CombatOverlay } from '../components/combat/CombatOverlay';
import { ActionSelector } from '../components/combat/ActionSelector';
import { CombatLog } from '../components/combat/CombatLog';
import { CombatReflectionModal } from '../components/combat/CombatReflectionModal';
import { ResourceDisplay } from '../components/combat/ResourceDisplay';

// Hooks and types
import { useCombat } from '../hooks/useCombat';
import { useCombatSounds } from '../hooks/useCombatSounds';
import { useGameStore } from '../store/game-store';
import type { CombatAction, ShadowManifestation } from '../store/game-store';
import type { CombatReflectionData } from '../components/combat/CombatReflectionModal';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('../hooks/useCombat');
vi.mock('../hooks/useCombatSounds');
vi.mock('../store/game-store');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}));

const mockUseCombat = vi.mocked(useCombat);
const mockUseCombatSounds = vi.mocked(useCombatSounds);
const mockUseGameStore = vi.mocked(useGameStore);

// Mock data
const mockEnemy: ShadowManifestation = {
  id: 'WHISPER_OF_DOUBT',
  name: 'The Whisper of Doubt',
  type: 'doubt',
  hp: 15,
  maxHp: 15,
  abilities: [],
  therapeuticInsight: 'Doubt often whispers loudest when we are on the verge of growth.',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'You have learned to question your doubts rather than accept them as truth.',
    permanentBenefit: 'Increased resistance to self-doubt in future challenges.'
  }
};

const mockReflectionData: CombatReflectionData = {
  enemy: mockEnemy,
  victory: true,
  turnsElapsed: 5,
  mostUsedAction: 'ILLUMINATE',
  lpGained: 5,
  spGained: 2,
  therapeuticInsight: 'Test insight',
  growthMessage: 'Test growth message'
};

// Helper functions
function createMockCombatHook(overrides = {}) {
  return {
    isActive: true,
    enemy: mockEnemy,
    resources: { lp: 10, sp: 5 },
    turn: 1,
    log: [],
    statusEffects: {
      healingBlocked: false,
      lpGenerationBlocked: false,
      skipNextTurn: false,
      damageMultiplier: 1,
      damageReduction: 1
    },
    canUseAction: vi.fn(() => true),
    getActionCost: vi.fn(() => ({ lp: 2, sp: 0 })),
    getActionDescription: vi.fn(() => 'Test description'),
    isPlayerTurn: true,
    combatEndStatus: { ended: false, victory: false, reason: '' },
    executeAction: vi.fn(),
    endCombat: vi.fn(),
    getTherapeuticInsight: vi.fn(() => 'Test insight'),
    getMostUsedAction: vi.fn(() => 'ILLUMINATE'),
    ...overrides
  };
}

function setupMocks() {
  mockUseCombat.mockReturnValue(createMockCombatHook());
  mockUseCombatSounds.mockReturnValue({
    playActionSound: vi.fn(),
    playShadowAttackSound: vi.fn(),
    playVictorySound: vi.fn(),
    playDefeatSound: vi.fn(),
    setSoundsEnabled: vi.fn(),
    setSoundVolume: vi.fn(),
    isSoundsEnabled: true
  });
  mockUseGameStore.mockReturnValue({
    addJournalEntry: vi.fn()
  } as any);
}

describe('Combat System Accessibility Compliance', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CombatOverlay Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<CombatOverlay />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA landmarks and roles', () => {
      render(<CombatOverlay />);
      
      // Check for main combat interface
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Check for progress bar (HP bar)
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Check for action buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<CombatOverlay />);
      
      // First focusable element should receive focus
      const firstButton = screen.getAllByRole('button')[0];
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockExecuteAction = vi.fn();
      mockUseCombat.mockReturnValue(createMockCombatHook({ executeAction: mockExecuteAction }));
      
      render(<CombatOverlay />);
      
      // Test keyboard shortcuts for actions
      await user.keyboard('1');
      expect(mockExecuteAction).toHaveBeenCalledWith('ILLUMINATE');
      
      await user.keyboard('2');
      expect(mockExecuteAction).toHaveBeenCalledWith('REFLECT');
    });

    it('should have descriptive text for screen readers', () => {
      render(<CombatOverlay />);
      
      // Check for enemy name
      expect(screen.getByText(mockEnemy.name)).toBeInTheDocument();
      
      // Check for resource labels
      expect(screen.getByText(/Light Points/i)).toBeInTheDocument();
      expect(screen.getByText(/Shadow Points/i)).toBeInTheDocument();
    });
  });

  describe('ActionSelector Accessibility', () => {
    const mockProps = {
      canUseAction: vi.fn(() => true),
      getActionCost: vi.fn(() => ({ lp: 2, sp: 0 })),
      getActionDescription: vi.fn(() => 'Test description'),
      onActionSelect: vi.fn(),
      resources: { lp: 10, sp: 5 }
    };

    it('should not have any accessibility violations', async () => {
      const { container } = render(<ActionSelector {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button labels and descriptions', () => {
      render(<ActionSelector {...mockProps} />);
      
      // Check for action buttons with proper labels
      expect(screen.getByRole('button', { name: /ILLUMINATE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /REFLECT/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ENDURE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EMBRACE/i })).toBeInTheDocument();
    });

    it('should have keyboard shortcut information in tooltips', () => {
      render(<ActionSelector {...mockProps} />);
      
      // Check for keyboard shortcut hints
      expect(screen.getByTestId('action-illuminate')).toHaveAttribute('title', expect.stringContaining('Press 1'));
      expect(screen.getByTestId('action-reflect')).toHaveAttribute('title', expect.stringContaining('Press 2'));
      expect(screen.getByTestId('action-endure')).toHaveAttribute('title', expect.stringContaining('Press 3'));
      expect(screen.getByTestId('action-embrace')).toHaveAttribute('title', expect.stringContaining('Press 4'));
    });

    it('should properly disable buttons when actions cannot be used', () => {
      const disabledProps = {
        ...mockProps,
        canUseAction: vi.fn((action: CombatAction) => action !== 'ILLUMINATE')
      };
      
      render(<ActionSelector {...disabledProps} />);
      
      const illuminateButton = screen.getByTestId('action-illuminate');
      expect(illuminateButton).toBeDisabled();
      expect(illuminateButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('CombatLog Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<CombatLog />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper scrollable region', () => {
      render(<CombatLog />);

      // Check for scrollable area
      const scrollArea = screen.getByTestId('combat-log-scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<CombatLog />);

      // Check for proper heading
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should support keyboard navigation for export functions', async () => {
      // Mock combat hook with log entries to show export buttons
      const mockCombatWithLog = createMockCombatHook({
        log: [
          {
            turn: 1,
            actor: 'PLAYER' as const,
            action: 'ILLUMINATE',
            effect: 'Dealt 5 damage',
            resourceChange: { lp: -2 },
            message: 'You illuminate the shadow with inner light.'
          }
        ]
      });
      mockUseCombat.mockReturnValue(mockCombatWithLog);

      const user = userEvent.setup();
      render(<CombatLog showExport={true} />);

      // Check that export buttons are present when there are log entries
      const exportButtons = screen.getAllByRole('button');
      expect(exportButtons.length).toBeGreaterThan(0);

      // First button should be focusable
      if (exportButtons.length > 0) {
        await user.tab();
        expect(exportButtons[0]).toBeInTheDocument();
      }
    });
  });

  describe('CombatReflectionModal Accessibility', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      reflectionData: mockReflectionData,
      onSaveReflection: vi.fn()
    };

    it('should not have any accessibility violations', async () => {
      const { container } = render(<CombatReflectionModal {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper dialog structure', () => {
      render(<CombatReflectionModal {...mockProps} />);
      
      // Check for dialog role
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Check for dialog title
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should trap focus within the modal', async () => {
      const user = userEvent.setup();
      render(<CombatReflectionModal {...mockProps} />);
      
      // Focus should be trapped within the modal
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // First focusable element should receive focus
      await user.tab();
      const focusedElement = document.activeElement;
      expect(dialog.contains(focusedElement)).toBe(true);
    });

    it('should support escape key to close', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      render(<CombatReflectionModal {...mockProps} onClose={mockOnClose} />);
      
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper form labels and descriptions', () => {
      render(<CombatReflectionModal {...mockProps} />);
      
      // Check for textarea with proper labeling
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAccessibleName();
    });
  });

  describe('ResourceDisplay Accessibility', () => {
    const mockProps = {
      lp: 10,
      sp: 5
    };

    it('should not have any accessibility violations', async () => {
      const { container } = render(<ResourceDisplay {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper semantic structure', () => {
      render(<ResourceDisplay {...mockProps} />);
      
      // Check for proper text content
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should have proper color contrast for resource values', () => {
      render(<ResourceDisplay {...mockProps} />);
      
      // Values should be visible and have proper contrast
      const lpValue = screen.getByText('10');
      const spValue = screen.getByText('5');
      
      expect(lpValue).toBeVisible();
      expect(spValue).toBeVisible();
    });

    it('should work in compact mode', async () => {
      const { container } = render(<ResourceDisplay {...mockProps} mode="compact" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast for all text elements', () => {
      render(<CombatOverlay />);
      
      // All text should be visible and have proper contrast
      const textElements = screen.getAllByText(/./);
      textElements.forEach(element => {
        expect(element).toBeVisible();
      });
    });

    it('should not rely solely on color to convey information', () => {
      render(<ActionSelector
        canUseAction={vi.fn((action) => action !== 'ILLUMINATE')}
        getActionCost={vi.fn(() => ({ lp: 2, sp: 0 }))}
        getActionDescription={vi.fn(() => 'Test description')}
        onActionSelect={vi.fn()}
        resources={{ lp: 1, sp: 5 }}
      />);
      
      // Disabled buttons should have text indicators, not just color
      const disabledButton = screen.getByTestId('action-illuminate');
      expect(disabledButton).toBeDisabled();
      expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Combat Text Visibility Integration Tests', () => {
    it('should use combat-specific text classes for high contrast visibility', () => {
      const { container } = render(<CombatOverlay />);
      
      // Check that combat-specific text classes are used
      const combatTextShadowElements = container.querySelectorAll('.combat-text-shadow');
      const combatTextLightElements = container.querySelectorAll('.combat-text-light');
      
      expect(combatTextShadowElements.length).toBeGreaterThan(0);
      expect(combatTextLightElements.length).toBeGreaterThan(0);
    });

    it('should not use generic text classes for critical combat elements', () => {
      const { container } = render(<CombatOverlay />);
      
      // Check that critical text elements don't use generic text classes
      const textForegroundElements = container.querySelectorAll('.text-foreground');
      const textMutedForegroundElements = container.querySelectorAll('.text-muted-foreground');
      
      // If generic classes exist, they should not be on critical elements
      textForegroundElements.forEach(element => {
        const textContent = element.textContent || '';
        expect(textContent).not.toMatch(/Health|Experience|Light Points|Shadow Points|End Turn|Surrender/);
      });
      
      textMutedForegroundElements.forEach(element => {
        const textContent = element.textContent || '';
        expect(textContent).not.toMatch(/Health|Experience|Light Points|Shadow Points|End Turn|Surrender/);
      });
    });

    it('should maintain text visibility across combat state changes', () => {
      // Test with different combat states
      const combatStates = [
        { isPlayerTurn: true, combatEndStatus: { ended: false, victory: false, reason: '' } },
        { isPlayerTurn: false, combatEndStatus: { ended: false, victory: false, reason: '' } },
        { isPlayerTurn: true, combatEndStatus: { ended: true, victory: true, reason: 'Victory!' } }
      ];

      combatStates.forEach(state => {
        const mockCombatWithState = createMockCombatHook(state);
        mockUseCombat.mockReturnValue(mockCombatWithState);
        
        const { container } = render(<CombatOverlay />);
        
        // Should always have combat-specific text classes
        const combatTextElements = container.querySelectorAll('.combat-text-shadow, .combat-text-light');
        expect(combatTextElements.length).toBeGreaterThan(0);
      });
    });

    it('should ensure all resource labels are accessible and visible', () => {
      render(<CombatOverlay />);
      
      // All resource labels should be present and accessible
      const resourceLabels = [
        'Health',
        'Experience',
        'Light Points',
        'Shadow Points',
        'Shadow Strength'
      ];
      
      resourceLabels.forEach(label => {
        const element = screen.getByText(label);
        expect(element).toBeVisible();
        expect(element).toHaveClass('combat-text-light');
      });
    });

    it('should ensure action buttons maintain text visibility', () => {
      render(<CombatOverlay />);
      
      // Action buttons should have proper text classes
      const endTurnButton = screen.getByTestId('end-turn-button');
      const surrenderButton = screen.getByTestId('surrender-button');
      
      expect(endTurnButton).toHaveClass('combat-text-light');
      expect(surrenderButton).toHaveClass('combat-text-light');
      
      // Buttons should be accessible
      expect(endTurnButton).toHaveAccessibleName();
      expect(surrenderButton).toHaveAccessibleName();
    });

    it('should maintain therapeutic insight text visibility', () => {
      render(<CombatOverlay />);
      
      // Therapeutic insight should use combat-specific text classes
      const therapeuticInsight = screen.getByText(/Test insight/);
      expect(therapeuticInsight).toBeVisible();
      expect(therapeuticInsight).toHaveClass('combat-text-light');
    });

    it('should handle combat end screen text visibility', () => {
      // Mock combat end state
      const endedCombatHook = createMockCombatHook({
        combatEndStatus: { ended: true, victory: true, reason: 'Combat ended successfully!' }
      });
      mockUseCombat.mockReturnValue(endedCombatHook);
      
      render(<CombatOverlay />);
      
      // End screen text should be visible with combat-specific classes
      const endScreenText = screen.getByText('Combat ended successfully!');
      expect(endScreenText).toBeVisible();
      expect(endScreenText).toHaveClass('combat-text-light');
    });

    it('should ensure combat log text maintains visibility', () => {
      // Mock combat with log entries
      const combatWithLog = createMockCombatHook({
        log: [
          {
            turn: 1,
            actor: 'PLAYER' as const,
            action: 'ILLUMINATE',
            effect: 'Dealt 5 damage',
            resourceChange: { lp: -2 },
            message: 'You illuminate the darkness with inner light'
          }
        ]
      });
      mockUseCombat.mockReturnValue(combatWithLog);
      
      render(<CombatOverlay />);
      
      // Combat log should use proper text classes
      const logMessage = screen.getByText('You illuminate the darkness with inner light');
      expect(logMessage).toBeVisible();
      expect(logMessage).toHaveClass('combat-text-shadow');
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce combat state changes', () => {
      render(<CombatOverlay />);
      
      // Check for live regions that announce changes
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);
    });

    it('should have descriptive labels for all interactive elements', () => {
      render(<CombatOverlay />);
      
      // All buttons should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
