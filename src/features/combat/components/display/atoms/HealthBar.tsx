// Built with Bolt.new
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

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  variant?: 'player' | 'enemy';
  showText?: boolean;
  className?: string;
}

export function HealthBar({
  current,
  max,
  label = 'Health',
  variant = 'player',
  showText = true,
  className
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage <= 25;
  const isCritical = percentage <= 10;

  const barColorClass = variant === 'player' 
    ? isCritical 
      ? 'bg-red-500' 
      : isLow 
        ? 'bg-yellow-500' 
        : 'bg-green-500'
    : isCritical
      ? 'bg-red-400'
      : isLow
        ? 'bg-orange-400' 
        : 'bg-red-500';

  return (
    <div className={cn('w-full', className)}>
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-combat-text font-medium">
            {label}
          </span>
          <span className="text-sm text-combat-text-muted">
            {Math.max(0, current)}/{max}
          </span>
        </div>
      )}
      
      <div className="relative w-full h-2 bg-combat-card rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            barColorClass,
            isCritical && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${current} out of ${max}`}
        />
        
        {/* Shine effect for healthy bars */}
        {percentage > 50 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  );
}