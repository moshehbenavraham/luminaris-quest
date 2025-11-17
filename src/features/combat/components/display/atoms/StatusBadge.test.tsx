/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/features/combat/components/display/atoms/StatusBadge';

describe('StatusBadge', () => {
  it('renders buff status correctly', () => {
    render(<StatusBadge type="buff" label="Strength" value={2} />);
    
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('text-green-300');
  });

  it('renders debuff status correctly', () => {
    render(<StatusBadge type="debuff" label="Weakness" value={-1} />);
    
    expect(screen.getByText('Weakness')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('text-red-300');
  });

  it('renders neutral status correctly', () => {
    render(<StatusBadge type="neutral" label="Focus" />);
    
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('text-blue-300');
  });

  it('displays duration when provided', () => {
    render(<StatusBadge type="buff" label="Shield" duration={3} />);
    
    expect(screen.getByText('Shield')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    render(<StatusBadge type="buff" label="Blessed" icon="✨" />);
    
    expect(screen.getByText('Blessed')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<StatusBadge type="buff" label="Power" value={3} duration={2} />);
    
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-label', 'Status effect: Power 3 for 2 turns');
  });

  it('handles zero duration correctly', () => {
    render(<StatusBadge type="buff" label="Temp" duration={0} />);
    
    expect(screen.queryByText('(0)')).not.toBeInTheDocument();
  });

  it('handles string values correctly', () => {
    render(<StatusBadge type="neutral" label="Status" value="Active" />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});