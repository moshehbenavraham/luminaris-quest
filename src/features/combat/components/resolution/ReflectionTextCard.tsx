/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * ReflectionTextCard - Free-form reflection text input
 *
 * Provides a textarea for writing combat reflections with optional
 * prompt context display.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface ReflectionTextCardProps {
  reflectionText: string;
  selectedPrompt: string | null;
  showPromptsButton: boolean;
  onTextChange: (text: string) => void;
  onShowPrompts: () => void;
}

export const ReflectionTextCard: React.FC<ReflectionTextCardProps> = ({
  reflectionText,
  selectedPrompt,
  showPromptsButton,
  onTextChange,
  onShowPrompts,
}) => {
  return (
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
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[120px] resize-none"
          data-testid="reflection-textarea"
          aria-label="Combat reflection text"
          aria-describedby="reflection-description"
        />

        {showPromptsButton && (
          <Button variant="outline" size="sm" onClick={onShowPrompts}>
            Show reflection prompts
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
