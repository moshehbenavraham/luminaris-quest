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
import { ResourceMeter } from '../atoms/ResourceMeter';
import { cn } from '@/lib/utils';
import type { CombatResources } from '@/features/combat/store/combat-store';

interface ResourceGridProps {
  playerHealth: number;
  maxHealth: number;
  resources: CombatResources;
  playerLevel: number;
  className?: string;
}

export function ResourceGrid({ 
  playerHealth, 
  maxHealth,
  resources,
  playerLevel,
  className 
}: ResourceGridProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-combat-text">
          Your Resources
        </h3>
        <span className="text-xs text-combat-text-muted bg-combat-card px-2 py-1 rounded">
          Level {playerLevel}
        </span>
      </div>
      
      <HealthBar
        current={playerHealth}
        max={maxHealth}
        label="Health"
        variant="player"
        className="w-full"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <ResourceMeter
          value={resources.lp}
          max={20}
          type="lp"
        />
        
        <ResourceMeter
          value={resources.sp}
          max={10}
          type="sp"
        />
      </div>
      
      <div className="text-xs text-combat-text-muted space-y-1">
        <div className="flex justify-between">
          <span>Light Points:</span>
          <span>Gained from victories & hope</span>
        </div>
        <div className="flex justify-between">
          <span>Shadow Points:</span>
          <span>Transformed from struggles</span>
        </div>
      </div>
    </div>
  );
}