/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { EnemyCard } from '@/features/combat/components/display/organisms/EnemyCard';
import type { ShadowManifestation } from '@/store/game-store';
import type { StatusEffects } from '@/features/combat/store/combat-store';

const mockEnemy: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Shadow of Doubt',
  type: 'doubt',
  description: 'A manifestation of your deepest uncertainties.',
  currentHP: 75,
  maxHP: 100,
  abilities: [
    {
      id: 'doubt-whisper',
      name: 'Whisper of Doubt',
      cooldown: 2,
      currentCooldown: 0,
      effect: 'Reduces player confidence'
    }
  ],
  therapeuticInsight: 'Remember that doubt is a natural part of growth.',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'You have learned to question your doubts.',
    permanentBenefit: 'Increased confidence in decision-making'
  }
};

const mockStatusEffects: StatusEffects = {
  damageMultiplier: 1,
  damageReduction: 1,
  healingBlocked: 0,
  lpGenerationBlocked: 0,
  skipNextTurn: false,
  consecutiveEndures: 0
};

describe('EnemyCard', () => {
  it('renders enemy information', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Shadow of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Self-Doubt')).toBeInTheDocument();
    expect(screen.getByText(mockEnemy.description)).toBeInTheDocument();
  });

  it('renders enemy health panel', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Shadow Health')).toBeInTheDocument();
    expect(screen.getByText('75/100')).toBeInTheDocument();
  });

  it('renders turn badge', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Turn 3')).toBeInTheDocument();
  });

  it('shows enemy turn indicator when it is enemy turn', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={true}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Enemy is thinking...')).toBeInTheDocument();
  });

  it('does not show enemy turn indicator when it is player turn', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.queryByText('Enemy is thinking...')).not.toBeInTheDocument();
  });

  it('applies special styling during enemy turn', () => {
    const { container } = render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={true}
        turnNumber={3}
      />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('ring-2', 'ring-red-400/50', 'bg-red-950/20');
  });

  it('does not apply special styling during player turn', () => {
    const { container } = render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('ring-2', 'ring-red-400/50', 'bg-red-950/20');
  });

  it('renders status effects when provided', () => {
    const vulnerableStatusEffects = {
      ...mockStatusEffects,
      damageMultiplier: 1.5
    };
    
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={vulnerableStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    const card = screen.getByRole('region', { name: 'Enemy: Shadow of Doubt' });
    expect(card).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <EnemyCard
        enemy={mockEnemy}
        statusEffects={mockStatusEffects}
        isEnemyTurn={false}
        turnNumber={3}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without status effects', () => {
    render(
      <EnemyCard
        enemy={mockEnemy}
        isEnemyTurn={false}
        turnNumber={3}
      />
    );
    
    expect(screen.getByText('Shadow of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Shadow Health')).toBeInTheDocument();
  });
});