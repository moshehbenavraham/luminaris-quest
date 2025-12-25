/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { StatusEffectList } from '@/features/combat/components/display/molecules/StatusEffectList';
import type { StatusEffects } from '@/features/combat/store/combat-store';

const baseStatusEffects: StatusEffects = {
  damageMultiplier: 1,
  damageReduction: 1,
  healingBlocked: 0,
  lpGenerationBlocked: 0,
  skipNextTurn: false,
  consecutiveEndures: 0,
};

describe('StatusEffectList', () => {
  it('renders nothing when no status effects are active', () => {
    const { container } = render(<StatusEffectList statusEffects={baseStatusEffects} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders vulnerable status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 1.5,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
    expect(screen.getByText('Your Status')).toBeInTheDocument();
  });

  it('renders resilient status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 0.7,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Resilient')).toBeInTheDocument();
  });

  it('renders fortified status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageReduction: 1.3,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Fortified')).toBeInTheDocument();
  });

  it('renders wounded status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      healingBlocked: 2,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Wounded')).toBeInTheDocument();
  });

  it('renders dimmed status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      lpGenerationBlocked: 1,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Dimmed')).toBeInTheDocument();
  });

  it('renders stunned status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      skipNextTurn: true,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Stunned')).toBeInTheDocument();
  });

  it('renders enduring status effect', () => {
    const statusEffects = {
      ...baseStatusEffects,
      consecutiveEndures: 2,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Enduring')).toBeInTheDocument();
  });

  it('renders unbreakable status effect for high endures', () => {
    const statusEffects = {
      ...baseStatusEffects,
      consecutiveEndures: 3,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Unbreakable')).toBeInTheDocument();
  });

  it('renders multiple status effects', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 1.5,
      healingBlocked: 1,
      skipNextTurn: true,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
    expect(screen.getByText('Wounded')).toBeInTheDocument();
    expect(screen.getByText('Stunned')).toBeInTheDocument();
  });

  it('renders correct target label for enemy', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 1.5,
    };

    render(<StatusEffectList statusEffects={statusEffects} target="enemy" />);

    expect(screen.getByText('Enemy Status')).toBeInTheDocument();
  });

  it('renders correct target label for player (default)', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 1.5,
    };

    render(<StatusEffectList statusEffects={statusEffects} />);

    expect(screen.getByText('Your Status')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const statusEffects = {
      ...baseStatusEffects,
      damageMultiplier: 1.5,
    };

    const { container } = render(
      <StatusEffectList statusEffects={statusEffects} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
