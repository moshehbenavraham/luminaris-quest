/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * DefeatContent - Therapeutic defeat display component
 *
 * This component displays defeat content with learning moments,
 * therapeutic guidance, and reflection prompts for combat resolution.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShadowManifestation } from '@/types';

interface DefeatContentProps {
  /** The shadow that provided the learning moment */
  enemy: ShadowManifestation;
  /** Callback when reflection button is clicked */
  onReflect: () => void;
  /** Callback when continue button is clicked */
  onContinue: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const DefeatContent: React.FC<DefeatContentProps> = ({
  enemy: _enemy,
  onReflect,
  onContinue,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Guardian Message */}
      <div className="animate-fade-in rounded-lg border border-slate-200 bg-slate-100 p-4">
        <p className="text-sm text-gray-700 italic">
          &ldquo;This shadow still has lessons to teach. Take a moment to reflect on what
          you&apos;ve learned.&rdquo;
        </p>
        <p className="mt-2 text-right text-xs text-gray-500">— Your Guardian Spirit</p>
      </div>

      {/* Learning Moment */}
      <div className="animate-slide-up text-center">
        <p className="text-sm text-gray-600">
          Every challenge teaches us something valuable about ourselves.
        </p>
      </div>

      {/* Combat Summary */}
      <div className="animate-fade-in text-center text-sm text-gray-600">
        <p>Sometimes stepping back is the wisest choice.</p>
      </div>

      {/* Therapeutic Insight */}
      <div className="animate-slide-up rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Reflection Prompt:</strong> What emotions did this shadow bring up? How might
          facing similar feelings in real life help you grow?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="animate-slide-up flex justify-center gap-2 pt-4">
        <Button
          variant="default"
          onClick={onReflect}
          className="bg-slate-600 text-white transition-all duration-200 hover:bg-slate-700"
        >
          📝 Journal Thoughts
        </Button>
        <Button
          variant="outline"
          onClick={onContinue}
          className="border-slate-300 transition-all duration-200 hover:bg-slate-50"
        >
          Rest & Recover
        </Button>
      </div>
    </div>
  );
};
