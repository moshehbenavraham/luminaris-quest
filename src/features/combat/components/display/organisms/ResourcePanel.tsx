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

import { ResourceGrid } from '../molecules/ResourceGrid';
import { StatusEffectList } from '../molecules/StatusEffectList';
import { cn } from '@/lib/utils';
import type { CombatResources, StatusEffects } from '@/features/combat/store/combat-store';

interface ResourcePanelProps {
  playerHealth: number;
  maxHealth: number;
  resources: CombatResources;
  statusEffects: StatusEffects;
  playerLevel: number;
  isPlayerTurn: boolean;
  className?: string;
}

export function ResourcePanel({
  playerHealth,
  maxHealth,
  resources,
  statusEffects,
  playerLevel,
  isPlayerTurn,
  className
}: ResourcePanelProps) {
  return (
    <div 
      className={cn(
        'bg-combat-card rounded-lg border border-combat-border p-4 space-y-4',
        'transition-all duration-300',
        isPlayerTurn && 'ring-2 ring-blue-400/50 bg-blue-950/20',
        className
      )}
      role="region"
      aria-label="Player resources and status"
    >
      <ResourceGrid
        playerHealth={playerHealth}
        maxHealth={maxHealth}
        resources={resources}
        playerLevel={playerLevel}
      />
      
      <StatusEffectList
        statusEffects={statusEffects}
        target="player"
      />
      
    </div>
  );
}