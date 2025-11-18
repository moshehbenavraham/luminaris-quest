 
/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions.
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  onEndTurn: () => void;
  onSurrender: () => void;
  isPlayerTurn: boolean;
  canEndTurn?: boolean;
  className?: string;
}

export function ControlPanel({
  onEndTurn,
  onSurrender,
  isPlayerTurn,
  canEndTurn = true,
  className
}: ControlPanelProps) {
  return (
    <div
      className={cn(
        'flex gap-3 w-full',
        // Mobile: stack vertically for better touch targets
        'flex-col',
        // Desktop: horizontal layout
        'sm:flex-row sm:justify-between',
        className
      )}
      role="group"
      aria-label="Combat controls"
    >
      <Button
        onClick={onEndTurn}
        disabled={!isPlayerTurn || !canEndTurn}
        variant="outline"
        size="lg"
        className={cn(
          'flex-1 min-h-[3rem]',
          // Touch optimization
          'touch-manipulation select-none',
          // End turn styling
          'bg-blue-600/20 hover:bg-blue-600/30',
          'border-blue-500/40 hover:border-blue-400/60',
          'text-blue-100 hover:text-blue-50',
          'disabled:bg-gray-700/20 disabled:border-gray-600/40',
          'disabled:text-gray-400 disabled:cursor-not-allowed',
          // Focus states
          'focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2',
          'focus:ring-offset-combat-card'
        )}
        data-testid="end-turn-button"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-lg">⏭️</span>
          <span className="font-medium">End Turn</span>
        </span>
      </Button>

      <Button
        onClick={onSurrender}
        variant="outline"
        size="lg"
        className={cn(
          'flex-1 min-h-[3rem]',
          // Touch optimization
          'touch-manipulation select-none',
          // Surrender styling (more muted)
          'bg-red-600/20 hover:bg-red-600/30',
          'border-red-500/40 hover:border-red-400/60',
          'text-red-200 hover:text-red-100',
          // Focus states
          'focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2',
          'focus:ring-offset-combat-card'
        )}
        data-testid="surrender-button"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-lg">🏃</span>
          <span className="font-medium">Surrender</span>
        </span>
      </Button>
    </div>
  );
}