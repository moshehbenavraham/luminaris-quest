/* eslint-disable react-hooks/set-state-in-effect -- Combat end modal state sync pattern */
/* eslint-disable @typescript-eslint/no-explicit-any -- Combat history insert requires flexible type for Supabase */

/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * CombatEndModal - Post-combat resolution dialog
 *
 * This component displays the combat outcome (victory/defeat) and provides
 * appropriate therapeutic guidance and reflection prompts.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCombatStore as useCombatStoreBase } from '../../store/combat-store';
import { useGameStore } from '@/store/game-store';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { createLogger } from '@/lib/environment';

const logger = createLogger('CombatEndModal');

interface CombatEndModalProps {
  /** Override for victory/defeat state (for testing) */
  forceVictory?: boolean;
  /** Callback when modal is closed */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const CombatEndModal: React.FC<CombatEndModalProps> = ({
  forceVictory,
  onClose,
  className,
}) => {
  const {
    combatEndStatus,
    enemy,
    clearCombatEnd,
    resources: combatResources,
    turn,
    preferredActions,
    playerHealth,
    log,
  } = useCombatStoreBase();
  const gameStore = useGameStore();
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);

  // Capture resources at combat start for history tracking
  const initialResourcesRef = useRef<{ lp: number; sp: number } | null>(null);

  const victory = forceVictory ?? combatEndStatus.victory;
  const isEnded = combatEndStatus.isEnded;

  // Open modal when combat ends with a small delay to ensure visibility
  useEffect(() => {
    if (isEnded && enemy) {
      // Capture initial resources for combat history
      if (!initialResourcesRef.current) {
        initialResourcesRef.current = {
          lp: combatResources.lp,
          sp: combatResources.sp,
        };
      }

      setOpen(true);
      const timer = setTimeout(() => setCanClose(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isEnded, enemy, combatResources.lp, combatResources.sp]);

  /**
   * Saves combat history to Supabase for therapeutic analytics and battle replay
   */
  const saveCombatHistory = async () => {
    if (!enemy) return;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        logger.warn('No authenticated user, skipping combat history save');
        return;
      }

      const combatHistoryEntry = {
        user_id: user.id,
        enemy_id: enemy.id,
        enemy_name: enemy.name,
        victory,
        turns_taken: turn,
        final_player_hp: playerHealth,
        final_enemy_hp: enemy.currentHP ?? 0,
        resources_start: initialResourcesRef.current ?? {
          lp: combatResources.lp,
          sp: combatResources.sp,
        },
        resources_end: { lp: combatResources.lp, sp: combatResources.sp },
        actions_used: preferredActions,
        combat_log: log,
        player_level: gameStore.playerLevel,
        scene_index: gameStore.currentSceneIndex,
      };

      const { error } = await supabase.from('combat_history').insert(combatHistoryEntry as any);

      if (error) {
        logger.error('Failed to save combat history', error);
        // Don't block the modal close - this is a non-critical save
      } else {
        logger.info('Combat history saved successfully', {
          enemyId: enemy.id,
          victory,
          turns: turn,
        });
      }
    } catch (error) {
      logger.error('Combat history save threw exception', error);
      // Don't block the modal close - this is a non-critical save
    }

    // Reset the ref for next combat
    initialResourcesRef.current = null;
  };

  const handleClose = () => {
    setOpen(false);
    clearCombatEnd();

    // Resources are already synced to shared store via combat-store.endCombat()
    // Just apply victory rewards and update game state

    // Apply victory LP bonus if applicable
    if (victory && enemy?.victoryReward?.lpBonus) {
      gameStore.modifyLightPoints(enemy.victoryReward.lpBonus);
    }

    // Award experience points for combat completion
    if (victory && enemy) {
      const combatXP = {
        'whisper-of-doubt': 40,
        'shadow-of-isolation': 55,
        'overwhelm-tempest': 70,
        'echo-of-past-pain': 75,
      };
      const xpReward = combatXP[enemy.id as keyof typeof combatXP] || 50;
      gameStore.modifyExperiencePoints(xpReward, `${enemy.name} defeated`);
    } else if (!victory && enemy) {
      // Partial XP for combat attempt even on defeat
      const attemptXP = 15;
      gameStore.modifyExperiencePoints(attemptXP, `combat with ${enemy.name} attempted`);
    }

    // Sync combat statistics to game store for therapeutic analytics persistence
    gameStore.updateCombatStatistics(preferredActions, victory, turn);

    // Save combat history to Supabase for therapeutic analytics
    // This is fire-and-forget - don't block the close on save completion
    saveCombatHistory();

    // Always end combat and advance scene when modal closes
    gameStore.endCombat(victory);

    onClose?.();
  };

  const handleReflect = () => {
    if (!canClose) return;
    // TODO: This will be implemented when ReflectionForm is created
    handleClose();
  };

  const handleContinue = () => {
    if (!canClose) return;
    handleClose();
  };

  if (!enemy) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          'mx-auto max-w-md',
          'bg-gradient-to-b',
          victory
            ? 'border-amber-200 from-amber-50 to-white'
            : 'border-slate-200 from-slate-50 to-white',
          className,
        )}
        aria-describedby="combat-end-description"
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              'text-center text-2xl font-bold',
              victory ? 'text-amber-800' : 'text-slate-800',
            )}
          >
            {victory ? '✨ Victory! ✨' : '💭 A Learning Moment'}
          </DialogTitle>
          <DialogDescription id="combat-end-description" className="mt-2 text-center">
            {victory
              ? `You've overcome ${enemy.name}!`
              : 'Every challenge is an opportunity to grow.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Guardian Message */}
          <div
            className={cn(
              'animate-fade-in rounded-lg p-4',
              victory
                ? 'border border-amber-200 bg-amber-100'
                : 'border border-slate-200 bg-slate-100',
            )}
          >
            <p className="text-sm text-gray-700 italic">
              {victory
                ? `"${enemy.therapeuticInsight} Your trust in yourself grows stronger."`
                : `"This shadow still has lessons to teach. Take a moment to reflect on what you've learned."`}
            </p>
            <p className="mt-2 text-right text-xs text-gray-500">— Your Guardian Spirit</p>
          </div>

          {/* Trust Update */}
          {victory && (
            <div className="animate-slide-up text-center">
              <p className="text-sm text-gray-600">
                Guardian Trust increased to{' '}
                <span className="font-bold text-amber-700">
                  {Math.min(100, gameStore.guardianTrust + 5)}%
                </span>
              </p>
            </div>
          )}

          {/* Combat Summary */}
          <div className="animate-fade-in text-center text-sm text-gray-600">
            <p>
              {victory
                ? 'You faced your fears with courage and wisdom.'
                : 'Sometimes stepping back is the wisest choice.'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-center">
          {victory ? (
            <>
              <Button
                variant="default"
                onClick={handleReflect}
                disabled={!canClose}
                className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                📝 Reflect on Victory
              </Button>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={!canClose}
                className="border-amber-300 hover:bg-amber-50 disabled:opacity-50"
              >
                Continue Journey
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                onClick={handleReflect}
                disabled={!canClose}
                className="bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
              >
                📝 Journal Thoughts
              </Button>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={!canClose}
                className="border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                Rest & Recover
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
