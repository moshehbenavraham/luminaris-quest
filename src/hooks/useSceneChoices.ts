import { useCallback, useMemo, useState } from 'react';
import {
  getChoiceModifiers,
  getLevelRollBonus,
  getScene,
  getSceneProgress,
  handleSceneOutcome,
  isLastScene,
  rollDice,
  type ChoiceType,
  type DiceResult,
  type Scene,
} from '@/engine/scene-engine';
import { useCombatStore } from '@/features/combat';
import { createShadowManifestation } from '@/data/shadowManifestations';
import { getLevelBenefits, useGameStore } from '@/store/game-store';
import { usePlayerResources } from '@/store/slices';

export interface UseSceneChoicesParams {
  guardianTrust: number;
  setGuardianTrust: (_trust: number) => void;
  setGuardianMessage: (_message: string) => void;
  onSceneComplete?: (_sceneId: string, _success: boolean) => void;
  onLearningMoment?: () => void;
}

export interface UseSceneChoicesResult {
  currentScene: Scene;
  progress: { current: number; total: number };

  showDiceRoll: boolean;
  diceResult: DiceResult | null;
  isProcessing: boolean;
  isJourneyComplete: boolean;

  // UI-display helpers (mirrors existing ChoiceList display logic)
  energyCostToAttempt: number;
  energyRewardOnSuccess: number;
  lpRewardOnSuccess: number | null;
  spPenaltyOnFailure: number | null;

  // Actions
  handleChoice: (choiceType: ChoiceType) => void;
  handleDiceRollClose: () => void;
  handleNewJourney: () => void;
}

const getDefaultLPRewardForDisplay = (sceneType: Scene['type']): number => {
  switch (sceneType) {
    case 'social':
      return 3;
    case 'skill':
      return 2;
    case 'exploration':
      return 3;
    default:
      return 2;
  }
};

const getDefaultSPPenaltyForDisplay = (sceneType: Scene['type']): number => {
  switch (sceneType) {
    case 'social':
      return 2;
    case 'skill':
      return 1;
    case 'exploration':
      return 2;
    default:
      return 1;
  }
};

