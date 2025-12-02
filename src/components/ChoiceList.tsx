import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getScene,
  isLastScene,
  getSceneProgress,
  rollDice,
  handleSceneOutcome,
  getLevelRollBonus,
  type DiceResult,
} from '@/engine/scene-engine';
import { DiceRollOverlay } from './DiceRollOverlay';
import { getLevelBenefits } from '@/store/game-store';

// Combat System: @/features/combat/
// See COMBAT_MIGRATION_GUIDE.md for historical context
import { CombatOverlay as NewCombatOverlay } from '@/features/combat';
import { useCombatStore } from '@/features/combat';
import { generateSyncChecksum } from '@/features/combat';
import { useGameStore } from '@/store/game-store';
import { createShadowManifestation } from '@/data/shadowManifestations';
import { Sword, Users, Wrench, BookOpen, Map, Sparkles, Zap, Battery } from 'lucide-react';

interface ChoiceListProps {
  guardianTrust: number;
  setGuardianTrust: (_trust: number) => void;
  setGuardianMessage: (_message: string) => void;
  onSceneComplete?: (_sceneId: string, _success: boolean) => void;
  onLearningMoment?: () => void;
  'data-testid'?: string;
}

export function ChoiceList({
  guardianTrust,
  setGuardianTrust,
  setGuardianMessage,
  onSceneComplete,
  onLearningMoment,
  'data-testid': testId,
}: ChoiceListProps) {
  const {
    completeScene,
    resetGame,
    currentSceneIndex,
    advanceScene,
    modifyLightPoints,
    modifyShadowPoints,
    modifyPlayerEnergy,
    modifyExperiencePoints,
    lightPoints,
    shadowPoints,
    playerHealth,
    playerLevel,
    playerEnergy,
    maxPlayerEnergy,
  } = useGameStore();

  // Get startCombat from NEW combat store
  const { startCombat: startNewCombat } = useCombatStore();

  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentScene = getScene(currentSceneIndex);
  const progress = getSceneProgress(currentSceneIndex);

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'skill':
        return <Wrench className="h-4 w-4" />;
      case 'combat':
        return <Sword className="h-4 w-4" />;
      case 'journal':
        return <BookOpen className="h-4 w-4" />;
      case 'exploration':
        return <Map className="h-4 w-4" />;
      default:
        return <Map className="h-4 w-4" />;
    }
  };

  const getSceneColor = (type: string) => {
    switch (type) {
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'skill':
        return 'bg-green-100 text-green-800';
      case 'combat':
        return 'bg-red-100 text-red-800';
      case 'journal':
        return 'bg-purple-100 text-purple-800';
      case 'exploration':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChoice = () => {
    if (isProcessing) return;

    // Check if player has enough energy for this scene type
    const outcome = handleSceneOutcome(currentScene, true); // Get energy cost regardless of success
    const energyCost = Math.abs(outcome.energyChanges?.energyCost || 0);

    if (playerEnergy < energyCost) {
      setGuardianMessage(
        `You need ${energyCost} energy to attempt this ${currentScene.type} challenge, but you only have ${playerEnergy}. Rest and let your energy regenerate before trying again.`,
      );
      return;
    }

    setIsProcessing(true);
    const levelBonus = getLevelRollBonus(playerLevel);
    const result = rollDice(currentScene.dc, levelBonus);
    setDiceResult(result);
    setShowDiceRoll(true);
  };

  const handleDiceRollClose = () => {
    if (!diceResult) return;

    setShowDiceRoll(false);

    // Handle scene outcome with new integration system
    const scene = getScene(currentSceneIndex);
    const outcome = handleSceneOutcome(
      scene,
      diceResult.success,
      diceResult.roll,
      currentSceneIndex,
    );

    // Update guardian trust and message based on result
    const baseTrustChange = diceResult.success ? 5 : -5;
    const levelBenefits = getLevelBenefits(playerLevel);
    // Apply trust gain multiplier only to positive changes
    const multipliedTrustChange =
      baseTrustChange > 0
        ? Math.round(baseTrustChange * levelBenefits.trustGainMultiplier)
        : baseTrustChange;
    const newTrust = Math.min(100, Math.max(0, guardianTrust + multipliedTrustChange));
    setGuardianTrust(newTrust);

    if (diceResult.success) {
      setGuardianMessage(scene.successText);
    } else {
      setGuardianMessage(scene.failureText);
    }

    // Apply energy changes (cost is always applied, reward only on success)
    if (outcome.energyChanges) {
      if (outcome.energyChanges.energyCost) {
        // Apply energy cost reduction benefit (reduce the cost by the benefit amount)
        const baseCost = outcome.energyChanges.energyCost; // This is negative
        const reducedCost = Math.min(0, baseCost + levelBenefits.energyCostReduction); // Less negative = reduced cost
        console.log(
          'Applying energy cost:',
          baseCost,
          '→',
          reducedCost,
          '(reduction:',
          levelBenefits.energyCostReduction,
          ')',
        );
        modifyPlayerEnergy(reducedCost);
      }
      if (outcome.energyChanges.energyReward && diceResult.success) {
        console.log('Applying energy reward:', outcome.energyChanges.energyReward);
        modifyPlayerEnergy(outcome.energyChanges.energyReward);
      }
    }

    // Apply resource changes if not triggering combat
    if (!outcome.triggeredCombat && outcome.resourceChanges) {
      if (outcome.resourceChanges.lpChange) {
        console.log('Applying LP change:', outcome.resourceChanges.lpChange);
        modifyLightPoints(outcome.resourceChanges.lpChange);
      }
      if (outcome.resourceChanges.spChange) {
        console.log('Applying SP change:', outcome.resourceChanges.spChange);
        modifyShadowPoints(outcome.resourceChanges.spChange);
      }
    }

    // Apply experience points (always awarded for scene attempts)
    if (outcome.experienceChanges?.xpGained) {
      console.log(
        'Applying XP change:',
        outcome.experienceChanges.xpGained,
        'for:',
        outcome.experienceChanges.reason,
      );
      modifyExperiencePoints(outcome.experienceChanges.xpGained, outcome.experienceChanges.reason);
    }

    // Debug logging for resource application
    console.log('Scene outcome:', {
      sceneType: scene.type,
      success: diceResult.success,
      triggeredCombat: outcome.triggeredCombat,
      resourceChanges: outcome.resourceChanges,
      energyChanges: outcome.energyChanges,
    });

    // Record the completed scene
    completeScene({
      id: `scene-${Date.now()}`,
      sceneId: scene.id,
      type: scene.type,
      title: scene.title,
      success: diceResult.success,
      roll: diceResult.roll,
      dc: scene.dc,
      trustChange: multipliedTrustChange,
      completedAt: Date.now(),
    });

    // Trigger combat if needed
    if (outcome.triggeredCombat && outcome.shadowType) {
      // 🚨 CRITICAL: This triggers the NEW combat system
      // The NEW system uses useCombatStore from @/features/combat
      // NOT the old gameStore.startCombat() from @/store/game-store
      // See COMBAT_MIGRATION_GUIDE.md if confused
      const shadowEnemy = createShadowManifestation(outcome.shadowType);
      if (shadowEnemy) {
        // Generate sync checksum for combat store validation
        const syncChecksum = generateSyncChecksum(lightPoints, shadowPoints);

        startNewCombat(shadowEnemy, {
          lightPoints,
          shadowPoints,
          playerHealth,
          playerLevel,
          playerEnergy,
          maxPlayerEnergy,
          syncChecksum,
        });
      }
    } else {
      // Only advance scene if not entering combat
      if (!isLastScene(currentSceneIndex)) {
        advanceScene();
      }
    }

    setIsProcessing(false);
    setDiceResult(null);

    if (onSceneComplete) {
      onSceneComplete(scene.id, diceResult.success);
    }

    if (onLearningMoment && !diceResult.success) {
      onLearningMoment();
    }
  };

  const handleNewJourney = () => {
    resetGame();
    setGuardianMessage(
      'I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward.',
    );
  };

  if (isLastScene(currentSceneIndex) && !showDiceRoll) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Journey Complete</CardTitle>
          <CardDescription>
            You have completed this chapter of your adventure. Your guardian spirit has learned much
            about your choices and growth through {progress.total} meaningful encounters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-muted-foreground mb-2 text-sm">Final Trust Level</p>
            <p className="text-2xl font-bold">{guardianTrust}/100</p>
          </div>
          <Button onClick={handleNewJourney} className="min-h-[44px] w-full py-3">
            Begin New Journey
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-2xl" data-testid={testId}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getSceneColor(currentScene.type)}>
                {getSceneIcon(currentScene.type)}
                {currentScene.type.charAt(0).toUpperCase() + currentScene.type.slice(1)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {progress.current} of {progress.total}
              </span>
            </div>
          </div>
          <CardTitle className="mt-2">{currentScene.title}</CardTitle>
          <CardDescription>
            Your guardian spirit watches as you face this {currentScene.type} challenge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{currentScene.text}</p>
          </div>

          <div className="space-y-4">
            <div className="border-muted space-y-1 border-t border-b py-2 text-center">
              <p className="text-muted-foreground text-sm font-medium">
                Difficulty: {currentScene.dc}
              </p>
              <p className="text-muted-foreground text-xs">Your choice will be tested by fate</p>

              {/* Show resource rewards/penalties and energy costs */}
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                {/* Energy cost (always shown) */}
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Battery className="h-3 w-3" />
                  <span>
                    -
                    {(() => {
                      const cost = handleSceneOutcome(currentScene, true).energyChanges?.energyCost;
                      return cost ? Math.abs(cost) : 0;
                    })()}{' '}
                    Energy
                  </span>
                </div>

                {/* Energy reward on success */}
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Battery className="h-3 w-3" />
                  <span>
                    +{handleSceneOutcome(currentScene, true).energyChanges?.energyReward || 0}{' '}
                    Energy on success
                  </span>
                </div>

                {(currentScene.lpReward || currentScene.type !== 'combat') && (
                  <div className="combat-text-critical flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      +
                      {currentScene.lpReward ||
                        (currentScene.type === 'social'
                          ? 3
                          : currentScene.type === 'skill'
                            ? 2
                            : currentScene.type === 'exploration'
                              ? 3
                              : 2)}{' '}
                      LP on success
                    </span>
                  </div>
                )}
                {currentScene.type === 'combat' && (
                  <div className="combat-text-damage flex items-center gap-1 text-xs">
                    <Sword className="h-3 w-3" />
                    <span>Combat on failure</span>
                  </div>
                )}
                {currentScene.type !== 'combat' && (
                  <div className="combat-text-mana flex items-center gap-1 text-xs">
                    <Zap className="h-3 w-3" />
                    <span>
                      +
                      {currentScene.spPenalty ||
                        (currentScene.type === 'social'
                          ? 2
                          : currentScene.type === 'skill'
                            ? 1
                            : currentScene.type === 'exploration'
                              ? 2
                              : 1)}{' '}
                      SP on failure
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleChoice}
                disabled={isProcessing}
                className="h-auto min-h-[44px] w-full justify-start p-4 text-left"
                variant="outline"
              >
                <div className="w-full">
                  <div className="text-base leading-relaxed font-medium">
                    {currentScene.choices.bold}
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleChoice}
                disabled={isProcessing}
                className="h-auto min-h-[44px] w-full justify-start p-4 text-left"
                variant="outline"
              >
                <div className="w-full">
                  <div className="text-base leading-relaxed font-medium">
                    {currentScene.choices.cautious}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDiceRoll && diceResult && (
        <DiceRollOverlay result={diceResult} onClose={handleDiceRollClose} />
      )}

      {/* Combat Overlay */}
      <NewCombatOverlay data-testid="combat-overlay" />
    </>
  );
}
