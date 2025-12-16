/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * CombatSummaryCard - Combat results summary display
 *
 * Displays combat outcome, statistics, resource changes, and therapeutic insights.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, TrendingUp, Award, Shield, Lightbulb, Battery } from 'lucide-react';
import type { CombatReflectionData } from './CombatReflectionModal';

interface CombatSummaryCardProps {
  reflectionData: CombatReflectionData;
  contextualMessage: string;
  maxPlayerEnergy: number;
}

export const CombatSummaryCard: React.FC<CombatSummaryCardProps> = ({
  reflectionData,
  contextualMessage,
  maxPlayerEnergy,
}) => {
  return (
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
              <span className="text-sm font-bold text-amber-400">
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
              <span className="text-sm font-bold text-purple-400">
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
              <span className="text-sm font-bold text-blue-400">-{reflectionData.energyLost}</span>
            </div>
          </div>
        </div>

        {!reflectionData.victory && (
          <div className="rounded-lg border border-orange-400/30 bg-orange-500/10 p-3">
            <p className="text-sm text-orange-300">
              <strong>Note:</strong> You&apos;ll need to retry this scene. You lost{' '}
              {Math.floor(maxPlayerEnergy * 0.2)} energy points, but your health has been restored
              to continue your journey.
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
            <p className="text-primary text-sm font-medium">{reflectionData.growthMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
