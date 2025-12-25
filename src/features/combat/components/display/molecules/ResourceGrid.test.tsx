/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { ResourceGrid } from '@/features/combat/components/display/molecules/ResourceGrid';
import type { CombatResources } from '@/features/combat/store/combat-store';

const mockResources: CombatResources = {
  lp: 8,
  sp: 3,
};

describe('ResourceGrid', () => {
  it('renders player health', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('renders player level', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('renders light points resource', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('LP')).toBeInTheDocument();
    expect(screen.getByText('8/20')).toBeInTheDocument();
  });

  it('renders shadow points resource', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  it('renders resource descriptions', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('Gained from victories & hope')).toBeInTheDocument();
    expect(screen.getByText('Transformed from struggles')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={mockResources} playerLevel={5} />,
    );

    expect(screen.getByText('Your Resources')).toBeInTheDocument();
  });

  it('handles zero resources correctly', () => {
    const zeroResources = { lp: 0, sp: 0 };
    render(
      <ResourceGrid playerHealth={85} maxHealth={100} resources={zeroResources} playerLevel={1} />,
    );

    expect(screen.getByText('0/20')).toBeInTheDocument();
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });

  it('handles maximum resources correctly', () => {
    const maxResources = { lp: 20, sp: 10 };
    render(
      <ResourceGrid playerHealth={100} maxHealth={100} resources={maxResources} playerLevel={10} />,
    );

    expect(screen.getByText('20/20')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByText('Level 10')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <ResourceGrid
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        playerLevel={5}
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
