import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Star, Sparkles, Sword, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatsBarProps extends React.ComponentPropsWithoutRef<'div'> {
  trust: number;
  health?: number;
  energy?: number;
  experience?: number;
  className?: string;
  /** Show combat resources (Light/Shadow Points) - defaults to auto-detect based on player progress */
  showCombatResources?: boolean;
}

export function StatsBar({
  trust: _trust,
  health, // Optional override - if not provided, uses store value
  energy = 100,
  className,
  showCombatResources,
  ...props
}: StatsBarProps) {
  const {
    lightPoints,
    shadowPoints,
    playerHealth,
    playerEnergy,
    maxPlayerEnergy,
    playerLevel,
    getExperienceProgress,
  } = useGameStore();

  // Use store health if no override provided
  const displayHealth = health ?? playerHealth;
  // Use store energy if no override provided (convert to percentage)
  const displayEnergy =
    energy !== 100 ? energy : Math.round((playerEnergy / maxPlayerEnergy) * 100);

  // Calculate if energy is low (< 20%)
  const isLowEnergy = displayEnergy < 20;

  // Auto-detect if combat resources should be shown
  // Show if explicitly requested, or if player has any combat resources
  const shouldShowCombatResources = showCombatResources ?? (lightPoints > 0 || shadowPoints > 0);

  // Calculate experience progress correctly
  const experienceProgress = getExperienceProgress();
  const progressPercentage = Math.min(100, Math.max(0, experienceProgress.percentage));

  return (
    <TooltipProvider>
      <Card className={className} {...props}>
        <CardContent className="space-y-4 p-4">
          {/* Trust Bond display removed - handled by GuardianText component */}

          {/* Combat Resources Section */}
          {shouldShowCombatResources && (
            <>
              {/* Combat Resources */}
              <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-purple-50 p-3 dark:border-amber-800 dark:from-amber-950/20 dark:to-purple-950/20">
                <div className="mb-3">
                  <span className="combat-text-critical text-sm font-semibold">
                    Combat Resources
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Light Points */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-medium">Light Points</p>
                          <p className="combat-text-critical text-lg font-bold">{lightPoints}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use Light Points for healing and defensive actions in combat</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Shadow Points */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                          <Sword className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-medium">Shadow Points</p>
                          <p className="combat-text-mana text-lg font-bold">{shadowPoints}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shadow Points enable powerful attacks but come with risk</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          )}

          {/* Other Stats */}
          {/* Add divider only if combat resources are shown */}
          {shouldShowCombatResources && <hr className="border-muted" />}
          <div className="grid grid-cols-1 gap-3">
            {/* Health */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center">
                  {/* Left side - icon and label with consistent width */}
                  <span className="flex w-24 items-center gap-2 text-sm font-medium">
                    <Shield className="combat-text-heal h-4 w-4 shrink-0" />
                    <span>Health</span>
                  </span>
                  {/* Right side - bar and value */}
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${displayHealth}%` }}
                      />
                    </div>
                    {/* Value with consistent width and alignment */}
                    <span className="w-10 text-right text-xs font-medium tabular-nums">
                      {displayHealth}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your vitality and wellbeing. Recovers after combat victories.</p>
              </TooltipContent>
            </Tooltip>

            {/* Energy with low-energy warning */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex cursor-help items-center',
                    isLowEnergy && 'rounded-md bg-orange-50 dark:bg-orange-950/20',
                  )}
                >
                  {/* Left side - icon and label with consistent width */}
                  <span className="flex w-24 items-center gap-2 text-sm font-medium">
                    <Zap
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isLowEnergy ? 'text-orange-500' : 'combat-text-mana',
                      )}
                    />
                    <span className="flex items-center gap-1">
                      Energy
                      {isLowEnergy && (
                        <AlertTriangle
                          className="h-3 w-3 animate-pulse text-orange-500"
                          data-testid="alert-triangle-icon"
                        />
                      )}
                    </span>
                  </span>
                  {/* Right side - bar and value */}
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        role="progressbar"
                        aria-label="energy"
                        aria-valuenow={displayEnergy}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isLowEnergy ? 'animate-pulse bg-orange-500' : 'bg-blue-500',
                        )}
                        style={{ width: `${displayEnergy}%` }}
                      />
                    </div>
                    {/* Value with consistent width and alignment */}
                    <span
                      className={cn(
                        'w-10 text-right text-xs font-medium tabular-nums',
                        isLowEnergy && 'font-bold text-orange-600 dark:text-orange-400',
                      )}
                    >
                      {displayEnergy}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">Energy System</p>
                  <p>Energy is needed for all actions:</p>
                  <ul className="ml-2 space-y-0.5 text-xs">
                    <li>• Scene choices cost 5-15 energy</li>
                    <li>• Combat actions cost 1-5 energy</li>
                    <li>• Regenerates 1 energy every 30 seconds</li>
                    <li>• Low energy (&lt;20%) reduces combat damage by 50%</li>
                  </ul>
                  {isLowEnergy && (
                    <p className="mt-2 font-medium text-orange-400">
                      ⚠️ Low energy! Rest or complete scenes to recover.
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Experience */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center">
                  {/* Left side - icon and label with consistent width */}
                  <span className="flex w-24 items-center gap-2 text-sm font-medium">
                    <Star className="combat-text-critical h-4 w-4 shrink-0" />
                    <span>Level {playerLevel}</span>
                  </span>
                  {/* Right side - bar and value */}
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        role="progressbar"
                        aria-label="experience progress"
                        aria-valuenow={Math.round(progressPercentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    {/* Value with consistent width and alignment */}
                    <span className="w-16 text-right text-xs font-medium tabular-nums">
                      {experienceProgress.current}/
                      {experienceProgress.current + experienceProgress.toNext}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">Level {playerLevel} Character</p>
                  <p>
                    Progress: {experienceProgress.current}/
                    {experienceProgress.current + experienceProgress.toNext} XP to Level{' '}
                    {playerLevel + 1}
                  </p>
                  <p className="text-xs">Gain XP from:</p>
                  <ul className="ml-2 space-y-0.5 text-xs">
                    <li>• Scene completion (25-50 XP)</li>
                    <li>• Combat victories (40-75 XP)</li>
                    <li>• Failed attempts still give 60% XP</li>
                  </ul>
                  <p className="mt-1 text-xs font-medium text-yellow-400">Level Benefits:</p>
                  <ul className="ml-2 space-y-0.5 text-xs">
                    <li>• Every level: +1 dice roll bonus</li>
                    <li>• Every 2 levels: +10 max energy</li>
                    <li>• Every 3 levels: +5 Light Points</li>
                    <li>• Every 4 levels: -1 energy cost</li>
                    <li>• Every 5 levels: +20% trust gain</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
