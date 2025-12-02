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

import { cn } from '@/lib/utils';
import type { ShadowManifestation } from '@/store/game-store';

interface EnemyInfoProps {
  enemy: ShadowManifestation;
  className?: string;
}

const shadowTypeColors = {
  doubt: 'text-purple-400',
  isolation: 'text-blue-400',
  overwhelm: 'text-red-400',
  'past-pain': 'text-amber-400',
} as const;

const shadowTypeLabels = {
  doubt: 'Self-Doubt',
  isolation: 'Isolation',
  overwhelm: 'Overwhelm',
  'past-pain': 'Past Pain',
} as const;

export function EnemyInfo({ enemy, className }: EnemyInfoProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-combat-text text-lg font-semibold">{enemy.name}</h3>
        <span
          className={cn(
            'bg-combat-card rounded-full px-2 py-1 text-sm font-medium',
            shadowTypeColors[enemy.type],
          )}
        >
          {shadowTypeLabels[enemy.type]}
        </span>
      </div>

      <p className="text-combat-text-muted text-sm leading-relaxed">{enemy.description}</p>

      {enemy.therapeuticInsight && (
        <div className="bg-combat-card border-combat-border mt-3 rounded-lg border p-3">
          <p className="text-combat-text-muted mb-1 text-xs font-medium">Guardian&apos;s Insight</p>
          <p className="text-combat-text-muted text-sm italic">{enemy.therapeuticInsight}</p>
        </div>
      )}
    </div>
  );
}
