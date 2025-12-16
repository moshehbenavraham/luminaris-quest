/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * TherapeuticPromptsCard - Guided reflection prompt selection
 *
 * Displays shadow-specific therapeutic prompts for guided journaling.
 */

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface TherapeuticPromptsCardProps {
  prompts: string[];
  isVisible: boolean;
  onPromptSelect: (prompt: string) => void;
  onSkipPrompts: () => void;
}

export const TherapeuticPromptsCard: React.FC<TherapeuticPromptsCardProps> = ({
  prompts,
  isVisible,
  onPromptSelect,
  onSkipPrompts,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div {...motionProps}>
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
                {prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto justify-start p-3 text-left"
                    onClick={() => onPromptSelect(prompt)}
                  >
                    <div className="text-sm leading-relaxed">{prompt}</div>
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" onClick={onSkipPrompts}>
                  Skip prompts and write freely
                </Button>
              </div>
            </CardContent>
          </Card>
        </m.div>
      )}
    </AnimatePresence>
  );
};
