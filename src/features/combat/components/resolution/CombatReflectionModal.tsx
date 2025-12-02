/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * CombatReflectionModal - Comprehensive post-combat resolution dialog
 *
 * This component displays detailed combat results and provides journaling
 * functionality for therapeutic reflection after combat.
 *
 * ⚠️ CLAUDE CODE FAILURE - ATTEMPT #3 ⚠️
 * Created: 2025-06-28
 * FAILED: This entire component was created to restore battle results screen
 * but NO battle results screen appears after combat. The component exists but
 * is not showing/working. User still reports no battle results screen with
 * combat summary and journaling functionality.
 * STATUS: FAILED ATTEMPT - Battle results screen still missing
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  Shield,
  Lightbulb,
  CheckCircle,
  Battery,
} from 'lucide-react';
import { useCombatStore } from '../../hooks/useCombatStore';
import { useGameStore } from '@/store/game-store';
import type { JournalEntry } from '@/components/JournalModal';
import type { ShadowManifestation } from '@/store/game-store';

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
  'data-testid'?: string;
}

// Shadow-specific therapeutic prompts
const getTherapeuticPrompts = (shadowType: string): string[] => {
  const prompts = {
    doubt: [
      'What specific self-doubts showed up during this encounter? Notice them without judgment.',
      'When uncertainty arose, what helped you take action anyway? What inner resources did you discover?',
      'What evidence from your life contradicts the harsh voice of your inner critic?',
      "How can you speak to yourself with the same kindness you'd show a good friend facing similar doubts?",
    ],
    isolation: [
      'When do you notice yourself withdrawing from others? What triggers this protective response?',
      'What fears or past hurts make reaching out feel risky? How might you honor these concerns while still connecting?',
      'Who in your life has shown they care about you? How might you take one small step toward deeper connection?',
      'How can you create a balance between healthy solitude and meaningful connection with others?',
    ],
    overwhelm: [
      'What specific situations in your life mirror this overwhelming feeling? What patterns do you notice?',
      'When stress builds up, what does your body tell you? What early warning signs can you learn to recognize?',
      "What's one strategy that helped you break down this challenge? How can you apply this to real-life overwhelm?",
      'How might you create small pockets of calm and breathing space in your daily routine?',
    ],
    'past-pain': [
      'What past experiences still echo in your present responses? How do they try to protect you?',
      'How has your relationship with difficult memories evolved? What growth do you notice?',
      'What wisdom would you offer your past self? What do you wish you had known then?',
      'How can you honor your experiences as part of your story while not letting them write your future?',
    ],
  };

  return prompts[shadowType as keyof typeof prompts] || prompts.doubt;
};

// Victory/defeat contextual messages
const getContextualMessage = (victory: boolean, shadowType: string): string => {
  if (victory) {
    const victoryMessages = {
      doubt:
        'You transformed uncertainty from an enemy into a teacher. Your courage to act despite doubt has grown stronger.',
      isolation:
        'You chose vulnerable connection over protective withdrawal. Your capacity for authentic relationship has deepened.',
      overwhelm:
        'You found your center in the chaos and learned to prioritize with wisdom. Your resilience has been proven.',
      'past-pain':
        'You faced your deepest wounds with compassion and transformed pain into wisdom. Your healing journey continues with courage.',
    };
    return victoryMessages[shadowType as keyof typeof victoryMessages] || victoryMessages.doubt;
  } else {
    const defeatMessages = {
      doubt:
        "Even in struggle, you showed up and tried. That's courage. Each encounter with uncertainty builds your tolerance for the unknown.",
      isolation:
        "This challenge reminded you that you don't have to face everything alone. Reaching out is an act of self-compassion.",
      overwhelm:
        "Sometimes stepping back to breathe and regroup is exactly what wisdom looks like. You're learning to honor your limits.",
      'past-pain':
        "Healing isn't linear, and setbacks don't erase progress. Every time you face your past, you're choosing growth over avoidance.",
    };
    return defeatMessages[shadowType as keyof typeof defeatMessages] || defeatMessages.doubt;
  }
};

