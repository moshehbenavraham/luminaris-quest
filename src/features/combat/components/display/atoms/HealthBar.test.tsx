/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { HealthBar } from '@/features/combat/components/display/atoms/HealthBar';

describe('HealthBar', () => {
  it('renders with correct health values', () => {
    render(<HealthBar current={75} max={100} />);

    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('75/100')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<HealthBar current={50} max={100} label="Enemy HP" />);

    expect(screen.getByText('Enemy HP')).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<HealthBar current={50} max={100} showText={false} />);

    expect(screen.queryByText('Health')).not.toBeInTheDocument();
    expect(screen.queryByText('50/100')).not.toBeInTheDocument();
  });

  it('shows critical state when health is very low', () => {
    render(<HealthBar current={5} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('animate-pulse');
  });

  it('handles zero health correctly', () => {
    render(<HealthBar current={0} max={100} />);

    expect(screen.getByText('0/100')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles negative health correctly', () => {
    render(<HealthBar current={-10} max={100} />);

    expect(screen.getByText('0/100')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<HealthBar current={75} max={100} label="Player Health" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', 'Player Health: 75 out of 100');
  });

  it('applies different styling for enemy variant', () => {
    const { container } = render(<HealthBar current={50} max={100} variant="enemy" />);

    const healthBar = container.querySelector('.bg-red-500');
    expect(healthBar).toBeInTheDocument();
  });
});
