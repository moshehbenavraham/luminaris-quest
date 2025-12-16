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
import type { ShadowManifestation } from '@/types';

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
  className,
}) => {
  const newTrustLevel = Math.min(100, guardianTrust + 5);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Guardian Message */}
      <div className="animate-fade-in rounded-lg border border-amber-200 bg-amber-100 p-4">
        <p className="text-sm text-gray-700 italic">
          &ldquo;{enemy.therapeuticInsight} Your trust in yourself grows stronger.&rdquo;
        </p>
        <p className="mt-2 text-right text-xs text-gray-500">— Your Guardian Spirit</p>
      </div>

      {/* Trust Update */}
      <div className="animate-slide-up text-center">
        <p className="text-sm text-gray-600">
          Guardian Trust increased to{' '}
          <span className="animate-glow font-bold text-amber-700">{newTrustLevel}%</span>
        </p>
      </div>

      {/* Combat Summary */}
      <div className="animate-fade-in text-center text-sm text-gray-600">
        <p>You faced your fears with courage and wisdom.</p>
      </div>

      {/* Action Buttons */}
      <div className="animate-slide-up flex justify-center gap-2 pt-4">
        <Button
          variant="default"
          onClick={onReflect}
          className="bg-amber-600 text-white transition-all duration-200 hover:bg-amber-700"
        >
          📝 Reflect on Victory
        </Button>
        <Button
          variant="outline"
          onClick={onContinue}
          className="border-amber-300 transition-all duration-200 hover:bg-amber-50"
        >
          Continue Journey
        </Button>
      </div>
    </div>
  );
};
