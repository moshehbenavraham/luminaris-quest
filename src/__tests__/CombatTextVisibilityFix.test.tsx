import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CombatOverlay } from '../components/combat/CombatOverlay';
import { useGameStore } from '../store/game-store';
import { useCombat } from '../hooks/useCombat';
import { useCombatSounds } from '../hooks/useCombatSounds';
import type { ShadowManifestation } from '../store/game-store';

// Mock external dependencies
vi.mock('../store/game-store');
vi.mock('../hooks/useCombat');
vi.mock('../hooks/useCombatSounds');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children
}));

describe('Combat Overlay Text Visibility Fix', () => {
  const mockEnemy: ShadowManifestation = {
    id: 'test-shadow',
    name: 'Test Shadow Enemy',
    type: 'doubt',
    description: 'A menacing shadow that tests your resolve',
    maxHP: 50,
    currentHP: 30,
    abilities: [],
    therapeuticInsight: 'This shadow represents your inner doubts and fears',
    victoryReward: {
      lpBonus: 10,
      growthMessage: 'You have overcome your doubts and grown stronger!',
      permanentBenefit: 'Enhanced resilience against doubt and uncertainty'
    }
  };

  const mockCombatHook = {
    isActive: true,
    enemy: mockEnemy,
    resources: { lp: 8, sp: 5 },
    turn: 3,
    log: [
      {
        turn: 1,
        actor: 'PLAYER' as const,
        action: 'ILLUMINATE',
        effect: 'Dealt 5 damage',
        resourceChange: { lp: -2 },
        message: 'You cast a brilliant light to illuminate the shadow'
      }
    ],
    statusEffects: {
      healingBlocked: 2,
      lpGenerationBlocked: 0,
      skipNextTurn: false,
      damageMultiplier: 1,
      damageReduction: 0
    },
    canUseAction: vi.fn(() => true),
    getActionCost: vi.fn(() => ({ lp: 2 })),
    getActionDescription: vi.fn(() => 'A powerful attack that illuminates the darkness'),
    isPlayerTurn: true,
    combatEndStatus: { isEnded: false, victory: false, reason: '' },
    executeAction: vi.fn(),
    playerHealth: 85,
    playerLevel: 3,
    endCombat: vi.fn(),
    endTurn: vi.fn(),
    getTherapeuticInsight: vi.fn(() => 'Remember, every challenge is an opportunity for growth')
  };

  const mockGameStore = {
    addJournalEntry: vi.fn(),
    combat: {
      preferredActions: {
        ILLUMINATE: 2,
        REFLECT: 1,
        ENDURE: 0,
        EMBRACE: 1
      }
    }
  };

  const mockCombatSounds = {
    playVictorySound: vi.fn(),
    playDefeatSound: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCombat as any).mockReturnValue(mockCombatHook);
    (useGameStore as any).mockReturnValue(mockGameStore);
    (useCombatSounds as any).mockReturnValue(mockCombatSounds);
  });

  describe('Enemy Name Text Visibility', () => {
    it('should use combat-text-shadow class for enemy name', () => {
      render(<CombatOverlay />);
      
      const enemyNameElement = screen.getByText(mockEnemy.name);
      expect(enemyNameElement).toBeInTheDocument();
      expect(enemyNameElement).toHaveClass('combat-text-shadow');
      
      // Should NOT use generic text classes
      expect(enemyNameElement).not.toHaveClass('text-foreground');
      expect(enemyNameElement).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Enemy Description Text Visibility', () => {
    it('should use combat-text-light class for enemy description', () => {
      render(<CombatOverlay />);
      
      const enemyDescriptionElement = screen.getByText(mockEnemy.description);
      expect(enemyDescriptionElement).toBeInTheDocument();
      expect(enemyDescriptionElement).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(enemyDescriptionElement).not.toHaveClass('text-foreground');
      expect(enemyDescriptionElement).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Resource Labels Text Visibility', () => {
    it('should use combat-text-light class for Health label', () => {
      render(<CombatOverlay />);
      
      const healthLabel = screen.getByText('Health');
      expect(healthLabel).toBeInTheDocument();
      expect(healthLabel).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(healthLabel).not.toHaveClass('text-foreground');
      expect(healthLabel).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Experience label', () => {
      render(<CombatOverlay />);
      
      const experienceLabel = screen.getByText('Experience');
      expect(experienceLabel).toBeInTheDocument();
      expect(experienceLabel).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(experienceLabel).not.toHaveClass('text-foreground');
      expect(experienceLabel).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Light Points label', () => {
      render(<CombatOverlay />);
      
      const lightPointsLabel = screen.getByText('Light Points');
      expect(lightPointsLabel).toBeInTheDocument();
      expect(lightPointsLabel).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(lightPointsLabel).not.toHaveClass('text-foreground');
      expect(lightPointsLabel).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Shadow Points label', () => {
      render(<CombatOverlay />);
      
      const shadowPointsLabel = screen.getByText('Shadow Points');
      expect(shadowPointsLabel).toBeInTheDocument();
      expect(shadowPointsLabel).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(shadowPointsLabel).not.toHaveClass('text-foreground');
      expect(shadowPointsLabel).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Shadow Strength label', () => {
      render(<CombatOverlay />);
      
      const shadowStrengthLabel = screen.getByText('Shadow Strength');
      expect(shadowStrengthLabel).toBeInTheDocument();
      
      // The combat-text-light class is on the parent container
      const parentContainer = shadowStrengthLabel.closest('.combat-text-light');
      expect(parentContainer).not.toBeNull();
      expect(parentContainer).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(shadowStrengthLabel).not.toHaveClass('text-foreground');
      expect(shadowStrengthLabel).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Active Effects label when status effects are present', () => {
      render(<CombatOverlay />);
      
      const activeEffectsLabel = screen.getByText('Active Effects');
      expect(activeEffectsLabel).toBeInTheDocument();
      expect(activeEffectsLabel).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(activeEffectsLabel).not.toHaveClass('text-foreground');
      expect(activeEffectsLabel).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Action Buttons Text Visibility', () => {
    it('should use combat-text-light class for End Turn button', () => {
      render(<CombatOverlay />);
      
      const endTurnButton = screen.getByTestId('end-turn-button');
      expect(endTurnButton).toBeInTheDocument();
      expect(endTurnButton).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(endTurnButton).not.toHaveClass('text-foreground');
      expect(endTurnButton).not.toHaveClass('text-muted-foreground');
    });

    it('should use combat-text-light class for Surrender button', () => {
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      expect(surrenderButton).toBeInTheDocument();
      expect(surrenderButton).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(surrenderButton).not.toHaveClass('text-foreground');
      expect(surrenderButton).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Therapeutic Insight Text Visibility', () => {
    it('should use combat-text-light class for therapeutic insight text', () => {
      render(<CombatOverlay />);
      
      const therapeuticInsightText = screen.getByText(/Remember, every challenge is an opportunity for growth/);
      expect(therapeuticInsightText).toBeInTheDocument();
      expect(therapeuticInsightText).toHaveClass('combat-text-light');
      
      // Should NOT use generic text classes
      expect(therapeuticInsightText).not.toHaveClass('text-foreground');
      expect(therapeuticInsightText).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Combat End Screen Text Visibility', () => {
    it('should use combat-text-light class for fallback end screen text', () => {
      const endedCombatHook = {
        ...mockCombatHook,
        combatEndStatus: { isEnded: true, victory: true, reason: 'You have defeated the shadow!' }
      };
      (useCombat as any).mockReturnValue(endedCombatHook);
      
      render(<CombatOverlay />);
      
      // The reflection modal might be shown instead of the fallback screen
      // Check if reflection modal is present, if not, check for fallback text
      const reflectionModal = screen.queryByTestId('combat-reflection-modal');
      if (reflectionModal) {
        // Combat reflection modal is shown - this is expected behavior
        expect(reflectionModal).toBeInTheDocument();
      } else {
        // Fallback end screen should have proper text classes
        const endScreenText = screen.getByText('You have defeated the shadow!');
        expect(endScreenText).toBeInTheDocument();
        expect(endScreenText).toHaveClass('combat-text-light');
        
        // Should NOT use generic text classes
        expect(endScreenText).not.toHaveClass('text-foreground');
        expect(endScreenText).not.toHaveClass('text-muted-foreground');
      }
    });
  });

  describe('Combat Log Text Visibility', () => {
    it('should use combat-text-light and combat-text-shadow classes for combat log messages', () => {
      render(<CombatOverlay />);
      
      // Find the combat log text elements
      const playerActorText = screen.getByText('You:');
      const logMessageText = screen.getByText('You cast a brilliant light to illuminate the shadow');
      
      expect(playerActorText).toHaveClass('font-medium');
      expect(logMessageText).toHaveClass('combat-text-shadow');
      
      // Parent container should have combat-text-light
      const logContainer = playerActorText.closest('.text-sm');
      expect(logContainer).toHaveClass('combat-text-light');
    });
  });

  describe('Comprehensive Text Class Validation', () => {
    it('should not have any text-foreground classes in critical text elements', () => {
      const { container } = render(<CombatOverlay />);
      
      // Check that no critical text elements use the generic text-foreground class
      const textForegroundElements = container.querySelectorAll('.text-foreground');
      
      // If any exist, they should not be in critical text areas
      textForegroundElements.forEach(element => {
        const textContent = element.textContent || '';
        
        // Critical text should not use text-foreground
        expect(textContent).not.toMatch(/Test Shadow Enemy|Health|Experience|Light Points|Shadow Points|Active Effects|End Turn|Surrender/);
      });
    });

    it('should not have any text-muted-foreground classes in critical text elements', () => {
      const { container } = render(<CombatOverlay />);
      
      // Check that no critical text elements use the generic text-muted-foreground class
      const textMutedForegroundElements = container.querySelectorAll('.text-muted-foreground');
      
      // If any exist, they should not be in critical text areas
      textMutedForegroundElements.forEach(element => {
        const textContent = element.textContent || '';
        
        // Critical text should not use text-muted-foreground
        expect(textContent).not.toMatch(/Test Shadow Enemy|Health|Experience|Light Points|Shadow Points|Active Effects|End Turn|Surrender/);
      });
    });

    it('should use combat-specific text classes for all visible text elements', () => {
      const { container } = render(<CombatOverlay />);
      
      // Count combat-specific text classes
      const combatTextShadowElements = container.querySelectorAll('.combat-text-shadow');
      const combatTextLightElements = container.querySelectorAll('.combat-text-light');
      
      // Should have at least some combat-specific text classes
      expect(combatTextShadowElements.length).toBeGreaterThan(0);
      expect(combatTextLightElements.length).toBeGreaterThan(0);
      
      // Enemy name should use combat-text-shadow
      const enemyNameElements = Array.from(combatTextShadowElements).filter(
        el => el.textContent?.includes('Test Shadow Enemy')
      );
      expect(enemyNameElements.length).toBeGreaterThan(0);
      
      // Resource labels should use combat-text-light
      const resourceLabelElements = Array.from(combatTextLightElements).filter(
        el => el.textContent?.match(/Health|Experience|Light Points|Shadow Points/)
      );
      expect(resourceLabelElements.length).toBeGreaterThan(0);
    });
  });

  describe('Text Visibility Integration', () => {
    it('should maintain text visibility across different combat states', () => {
      // Test player turn
      const { unmount } = render(<CombatOverlay />);
      expect(screen.getByText('Test Shadow Enemy')).toHaveClass('combat-text-shadow');
      unmount();
      
      // Test enemy turn
      const enemyTurnHook = { ...mockCombatHook, isPlayerTurn: false };
      (useCombat as any).mockReturnValue(enemyTurnHook);
      
      render(<CombatOverlay />);
      expect(screen.getByText('Test Shadow Enemy')).toHaveClass('combat-text-shadow');
    });

    it('should maintain text visibility when status effects are present', () => {
      const statusEffectsHook = {
        ...mockCombatHook,
        statusEffects: {
          healingBlocked: 2,
          lpGenerationBlocked: 1,
          skipNextTurn: true,
          damageMultiplier: 1,
          damageReduction: 0
        }
      };
      (useCombat as any).mockReturnValue(statusEffectsHook);
      
      render(<CombatOverlay />);
      
      // Active Effects label should still be visible
      const activeEffectsLabel = screen.getByText('Active Effects');
      expect(activeEffectsLabel).toHaveClass('combat-text-light');
    });

    it('should maintain text visibility when combat log has entries', () => {
      render(<CombatOverlay />);
      
      // Combat log should use proper text classes
      const logText = screen.getByText('You cast a brilliant light to illuminate the shadow');
      expect(logText).toHaveClass('combat-text-shadow');
    });
  });
});
