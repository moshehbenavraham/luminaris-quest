 
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

interface ResourceMeterProps {
  value: number;
  max: number;
  type: 'lp' | 'sp';
  className?: string;
}

export function ResourceMeter({ value, max, type, className }: ResourceMeterProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const config = {
    lp: {
      label: 'Light Points',
      shortLabel: 'LP',
      color: 'bg-yellow-400',
      icon: '☀️',
      glowColor: 'shadow-yellow-400/50',
    },
    sp: {
      label: 'Shadow Points', 
      shortLabel: 'SP',
      color: 'bg-purple-500',
      icon: '🌙',
      glowColor: 'shadow-purple-500/50',
    }
  }[type];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-combat-card flex items-center justify-center text-sm">
        {config.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-combat-text font-medium">
            {config.shortLabel}
          </span>
          <span className="text-xs text-combat-text-muted">
            {Math.max(0, value)}/{max}
          </span>
        </div>
        
        <div className="relative w-full h-1.5 bg-combat-card rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              config.color,
              value > 0 && `shadow-sm ${config.glowColor}`
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${config.label}: ${value} out of ${max}`}
          />
          
          {/* Subtle glow effect when resource is available */}
          {value > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}