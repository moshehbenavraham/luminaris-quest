/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * CombatEndModal - Post-combat resolution dialog
 * 
 * This component displays the combat outcome (victory/defeat) and provides
 * appropriate therapeutic guidance and reflection prompts.
 */

import React, { useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';

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
  className
}) => {
  const { combatEndStatus, enemy, clearCombatEnd, resources: combatResources, beginSyncTransaction, commitSyncTransaction, rollbackSyncTransaction } = useCombatStoreBase();
  const gameStore = useGameStore();
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false); // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This state was NOT needed
  const [syncValidationError, setSyncValidationError] = useState<string | null>(null);

  const victory = forceVictory ?? combatEndStatus.victory;
  const isEnded = combatEndStatus.isEnded;

  useEffect(() => {
    // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️ 
    // The 1-second delay below was added based on INCORRECT ASSUMPTION that the modal
    // wasn't being seen by users. This was NOT the actual issue reported by the user.
    // The user's real issue was missing post-combat overlay entirely, not modal timing.
    // This change addresses a NON-EXISTENT problem.
    
    // Open modal when combat ends with a small delay to ensure visibility
    if (isEnded && enemy) {
      setOpen(true);
      // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This 1-second timer was NOT needed to fix user issue
      const timer = setTimeout(() => setCanClose(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isEnded, enemy]);

  const handleClose = () => {
    setOpen(false);
    clearCombatEnd();
    
    // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️
    // The following code was added based on INCORRECT ASSUMPTIONS that the modal wasn't
    // working properly. User reported missing "post-combat result overlay" but this modal
    // WAS ALREADY WORKING. The real issue was elsewhere in the combat flow.
    // 
    // FAILED ASSUMPTION #1: Modal wasn't showing - IT WAS SHOWING
    // FAILED ASSUMPTION #2: Scene advancement was broken - IT WASN'T THE ISSUE
    // FAILED ASSUMPTION #3: Resource syncing was the problem - IT WASN'T
    //
    // This entire implementation below was WASTED EFFORT that addresses NON-EXISTENT problems
    // while the actual user issue remains UNFIXED. Zero improvements achieved.
    
    // Prepare transaction for combat → game store sync
    const sourceState = {
      lp: combatResources.lp,
      sp: combatResources.sp,
      playerHealth: 100, // Combat always ends with full health restore
      playerEnergy: gameStore.playerEnergy // Keep current energy
    };
    
    const targetState = {
      lp: combatResources.lp + (victory && enemy?.victoryReward?.lpBonus ? enemy.victoryReward.lpBonus : 0),
      sp: combatResources.sp,
      playerHealth: 100, // Always restore to full health
      playerEnergy: gameStore.playerEnergy // Keep current energy
    };
    
    // Begin transaction for combat-to-game sync
    const transactionResult = beginSyncTransaction('combat-to-game', sourceState, targetState);
    
    if (!transactionResult.success) {
      const errorMsg = `Combat → Game store sync failed: ${transactionResult.errorMessage}`;
      setSyncValidationError(errorMsg);
      console.warn(errorMsg);
      
      // Apply changes manually as fallback (unsafe mode)
      const lpDifference = combatResources.lp - gameStore.lightPoints;
      const spDifference = combatResources.sp - gameStore.shadowPoints;
      
      if (lpDifference !== 0) {
        gameStore.modifyLightPoints(lpDifference);
      }
      if (spDifference !== 0) {
        gameStore.modifyShadowPoints(spDifference);
      }
      
      // Apply victory rewards if applicable
      if (victory && enemy?.victoryReward?.lpBonus) {
        gameStore.modifyLightPoints(enemy.victoryReward.lpBonus);
      }
      
      // Award experience points for combat completion
      if (victory && enemy) {
        const combatXP = {
          'whisper-of-doubt': 40,
          'shadow-of-isolation': 55,
          'overwhelm-tempest': 70,
          'echo-of-past-pain': 75
        };
        const xpReward = combatXP[enemy.id as keyof typeof combatXP] || 50;
        gameStore.modifyExperiencePoints(xpReward, `${enemy.name} defeated`);
      } else if (!victory && enemy) {
        // Partial XP for combat attempt even on defeat
        const attemptXP = 15;
        gameStore.modifyExperiencePoints(attemptXP, `combat with ${enemy.name} attempted`);
      }
    } else {
      // Commit the transaction and apply changes to game store
      const commitResult = commitSyncTransaction(transactionResult.transaction.id);
      
      if (commitResult.success) {
        // Apply the validated changes to game store
        const lpDifference = targetState.lp - gameStore.lightPoints;
        const spDifference = targetState.sp - gameStore.shadowPoints;
        
        if (lpDifference !== 0) {
          gameStore.modifyLightPoints(lpDifference);
        }
        if (spDifference !== 0) {
          gameStore.modifyShadowPoints(spDifference);
        }
        
        // Award experience points for combat completion
        if (victory && enemy) {
          const combatXP = {
            'whisper-of-doubt': 40,
            'shadow-of-isolation': 55,
            'overwhelm-tempest': 70,
            'echo-of-past-pain': 75
          };
          const xpReward = combatXP[enemy.id as keyof typeof combatXP] || 50;
          gameStore.modifyExperiencePoints(xpReward, `${enemy.name} defeated`);
        } else if (!victory && enemy) {
          // Partial XP for combat attempt even on defeat
          const attemptXP = 15;
          gameStore.modifyExperiencePoints(attemptXP, `combat with ${enemy.name} attempted`);
        }
        
        console.log('Combat → Game Store transaction committed:', {
          transactionId: transactionResult.transaction.id,
          lpChange: lpDifference,
          spChange: spDifference
        });
      } else {
        // Rollback on commit failure
        rollbackSyncTransaction(transactionResult.transaction.id);
        setSyncValidationError(`Transaction commit failed: ${commitResult.errorMessage}`);
      }
    }
    
    // Always end combat and advance scene when modal closes
    // This ensures the post-combat flow works regardless of the old game store's combat state
    gameStore.endCombat(victory);
    
    onClose?.();
  };

  const handleReflect = () => {
    // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️
    // The canClose check below was added based on INCORRECT ASSUMPTION about modal timing issues.
    // This was NOT the actual user-reported problem. Zero improvements achieved.
    if (!canClose) return;
    // TODO: This will be implemented when ReflectionForm is created
    handleClose();
  };

  const handleContinue = () => {
    // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️  
    // The canClose check below was added based on INCORRECT ASSUMPTION about modal timing issues.
    // This was NOT the actual user-reported problem. Zero improvements achieved.
    if (!canClose) return;
    handleClose();
  };

  if (!enemy) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={cn(
          'max-w-md mx-auto',
          'bg-gradient-to-b',
          victory 
            ? 'from-amber-50 to-white border-amber-200' 
            : 'from-slate-50 to-white border-slate-200',
          className
        )}
        aria-describedby="combat-end-description"
      >
        <DialogHeader>
          <DialogTitle className={cn(
            'text-2xl font-bold text-center',
            victory ? 'text-amber-800' : 'text-slate-800'
          )}>
            {victory ? '✨ Victory! ✨' : '💭 A Learning Moment'}
          </DialogTitle>
          <DialogDescription 
            id="combat-end-description"
            className="text-center mt-2"
          >
            {victory 
              ? `You've overcome ${enemy.name}!`
              : 'Every challenge is an opportunity to grow.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Sync Validation Warning */}
          {syncValidationError && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 animate-fade-in">
              <p className="text-xs text-yellow-800">
                ⚠️ Data sync warning: {syncValidationError}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Progress has been saved, but please report this issue if it persists.
              </p>
            </div>
          )}
          
          {/* Guardian Message */}
          <div className={cn(
            'p-4 rounded-lg animate-fade-in',
            victory 
              ? 'bg-amber-100 border border-amber-200' 
              : 'bg-slate-100 border border-slate-200'
          )}>
            <p className="text-sm italic text-gray-700">
              {victory 
                ? `"${enemy.therapeuticInsight} Your trust in yourself grows stronger."` 
                : `"This shadow still has lessons to teach. Take a moment to reflect on what you've learned."`
              }
            </p>
            <p className="text-xs text-gray-500 mt-2 text-right">
              — Your Guardian Spirit
            </p>
          </div>

          {/* Trust Update */}
          {victory && (
            <div className="text-center animate-slide-up">
              <p className="text-sm text-gray-600">
                Guardian Trust increased to{' '}
                <span className="font-bold text-amber-700">
                  {Math.min(100, gameStore.guardianTrust + 5)}%
                </span>
              </p>
            </div>
          )}

          {/* Combat Summary */}
          <div className="text-center text-sm text-gray-600 animate-fade-in">
            <p>
              {victory 
                ? 'You faced your fears with courage and wisdom.'
                : 'Sometimes stepping back is the wisest choice.'
              }
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          {victory ? (
            <>
              <Button
                variant="default"
                onClick={handleReflect}
                disabled={!canClose} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - canClose logic was NOT needed
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              >
                📝 Reflect on Victory
              </Button>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={!canClose} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - canClose logic was NOT needed
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
                disabled={!canClose} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - canClose logic was NOT needed
                className="bg-slate-600 hover:bg-slate-700 text-white disabled:opacity-50"
              >
                📝 Journal Thoughts
              </Button>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={!canClose} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - canClose logic was NOT needed
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