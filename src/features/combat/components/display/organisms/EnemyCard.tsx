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

import { EnemyInfo } from '../molecules/EnemyInfo';
import { EnemyHealthPanel } from '../molecules/EnemyHealthPanel';
import { TurnBadge } from '../atoms/TurnBadge';
import { cn } from '@/lib/utils';
import type { ShadowManifestation } from '@/types';
import type { StatusEffects } from '@/features/combat/store/combat-store';

interface EnemyCardProps {
  enemy: ShadowManifestation;
  statusEffects?: StatusEffects;
  isEnemyTurn: boolean;
  turnNumber: number;
  className?: string;
}

export function EnemyCard({
  enemy,
  statusEffects,
  isEnemyTurn,
  turnNumber,
  className,
}: EnemyCardProps) {
  return (
    <div
      className={cn(
        'bg-combat-card border-combat-border space-y-4 rounded-lg border p-4',
        'transition-all duration-300',
        isEnemyTurn && 'bg-red-950/20 ring-2 ring-red-400/50',
        className,
      )}
      role="region"
      aria-label={`Enemy: ${enemy.name}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <EnemyInfo enemy={enemy} />
        </div>

        <div className="ml-4 shrink-0">
          <TurnBadge isPlayerTurn={!isEnemyTurn} turnNumber={turnNumber} />
        </div>
      </div>

      <EnemyHealthPanel enemy={enemy} statusEffects={statusEffects} />

      {isEnemyTurn && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-red-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            <span className="text-sm font-medium">Enemy is thinking...</span>
            <div className="animation-delay-200 h-2 w-2 animate-pulse rounded-full bg-red-400" />
          </div>
        </div>
      )}
    </div>
  );
}
