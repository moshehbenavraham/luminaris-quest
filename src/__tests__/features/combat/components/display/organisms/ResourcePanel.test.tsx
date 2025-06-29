/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { ResourcePanel } from '../../../../../../features/combat/components/display/organisms/ResourcePanel';
import type { CombatResources, StatusEffects } from '../../../../../../features/combat/store/combat-store';

const mockResources: CombatResources = {
  lp: 8,
  sp: 3
};

const mockStatusEffects: StatusEffects = {
  damageMultiplier: 1,
  damageReduction: 1,
  healingBlocked: 0,
  lpGenerationBlocked: 0,
  skipNextTurn: false,
  consecutiveEndures: 0
};

describe('ResourcePanel', () => {
  it('renders player resources', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Your Resources')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('renders resource meters', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('LP')).toBeInTheDocument();
    expect(screen.getByText('8/20')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  it('renders turn badge', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Turn 3')).toBeInTheDocument();
  });

  it('shows player turn indicator when it is player turn', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Choose an action')).toBeInTheDocument();
  });

  it('shows enemy turn indicator when it is enemy turn', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Awaiting enemy action...')).toBeInTheDocument();
  });

  it('applies special styling during player turn', () => {
    const { container } = render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveClass('ring-2', 'ring-blue-400/50', 'bg-blue-950/20');
  });

  it('does not apply special styling during enemy turn', () => {
    const { container } = render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={false}
        turnNumber={3}
      />
    );
    
    const panel = container.firstChild as HTMLElement;
    expect(panel).not.toHaveClass('ring-2', 'ring-blue-400/50', 'bg-blue-950/20');
  });

  it('renders status effects list', () => {
    const vulnerableStatusEffects = {
      ...mockStatusEffects,
      damageMultiplier: 1.5
    };
    
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={vulnerableStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Your Status')).toBeInTheDocument();
    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
      />
    );
    
    const panel = screen.getByRole('region', { name: 'Player resources and status' });
    expect(panel).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <ResourcePanel
        playerHealth={85}
        maxHealth={100}
        resources={mockResources}
        statusEffects={mockStatusEffects}
        playerLevel={5}
        isPlayerTurn={true}
        turnNumber={3}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles zero resources correctly', () => {
    const zeroResources = { lp: 0, sp: 0 };
    render(
      <ResourcePanel
        playerHealth={0}
        maxHealth={100}
        resources={zeroResources}
        statusEffects={mockStatusEffects}
        playerLevel={1}
        isPlayerTurn={true}
        turnNumber={1}
      />
    );
    
    expect(screen.getByText('0/100')).toBeInTheDocument();
    expect(screen.getByText('0/20')).toBeInTheDocument();
    expect(screen.getByText('0/10')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('handles maximum resources correctly', () => {
    const maxResources = { lp: 20, sp: 10 };
    render(
      <ResourcePanel
        playerHealth={100}
        maxHealth={100}
        resources={maxResources}
        statusEffects={mockStatusEffects}
        playerLevel={10}
        isPlayerTurn={false}
        turnNumber={10}
      />
    );
    
    expect(screen.getByText('100/100')).toBeInTheDocument();
    expect(screen.getByText('20/20')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByText('Level 10')).toBeInTheDocument();
  });
});