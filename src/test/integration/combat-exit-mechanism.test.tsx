import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatOverlay } from '@/components/combat/CombatOverlay';
import type { ShadowManifestation } from '@/store/game-store';

// Mock the game store
const mockGameStore = {
  combat: {
    inCombat: true,
    currentEnemy: {
      id: 'test-shadow',
      name: 'Test Shadow',
      type: 'doubt',
      description: 'A test shadow for surrender testing',
      currentHP: 10,
      maxHP: 15,
      abilities: [],
      therapeuticInsight: 'Test insight',
      victoryReward: {
        lpBonus: 5,
        growthMessage: 'Test growth message',
        permanentBenefit: 'Test benefit'
      }
    } as ShadowManifestation,
    resources: { lp: 10, sp: 5 },
    turn: 3,
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
  },
  guardianTrust: 50,
  addJournalEntry: vi.fn(),
  startCombat: vi.fn(),
  executeCombatAction: vi.fn(),
  endCombat: vi.fn()
};

vi.mock('@/store/game-store', () => ({
  useGameStore: () => mockGameStore
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock CombatReflectionModal
vi.mock('@/components/combat/CombatReflectionModal', () => ({
  CombatReflectionModal: ({ isOpen, onClose, onSaveReflection, ...props }: any) =>
    isOpen ? (
      <div data-testid="combat-reflection-modal" {...props}>
        <button onClick={onClose} data-testid="skip-reflection">Skip</button>
        <button onClick={() => onSaveReflection({ id: 'test', content: 'test' })} data-testid="save-reflection">Save</button>
      </div>
    ) : null
}));

// Mock ActionSelector
vi.mock('@/components/combat/ActionSelector', () => ({
  ActionSelector: ({ onActionSelect, ...props }: any) => (
    <div data-testid="action-selector" {...props}>
      <button onClick={() => onActionSelect('ILLUMINATE')} data-testid="action-illuminate">Illuminate</button>
    </div>
  )
}));

// Mock audio hooks
vi.mock('@/hooks/useCombatSounds', () => ({
  useCombatSounds: () => ({
    playVictorySound: vi.fn(),
    playDefeatSound: vi.fn(),
    playActionSound: vi.fn()
  })
}));

describe('Combat Exit Mechanism Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset combat state to active
    mockGameStore.combat.inCombat = true;
    mockGameStore.combat.currentEnemy = {
      id: 'test-shadow',
      name: 'Test Shadow',
      type: 'doubt',
      description: 'A test shadow for surrender testing',
      currentHP: 10,
      maxHP: 15,
      abilities: [],
      therapeuticInsight: 'Test insight',
      victoryReward: {
        lpBonus: 5,
        growthMessage: 'Test growth message',
        permanentBenefit: 'Test benefit'
      }
    } as ShadowManifestation;
  });

  describe('Surrender Button Functionality', () => {
    it('should render surrender button during active combat', () => {
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      expect(surrenderButton).toBeInTheDocument();
      expect(surrenderButton).toHaveTextContent('Surrender');
    });

    it('should call endCombat with defeat when surrender is clicked', () => {
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      fireEvent.click(surrenderButton);
      
      expect(mockGameStore.endCombat).toHaveBeenCalledWith(false);
      expect(mockGameStore.endCombat).toHaveBeenCalledTimes(1);
    });

    it('should be accessible during player turn', () => {
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      expect(surrenderButton).not.toBeDisabled();
      expect(surrenderButton).toBeVisible();
    });

    it('should be accessible during shadow turn', () => {
      mockGameStore.combat.skipNextTurn = true; // Simulate shadow turn
      
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      expect(surrenderButton).not.toBeDisabled();
      expect(surrenderButton).toBeVisible();
    });
  });

  describe('Combat Exit Flow', () => {
    it('should provide immediate exit without requiring turn completion', () => {
      render(<CombatOverlay />);

      // Verify combat is active
      expect(screen.getByText('Test Shadow')).toBeInTheDocument();
      expect(screen.getByTestId('combat-actions')).toBeInTheDocument();

      // Click surrender
      const surrenderButton = screen.getByTestId('surrender-button');
      fireEvent.click(surrenderButton);

      // Verify endCombat was called immediately
      expect(mockGameStore.endCombat).toHaveBeenCalledWith(false);
    });

    it('should work regardless of current turn count', () => {
      // Test with high turn count (near limit)
      mockGameStore.combat.turn = 18;
      
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      fireEvent.click(surrenderButton);
      
      expect(mockGameStore.endCombat).toHaveBeenCalledWith(false);
    });

    it('should work regardless of resource levels', () => {
      // Test with low resources
      mockGameStore.combat.resources = { lp: 1, sp: 0 };
      
      render(<CombatOverlay />);
      
      const surrenderButton = screen.getByTestId('surrender-button');
      fireEvent.click(surrenderButton);
      
      expect(mockGameStore.endCombat).toHaveBeenCalledWith(false);
    });
  });

  describe('User Experience', () => {
    it('should have clear visual styling to indicate surrender action', () => {
      render(<CombatOverlay />);

      const surrenderButton = screen.getByTestId('surrender-button');

      // Check for combat light styling (less prominent than main actions)
      expect(surrenderButton).toHaveClass('combat-text-light');

      // Check for destructive hover styling (indicates negative action)
      expect(surrenderButton).toHaveClass('hover:text-destructive');
      expect(surrenderButton).toHaveClass('hover:border-destructive');
    });

    it('should be positioned separately from main combat actions', () => {
      render(<CombatOverlay />);

      const surrenderButton = screen.getByTestId('surrender-button');
      const combatActions = screen.getByTestId('combat-actions');

      // Both should be present but surrender should be separate
      expect(surrenderButton).toBeInTheDocument();
      expect(combatActions).toBeInTheDocument();

      // Surrender button should not be inside the combat actions container
      expect(combatActions).not.toContainElement(surrenderButton);
    });
  });

  describe('Edge Cases', () => {
    it('should not render surrender button when combat is not active', () => {
      mockGameStore.combat.inCombat = false;
      
      render(<CombatOverlay />);
      
      expect(screen.queryByTestId('surrender-button')).not.toBeInTheDocument();
    });

    it('should not render surrender button when no enemy is present', () => {
      mockGameStore.combat.currentEnemy = null;
      
      render(<CombatOverlay />);
      
      expect(screen.queryByTestId('surrender-button')).not.toBeInTheDocument();
    });
  });
});
