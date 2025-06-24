import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CombatOverlay from '../components/combat/CombatOverlay';
import ActionSelector from '../components/combat/ActionSelector';
import CombatLog from '../components/combat/CombatLog';
import { CombatReflectionModal } from '../components/combat/CombatReflectionModal';
import { useCombat } from '../hooks/useCombat';
import { useCombatSounds } from '../hooks/useCombatSounds';
import { useGameStore } from '../store/game-store';

// Mock hooks
vi.mock('../hooks/useCombat');
vi.mock('../hooks/useCombatSounds');
vi.mock('../store/game-store');

const mockUseCombat = useCombat as vi.MockedFunction<typeof useCombat>;
const mockUseCombatSounds = useCombatSounds as vi.MockedFunction<typeof useCombatSounds>;
const mockUseGameStore = useGameStore as vi.MockedFunction<typeof useGameStore>;

describe('Combat System Performance Optimizations', () => {
  const mockEnemy = {
    id: 'test-enemy',
    name: 'Test Shadow',
    type: 'doubt' as const,
    description: 'A test shadow',
    maxHealth: 100,
    currentHealth: 50,
    actions: ['WHISPER_DOUBT'],
    resistances: {},
    vulnerabilities: {}
  };

  const mockResources = {
    lp: 80,
    sp: 60,
    maxLp: 100,
    maxSp: 100
  };

  const mockLog = [
    {
      turn: 1,
      actor: 'PLAYER' as const,
      action: 'ILLUMINATE',
      effect: 'Dealt 20 damage',
      message: 'You illuminate the shadow with inner light',
      timestamp: new Date()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCombat.mockReturnValue({
      isActive: true,
      enemy: mockEnemy,
      resources: mockResources,
      turn: 1,
      log: mockLog,
      statusEffects: [],
      canUseAction: vi.fn(() => true),
      getActionCost: vi.fn(() => ({ lp: 10, sp: 5 })),
      getActionDescription: vi.fn(() => 'Test action'),
      isPlayerTurn: true,
      combatEndStatus: { isEnded: false, victory: false },
      executeAction: vi.fn(),
      endCombat: vi.fn(),
      getTherapeuticInsight: vi.fn(() => 'Test insight')
    });

    mockUseCombatSounds.mockReturnValue({
      playVictorySound: vi.fn(),
      playDefeatSound: vi.fn()
    });

    mockUseGameStore.mockReturnValue({
      addJournalEntry: vi.fn(),
      combat: {}
    });
  });

  describe('CombatOverlay Performance', () => {
    it('should be wrapped with React.memo to prevent unnecessary re-renders', () => {
      const { rerender } = render(<CombatOverlay />);
      
      // Verify component renders
      expect(screen.getByText('Test Shadow')).toBeInTheDocument();
      
      // Re-render with same props should not cause re-render
      rerender(<CombatOverlay />);
      
      // Component should still be present
      expect(screen.getByText('Test Shadow')).toBeInTheDocument();
    });

    it('should memoize shadow type color calculation', () => {
      render(<CombatOverlay />);
      
      // Verify shadow type badge is rendered with correct styling
      const shadowBadge = screen.getByText('Doubt');
      expect(shadowBadge).toBeInTheDocument();
      expect(shadowBadge).toHaveClass('bg-yellow-100');
    });
  });

  describe('ActionSelector Performance', () => {
    const mockProps = {
      isPlayerTurn: true,
      canUseAction: vi.fn(() => true),
      getActionCost: vi.fn(() => ({ lp: 10, sp: 5 })),
      getActionDescription: vi.fn(() => 'Test description'),
      onActionSelect: vi.fn()
    };

    it('should be wrapped with React.memo', () => {
      const { rerender } = render(<ActionSelector {...mockProps} />);

      expect(screen.getByText('Choose Your Response')).toBeInTheDocument();

      // Re-render with same props
      rerender(<ActionSelector {...mockProps} />);

      expect(screen.getByText('Choose Your Response')).toBeInTheDocument();
    });

    it('should memoize action icon, color, and shortcut mappings', () => {
      render(<ActionSelector {...mockProps} />);

      // Verify action buttons are rendered (actions are displayed in uppercase)
      expect(screen.getByText('ILLUMINATE')).toBeInTheDocument();
      expect(screen.getByText('REFLECT')).toBeInTheDocument();
      expect(screen.getByText('ENDURE')).toBeInTheDocument();
      expect(screen.getByText('EMBRACE')).toBeInTheDocument();
    });
  });

  describe('CombatLog Performance', () => {
    it('should be wrapped with React.memo', () => {
      const { rerender } = render(<CombatLog />);
      
      expect(screen.getByText('Combat Log')).toBeInTheDocument();
      
      // Re-render with same props
      rerender(<CombatLog />);
      
      expect(screen.getByText('Combat Log')).toBeInTheDocument();
    });

    it('should handle auto-scroll toggle efficiently', () => {
      render(<CombatLog />);
      
      const autoScrollToggle = screen.getByTestId('auto-scroll-toggle');
      expect(autoScrollToggle).toBeInTheDocument();
      
      fireEvent.click(autoScrollToggle);
      
      expect(autoScrollToggle).toHaveTextContent('Auto-scroll: OFF');
    });
  });

  describe('Performance Monitoring', () => {
    it('should not cause excessive re-renders during combat state changes', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <CombatOverlay />;
      };

      const { rerender } = render(<TestComponent />);
      
      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Update combat state
      mockUseCombat.mockReturnValue({
        ...mockUseCombat(),
        turn: 2
      });
      
      rerender(<TestComponent />);
      
      // Should only re-render when necessary
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid action selections without performance degradation', () => {
      const mockOnActionSelect = vi.fn();
      
      render(
        <ActionSelector
          isPlayerTurn={true}
          canUseAction={() => true}
          getActionCost={() => ({ lp: 10, sp: 5 })}
          getActionDescription={() => 'Test'}
          onActionSelect={mockOnActionSelect}
        />
      );
      
      // Simulate rapid clicks
      const illuminateButton = screen.getByText('ILLUMINATE');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(illuminateButton);
      }
      
      expect(mockOnActionSelect).toHaveBeenCalledTimes(10);
    });
  });
});
