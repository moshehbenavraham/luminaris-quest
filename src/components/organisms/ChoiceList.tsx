import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiceRollOverlay } from '@/components/molecules/DiceRollOverlay';
import { useSceneChoices } from '@/hooks/useSceneChoices';

// Combat System: @/features/combat/
// See COMBAT_MIGRATION_GUIDE.md for historical context
import { CombatOverlay as NewCombatOverlay } from '@/features/combat';
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
    currentScene,
    progress,
    showDiceRoll,
    diceResult,
    isProcessing,
    isJourneyComplete,
    energyCostToAttempt,
    energyRewardOnSuccess,
    lpRewardOnSuccess,
    spPenaltyOnFailure,
    handleChoice,
    handleDiceRollClose,
    handleNewJourney,
  } = useSceneChoices({
    guardianTrust,
    setGuardianTrust,
    setGuardianMessage,
    onSceneComplete,
    onLearningMoment,
  });

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

  if (isJourneyComplete) {
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
                  <span>-{energyCostToAttempt} Energy</span>
                </div>

                {/* Energy reward on success */}
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Battery className="h-3 w-3" />
                  <span>+{energyRewardOnSuccess} Energy on success</span>
                </div>

                {lpRewardOnSuccess !== null && (
                  <div className="status-text-warning flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span>+{lpRewardOnSuccess} LP on success</span>
                  </div>
                )}
                {currentScene.type === 'combat' && (
                  <div className="status-text-danger flex items-center gap-1 text-xs">
                    <Sword className="h-3 w-3" />
                    <span>Combat on failure</span>
                  </div>
                )}
                {spPenaltyOnFailure !== null && (
                  <div className="status-text-info flex items-center gap-1 text-xs">
                    <Zap className="h-3 w-3" />
                    <span>+{spPenaltyOnFailure} SP on failure</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleChoice('bold')}
                disabled={isProcessing}
                className="h-auto min-h-[44px] w-full justify-start p-4 text-left"
                variant="outline"
                data-testid="choice-bold"
              >
                <div className="w-full">
                  <div className="text-base leading-relaxed font-medium">
                    {currentScene.choices.bold}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Bold: DC +2, but +2 LP and +2 Trust on success
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleChoice('cautious')}
                disabled={isProcessing}
                className="h-auto min-h-[44px] w-full justify-start p-4 text-left"
                variant="outline"
                data-testid="choice-cautious"
              >
                <div className="w-full">
                  <div className="text-base leading-relaxed font-medium">
                    {currentScene.choices.cautious}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Cautious: DC -2, standard rewards
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
