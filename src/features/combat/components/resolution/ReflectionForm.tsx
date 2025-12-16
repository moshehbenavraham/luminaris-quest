/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * ReflectionForm - Therapeutic journal entry form for combat resolution
 *
 * This component provides a guided reflection form for players to process
 * their combat experiences through therapeutic journaling.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/game-store';
import type { JournalEntry, ShadowManifestation } from '@/types';

interface ReflectionFormProps {
  /** The enemy from the combat encounter */
  enemy: ShadowManifestation;
  /** Whether the combat was won (true) or lost (false) */
  victory: boolean;
  /** Current guardian trust level */
  guardianTrust: number;
  /** Callback when reflection is saved */
  onSave: (_entry: JournalEntry) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  enemy,
  victory,
  guardianTrust,
  onSave,
  onCancel,
  className,
}) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addJournalEntry } = useGameStore();

  const getReflectionPrompts = () => {
    const basePrompts = [
      `What emotions did facing ${enemy.name} bring up for you?`,
      'How might this experience help you in real-life challenges?',
      'What did you learn about your own strengths or areas for growth?',
    ];

    if (victory) {
      return [
        ...basePrompts,
        'How can you carry this sense of accomplishment forward?',
        'What strategies worked well that you might use again?',
      ];
    } else {
      return [
        ...basePrompts,
        'What would you try differently next time?',
        'How can this setback become a stepping stone for growth?',
      ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reflection.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const journalEntry: JournalEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'learning',
        trustLevel: guardianTrust,
        content: reflection.trim(),
        timestamp: new Date(),
        title: victory ? `Victory Reflection: ${enemy.name}` : `Learning Moment: ${enemy.name}`,
        sceneId: `combat-${enemy.id}`,
        tags: [
          'combat',
          victory ? 'victory' : 'learning',
          enemy.type,
          `trust-${Math.floor(guardianTrust / 25) * 25}`, // Group by 25s
        ],
      };

      // Save to game store
      addJournalEntry(journalEntry);

      // Call the callback
      onSave(journalEntry);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prompts = getReflectionPrompts();

  return (
    <Card className={cn('animate-fade-in mx-auto w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="animate-slide-up flex items-center gap-2">
          📝
          {victory ? 'Reflect on Your Victory' : 'Journal Your Thoughts'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Therapeutic Context */}
          <div className="animate-fade-in rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-2 text-sm text-blue-700">
              <strong>💡 Reflection Guidance:</strong>
            </p>
            <p className="text-sm text-blue-600">
              {victory
                ? `Congratulations on overcoming ${enemy.name}! Taking time to reflect on your success helps reinforce positive coping strategies.`
                : `Every challenge teaches us something valuable. Use this moment to process your experience with ${enemy.name} and discover insights for growth.`}
            </p>
          </div>

          {/* Reflection Prompts */}
          <div className="animate-slide-up space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Consider these reflection prompts:
            </Label>
            <ul className="space-y-2 text-sm text-gray-600">
              {prompts.map((prompt, index) => (
                <li
                  key={index}
                  className="animate-fade-in flex items-start gap-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mt-1 text-blue-500">•</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reflection Input */}
          <div className="animate-slide-up space-y-2">
            <Label htmlFor="reflection-input" className="text-sm font-medium">
              Your Reflection
            </Label>
            <Textarea
              id="reflection-input"
              placeholder="Share your thoughts and feelings about this experience..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px] resize-y transition-all duration-200 focus:ring-2 focus:ring-blue-300"
              required
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Take your time to process this experience</span>
              <span>{reflection.length}/1000</span>
            </div>
          </div>

          {/* Enemy Context */}
          <div className="animate-fade-in rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="mb-1 text-xs text-gray-600">
              <strong>Shadow Encountered:</strong> {enemy.name}
            </p>
            <p className="text-xs text-gray-600 italic">&ldquo;{enemy.therapeuticInsight}&rdquo;</p>
          </div>

          {/* Action Buttons */}
          <div className="animate-slide-up flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="transition-all duration-200"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              disabled={!reflection.trim() || isSubmitting}
              className={cn(
                'transition-all duration-200',
                victory
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-600 text-white hover:bg-slate-700',
              )}
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
