/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * VictoryContent - Therapeutic victory display component
 * 
 * This component displays victory content with therapeutic insights,
 * trust updates, and reflection prompts for successful combat resolution.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShadowManifestation } from '@/store/game-store';

interface VictoryContentProps {
  /** The defeated enemy */
  enemy: ShadowManifestation;
  /** Current guardian trust level */
  guardianTrust: number;
  /** Callback when reflection button is clicked */
  onReflect: () => void;
  /** Callback when continue button is clicked */
  onContinue: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const VictoryContent: React.FC<VictoryContentProps> = ({
  enemy,
  guardianTrust,
  onReflect,
  onContinue,
  className
}) => {
  const newTrustLevel = Math.min(100, guardianTrust + 5);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Guardian Message */}
      <div className="p-4 rounded-lg bg-amber-100 border border-amber-200 animate-fade-in">
        <p className="text-sm italic text-gray-700">
          &ldquo;{enemy.therapeuticInsight} Your trust in yourself grows stronger.&rdquo;
        </p>
        <p className="text-xs text-gray-500 mt-2 text-right">
          — Your Guardian Spirit
        </p>
      </div>

      {/* Trust Update */}
      <div className="text-center animate-slide-up">
        <p className="text-sm text-gray-600">
          Guardian Trust increased to{' '}
          <span className="font-bold text-amber-700 animate-glow">
            {newTrustLevel}%
          </span>
        </p>
      </div>

      {/* Combat Summary */}
      <div className="text-center text-sm text-gray-600 animate-fade-in">
        <p>You faced your fears with courage and wisdom.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 pt-4 animate-slide-up">
        <Button
          variant="default"
          onClick={onReflect}
          className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200"
        >
          📝 Reflect on Victory
        </Button>
        <Button
          variant="outline"
          onClick={onContinue}
          className="border-amber-300 hover:bg-amber-50 transition-all duration-200"
        >
          Continue Journey
        </Button>
      </div>
    </div>
  );
};