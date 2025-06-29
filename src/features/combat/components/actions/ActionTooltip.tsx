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
  shortcut
}: ActionTooltipProps) {
  const costText = cost ? Object.entries(cost)
    .filter(([, value]) => value > 0)
    .map(([resource, value]) => `${value} ${resource.toUpperCase()}`)
    .join(', ') : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-combat-backdrop border-combat-border text-combat-text"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-combat-text">{title}</span>
              {shortcut && (
                <span className="text-xs bg-combat-card px-1.5 py-0.5 rounded text-combat-text-muted">
                  {shortcut}
                </span>
              )}
            </div>
            
            <p className="text-sm text-combat-text-muted leading-relaxed">
              {description}
            </p>
            
            {costText && (
              <div className="flex items-center justify-between pt-1 border-t border-combat-border">
                <span className="text-xs text-combat-text-muted">Cost:</span>
                <span className={`text-xs font-medium ${disabled ? 'text-red-400' : 'text-combat-text'}`}>
                  {costText}
                </span>
              </div>
            )}
            
            {disabled && (
              <div className="text-xs text-red-400 bg-red-950/20 px-2 py-1 rounded">
                Insufficient resources
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}