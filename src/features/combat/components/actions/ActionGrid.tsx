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

import { useState, useCallback, useRef } from 'react';
import { ActionButton } from './ActionButton';
import { cn } from '@/lib/utils';
import type { CombatAction } from '@/types';

interface ActionGridProps {
  canUseAction: (action: CombatAction) => boolean;
  getActionCost: (action: CombatAction) => { lp?: number; sp?: number };
  getActionDescription: (action: CombatAction) => string;
  onActionExecute: (action: CombatAction) => void;
  isPlayerTurn: boolean;
  className?: string;
  keyboardActiveAction?: CombatAction | null; // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This prop was NOT needed
}

const ACTIONS: Array<{
  action: CombatAction;
  title: string;
  shortcut: string;
}> = [
  { action: 'ILLUMINATE', title: 'Illuminate', shortcut: '1' },
  { action: 'REFLECT', title: 'Reflect', shortcut: '2' },
  { action: 'ENDURE', title: 'Endure', shortcut: '3' },
  { action: 'EMBRACE', title: 'Embrace', shortcut: '4' },
];

export function ActionGrid({
  canUseAction,
  getActionCost,
  getActionDescription,
  onActionExecute,
  isPlayerTurn,
  className,
  keyboardActiveAction,
}: ActionGridProps) {
  const [activeAction, setActiveAction] = useState<CombatAction | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️
  // This keyboardActiveAction coordination was added based on INCORRECT ASSUMPTION that
  // keyboard event conflicts were causing overlay interaction issues. This was NOT the
  // actual problem. The real interaction blocking issue remains UNFIXED.

  // Combine local click-based active action with keyboard-based active action
  const currentActiveAction = keyboardActiveAction || activeAction;

  const handleActionClick = useCallback(
    (action: CombatAction) => {
      if (!isPlayerTurn || !canUseAction(action)) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setActiveAction(action);
      onActionExecute(action);

      // Clear active state after animation
      timeoutRef.current = setTimeout(() => {
        setActiveAction(null);
        timeoutRef.current = null;
      }, 200);
    },
    [isPlayerTurn, canUseAction, onActionExecute],
  );

  // Cleanup timeout on unmount (handled by parent component)

  return (
    <div
      className={cn(
        'w-full',
        // Mobile: 2x2 grid
        'grid grid-cols-2 gap-3',
        // Desktop: 4x1 grid
        'sm:grid-cols-4 sm:gap-4',
        className,
      )}
      role="group"
      aria-label="Combat actions"
    >
      {ACTIONS.map(({ action, title, shortcut }) => {
        const cost = getActionCost(action);
        const description = getActionDescription(action);
        const disabled = !isPlayerTurn || !canUseAction(action);
        const isActive = currentActiveAction === action;

        return (
          <ActionButton
            key={action}
            action={action}
            title={title}
            description={description}
            cost={cost}
            shortcut={shortcut}
            disabled={disabled}
            isActive={isActive}
            onClick={handleActionClick}
            className={cn(
              // Mobile-first sizing
              'aspect-square',
              // Desktop sizing
              'sm:aspect-auto sm:min-h-[5rem]',
              // Touch optimization
              'touch-manipulation select-none',
              // Prevent text selection on double-tap
              'user-select-none',
            )}
          />
        );
      })}

      {!isPlayerTurn && (
        <div className="col-span-2 py-4 text-center sm:col-span-4">
          <div className="flex items-center justify-center space-x-3 rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-400" />
            <span className="font-medium text-red-300">Enemy Turn - Please Wait</span>
            <div className="animation-delay-300 h-3 w-3 animate-pulse rounded-full bg-red-400" />
          </div>
        </div>
      )}
    </div>
  );
}
