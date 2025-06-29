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
import type { ShadowManifestation } from '@/store/game-store';
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
  className
}: EnemyCardProps) {
  return (
    <div 
      className={cn(
        'bg-combat-card rounded-lg border border-combat-border p-4 space-y-4',
        'transition-all duration-300',
        isEnemyTurn && 'ring-2 ring-red-400/50 bg-red-950/20',
        className
      )}
      role="region"
      aria-label={`Enemy: ${enemy.name}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <EnemyInfo enemy={enemy} />
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <TurnBadge
            isPlayerTurn={!isEnemyTurn}
            turnNumber={turnNumber}
          />
        </div>
      </div>
      
      <EnemyHealthPanel
        enemy={enemy}
        statusEffects={statusEffects}
      />
      
      {isEnemyTurn && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Enemy is thinking...</span>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-200" />
          </div>
        </div>
      )}
    </div>
  );
}