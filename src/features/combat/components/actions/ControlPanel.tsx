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
  className,
}: ControlPanelProps) {
  const isEndTurnDisabled = !isPlayerTurn || !canEndTurn;

  return (
    <div
      role="group"
      aria-label="Combat controls"
      className={cn('flex flex-col gap-2 sm:flex-row', className)}
    >
      <button
        data-testid="end-turn-button"
        onClick={onEndTurn}
        disabled={isEndTurnDisabled}
        className={cn(
          'min-h-[3rem] flex-1 rounded-lg border-2 px-4 py-2',
          'flex items-center justify-center gap-2',
          'transition-all duration-200',
          'focus:ring-2 focus:ring-amber-400/50 focus:outline-none',
          isEndTurnDisabled
            ? 'cursor-not-allowed border-gray-600/40 bg-gray-700/20 text-gray-500'
            : 'cursor-pointer border-amber-500/40 bg-amber-600/20 text-amber-100 hover:border-amber-400/60 hover:bg-amber-600/30',
        )}
      >
        <span aria-hidden="true">⏭️</span>
        <span>End Turn</span>
      </button>

      <button
        data-testid="surrender-button"
        onClick={onSurrender}
        className={cn(
          'min-h-[3rem] flex-1 rounded-lg border-2 px-4 py-2',
          'flex items-center justify-center gap-2',
          'transition-all duration-200',
          'cursor-pointer border-red-500/40 bg-red-600/20 text-red-100',
          'hover:border-red-400/60 hover:bg-red-600/30',
          'focus:ring-2 focus:ring-red-400/50 focus:outline-none',
        )}
      >
        <span aria-hidden="true">🏃</span>
        <span>Surrender</span>
      </button>
    </div>
  );
}
