/* eslint-disable react-hooks/set-state-in-effect -- Virtualization state sync pattern */

import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: 'action' | 'damage' | 'heal' | 'status' | 'turn' | 'system';
  actor: 'player' | 'enemy' | 'system';
  message: string;
  metadata?: {
    damage?: number;
    healing?: number;
    actionType?: string;
    statusEffect?: string;
  };
}

interface CombatLogProps {
  entries: CombatLogEntry[];
  maxVisible?: number;
  autoScroll?: boolean;
  className?: string;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  entries,
  maxVisible = 50,
  autoScroll = true,
  className,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [visibleEntries, setVisibleEntries] = useState<CombatLogEntry[]>([]);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(autoScroll);

  // Simple virtualization: only show the last maxVisible entries

  useEffect(() => {
    const startIndex = Math.max(0, entries.length - maxVisible);
    setVisibleEntries(entries.slice(startIndex));
  }, [entries, maxVisible]);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (shouldAutoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [visibleEntries, shouldAutoScroll]);

  const getEntryIcon = (entry: CombatLogEntry) => {
    switch (entry.type) {
      case 'action':
        return entry.actor === 'player' ? '⚔️' : '👹';
      case 'damage':
        return '💥';
      case 'heal':
        return '💚';
      case 'status':
        return '✨';
      case 'turn':
        return '🔄';
      case 'system':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const getEntryStyles = (entry: CombatLogEntry) => {
    switch (entry.type) {
      case 'action':
        return entry.actor === 'player' ? 'text-blue-300' : 'text-red-300';
      case 'damage':
        return 'text-red-400 font-medium';
      case 'heal':
        return 'text-green-400 font-medium';
      case 'status':
        return 'text-purple-300';
      case 'turn':
        return 'text-yellow-300 font-medium';
      case 'system':
        return 'text-gray-400 italic';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleScroll = (event: React.UIEvent) => {
    const target = event.currentTarget;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10;
    setShouldAutoScroll(isAtBottom);
  };

  return (
    <div
      className={cn('rounded-lg border border-gray-700 bg-black/80', 'backdrop-blur-sm', className)}
    >
      <div className="border-b border-gray-700 bg-gray-800/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Combat Log</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{entries.length} entries</span>
            {!shouldAutoScroll && (
              <button
                onClick={() => {
                  setShouldAutoScroll(true);
                  if (scrollAreaRef.current) {
                    const scrollContainer = scrollAreaRef.current.querySelector(
                      '[data-radix-scroll-area-viewport]',
                    );
                    if (scrollContainer) {
                      scrollContainer.scrollTop = scrollContainer.scrollHeight;
                    }
                  }
                }}
                className="text-xs text-blue-400 transition-colors hover:text-blue-300"
              >
                ↓ Jump to Bottom
              </button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="h-64 p-3" onScrollCapture={handleScroll}>
        <div className="space-y-2">
          {visibleEntries.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <div className="mb-2 text-2xl">⚔️</div>
              <div className="text-sm">Combat log is empty</div>
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-start space-x-2 text-sm',
                  'rounded px-2 py-1 transition-colors hover:bg-white/5',
                  getEntryStyles(entry),
                )}
              >
                <div className="mt-0.5 shrink-0 text-xs">{getEntryIcon(entry)}</div>
                <div className="min-w-0 flex-1">
                  <div className="break-words">{entry.message}</div>
                  {entry.metadata && (
                    <div className="mt-1 text-xs text-gray-500">
                      {entry.metadata.damage && `Damage: ${entry.metadata.damage}`}
                      {entry.metadata.healing && `Healing: ${entry.metadata.healing}`}
                      {entry.metadata.statusEffect && `Status: ${entry.metadata.statusEffect}`}
                    </div>
                  )}
                </div>
                <div className="shrink-0 font-mono text-xs text-gray-500">
                  {formatTimestamp(entry.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
