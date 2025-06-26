/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { ResourceMeter } from '../../../../../../features/combat/components/display/atoms/ResourceMeter';

describe('ResourceMeter', () => {
  it('renders LP meter correctly', () => {
    render(<ResourceMeter value={5} max={10} type="lp" />);
    
    expect(screen.getByText('LP')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('renders SP meter correctly', () => {
    render(<ResourceMeter value={3} max={8} type="sp" />);
    
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('3/8')).toBeInTheDocument();
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('handles zero resources correctly', () => {
    render(<ResourceMeter value={0} max={10} type="lp" />);
    
    expect(screen.getByText('0/10')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles negative resources correctly', () => {
    render(<ResourceMeter value={-2} max={10} type="sp" />);
    
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ResourceMeter value={7} max={10} type="lp" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '7');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    expect(progressBar).toHaveAttribute('aria-label', 'Light Points: 7 out of 10');
  });

  it('applies different colors for LP and SP', () => {
    const { container: lpContainer } = render(<ResourceMeter value={5} max={10} type="lp" />);
    const { container: spContainer } = render(<ResourceMeter value={5} max={10} type="sp" />);
    
    expect(lpContainer.querySelector('.bg-yellow-400')).toBeInTheDocument();
    expect(spContainer.querySelector('.bg-purple-500')).toBeInTheDocument();
  });
});