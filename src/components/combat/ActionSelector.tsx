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

import React, { useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  RotateCcw, 
  Shield, 
  Heart,
  Zap,
  Hourglass
} from 'lucide-react';
import type { CombatAction } from '@/store/game-store';

/**
 * ActionSelector - Combat action selection component for Light & Shadow Combat System
 * 
 * This component provides the interface for selecting therapeutic combat actions,
 * featuring:
 * - All 4 combat actions (ILLUMINATE, REFLECT, ENDURE, EMBRACE)
 * - An "End Turn" button to cede the turn to the shadow
 * - Enhanced keyboard shortcuts (1-5 keys)
 * - Action tooltips and enhanced descriptions
 * - Resource cost display and validation
 * - Responsive design with accessibility compliance
 */

interface ActionSelectorProps {
  /** Whether it's currently the player's turn */
  isPlayerTurn: boolean;
  /** Function to check if an action can be used */
  canUseAction: (_action: CombatAction) => boolean;
  /** Function to get action resource cost */
  getActionCost: (_action: CombatAction) => { lp?: number; sp?: number };
  /** Function to get action description */
  getActionDescription: (_action: CombatAction) => string;
  /** Function to execute an action */
  onActionSelect: (_action: CombatAction) => void;
  /** Function to end the player's turn */
  onEndTurn: () => void;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

const COMBAT_ACTIONS: CombatAction[] = ['ILLUMINATE', 'REFLECT', 'ENDURE', 'EMBRACE'];

export const ActionSelector = React.memo(function ActionSelector({
  isPlayerTurn,
  canUseAction,
  getActionCost,
  getActionDescription,
  onActionSelect,
  onEndTurn,
  'data-testid': testId
}: ActionSelectorProps) {

  // Memoized action icon mapping to prevent recreation on every render
  const getActionIcon = useMemo(() => {
    const iconMapper = (action: CombatAction | 'END_TURN') => {
      switch (action) {
        case 'ILLUMINATE': return <Eye className="w-4 h-4" />;
        case 'REFLECT': return <RotateCcw className="w-4 h-4" />;
        case 'ENDURE': return <Shield className="w-4 h-4" />;
        case 'EMBRACE': return <Heart className="w-4 h-4" />;
        case 'END_TURN': return <Hourglass className="w-4 h-4" />;
        default: return <Zap className="w-4 h-4" />;
      }
    };
    return iconMapper;
  }, []);

  // Memoized action color mapping
  const getActionColor = useMemo(() => (action: CombatAction | 'END_TURN') => {
    switch (action) {
      case 'ILLUMINATE': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'REFLECT': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'ENDURE': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'EMBRACE': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'END_TURN': return 'bg-gray-500 hover:bg-gray-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  }, []);

  // Memoized keyboard shortcut mapping
  const getActionKeyboardShortcut = useMemo(() => (action: CombatAction | 'END_TURN') => {
    switch (action) {
      case 'ILLUMINATE': return '1';
      case 'REFLECT': return '2';
      case 'ENDURE': return '3';
      case 'EMBRACE': return '4';
      case 'END_TURN': return '5';
      default: return '';
    }
  }, []);

  const handleActionClick = useCallback((action: CombatAction) => {
    if (canUseAction(action) && isPlayerTurn) {
      onActionSelect(action);
    }
  }, [canUseAction, isPlayerTurn, onActionSelect]);

  const handleEndTurnClick = useCallback(() => {
    if (isPlayerTurn) {
      onEndTurn();
    }
  }, [isPlayerTurn, onEndTurn]);

  // Enhanced keyboard shortcuts (1-5)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts during player turn
      if (!isPlayerTurn) return;
      
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyToAction: Record<string, CombatAction | 'END_TURN'> = {
        '1': 'ILLUMINATE',
        '2': 'REFLECT', 
        '3': 'ENDURE',
        '4': 'EMBRACE',
        '5': 'END_TURN'
      };

      const action = keyToAction[event.key];
      if (action) {
        event.preventDefault();
        if (action === 'END_TURN') {
          handleEndTurnClick();
        } else if (canUseAction(action)) {
          handleActionClick(action);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlayerTurn, canUseAction, handleActionClick, handleEndTurnClick]);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      data-testid={testId || 'action-selector'}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white font-bold">
            {isPlayerTurn ? 'Choose Your Response' : 'Shadow\'s Turn'}
          </CardTitle>
          {isPlayerTurn && (
            <p className="text-xs text-muted-foreground">
              Use keyboard shortcuts: 1-5 keys
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {COMBAT_ACTIONS.map((action) => {
            const cost = getActionCost(action);
            const canUse = canUseAction(action);
            const description = getActionDescription(action);
            const shortcut = getActionKeyboardShortcut(action);
            
            return (
              <Button
                key={action}
                onClick={() => handleActionClick(action)}
                disabled={!canUse || !isPlayerTurn}
                aria-disabled={!canUse || !isPlayerTurn}
                className={`w-full h-auto p-4 justify-start ${getActionColor(action)} disabled:opacity-50`}
                variant="outline"
                data-testid={`action-${action.toLowerCase()}`}
                title={`${action} - Press ${shortcut} to use`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(action)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action}</span>
                        <span className="text-xs opacity-60 bg-black/20 px-1.5 py-0.5 rounded">
                          {shortcut}
                        </span>
                      </div>
                      {(cost.lp || cost.sp) && (
                        <span className="text-xs opacity-75">
                          {cost.lp && `${cost.lp} LP`}
                          {cost.lp && cost.sp && ' • '}
                          {cost.sp && `${cost.sp} SP`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}


        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ActionSelector;
