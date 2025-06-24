import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCombat } from '@/hooks/useCombat';
import { useCombatSounds } from '@/hooks/useCombatSounds';
import { useGameStore } from '@/store/game-store';
import { ActionSelector } from './ActionSelector';
import { CombatReflectionModal, type CombatReflectionData } from './CombatReflectionModal';
import type { JournalEntry } from '@/components/JournalModal';
import {
  Sparkles,
  Sword
} from 'lucide-react';

/**
 * CombatOverlay - Main combat UI container for Light & Shadow Combat System
 * 
 * This component provides the primary interface for therapeutic combat encounters,
 * featuring:
 * - Shadow enemy visualization with HP bar
 * - Resource display (Light Points / Shadow Points)
 * - Combat action buttons with validation
 * - Real-time combat log and status effects
 * - Smooth animations and therapeutic messaging
 */

interface CombatOverlayProps {
  /** Optional test ID for testing */
  'data-testid'?: string;
}

export const CombatOverlay = React.memo(function CombatOverlay({ 'data-testid': testId }: CombatOverlayProps = {}) {
  const {
    isActive,
    enemy,
    resources,
    turn,
    statusEffects,
    canUseAction,
    getActionCost,
    getActionDescription,
    isPlayerTurn,
    combatEndStatus,
    executeAction,
    endCombat,
    getTherapeuticInsight
  } = useCombat();

  // Combat sound effects
  const { playVictorySound, playDefeatSound } = useCombatSounds();

  const { addJournalEntry, combat } = useGameStore();

  // State for reflection modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionData, setReflectionData] = useState<CombatReflectionData | null>(null);
  const [combatStartResources, setCombatStartResources] = useState<{ lp: number; sp: number } | null>(null);

  // Track initial resources when combat starts or when combat ends without having started
  useEffect(() => {
    if (isActive && enemy && !combatStartResources) {
      setCombatStartResources({ lp: resources.lp, sp: resources.sp });
    }
    // If combat ends without having started (e.g., in tests), use current resources as start
    if (combatEndStatus.isEnded && enemy && !combatStartResources) {
      setCombatStartResources({ lp: resources.lp, sp: resources.sp });
    }
  }, [isActive, enemy, resources, combatStartResources, combatEndStatus.isEnded]);

  // Play victory/defeat sound when combat ends
  useEffect(() => {
    if (combatEndStatus.isEnded && enemy) {
      const playEndSound = async () => {
        try {
          if (combatEndStatus.victory) {
            await playVictorySound();
          } else {
            await playDefeatSound();
          }
        } catch (error) {
          console.warn('Failed to play combat end sound:', error);
        }
      };

      playEndSound();
    }
  }, [combatEndStatus.isEnded, combatEndStatus.victory, enemy, playVictorySound, playDefeatSound]);

  // Prepare reflection data when combat ends
  useEffect(() => {
    if (combatEndStatus.isEnded && enemy && combatStartResources && !showReflectionModal) {
      const getMostUsedAction = () => {
        if (!combat?.preferredActions) return 'ILLUMINATE';
        const actions = combat.preferredActions;
        return Object.entries(actions).reduce((a, b) => actions[a[0] as keyof typeof actions] > actions[b[0] as keyof typeof actions] ? a : b)[0];
      };

      const lpGained = Math.max(0, resources.lp - combatStartResources.lp);
      const spGained = Math.max(0, resources.sp - combatStartResources.sp);

      const data: CombatReflectionData = {
        enemy,
        victory: combatEndStatus.victory || false,
        turnsElapsed: turn,
        mostUsedAction: getMostUsedAction(),
        lpGained,
        spGained,
        therapeuticInsight: enemy.therapeuticInsight,
        growthMessage: combatEndStatus.victory && enemy.victoryReward
          ? enemy.victoryReward.growthMessage
          : 'Every challenge teaches us something valuable about ourselves.'
      };

      setReflectionData(data);
      setShowReflectionModal(true);
    }
  }, [combatEndStatus, enemy, combatStartResources, resources, turn, combat, showReflectionModal]);

  // Memoized handlers for reflection modal to prevent unnecessary re-renders
  const handleSaveReflection = useCallback((entry: JournalEntry) => {
    addJournalEntry(entry);
    setShowReflectionModal(false);
    // Reset state for next combat
    setCombatStartResources(null);
    setReflectionData(null);
    // Only end combat if it's still active (avoid double-ending)
    if (isActive) {
      endCombat(combatEndStatus.victory || false);
    }
  }, [addJournalEntry, endCombat, combatEndStatus.victory, isActive]);

  const handleSkipReflection = useCallback(() => {
    setShowReflectionModal(false);
    // Reset state for next combat
    setCombatStartResources(null);
    setReflectionData(null);
    // Only end combat if it's still active (avoid double-ending)
    if (isActive) {
      endCombat(combatEndStatus.victory || false);
    }
  }, [endCombat, combatEndStatus.victory, isActive]);

  // Handler for manual combat surrender
  const handleSurrender = useCallback(() => {
    // Only end combat if it's still active (avoid double-ending)
    if (isActive) {
      endCombat(false);
    }
  }, [endCombat, isActive]);

  // Memoized shadow type color calculation to prevent recalculation on every render
  const shadowTypeColor = useMemo(() => {
    if (!enemy) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

    switch (enemy.type) {
      case 'doubt': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'isolation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overwhelm': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'past-pain': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }, [enemy?.type]);

  // Calculate HP percentage for progress bar
  const hpPercentage = useMemo(() => {
    if (!enemy) return 0;
    return Math.max(0, (enemy.currentHP / enemy.maxHP) * 100);
  }, [enemy?.currentHP, enemy?.maxHP]);

  // Don't render if combat is not active or no enemy
  if (!isActive || !enemy) {
    return null;
  }

  // Handle combat end - show reflection modal instead of simple end screen
  if (combatEndStatus.isEnded) {
    return (
      <>
        {/* Reflection Modal */}
        <CombatReflectionModal
          isOpen={showReflectionModal}
          onClose={handleSkipReflection}
          reflectionData={reflectionData}
          onSaveReflection={handleSaveReflection}
          data-testid={testId ? `${testId}-reflection-modal` : 'combat-reflection-modal'}
        />

        {/* Fallback simple end screen if reflection modal is not shown */}
        {!showReflectionModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            data-testid={testId ? `${testId}-end-screen` : 'combat-end-screen'}
          >
            <Card className="mx-4 w-full max-w-md bg-background/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl ${combatEndStatus.victory ? 'text-primary' : 'text-amber-500'}`}>
                  {combatEndStatus.victory ? '✨ Victory!' : '💡 Learning Moment'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  {combatEndStatus.reason || 'Combat has ended.'}
                </p>
                <Button
                  onClick={handleSkipReflection}
                  className="w-full"
                >
                  Continue Journey
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        data-testid={testId || 'combat-overlay'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="combat-title"
        aria-describedby="combat-description"
      >
        <div className="w-full max-w-4xl space-y-4">
          {/* Enemy Display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={shadowTypeColor}>
                      {enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)}
                    </Badge>
                    <CardTitle className="text-xl" id="combat-title">{enemy.name}</CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Turn {turn}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{enemy.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enemy HP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Shadow Strength</span>
                    <span>{enemy.currentHP} / {enemy.maxHP}</span>
                  </div>
                  <Progress
                    value={hpPercentage}
                    className="h-3"
                    data-testid="enemy-hp-bar"
                    aria-label={`${enemy.name} health: ${enemy.currentHP} out of ${enemy.maxHP} points`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resources and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resources Display */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Light Points */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Light Points</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {resources.lp}
                        </p>
                      </div>
                    </div>
                    
                    {/* Shadow Points */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center">
                        <Sword className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Shadow Points</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {resources.sp}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Effects */}
                  {(statusEffects.healingBlocked || statusEffects.lpGenerationBlocked || statusEffects.skipNextTurn) && (
                    <div className="space-y-2">
                      <Separator />
                      <p className="text-sm font-medium text-muted-foreground">Active Effects</p>
                      <div className="flex flex-wrap gap-1">
                        {statusEffects.healingBlocked && (
                          <Badge variant="destructive" className="text-xs">Healing Blocked</Badge>
                        )}
                        {statusEffects.lpGenerationBlocked && (
                          <Badge variant="destructive" className="text-xs">LP Generation Blocked</Badge>
                        )}
                        {statusEffects.skipNextTurn && (
                          <Badge variant="destructive" className="text-xs">Skip Next Turn</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Combat Actions */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ActionSelector
                isPlayerTurn={isPlayerTurn}
                canUseAction={canUseAction}
                getActionCost={getActionCost}
                getActionDescription={getActionDescription}
                onActionSelect={executeAction}
                data-testid="combat-actions"
              />
            </motion.div>

            {/* Surrender Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSurrender}
                className="text-muted-foreground hover:text-destructive hover:border-destructive"
                data-testid="surrender-button"
              >
                Surrender
              </Button>
            </div>
          </div>

          {/* Therapeutic Insight */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm">
              <CardContent className="pt-4">
                <p className="text-sm text-center italic text-muted-foreground" id="combat-description">
                  💡 {getTherapeuticInsight()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default CombatOverlay;
