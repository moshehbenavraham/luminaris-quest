/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * CombatReflectionModal - Comprehensive post-combat resolution dialog
 *
 * This component displays detailed combat results and provides journaling
 * functionality for therapeutic reflection after combat.
 *
 * Fixed 2025-12-16: Root cause was hydration race condition in useCombatStore.
 * When the modal mounted, useCombatStore returned enemy: null during hydration,
 * causing reflectionData to be null and the modal to render nothing.
 * Solution: Combat data is now passed as a snapshot prop from CombatOverlay,
 * bypassing the hydration safety defaults that caused the issue.
 *
 * Refactored 2025-12-17: Extracted sub-components to reduce file size from
 * 545 lines to <250 lines per component guideline (Issue #18 in audit).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle } from 'lucide-react';
import { useCombatStore } from '../../hooks/useCombatStore';
import { useGameStore } from '@/store/game-store';
import {
  getTherapeuticPrompts,
  getContextualMessage,
  linkJournalToCombatHistory,
} from '../../utils';
import { CombatSummaryCard } from './CombatSummaryCard';
import { TherapeuticPromptsCard } from './TherapeuticPromptsCard';
import { ReflectionTextCard } from './ReflectionTextCard';
import type { CombatAction, JournalEntry, ShadowManifestation } from '@/types';

/**
 * Snapshot of combat state at the moment combat ends.
 * Passed as a prop to avoid hydration race conditions.
 */
export interface CombatEndSnapshot {
  enemy: ShadowManifestation;
  victory: boolean;
  reason: string;
  resources: { lp: number; sp: number };
  playerHealth: number;
  playerEnergy: number;
  turn: number;
  preferredActions: Record<CombatAction, number>;
}

export interface CombatReflectionData {
  enemy: ShadowManifestation;
  victory: boolean;
  turnsElapsed: number;
  mostUsedAction: string;
  lpGained: number;
  spGained: number;
  energyLost: number;
  therapeuticInsight: string;
  growthMessage: string;
  startingResources: {
    lp: number;
    sp: number;
    energy: number;
  };
  endingResources: {
    lp: number;
    sp: number;
    energy: number;
  };
}

interface CombatReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  combatSnapshot: CombatEndSnapshot;
  'data-testid'?: string;
}

