/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { EnemyHealthPanel } from '@/features/combat/components/display/molecules/EnemyHealthPanel';
import type { ShadowManifestation } from '@/store/game-store';
import type { StatusEffects } from '@/features/combat/store/combat-store';

const mockEnemy: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Shadow of Doubt',
  type: 'doubt',
  description: 'A test shadow',
  currentHP: 75,
  maxHP: 100,
  abilities: [
    {
      id: 'doubt-whisper',
      name: 'Whisper of Doubt',
      cooldown: 2,
      currentCooldown: 0,
      effect: 'Reduces player confidence'
    },
    {
      id: 'overwhelm',
      name: 'Overwhelm',
      cooldown: 3,
      currentCooldown: 2,
      effect: 'Stuns player for 1 turn'
    }
  ],
  therapeuticInsight: 'Test insight',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'Test growth',
    permanentBenefit: 'Test benefit'
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

describe('EnemyHealthPanel', () => {
  it('renders enemy health bar', () => {
    render(<EnemyHealthPanel enemy={mockEnemy} />);
    
    expect(screen.getByText('Shadow Health')).toBeInTheDocument();
    expect(screen.getByText('75/100')).toBeInTheDocument();
  });

  it('renders enemy abilities', () => {
    render(<EnemyHealthPanel enemy={mockEnemy} />);
    
    expect(screen.getByText('Shadow Abilities')).toBeInTheDocument();
    expect(screen.getByText('Whisper of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Overwhelm')).toBeInTheDocument();
  });

  it('shows cooldown for abilities on cooldown', () => {
    render(<EnemyHealthPanel enemy={mockEnemy} />);
    
    // Overwhelm should show cooldown (2)
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('renders vulnerable status effect', () => {
    const vulnerableStatusEffects = {
      ...mockStatusEffects,
      damageMultiplier: 1.5
    };
    
    render(<EnemyHealthPanel enemy={mockEnemy} statusEffects={vulnerableStatusEffects} />);
    
    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
  });

  it('renders resilient status effect', () => {
    const resilientStatusEffects = {
      ...mockStatusEffects,
      damageMultiplier: 0.8
    };
    
    render(<EnemyHealthPanel enemy={mockEnemy} statusEffects={resilientStatusEffects} />);
    
    expect(screen.getByText('Resilient')).toBeInTheDocument();
  });

  it('renders stunned status effect', () => {
    const stunnedStatusEffects = {
      ...mockStatusEffects,
      skipNextTurn: true
    };
    
    render(<EnemyHealthPanel enemy={mockEnemy} statusEffects={stunnedStatusEffects} />);
    
    expect(screen.getByText('Stunned')).toBeInTheDocument();
  });

  it('renders fortified status effect', () => {
    const fortifiedStatusEffects = {
      ...mockStatusEffects,
      consecutiveEndures: 3
    };
    
    render(<EnemyHealthPanel enemy={mockEnemy} statusEffects={fortifiedStatusEffects} />);
    
    expect(screen.getByText('Fortified')).toBeInTheDocument();
  });

  it('does not render abilities section when enemy has no abilities', () => {
    const enemyWithoutAbilities = { ...mockEnemy, abilities: [] };
    render(<EnemyHealthPanel enemy={enemyWithoutAbilities} />);
    
    expect(screen.queryByText('Shadow Abilities')).not.toBeInTheDocument();
  });

  it('does not render status effects when none are active', () => {
    render(<EnemyHealthPanel enemy={mockEnemy} statusEffects={mockStatusEffects} />);
    
    expect(screen.queryByText('Vulnerable')).not.toBeInTheDocument();
    expect(screen.queryByText('Stunned')).not.toBeInTheDocument();
    expect(screen.queryByText('Fortified')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<EnemyHealthPanel enemy={mockEnemy} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});