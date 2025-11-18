 
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

import { ActionTooltip } from './ActionTooltip';
import { cn } from '@/lib/utils';
import type { CombatAction } from '@/store/game-store';

interface ActionButtonProps {
  action: CombatAction;
  title: string;
  description: string;
  cost?: { lp?: number; sp?: number };
  shortcut?: string;
  disabled?: boolean;
  isActive?: boolean;
  icon?: string;
  onClick: (action: CombatAction) => void;
  className?: string;
}

const actionStyles = {
  ILLUMINATE: {
    bg: 'bg-yellow-600/20 hover:bg-yellow-600/30',
    border: 'border-yellow-500/40 hover:border-yellow-400/60',
    text: 'text-yellow-100',
    icon: '✨',
    disabledBg: 'bg-yellow-900/10',
    disabledBorder: 'border-yellow-700/20',
    disabledText: 'text-yellow-300',
  },
  REFLECT: {
    bg: 'bg-blue-600/20 hover:bg-blue-600/30',
    border: 'border-blue-500/40 hover:border-blue-400/60',
    text: 'text-blue-100',
    icon: '🔄',
    disabledBg: 'bg-blue-900/10',
    disabledBorder: 'border-blue-700/20',
    disabledText: 'text-blue-300',
  },
  ENDURE: {
    bg: 'bg-green-600/20 hover:bg-green-600/30',
    border: 'border-green-500/40 hover:border-green-400/60',
    text: 'text-green-100',
    icon: '🛡️',
    disabledBg: 'bg-green-900/10',
    disabledBorder: 'border-green-700/20',
    disabledText: 'text-green-300',
  },
  EMBRACE: {
    bg: 'bg-purple-600/20 hover:bg-purple-600/30',
    border: 'border-purple-500/40 hover:border-purple-400/60',
    text: 'text-pink-200',
    icon: '🤗',
    disabledBg: 'bg-purple-900/10',
    disabledBorder: 'border-purple-700/20',
    disabledText: 'text-pink-300',
  },
} as const;

export function ActionButton({
  action,
  title,
  description,
  cost,
  shortcut,
  disabled = false,
  isActive = false,
  icon,
  onClick,
  className
}: ActionButtonProps) {
  const style = actionStyles[action];
  const displayIcon = icon || style.icon;

  const handleClick = () => {
    if (!disabled) {
      onClick(action);
    }
  };

  const buttonClasses = cn(
    'relative flex flex-col items-center justify-center',
    'min-h-[4rem] sm:min-h-[5rem] p-3 rounded-lg border-2',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-blue-400/50',
    'active:scale-95 transform',
    'touch-manipulation', // Optimize for touch devices
    disabled
      ? cn(
          style.disabledBg,
          style.disabledBorder,
          style.disabledText,
          'cursor-not-allowed opacity-60'
        )
      : cn(
          style.bg,
          style.border,
          style.text,
          'cursor-pointer hover:scale-105',
          isActive && 'ring-2 ring-blue-400/50 scale-105'
        ),
    className
  );

  return (
    <ActionTooltip
      title={title}
      description={description}
      cost={cost}
      shortcut={shortcut}
      disabled={disabled}
    >
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled}
        aria-label={`${title}${shortcut ? ` (${shortcut})` : ''}`}
        data-testid={`action-${action.toLowerCase()}`}
      >
        <div className="text-2xl mb-1" aria-hidden="true">
          {displayIcon}
        </div>
        
        <span className="text-xs sm:text-sm font-medium text-center leading-tight">
          {title}
        </span>
        
        {cost && Object.values(cost).some(v => v > 0) && (
          <div className="absolute top-1 right-1 text-xs opacity-75">
            {cost.lp && <span className="text-yellow-300">{cost.lp}LP</span>}
            {cost.lp && cost.sp && <span className="text-combat-text-muted">•</span>}
            {cost.sp && <span className="text-purple-300">{cost.sp}SP</span>}
          </div>
        )}
        
        {shortcut && (
          <div className="absolute bottom-1 right-1 text-xs opacity-60 bg-black/20 px-1 rounded">
            {shortcut}
          </div>
        )}
        
        {isActive && (
          <div className="absolute inset-0 rounded-lg bg-blue-400/10 pointer-events-none" />
        )}
      </button>
    </ActionTooltip>
  );
}