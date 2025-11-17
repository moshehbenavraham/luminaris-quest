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
  Sword,
  Heart,
  Zap
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
    log,
    statusEffects,
    canUseAction,
    getActionCost,
    getActionDescription,
    isPlayerTurn,
    combatEndStatus,
    executeAction,
    playerHealth,
    playerLevel,
    endCombat,
    endTurn,
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
  }, [enemy]);

  // Keyboard shortcut handler for End Turn (key 5)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPlayerTurn || !isActive) return;

      if (event.key === '5' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        endTurn();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlayerTurn, isActive, endTurn]);

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
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            data-testid={testId ? `${testId}-end-screen` : 'combat-end-screen'}
          >
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm">
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
            </div>
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
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        data-testid={testId || 'combat-overlay'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="combat-title"
        aria-describedby="combat-description"
      >
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Enemy Display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background/95 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={shadowTypeColor}>
                      {enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)}
                    </Badge>
                    <CardTitle className="text-xl text-white font-bold" id="combat-title">{enemy.name}</CardTitle>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    isPlayerTurn
                      ? 'text-primary bg-primary/10 border border-primary/20'
                      : 'text-purple-400 bg-purple-500/10 border border-purple-500/20 animate-pulse'
                  }`}>
                    {isPlayerTurn ? '✨ Your Turn' : '🌑 Shadow\'s Turn'} (Turn {turn})
                  </div>
                </div>
                <p className="text-sm text-white/90">{enemy.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enemy HP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white">
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

                {/* Recent Combat Action - Simple text display */}
                {log.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-200">
                      <span className="font-medium">
                        {log[log.length - 1].actor === 'PLAYER' ? 'You' : enemy.name}:
                      </span>
                      <span className="ml-2 text-gray-300">
                        {log[log.length - 1].message}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resources and Actions - Mobile-First Layout */}
          <div className="space-y-6">
            {/* Resources Display - Mobile-First */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white font-bold">Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile-First: Stack resources vertically on small screens, 2 columns on larger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Health */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Health</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          {playerHealth}
                        </p>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {playerLevel}
                        </p>
                      </div>
                    </div>

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
                onEndTurn={endTurn} // Pass the endTurn function
                data-testid="combat-actions"
              />
            </motion.div>

            {/* Combat Control Buttons - Mobile-First */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-3 pt-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={endTurn}
                disabled={!isPlayerTurn}
                className="text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-50 w-full sm:w-auto"
                data-testid="end-turn-button"
                title="End Turn - Press 5 to use"
              >
                End Turn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSurrender}
                className="text-muted-foreground hover:text-destructive hover:border-destructive w-full sm:w-auto"
                data-testid="surrender-button"
              >
                Surrender
              </Button>
            </motion.div>
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default CombatOverlay;