export function useSceneChoices({
  guardianTrust,
  setGuardianTrust,
  setGuardianMessage,
  onSceneComplete,
  onLearningMoment,
}: UseSceneChoicesParams): UseSceneChoicesResult {
  const {
    completeScene,
    resetGame,
    currentSceneIndex,
    advanceScene,
    modifyLightPoints,
    modifyShadowPoints,
    modifyPlayerEnergy,
    modifyExperiencePoints,
    playerLevel,
    playerEnergy,
  } = useGameStore();

  // Get startCombat from NEW combat store
  const { startCombat: startNewCombat } = useCombatStore();

  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingChoiceType, setPendingChoiceType] = useState<ChoiceType | null>(null);

  const currentScene = useMemo(() => getScene(currentSceneIndex), [currentSceneIndex]);
  const progress = useMemo(() => getSceneProgress(currentSceneIndex), [currentSceneIndex]);

  const previewOutcome = useMemo(() => handleSceneOutcome(currentScene, true), [currentScene]);
  const energyCostToAttempt = useMemo(
    () => Math.abs(previewOutcome.energyChanges?.energyCost ?? 0),
    [previewOutcome],
  );
  const energyRewardOnSuccess = useMemo(
    () => previewOutcome.energyChanges?.energyReward ?? 0,
    [previewOutcome],
  );

  const lpRewardOnSuccess = useMemo(() => {
    if (currentScene.type === 'combat' && currentScene.lpReward === undefined) return null;
    return currentScene.lpReward ?? getDefaultLPRewardForDisplay(currentScene.type);
  }, [currentScene]);

  const spPenaltyOnFailure = useMemo(() => {
    if (currentScene.type === 'combat') return null;
    return currentScene.spPenalty ?? getDefaultSPPenaltyForDisplay(currentScene.type);
  }, [currentScene]);

  const isJourneyComplete = useMemo(
    () => isLastScene(currentSceneIndex) && !showDiceRoll,
    [currentSceneIndex, showDiceRoll],
  );

  const handleChoice = useCallback(
    (choiceType: ChoiceType) => {
      if (isProcessing) return;

      if (playerEnergy < energyCostToAttempt) {
        setGuardianMessage(
          `You need ${energyCostToAttempt} energy to attempt this ${currentScene.type} challenge, but you only have ${playerEnergy}. Rest and let your energy regenerate before trying again.`,
        );
        return;
      }

      setIsProcessing(true);
      setPendingChoiceType(choiceType);

      // Apply DC modifier based on choice type
      // Bold = +2 DC (harder), Cautious = -2 DC (easier)
      const choiceModifiers = getChoiceModifiers(choiceType);
      const modifiedDC = currentScene.dc + choiceModifiers.dcModifier;

      const levelBonus = getLevelRollBonus(playerLevel);
      const result = rollDice(modifiedDC, levelBonus);
      setDiceResult(result);
      setShowDiceRoll(true);
    },
    [
      currentScene,
      energyCostToAttempt,
      isProcessing,
      playerEnergy,
      playerLevel,
      setGuardianMessage,
    ],
  );

  const handleDiceRollClose = useCallback(() => {
    if (!diceResult) return;

    setShowDiceRoll(false);

    const outcome = handleSceneOutcome(
      currentScene,
      diceResult.success,
      diceResult.roll,
      currentSceneIndex,
      pendingChoiceType || undefined,
    );

    // Update guardian trust and message based on result
    // Include trust bonus from choice type (bold gives +2 on success)
    const baseTrustChange = diceResult.success ? 5 : -5;
    const choiceTrustBonus = outcome.trustModifiers?.trustBonus || 0;
    const levelBenefits = getLevelBenefits(playerLevel);

    // Apply trust gain multiplier only to positive changes
    const totalBaseTrust = baseTrustChange + (diceResult.success ? choiceTrustBonus : 0);
    const multipliedTrustChange =
      totalBaseTrust > 0
        ? Math.round(totalBaseTrust * levelBenefits.trustGainMultiplier)
        : totalBaseTrust;

    const newTrust = Math.min(100, Math.max(0, guardianTrust + multipliedTrustChange));
    setGuardianTrust(newTrust);

    setGuardianMessage(diceResult.success ? currentScene.successText : currentScene.failureText);

    // Apply energy changes (cost is always applied, reward only on success)
    if (outcome.energyChanges) {
      if (outcome.energyChanges.energyCost) {
        // Apply energy cost reduction benefit (reduce the cost by the benefit amount)
        const baseCost = outcome.energyChanges.energyCost; // This is negative
        const reducedCost = Math.min(0, baseCost + levelBenefits.energyCostReduction); // Less negative = reduced cost
        modifyPlayerEnergy(reducedCost);
      }

      if (outcome.energyChanges.energyReward && diceResult.success) {
        modifyPlayerEnergy(outcome.energyChanges.energyReward);
      }
    }

    // Apply resource changes if not triggering combat
    if (!outcome.triggeredCombat && outcome.resourceChanges) {
      if (outcome.resourceChanges.lpChange) {
        modifyLightPoints(outcome.resourceChanges.lpChange);
      }

      if (outcome.resourceChanges.spChange) {
        modifyShadowPoints(outcome.resourceChanges.spChange);
      }
    }

    // Apply experience points (always awarded for scene attempts)
    if (outcome.experienceChanges?.xpGained) {
      modifyExperiencePoints(outcome.experienceChanges.xpGained, outcome.experienceChanges.reason);
    }

    // Record the completed scene
    completeScene({
      id: `scene-${Date.now()}`,
      sceneId: currentScene.id,
      type: currentScene.type,
      title: currentScene.title,
      success: diceResult.success,
      roll: diceResult.roll,
      dc: currentScene.dc,
      trustChange: multipliedTrustChange,
      completedAt: Date.now(),
    });

    // Trigger combat if needed
    if (outcome.triggeredCombat && outcome.shadowType) {
      const shadowEnemy = createShadowManifestation(outcome.shadowType);

      if (shadowEnemy) {
        // Read from the shared resource store to avoid passing stale values that could overwrite
        // recent energy/resource mutations done earlier in this handler.
        const resourceSnapshot = usePlayerResources.getState().getResourceSnapshot();

        startNewCombat(shadowEnemy, {
          lightPoints: resourceSnapshot.lightPoints,
          shadowPoints: resourceSnapshot.shadowPoints,
          playerHealth: resourceSnapshot.playerHealth,
          playerLevel,
          playerEnergy: resourceSnapshot.playerEnergy,
          maxPlayerEnergy: resourceSnapshot.maxPlayerEnergy,
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
    setPendingChoiceType(null);

    onSceneComplete?.(currentScene.id, diceResult.success);
    if (onLearningMoment && !diceResult.success) {
      onLearningMoment();
    }
  }, [
    advanceScene,
    completeScene,
    currentScene,
    currentSceneIndex,
    diceResult,
    guardianTrust,
    modifyExperiencePoints,
    modifyLightPoints,
    modifyPlayerEnergy,
    modifyShadowPoints,
    onLearningMoment,
    onSceneComplete,
    pendingChoiceType,
    playerLevel,
    setGuardianMessage,
    setGuardianTrust,
    startNewCombat,
  ]);

  const handleNewJourney = useCallback(() => {
    resetGame();
    setGuardianMessage(
      'I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward.',
    );
  }, [resetGame, setGuardianMessage]);

  return {
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
  };
}
