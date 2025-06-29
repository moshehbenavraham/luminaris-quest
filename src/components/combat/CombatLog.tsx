// Built with Bolt.new
/**
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 * 
 * This file is part of the DEPRECATED combat system.
 * It only exists for backwards compatibility when using ?legacyCombat=1
 * 
 * DO NOT USE THIS FILE FOR NEW DEVELOPMENT!
 * 
 * For new development, use the NEW combat system at:
 * → /src/features/combat/
 * 
 * See COMBAT_MIGRATION_GUIDE.md for migration details.
 * 
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Download, Copy, Scroll } from 'lucide-react';
import { useCombat } from '../../hooks/useCombat';
// Simplified log entry type that matches what useCombat returns
type SimpleCombatLogEntry = {
  turn: number;
  actor: 'PLAYER' | 'SHADOW';
  action: string;
  effect: string;
  message: string;
};

/**
 * CombatLog - Turn narrative display component for Light & Shadow Combat System
 * 
 * This component provides a scrollable combat log with turn history, featuring:
 * - Animated log entries with therapeutic messaging
 * - Real-time combat narrative tracking
 * - Export/save combat session functionality
 * - Mobile-first responsive design
 * - Accessibility compliance (WCAG 2.1 AA)
 */

interface CombatLogProps {
  /** Whether to show the export functionality */
  showExport?: boolean;
  /** Maximum height for the log container */
  maxHeight?: string;
  /** Optional test ID for testing */
  'data-testid'?: string;
  /** Optional CSS class name */
  className?: string;
}

export const CombatLog = React.memo(function CombatLog({
  showExport = true,
  maxHeight = '400px',
  'data-testid': testId,
  className = ''
}: CombatLogProps) {
  const { log, enemy, turn, isActive } = useCombat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (isAutoScrollEnabled && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [log.length, isAutoScrollEnabled]);

  // Memoized export combat log function to prevent recreation on every render
  const exportCombatLog = useCallback(() => {
    if (!enemy || log.length === 0) return;

    const logText = [
      `=== Combat Log: ${enemy.name} ===`,
      `Date: ${new Date().toLocaleString()}`,
      `Total Turns: ${turn}`,
      '',
      ...log.map(entry =>
        `Turn ${entry.turn} - ${entry.actor}: ${entry.action}\n` +
        `Effect: ${entry.effect}\n` +
        `Message: ${entry.message}\n`
      ),
      '',
      '=== End of Combat Log ==='
    ].join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combat-log-${enemy.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [enemy, log, turn]);

  // Memoized copy combat log function
  const copyCombatLog = useCallback(async () => {
    if (!enemy || log.length === 0) return;

    const logText = log.map(entry =>
      `Turn ${entry.turn} - ${entry.actor}: ${entry.message}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      // Could add a toast notification here in the future
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  }, [enemy, log]);

  // Memoized entry styling function to prevent recalculation
  const getEntryStyle = useMemo(() => (entry: SimpleCombatLogEntry) => {
    switch (entry.actor) {
      case 'PLAYER':
        return {
          borderColor: 'border-primary/30',
          bgColor: 'bg-primary/5',
          textColor: 'text-primary',
          icon: '✨'
        };
      case 'SHADOW':
        return {
          borderColor: 'border-purple-500/30',
          bgColor: 'bg-purple-500/5',
          textColor: 'text-purple-600',
          icon: '🌑'
        };
      default:
        return {
          borderColor: 'border-muted',
          bgColor: 'bg-muted/20',
          textColor: 'text-muted-foreground',
          icon: '📝'
        };
    }
  }, []);

  // Memoized toggle auto-scroll function
  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(!isAutoScrollEnabled);
  }, [isAutoScrollEnabled]);

  // Don't render if combat is not active
  if (!isActive || !enemy) {
    return null;
  }

  return (
    <Card className={`bg-background/95 backdrop-blur-sm border-border/50 ${className}`} data-testid={testId || 'combat-log'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold tracking-tight text-lg combat-text-light flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Combat Log
          </h3>
          {showExport && log.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyCombatLog}
                className="h-8 px-2"
                data-testid="copy-log-button"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCombatLog}
                className="h-8 px-2"
                data-testid="export-log-button"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            Turn {turn}
          </Badge>
          <span>vs {enemy.name}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea 
          className="w-full rounded-md border" 
          style={{ height: maxHeight }}
          ref={scrollAreaRef}
          data-testid="combat-log-scroll-area"
        >
          <div className="p-4 space-y-3">
            {log.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Scroll className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Combat log will appear here...</p>
              </div>
            ) : (
              <AnimatePresence>
                {log.map((entry, index) => {
                  const style = getEntryStyle(entry);
                  return (
                    <motion.div
                      key={`${entry.turn}-${entry.actor}-${index}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      className={`
                        p-3 rounded-lg border ${style.borderColor} ${style.bgColor}
                        transition-all duration-200 hover:shadow-sm
                      `}
                      data-testid={`combat-log-entry-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {style.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${style.textColor} border-current`}
                            >
                              Turn {entry.turn}
                            </Badge>
                            <span className={`text-sm font-medium ${style.textColor}`}>
                              {entry.actor === 'PLAYER' ? 'You' : enemy.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.action}
                            </span>
                          </div>
                          <p className="text-sm combat-text-shadow leading-relaxed">
                            {entry.message}
                          </p>
                          {entry.effect && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {entry.effect}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
        
        {/* Auto-scroll toggle */}
        {log.length > 3 && (
          <div className="flex justify-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoScroll}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="auto-scroll-toggle"
            >
              Auto-scroll: {isAutoScrollEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default CombatLog;