export const CombatReflectionModal: React.FC<CombatReflectionModalProps> = React.memo(
  function CombatReflectionModal({ isOpen, onClose, 'data-testid': testId }) {
    const {
      combatEndStatus,
      enemy,
      resources: endingResources,
      turn,
      playerEnergy,
      preferredActions,
      clearCombatEnd,
    } = useCombatStore();

    const gameStore = useGameStore();

    const [reflectionText, setReflectionText] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);

    // Calculate combat statistics
    const reflectionData = useMemo(() => {
      if (!enemy || !combatEndStatus.isEnded) return null;

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
        victory: combatEndStatus.victory,
        turnsElapsed: turn,
        mostUsedAction: mostUsedAction.charAt(0) + mostUsedAction.slice(1).toLowerCase(),
        lpGained: Math.max(0, lpGained),
        spGained: Math.max(0, spGained),
        energyLost,
        therapeuticInsight: enemy.therapeuticInsight,
        growthMessage: enemy.victoryReward.growthMessage,
        startingResources: {
          lp: startingLp,
          sp: startingSp,
          energy: startingEnergy,
        },
        endingResources: {
          lp: endingResources.lp,
          sp: endingResources.sp,
          energy: playerEnergy,
        },
      } as CombatReflectionData;
    }, [enemy, combatEndStatus, turn, preferredActions, endingResources, playerEnergy, gameStore]);

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
    const therapeuticPrompts = useMemo(() => {
      return reflectionData ? getTherapeuticPrompts(reflectionData.enemy.type) : [];
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally narrow: only recalculate when type changes
    }, [reflectionData?.enemy.type]);

    const contextualMessage = useMemo(() => {
      return reflectionData
        ? getContextualMessage(reflectionData.victory, reflectionData.enemy.type)
        : '';
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally narrow: only recalculate when victory or type changes
    }, [reflectionData?.victory, reflectionData?.enemy.type]);

    // Handlers
    const handlePromptSelect = useCallback((prompt: string) => {
      setSelectedPrompt(prompt);
      setReflectionText((prev) => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
      setShowPrompts(false);
    }, []);

    const handleClose = useCallback(() => {
      // Apply combat results to game state
      if (reflectionData) {
        // Sync combat resources back to game store
        const lpDifference =
          reflectionData.endingResources.lp - reflectionData.startingResources.lp;
        const spDifference =
          reflectionData.endingResources.sp - reflectionData.startingResources.sp;

        if (lpDifference !== 0) {
          gameStore.modifyLightPoints(lpDifference);
        }
        if (spDifference !== 0) {
          gameStore.modifyShadowPoints(spDifference);
        }

        // Apply victory rewards or defeat penalties
        if (reflectionData.victory) {
          // Victory: Apply bonus rewards and advance scene
          if (reflectionData.enemy.victoryReward.lpBonus > 0) {
            gameStore.modifyLightPoints(reflectionData.enemy.victoryReward.lpBonus);
          }

          // Restore health to full and advance scene
          gameStore.setPlayerHealth(100);
          gameStore.advanceScene(); // Advance to next scene on victory
          gameStore.endCombat(true);
        } else {
          // Defeat: Apply energy penalty and DO NOT advance scene
          const energyPenalty = Math.floor(gameStore.maxPlayerEnergy * 0.2); // Lose 20% max energy
          gameStore.modifyPlayerEnergy(-energyPenalty);

          // Restore health but stay on same scene
          gameStore.setPlayerHealth(100);
          gameStore.endCombat(false);
          // Important: Do NOT call advanceScene() on defeat
        }
      }

      clearCombatEnd();
      onClose();
    }, [reflectionData, gameStore, clearCombatEnd, onClose]);

    const handleSave = useCallback(async () => {
      if (!reflectionText.trim() || !reflectionData) return;

      setIsSaving(true);

      const journalEntry: JournalEntry = {
        id: `combat-reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'learning',
        trustLevel: gameStore.guardianTrust,
        content: reflectionText.trim(),
        timestamp: new Date(),
        title: `Reflection: ${reflectionData.enemy.name}`,
        sceneId: `combat-${reflectionData.enemy.id}`,
        tags: [
          'combat',
          'reflection',
          reflectionData.enemy.type,
          reflectionData.victory ? 'victory' : 'learning',
        ],
        isEdited: false,
      };

      try {
        gameStore.addJournalEntry(journalEntry);
        handleClose();
      } catch (error) {
        console.error('Failed to save reflection:', error);
      } finally {
        setIsSaving(false);
      }
    }, [reflectionText, reflectionData, gameStore, handleClose]);

    const togglePrompts = useCallback(() => {
      setShowPrompts((prev) => !prev);
    }, []);

    if (!reflectionData) return null;

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
            {/* Combat Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Combat Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Outcome:</span>
                      <Badge variant={reflectionData.victory ? 'default' : 'secondary'}>
                        {reflectionData.victory ? 'Victory' : 'Learning Experience'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Turns:</span>
                      <span className="text-sm">{reflectionData.turnsElapsed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Used Action:</span>
                      <Badge variant="outline">{reflectionData.mostUsedAction}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Light Points:
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        {reflectionData.lpGained > 0
                          ? `+${reflectionData.lpGained}`
                          : reflectionData.lpGained}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Shield className="h-4 w-4 text-purple-500" />
                        Shadow Points:
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {reflectionData.spGained > 0
                          ? `+${reflectionData.spGained}`
                          : reflectionData.spGained}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Battery className="h-4 w-4 text-blue-500" />
                        Energy Used:
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        -{reflectionData.energyLost}
                      </span>
                    </div>
                  </div>
                </div>

                {!reflectionData.victory && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-sm text-orange-800">
                      <strong>Note:</strong> You&apos;ll need to retry this scene. You lost{' '}
                      {Math.floor(gameStore.maxPlayerEnergy * 0.2)} energy points, but your health
                      has been restored to continue your journey.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Therapeutic Insight
                  </h4>
                  <p className="text-muted-foreground text-sm italic">
                    {reflectionData.therapeuticInsight}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Growth Message
                  </h4>
                  <p className="text-muted-foreground text-sm">{contextualMessage}</p>
                  {reflectionData.victory && (
                    <p className="text-primary text-sm font-medium">
                      {reflectionData.growthMessage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Therapeutic Prompts */}
            <AnimatePresence>
              {showPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Reflection Prompts
                      </CardTitle>
                      <CardDescription>
                        Choose a prompt to guide your reflection, or write freely below
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {therapeuticPrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="h-auto justify-start p-3 text-left"
                            onClick={() => handlePromptSelect(prompt)}
                          >
                            <div className="text-sm leading-relaxed">{prompt}</div>
                          </Button>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button variant="ghost" size="sm" onClick={togglePrompts}>
                          Skip prompts and write freely
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reflection Text Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Your Reflection
                </CardTitle>
                <CardDescription>
                  Write about your experience, insights, or anything that comes to mind
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPrompt && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-sm font-medium">
                      Reflecting on: &ldquo;{selectedPrompt}&rdquo;
                    </p>
                  </div>
                )}

                <Textarea
                  placeholder="Share your thoughts, feelings, and insights from this encounter..."
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  data-testid="reflection-textarea"
                  aria-label="Combat reflection text"
                  aria-describedby="reflection-description"
                />

                {!showPrompts && (
                  <Button variant="outline" size="sm" onClick={togglePrompts}>
                    Show reflection prompts
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
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
