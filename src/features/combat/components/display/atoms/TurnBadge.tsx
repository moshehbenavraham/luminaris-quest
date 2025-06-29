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

interface TurnBadgeProps {
  isPlayerTurn: boolean;
  turnNumber?: number;
  isAnimating?: boolean;
  className?: string;
}

export function TurnBadge({ 
  isPlayerTurn, 
  turnNumber, 
  isAnimating = false, 
  className 
}: TurnBadgeProps) {
  const playerConfig = {
    bgColor: 'bg-primary-500/20',
    borderColor: 'border-primary-500/40',
    textColor: 'text-primary-50',
    icon: '⚡',
    label: 'Your Turn',
    glowColor: 'shadow-primary-500/30',
  };

  const enemyConfig = {
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-100',
    icon: '💀',
    label: 'Shadow Turn',
    glowColor: 'shadow-red-500/30',
  };

  const config = isPlayerTurn ? playerConfig : enemyConfig;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-medium',
        'transition-all duration-300',
        config.bgColor,
        config.borderColor,
        config.textColor,
        config.glowColor,
        isAnimating && 'animate-pulse scale-105',
        !isPlayerTurn && 'animate-pulse',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${config.label}${turnNumber ? ` - Turn ${turnNumber}` : ''}`}
    >
      <span 
        className={cn(
          'text-lg transition-transform duration-200',
          isAnimating && 'scale-125'
        )}
        aria-hidden="true"
      >
        {config.icon}
      </span>
      
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-none">
          {config.label}
        </span>
        {turnNumber && (
          <span className="text-xs opacity-75 leading-none mt-1">
            Turn {turnNumber}
          </span>
        )}
      </div>
      
      {!isPlayerTurn && (
        <div className="flex gap-1">
          <div className={cn(
            'w-1 h-1 rounded-full bg-current animate-bounce',
            'animation-delay-0'
          )} />
          <div className={cn(
            'w-1 h-1 rounded-full bg-current animate-bounce', 
            'animation-delay-75'
          )} />
          <div className={cn(
            'w-1 h-1 rounded-full bg-current animate-bounce',
            'animation-delay-150'
          )} />
        </div>
      )}
    </div>
  );
}