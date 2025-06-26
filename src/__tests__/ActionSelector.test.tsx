import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionSelector } from '../components/combat/ActionSelector';
import type { CombatAction } from '../store/game-store';

describe('ActionSelector', () => {
  const mockProps = {
    isPlayerTurn: true,
    canUseAction: vi.fn(),
    getActionCost: vi.fn(),
    getActionDescription: vi.fn(),
    onActionSelect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockProps.canUseAction.mockReturnValue(true);
    mockProps.getActionCost.mockReturnValue({ lp: 2 });
    mockProps.getActionDescription.mockReturnValue('Test action description');
  });

  describe('Basic Rendering', () => {
    it('renders action selector with all combat actions', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByTestId('action-selector')).toBeInTheDocument();
      expect(screen.getByText('Choose Your Response')).toBeInTheDocument();
      expect(screen.getByTestId('action-illuminate')).toBeInTheDocument();
      expect(screen.getByTestId('action-reflect')).toBeInTheDocument();
      expect(screen.getByTestId('action-endure')).toBeInTheDocument();
      expect(screen.getByTestId('action-embrace')).toBeInTheDocument();
    });

    it('shows keyboard shortcuts hint when player turn', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByText('Use keyboard shortcuts: 1-4 keys')).toBeInTheDocument();
    });

    it('shows shadow turn message when not player turn', () => {
      render(<ActionSelector {...mockProps} isPlayerTurn={false} />);
      
      expect(screen.getByText('Shadow\'s Turn')).toBeInTheDocument();
      expect(screen.queryByText('Use keyboard shortcuts: 1-4 keys')).not.toBeInTheDocument();
    });

    it('renders with custom test ID', () => {
      render(<ActionSelector {...mockProps} data-testid="custom-selector" />);
      
      expect(screen.getByTestId('custom-selector')).toBeInTheDocument();
    });


  });""

  describe('Action Button Display', () => {
    it('displays action names correctly', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByText('ILLUMINATE')).toBeInTheDocument();
      expect(screen.getByText('REFLECT')).toBeInTheDocument();
      expect(screen.getByText('ENDURE')).toBeInTheDocument();
      expect(screen.getByText('EMBRACE')).toBeInTheDocument();
    });

    it('displays keyboard shortcuts for each action', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('displays action descriptions', () => {
      mockProps.getActionDescription.mockImplementation((action: CombatAction) => `${action} description`);
      
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByText('ILLUMINATE description')).toBeInTheDocument();
      expect(screen.getByText('REFLECT description')).toBeInTheDocument();
      expect(screen.getByText('ENDURE description')).toBeInTheDocument();
      expect(screen.getByText('EMBRACE description')).toBeInTheDocument();
    });

    it('displays resource costs correctly', () => {
      mockProps.getActionCost.mockImplementation((action: CombatAction) => {
        switch (action) {
          case 'ILLUMINATE': return { lp: 2 };
          case 'REFLECT': return { sp: 2 };
          case 'ENDURE': return {};
          case 'EMBRACE': return { lp: 1, sp: 3 };
          default: return {};
        }
      });
      
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByText('2 LP')).toBeInTheDocument();
      expect(screen.getByText('2 SP')).toBeInTheDocument();
      expect(screen.getByText('1 LP • 3 SP')).toBeInTheDocument();
    });
  });

  describe('Action Validation and Interaction', () => {
    it('enables actions when they can be used and it is player turn', () => {
      mockProps.canUseAction.mockReturnValue(true);
      
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByTestId('action-illuminate')).not.toBeDisabled();
      expect(screen.getByTestId('action-reflect')).not.toBeDisabled();
      expect(screen.getByTestId('action-endure')).not.toBeDisabled();
      expect(screen.getByTestId('action-embrace')).not.toBeDisabled();
    });

    it('disables actions when they cannot be used', () => {
      mockProps.canUseAction.mockImplementation((action: CombatAction) => action === 'ILLUMINATE');
      
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByTestId('action-illuminate')).not.toBeDisabled();
      expect(screen.getByTestId('action-reflect')).toBeDisabled();
      expect(screen.getByTestId('action-endure')).toBeDisabled();
      expect(screen.getByTestId('action-embrace')).toBeDisabled();
    });

    it('disables all actions when not player turn', () => {
      render(<ActionSelector {...mockProps} isPlayerTurn={false} />);

      expect(screen.getByTestId('action-illuminate')).toBeDisabled();
      expect(screen.getByTestId('action-reflect')).toBeDisabled();
      expect(screen.getByTestId('action-endure')).toBeDisabled();
      expect(screen.getByTestId('action-embrace')).toBeDisabled();
    });

    it('calls onActionSelect when action button is clicked', () => {
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.click(screen.getByTestId('action-illuminate'));
      
      expect(mockProps.onActionSelect).toHaveBeenCalledWith('ILLUMINATE');
    });

    it('does not call onActionSelect when action is disabled', () => {
      mockProps.canUseAction.mockReturnValue(false);
      
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.click(screen.getByTestId('action-illuminate'));
      
      expect(mockProps.onActionSelect).not.toHaveBeenCalled();
    });

    it('does not call onActionSelect when not player turn', () => {
      render(<ActionSelector {...mockProps} isPlayerTurn={false} />);

      fireEvent.click(screen.getByTestId('action-illuminate'));

      expect(mockProps.onActionSelect).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('triggers ILLUMINATE action when pressing 1', async () => {
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).toHaveBeenCalledWith('ILLUMINATE');
      });
    });

    it('triggers REFLECT action when pressing 2', async () => {
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(document, { key: '2' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).toHaveBeenCalledWith('REFLECT');
      });
    });

    it('triggers ENDURE action when pressing 3', async () => {
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(document, { key: '3' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).toHaveBeenCalledWith('ENDURE');
      });
    });

    it('triggers EMBRACE action when pressing 4', async () => {
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(document, { key: '4' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).toHaveBeenCalledWith('EMBRACE');
      });
    });



    it('does not trigger actions when not player turn', async () => {
      render(<ActionSelector {...mockProps} isPlayerTurn={false} />);
      
      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).not.toHaveBeenCalled();
      });
    });

    it('does not trigger disabled actions via keyboard', async () => {
      mockProps.canUseAction.mockReturnValue(false);
      
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).not.toHaveBeenCalled();
      });
    });

    it('ignores keyboard shortcuts when typing in input fields', async () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      
      render(<ActionSelector {...mockProps} />);
      
      fireEvent.keyDown(input, { key: '1' });
      
      await waitFor(() => {
        expect(mockProps.onActionSelect).not.toHaveBeenCalled();
      });
      
      document.body.removeChild(input);
    });
  });

  describe('Accessibility and Tooltips', () => {
    it('includes keyboard shortcut in button title attribute', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(screen.getByTestId('action-illuminate')).toHaveAttribute('title', 'ILLUMINATE - Press 1 to use');
      expect(screen.getByTestId('action-reflect')).toHaveAttribute('title', 'REFLECT - Press 2 to use');
      expect(screen.getByTestId('action-endure')).toHaveAttribute('title', 'ENDURE - Press 3 to use');
      expect(screen.getByTestId('action-embrace')).toHaveAttribute('title', 'EMBRACE - Press 4 to use');
    });

    it('calls action cost and description functions for each action', () => {
      render(<ActionSelector {...mockProps} />);
      
      expect(mockProps.getActionCost).toHaveBeenCalledWith('ILLUMINATE');
      expect(mockProps.getActionCost).toHaveBeenCalledWith('REFLECT');
      expect(mockProps.getActionCost).toHaveBeenCalledWith('ENDURE');
      expect(mockProps.getActionCost).toHaveBeenCalledWith('EMBRACE');
      
      expect(mockProps.getActionDescription).toHaveBeenCalledWith('ILLUMINATE');
      expect(mockProps.getActionDescription).toHaveBeenCalledWith('REFLECT');
      expect(mockProps.getActionDescription).toHaveBeenCalledWith('ENDURE');
      expect(mockProps.getActionDescription).toHaveBeenCalledWith('EMBRACE');
    });
  });
});
