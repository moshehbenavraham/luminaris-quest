/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { EnemyInfo } from '../../../../../../features/combat/components/display/molecules/EnemyInfo';
import type { ShadowManifestation } from '../../../../../../store/game-store';

const mockEnemy: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Shadow of Doubt',
  type: 'doubt',
  description: 'A manifestation of your deepest uncertainties, whispering that you are not enough.',
  currentHP: 75,
  maxHP: 100,
  abilities: [],
  therapeuticInsight: 'Remember that doubt is a natural part of growth. Challenge these thoughts with evidence of your past successes.',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'You have learned to question your doubts.',
    permanentBenefit: 'Increased confidence in decision-making'
  }
};

describe('EnemyInfo', () => {
  it('renders enemy name and type', () => {
    render(<EnemyInfo enemy={mockEnemy} />);
    
    expect(screen.getByText('Shadow of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Self-Doubt')).toBeInTheDocument();
  });

  it('renders enemy description', () => {
    render(<EnemyInfo enemy={mockEnemy} />);
    
    expect(screen.getByText(mockEnemy.description)).toBeInTheDocument();
  });

  it('renders therapeutic insight when provided', () => {
    render(<EnemyInfo enemy={mockEnemy} />);
    
    expect(screen.getByText("Guardian's Insight")).toBeInTheDocument();
    expect(screen.getByText(mockEnemy.therapeuticInsight!)).toBeInTheDocument();
  });

  it('does not render therapeutic insight section when not provided', () => {
    const enemyWithoutInsight = { ...mockEnemy, therapeuticInsight: '' };
    render(<EnemyInfo enemy={enemyWithoutInsight} />);
    
    expect(screen.queryByText("Guardian's Insight")).not.toBeInTheDocument();
  });

  it('applies correct styling for different shadow types', () => {
    const isolationEnemy = { ...mockEnemy, type: 'isolation' as const };
    render(<EnemyInfo enemy={isolationEnemy} />);
    
    const typeLabel = screen.getByText('Isolation');
    expect(typeLabel).toHaveClass('text-blue-400');
  });

  it('applies correct styling for overwhelm type', () => {
    const overwhelmEnemy = { ...mockEnemy, type: 'overwhelm' as const };
    render(<EnemyInfo enemy={overwhelmEnemy} />);
    
    const typeLabel = screen.getByText('Overwhelm');
    expect(typeLabel).toHaveClass('text-red-400');
  });

  it('applies correct styling for past-pain type', () => {
    const pastPainEnemy = { ...mockEnemy, type: 'past-pain' as const };
    render(<EnemyInfo enemy={pastPainEnemy} />);
    
    const typeLabel = screen.getByText('Past Pain');
    expect(typeLabel).toHaveClass('text-amber-400');
  });

  it('accepts custom className', () => {
    const { container } = render(<EnemyInfo enemy={mockEnemy} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});