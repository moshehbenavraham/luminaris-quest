# Dice Roll Mechanics & UI Reference

This document outlines the dice roll mechanic implementation across the codebase, from the core engine logic to the UI presentation.

## 1. Actual Dice Logic

**Location:** `src/engine/scene-engine.ts`

The core dice logic simulates a d20 roll with level bonuses and checks against a Difficulty Check (DC).

```typescript
/**
 * Result of a dice roll against a difficulty check
 */
export interface DiceResult {
  /** The actual d20 roll result (1-20) */
  roll: number;
  /** The difficulty check target number */
  dc: number;
  /** Whether the roll succeeded (roll >= dc) */
  success: boolean;
}

/**
 * Performs a d20 dice roll against a difficulty check
 */
export const rollDice = (dc: number, levelBonus: number = 0): DiceResult => {
  const baseRoll = Math.floor(Math.random() * 20) + 1; // d20 roll
  const modifiedRoll = baseRoll + levelBonus; // Add level bonus
  return {
    roll: modifiedRoll,
    dc,
    success: modifiedRoll >= dc,
  };
};
```

## 2. Where It Gets Triggered

**Location:** `src/hooks/useSceneChoices.ts`

The dice roll is triggered when a user makes a choice in a scene. The hook calculates the modified DC, performs the roll, and updates the local state to show the dice roll UI.

```typescript
// Apply DC modifier based on choice type
// Bold = +2 DC (harder), Cautious = -2 DC (easier)
const choiceModifiers = getChoiceModifiers(choiceType);
const modifiedDC = currentScene.dc + choiceModifiers.dcModifier;

const levelBonus = getLevelRollBonus(playerLevel);
const result = rollDice(modifiedDC, levelBonus);
setDiceResult(result);
setShowDiceRoll(true);
```

## 3. Where It Gets Mounted

**Location:** `src/components/organisms/ChoiceList.tsx`

The `DiceRollOverlay` component is mounted within the `ChoiceList` component, conditional on the state returned from `useSceneChoices`.

```tsx
const {
  // ...
  showDiceRoll,
  diceResult,
  handleDiceRollClose,
  // ...
} = useSceneChoices({
  // ...
});

// ...

return (
  <>
    {/* ... */}
    {showDiceRoll && diceResult && (
      <DiceRollOverlay result={diceResult} onClose={handleDiceRollClose} />
    )}
    {/* ... */}
  </>
);
```

## 4. The Dice Visual Effect (Full UI)

**Location:** `src/components/molecules/DiceRollOverlay.tsx`

This component is the full UI for the roll effect. It handles playing sounds, delaying the result reveal, and displaying the spinning dice and final result.

- `Line 42`: Plays a random dice sound on mount
- `Line 53`: Waits 1500ms before revealing the result
- `Line 68`: Fullscreen dark/blurry overlay with fade transition
- `Line 81`: `Dice6` icon spins while rolling
- `Line 90`: "Rolling..." text pulses
- `Line 102`: Final roll number display

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dice6 } from 'lucide-react';
import { type DiceResult } from '@/engine/scene-engine';
import { soundManager } from '@/utils/sound-manager';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Register dice sound effects
const DICE_SOUNDS = [
  { id: 'dice1', src: '/audio/dice 001.mp3', volume: 0.5, preload: true },
  { id: 'dice2', src: '/audio/dice 002.mp3', volume: 0.5, preload: true },
  { id: 'dice3', src: '/audio/dice 003.mp3', volume: 0.5, preload: true },
];

// Register all dice sounds on module load
DICE_SOUNDS.forEach((sound) => soundManager.registerSound(sound));

interface DiceRollOverlayProps {
  result: DiceResult;
  onClose: () => void;
}

export function DiceRollOverlay({ result, onClose }: DiceRollOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  // Initialize to true since component only renders when needed
  const [isVisible, setIsVisible] = useState(true);
  // If reduced motion is preferred, show result immediately (skip rolling animation)
  const [showResult, setShowResult] = useState(prefersReducedMotion);

  const handleClose = useCallback(() => {
    // If reduced motion is preferred, close instantly without fade-out delay
    if (prefersReducedMotion) {
      onClose();
      return;
    }
    setIsVisible(false);
    setTimeout(onClose, 1000);
  }, [onClose, prefersReducedMotion]);

  useEffect(() => {
    // Play a random dice sound when rolling starts (still play sound even with reduced motion)
    const randomDiceIndex = Math.floor(Math.random() * DICE_SOUNDS.length);
    const selectedSound = DICE_SOUNDS[randomDiceIndex];
    soundManager.playSound(selectedSound.id);

    // If reduced motion is preferred, result is already shown - skip the timer
    if (prefersReducedMotion) {
      return;
    }

    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, 1500);

    // Note: Auto-close timer removed intentionally (Issue #15 - frontend-ui-audit.md)
    // Users should control their own pace of reflection by clicking "Continue" or the backdrop.
    // This supports therapeutic design principles: user empowerment and reflection opportunities.

    return () => {
      clearTimeout(resultTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <Card
        className={`bg-background/95 border-border/50 mx-4 w-96 transform border shadow-2xl backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-2 text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
            <Dice6
              className={`h-7 w-7 text-white ${!showResult && !prefersReducedMotion ? 'animate-spin' : ''}`}
            />
            Fate&apos;s Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 py-6 text-center">
          {!showResult ? (
            <div className="space-y-3">
              <div
                className={`text-3xl font-bold text-white ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
              >
                Rolling...
              </div>
              <div className="text-base text-white/80">
                Target: <span className="font-medium text-white">{result.dc}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="bg-gradient-to-b from-white to-gray-200 bg-clip-text text-7xl font-extrabold text-transparent">
                  {result.roll}
                </div>
                <div className="text-base text-white/80">
                  vs <span className="font-medium text-white">DC {result.dc}</span>
                </div>
              </div>

              <div
                className={`text-2xl font-bold ${
                  result.success ? 'status-text-success' : 'status-text-warning'
                }`}
              >
                {result.success ? '✨ Success!' : '💡 Try Again'}
              </div>

              <Button
                onClick={handleClose}
                variant={result.success ? 'default' : 'outline'}
                size="lg"
                className={`mt-2 h-11 rounded-full px-8 text-base ${
                  result.success
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'border-amber-500/30 text-white hover:bg-amber-500/10'
                }`}
              >
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```
