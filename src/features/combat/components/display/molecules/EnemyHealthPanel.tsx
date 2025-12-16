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

import { HealthBar } from '../atoms/HealthBar';
import { StatusBadge } from '../atoms/StatusBadge';
import { cn } from '@/lib/utils';
import type { ShadowManifestation } from '@/types';
import type { StatusEffects } from '@/features/combat/store/combat-store';

interface EnemyHealthPanelProps {
  enemy: ShadowManifestation;
  statusEffects?: StatusEffects;
  className?: string;
}

export function EnemyHealthPanel({ enemy, statusEffects, className }: EnemyHealthPanelProps) {
  const activeStatusEffects = statusEffects
    ? [
        statusEffects.damageMultiplier !== 1 && {
          label: statusEffects.damageMultiplier > 1 ? 'Vulnerable' : 'Resilient',
          type: statusEffects.damageMultiplier > 1 ? ('debuff' as const) : ('buff' as const),
        },
        statusEffects.skipNextTurn && {
          label: 'Stunned',
          type: 'debuff' as const,
        },
        statusEffects.consecutiveEndures > 2 && {
          label: 'Fortified',
          type: 'buff' as const,
        },
      ].filter((effect): effect is { label: string; type: 'buff' | 'debuff' } => Boolean(effect))
    : [];

  return (
    <div className={cn('space-y-3', className)}>
      <HealthBar
        current={enemy.currentHP}
        max={enemy.maxHP}
        label="Shadow Health"
        variant="enemy"
        className="w-full"
      />

      {activeStatusEffects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeStatusEffects.map((effect, index) => (
            <StatusBadge key={index} label={effect.label} type={effect.type} />
          ))}
        </div>
      )}

      {enemy.abilities && enemy.abilities.length > 0 && (
        <div className="space-y-1">
          <p className="text-combat-text-muted text-xs font-medium">Shadow Abilities</p>
          <div className="flex flex-wrap gap-1">
            {enemy.abilities.map((ability) => (
              <span
                key={ability.id}
                className={cn(
                  'bg-combat-card text-combat-text-muted rounded px-2 py-1 text-xs',
                  ability.currentCooldown > 0 && 'opacity-50',
                )}
              >
                {ability.name}
                {ability.currentCooldown > 0 && (
                  <span className="ml-1 text-red-400">({ability.currentCooldown})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
