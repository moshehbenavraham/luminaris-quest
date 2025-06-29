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
import type { ShadowManifestation } from '@/store/game-store';

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
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Guardian Message */}
      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 animate-fade-in">
        <p className="text-sm italic text-gray-700">
          &ldquo;This shadow still has lessons to teach. Take a moment to reflect on what you&apos;ve learned.&rdquo;
        </p>
        <p className="text-xs text-gray-500 mt-2 text-right">
          — Your Guardian Spirit
        </p>
      </div>

      {/* Learning Moment */}
      <div className="text-center animate-slide-up">
        <p className="text-sm text-gray-600">
          Every challenge teaches us something valuable about ourselves.
        </p>
      </div>

      {/* Combat Summary */}
      <div className="text-center text-sm text-gray-600 animate-fade-in">
        <p>Sometimes stepping back is the wisest choice.</p>
      </div>

      {/* Therapeutic Insight */}
      <div className="p-3 rounded-md bg-blue-50 border border-blue-200 animate-slide-up">
        <p className="text-sm text-blue-700">
          💡 <strong>Reflection Prompt:</strong> What emotions did this shadow bring up? 
          How might facing similar feelings in real life help you grow?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 pt-4 animate-slide-up">
        <Button
          variant="default"
          onClick={onReflect}
          className="bg-slate-600 hover:bg-slate-700 text-white transition-all duration-200"
        >
          📝 Journal Thoughts
        </Button>
        <Button
          variant="outline"
          onClick={onContinue}
          className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
        >
          Rest & Recover
        </Button>
      </div>
    </div>
  );
};