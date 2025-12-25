/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '@/features/combat/components/actions/ControlPanel';
import { vi } from 'vitest';

describe('ControlPanel', () => {
  const mockProps = {
    onEndTurn: vi.fn(),
    onSurrender: vi.fn(),
    isPlayerTurn: true,
  };

  beforeEach(() => {
    mockProps.onEndTurn.mockClear();
    mockProps.onSurrender.mockClear();
  });

  it('renders both control buttons', () => {
    render(<ControlPanel {...mockProps} />);

    expect(screen.getByTestId('end-turn-button')).toBeInTheDocument();
    expect(screen.getByTestId('surrender-button')).toBeInTheDocument();
    expect(screen.getByText('End Turn')).toBeInTheDocument();
    expect(screen.getByText('Surrender')).toBeInTheDocument();
  });

  it('calls onEndTurn when End Turn button is clicked', () => {
    render(<ControlPanel {...mockProps} />);

    fireEvent.click(screen.getByTestId('end-turn-button'));
    expect(mockProps.onEndTurn).toHaveBeenCalledTimes(1);
  });

  it('calls onSurrender when Surrender button is clicked', () => {
    render(<ControlPanel {...mockProps} />);

    fireEvent.click(screen.getByTestId('surrender-button'));
    expect(mockProps.onSurrender).toHaveBeenCalledTimes(1);
  });

  it('disables End Turn button when not player turn', () => {
    render(<ControlPanel {...mockProps} isPlayerTurn={false} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    expect(endTurnButton).toBeDisabled();
  });

  it('enables Surrender button regardless of turn state', () => {
    render(<ControlPanel {...mockProps} isPlayerTurn={false} />);

    const surrenderButton = screen.getByTestId('surrender-button');
    expect(surrenderButton).not.toBeDisabled();
  });

  it('disables End Turn button when canEndTurn is false', () => {
    render(<ControlPanel {...mockProps} canEndTurn={false} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    expect(endTurnButton).toBeDisabled();
  });

  it('enables End Turn button when canEndTurn is true and player turn', () => {
    render(<ControlPanel {...mockProps} canEndTurn={true} isPlayerTurn={true} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    expect(endTurnButton).not.toBeDisabled();
  });

  it('does not call onEndTurn when button is disabled', () => {
    render(<ControlPanel {...mockProps} isPlayerTurn={false} />);

    fireEvent.click(screen.getByTestId('end-turn-button'));
    expect(mockProps.onEndTurn).not.toHaveBeenCalled();
  });

  it('always allows surrender even when not player turn', () => {
    render(<ControlPanel {...mockProps} isPlayerTurn={false} />);

    fireEvent.click(screen.getByTestId('surrender-button'));
    expect(mockProps.onSurrender).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<ControlPanel {...mockProps} />);

    const controlGroup = screen.getByRole('group', { name: 'Combat controls' });
    expect(controlGroup).toBeInTheDocument();

    const endTurnButton = screen.getByRole('button', { name: /end turn/i });
    const surrenderButton = screen.getByRole('button', { name: /surrender/i });

    expect(endTurnButton).toBeInTheDocument();
    expect(surrenderButton).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<ControlPanel {...mockProps} />);

    const controlPanel = container.firstChild as HTMLElement;
    expect(controlPanel).toHaveClass('flex', 'flex-col', 'sm:flex-row');
  });

  it('accepts custom className', () => {
    const { container } = render(<ControlPanel {...mockProps} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper button styling and sizes', () => {
    render(<ControlPanel {...mockProps} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    const surrenderButton = screen.getByTestId('surrender-button');

    expect(endTurnButton).toHaveClass('min-h-[3rem]', 'flex-1');
    expect(surrenderButton).toHaveClass('min-h-[3rem]', 'flex-1');
  });

  it('includes icons in button content', () => {
    render(<ControlPanel {...mockProps} />);

    // Check for emoji icons in buttons
    expect(screen.getByText('⏭️')).toBeInTheDocument(); // End turn icon
    expect(screen.getByText('🏃')).toBeInTheDocument(); // Surrender icon
  });

  it('handles both disabled states correctly', () => {
    render(<ControlPanel {...mockProps} isPlayerTurn={false} canEndTurn={false} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    const surrenderButton = screen.getByTestId('surrender-button');

    expect(endTurnButton).toBeDisabled();
    expect(surrenderButton).not.toBeDisabled();

    fireEvent.click(endTurnButton);
    fireEvent.click(surrenderButton);

    expect(mockProps.onEndTurn).not.toHaveBeenCalled();
    expect(mockProps.onSurrender).toHaveBeenCalledTimes(1);
  });

  it('renders with default canEndTurn value', () => {
    render(<ControlPanel {...mockProps} />);

    const endTurnButton = screen.getByTestId('end-turn-button');
    expect(endTurnButton).not.toBeDisabled();
  });
});
