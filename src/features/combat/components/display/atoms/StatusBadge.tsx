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

interface StatusBadgeProps {
  type: 'buff' | 'debuff' | 'neutral';
  label: string;
  value?: number | string;
  duration?: number;
  icon?: string;
  className?: string;
}

export function StatusBadge({ type, label, value, duration, icon, className }: StatusBadgeProps) {
  const typeConfig = {
    buff: {
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-300',
      glowColor: 'shadow-green-500/20',
    },
    debuff: {
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
      glowColor: 'shadow-red-500/20',
    },
    neutral: {
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      glowColor: 'shadow-blue-500/20',
    },
  }[type];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
        'transition-all duration-200 hover:scale-105',
        typeConfig.bgColor,
        typeConfig.borderColor,
        typeConfig.textColor,
        typeConfig.glowColor,
        className,
      )}
      role="status"
      aria-label={`Status effect: ${label}${value ? ` ${value}` : ''}${duration ? ` for ${duration} turns` : ''}`}
    >
      {icon && (
        <span className="shrink-0 text-xs" aria-hidden="true">
          {icon}
        </span>
      )}

      <span className="truncate">{label}</span>

      {value !== undefined && (
        <span className="shrink-0 font-bold">
          {typeof value === 'number' && value > 0 ? '+' : ''}
          {value}
        </span>
      )}

      {duration !== undefined && duration > 0 && (
        <span className="shrink-0 opacity-75">({duration})</span>
      )}
    </div>
  );
}
