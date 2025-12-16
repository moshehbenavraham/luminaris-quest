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
    },
  }[type];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="bg-combat-card flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm">
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-combat-text text-xs font-medium">{config.shortLabel}</span>
          <span className="text-combat-text-muted text-xs">
            {Math.max(0, value)}/{max}
          </span>
        </div>

        <div className="bg-combat-card relative h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              config.color,
              value > 0 && `shadow-sm ${config.glowColor}`,
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