export const CombatReflectionModal: React.FC<CombatReflectionModalProps> = React.memo(
  function CombatReflectionModal({ isOpen, onClose, combatSnapshot, 'data-testid': testId }) {
    const { clearCombatEnd, lastCombatHistoryId } = useCombatStore();
    const gameStore = useGameStore();

    const [reflectionText, setReflectionText] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);

    // Calculate combat statistics using snapshot data (avoids hydration race condition)
    const reflectionData = useMemo(() => {
      const {
        enemy,
        victory,
        resources: endingResources,
        turn,
        preferredActions,
        playerEnergy,
      } = combatSnapshot;

      // Find most used action
      let mostUsedAction = 'ENDURE';
      let maxCount = 0;
      Object.entries(preferredActions).forEach(([action, count]) => {
        if (count > maxCount) {
          mostUsedAction = action;
          maxCount = count;
        }
      });

      // Calculate resource changes
      const startingLp = gameStore.lightPoints;
      const startingSp = gameStore.shadowPoints;
      const startingEnergy = gameStore.playerEnergy;

      const lpGained = endingResources.lp - startingLp;
      const spGained = endingResources.sp - startingSp;
      const energyLost = Math.max(0, startingEnergy - playerEnergy);

      return {
        enemy,
        victory,
        turnsElapsed: turn,
        mostUsedAction: mostUsedAction.charAt(0) + mostUsedAction.slice(1).toLowerCase(),
        lpGained: Math.max(0, lpGained),
        spGained: Math.max(0, spGained),
        energyLost,
        therapeuticInsight: enemy.therapeuticInsight,
        growthMessage: enemy.victoryReward.growthMessage,
        startingResources: { lp: startingLp, sp: startingSp, energy: startingEnergy },
        endingResources: { lp: endingResources.lp, sp: endingResources.sp, energy: playerEnergy },
      } as CombatReflectionData;
    }, [combatSnapshot, gameStore]);

    // Reset state when modal opens/closes
    useEffect(() => {
      if (isOpen) {
        setReflectionText('');
        setSelectedPrompt(null);
        setIsSaving(false);
        setShowPrompts(true);
      }
    }, [isOpen]);

    // Memoized therapeutic prompts and contextual message
    const therapeuticPrompts = useMemo(
      () => getTherapeuticPrompts(reflectionData.enemy.type),
      [reflectionData.enemy.type],
    );

    const contextualMessage = useMemo(
      () => getContextualMessage(reflectionData.victory, reflectionData.enemy.type),
      [reflectionData.victory, reflectionData.enemy.type],
    );

    // Handlers
    const handlePromptSelect = useCallback((prompt: string) => {
      setSelectedPrompt(prompt);
      setReflectionText((prev) => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
      setShowPrompts(false);
    }, []);

    const handleClose = useCallback(() => {
      // Apply combat results to game state
      const lpDiff = reflectionData.endingResources.lp - reflectionData.startingResources.lp;
      const spDiff = reflectionData.endingResources.sp - reflectionData.startingResources.sp;

      if (lpDiff !== 0) gameStore.modifyLightPoints(lpDiff);
      if (spDiff !== 0) gameStore.modifyShadowPoints(spDiff);

      if (reflectionData.victory) {
        if (reflectionData.enemy.victoryReward.lpBonus > 0) {
          gameStore.modifyLightPoints(reflectionData.enemy.victoryReward.lpBonus);
        }
        gameStore.setPlayerHealth(100);
        gameStore.advanceScene();
        gameStore.endCombat(true);
      } else {
        const energyPenalty = Math.floor(gameStore.maxPlayerEnergy * 0.2);
        gameStore.modifyPlayerEnergy(-energyPenalty);
        gameStore.setPlayerHealth(100);
        gameStore.endCombat(false);
      }

      clearCombatEnd();
      onClose();
    }, [reflectionData, gameStore, clearCombatEnd, onClose]);

    const handleSave = useCallback(async () => {
      if (!reflectionText.trim()) return;

      setIsSaving(true);

      // Build therapeutic context tags for enhanced tracking
      const therapeuticTags = [
        'combat',
        'reflection',
        reflectionData.enemy.type,
        reflectionData.victory ? 'victory' : 'learning',
        `turns-${reflectionData.turnsElapsed}`,
        `action-${reflectionData.mostUsedAction.toLowerCase()}`,
        `enemy-${reflectionData.enemy.name.toLowerCase().replace(/\s+/g, '-')}`,
      ];

      const journalEntry: JournalEntry = {
        id: `combat-reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'learning',
        trustLevel: gameStore.guardianTrust,
        content: reflectionText.trim(),
        timestamp: new Date(),
        title: `Reflection: ${reflectionData.enemy.name}`,
        sceneId: `combat-${reflectionData.enemy.id}`,
        tags: therapeuticTags,
        isEdited: false,
      };

      try {
        gameStore.addJournalEntry(journalEntry);

        // Link journal entry to combat history (non-blocking, logs errors)
        if (lastCombatHistoryId) {
          linkJournalToCombatHistory(lastCombatHistoryId, journalEntry.id).then((result) => {
            if (!result.success) {
              console.warn('Failed to link journal to combat history:', result.error);
            }
          });
        }

        handleClose();
      } catch (error) {
        console.error('Failed to save reflection:', error);
      } finally {
        setIsSaving(false);
      }
    }, [reflectionText, reflectionData, gameStore, handleClose, lastCombatHistoryId]);

    const togglePrompts = useCallback(() => setShowPrompts((prev) => !prev), []);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" data-testid={testId}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {reflectionData.victory ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Heart className="h-6 w-6 text-blue-500" />
              )}
              Battle Results & Reflection
            </DialogTitle>
            <DialogDescription>
              Take a moment to reflect on your encounter with {reflectionData.enemy.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <CombatSummaryCard
              reflectionData={reflectionData}
              contextualMessage={contextualMessage}
              maxPlayerEnergy={gameStore.maxPlayerEnergy}
            />

            <TherapeuticPromptsCard
              prompts={therapeuticPrompts}
              isVisible={showPrompts}
              onPromptSelect={handlePromptSelect}
              onSkipPrompts={togglePrompts}
            />

            <ReflectionTextCard
              reflectionText={reflectionText}
              selectedPrompt={selectedPrompt}
              showPromptsButton={!showPrompts}
              onTextChange={setReflectionText}
              onShowPrompts={togglePrompts}
            />

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                Skip Reflection
              </Button>
              <Button
                onClick={handleSave}
                disabled={!reflectionText.trim() || isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? 'Saving...' : 'Save Reflection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
