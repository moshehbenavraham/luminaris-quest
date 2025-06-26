/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { TurnBadge } from '../../../../../../features/combat/components/display/atoms/TurnBadge';

describe('TurnBadge', () => {
  it('renders player turn correctly', () => {
    render(<TurnBadge isPlayerTurn={true} />);
    
    expect(screen.getByText('Your Turn')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('renders enemy turn correctly', () => {
    render(<TurnBadge isPlayerTurn={false} />);
    
    expect(screen.getByText('Shadow Turn')).toBeInTheDocument();
    expect(screen.getByText('💀')).toBeInTheDocument();
  });

  it('displays turn number when provided', () => {
    render(<TurnBadge isPlayerTurn={true} turnNumber={5} />);
    
    expect(screen.getByText('Your Turn')).toBeInTheDocument();
    expect(screen.getByText('Turn 5')).toBeInTheDocument();
  });

  it('applies animation classes when animating', () => {
    render(<TurnBadge isPlayerTurn={true} isAnimating={true} />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('animate-pulse', 'scale-105');
  });

  it('shows loading dots for enemy turn', () => {
    const { container } = render(<TurnBadge isPlayerTurn={false} />);
    
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('has proper accessibility attributes', () => {
    render(<TurnBadge isPlayerTurn={true} turnNumber={3} />);
    
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-label', 'Your Turn - Turn 3');
  });

  it('applies different styling for player vs enemy', () => {
    const { container: playerContainer } = render(<TurnBadge isPlayerTurn={true} />);
    const { container: enemyContainer } = render(<TurnBadge isPlayerTurn={false} />);
    
    expect(playerContainer.querySelector('.text-primary-300')).toBeInTheDocument();
    expect(enemyContainer.querySelector('.text-red-300')).toBeInTheDocument();
  });

  it('enemy turn always has pulse animation', () => {
    render(<TurnBadge isPlayerTurn={false} />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('animate-pulse');
  });
});