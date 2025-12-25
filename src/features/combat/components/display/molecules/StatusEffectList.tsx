/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import { StatusBadge } from '../atoms/StatusBadge';
import { cn } from '@/lib/utils';
import type { StatusEffects } from '@/features/combat/store/combat-store';

interface StatusEffectListProps {
  statusEffects: StatusEffects;
  target?: 'player' | 'enemy';
  className?: string;
}

interface StatusEffect {
  label: string;
  type: 'buff' | 'debuff' | 'neutral';
  description: string;
}

export function StatusEffectList({
  statusEffects,
  target = 'player',
  className,
}: StatusEffectListProps) {
  const getActiveEffects = (): StatusEffect[] => {
    const effects: StatusEffect[] = [];

    if (statusEffects.damageMultiplier > 1) {
      effects.push({
        label: 'Vulnerable',
        type: 'debuff',
        description: `Taking ${Math.round((statusEffects.damageMultiplier - 1) * 100)}% more damage`,
      });
    } else if (statusEffects.damageMultiplier < 1) {
      effects.push({
        label: 'Resilient',
        type: 'buff',
        description: `Taking ${Math.round((1 - statusEffects.damageMultiplier) * 100)}% less damage`,
      });
    }

    if (statusEffects.damageReduction > 1) {
      effects.push({
        label: 'Fortified',
        type: 'buff',
        description: `Damage reduced by ${Math.round((statusEffects.damageReduction - 1) * 100)}%`,
      });
    }

    if (statusEffects.healingBlocked > 0) {
      effects.push({
        label: 'Wounded',
        type: 'debuff',
        description: `Healing blocked for ${statusEffects.healingBlocked} turns`,
      });
    }

    if (statusEffects.lpGenerationBlocked > 0) {
      effects.push({
        label: 'Dimmed',
        type: 'debuff',
        description: `Light generation blocked for ${statusEffects.lpGenerationBlocked} turns`,
      });
    }

    if (statusEffects.skipNextTurn) {
      effects.push({
        label: 'Stunned',
        type: 'debuff',
        description: 'Will skip next turn',
      });
    }

    if (statusEffects.consecutiveEndures > 0) {
      const endureEffect = statusEffects.consecutiveEndures >= 3 ? 'Unbreakable' : 'Enduring';
      effects.push({
        label: endureEffect,
        type: 'buff',
        description: `Consecutive endures: ${statusEffects.consecutiveEndures}`,
      });
    }

    return effects;
  };

  const activeEffects = getActiveEffects();

  if (activeEffects.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-combat-text-muted text-xs font-medium">
        {target === 'player' ? 'Your Status' : 'Enemy Status'}
      </p>

      <div className="flex flex-wrap gap-2">
        {activeEffects.map((effect, index) => (
          <div key={index} className="group relative">
            <StatusBadge label={effect.label} type={effect.type} />

            {/* Tooltip on hover */}
            <div className="bg-combat-backdrop text-combat-text pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {effect.description}
              <div className="border-t-combat-backdrop absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
