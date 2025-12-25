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

import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActionTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  cost?: { lp?: number; sp?: number };
  disabled?: boolean;
  shortcut?: string;
}

export function ActionTooltip({
  children,
  title,
  description,
  cost,
  disabled = false,
  shortcut,
}: ActionTooltipProps) {
  const costText = cost
    ? Object.entries(cost)
        .filter(([, value]) => value > 0)
        .map(([resource, value]) => `${value} ${resource.toUpperCase()}`)
        .join(', ')
    : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-combat-backdrop border-combat-border text-combat-text max-w-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-combat-text font-semibold">{title}</span>
              {shortcut && (
                <span className="bg-combat-card text-combat-text-muted rounded px-1.5 py-0.5 text-xs">
                  {shortcut}
                </span>
              )}
            </div>

            <p className="text-combat-text-muted text-sm leading-relaxed">{description}</p>

            {costText && (
              <div className="border-combat-border flex items-center justify-between border-t pt-1">
                <span className="text-combat-text-muted text-xs">Cost:</span>
                <span
                  className={`text-xs font-medium ${disabled ? 'text-red-400' : 'text-combat-text'}`}
                >
                  {costText}
                </span>
              </div>
            )}

            {disabled && (
              <div className="rounded bg-red-950/20 px-2 py-1 text-xs text-red-400">
                Insufficient resources
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
