
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dice6 } from 'lucide-react';
import { type DiceResult } from '@/engine/scene-engine';
import { soundManager } from '@/utils/sound-manager';

// Register dice sound effects
const DICE_SOUNDS = [
  { id: 'dice1', src: '/audio/dice 001.mp3', volume: 0.5, preload: true },
  { id: 'dice2', src: '/audio/dice 002.mp3', volume: 0.5, preload: true },
  { id: 'dice3', src: '/audio/dice 003.mp3', volume: 0.5, preload: true }
];

// Register all dice sounds on module load
DICE_SOUNDS.forEach(sound => soundManager.registerSound(sound));

interface DiceRollOverlayProps {
  result: DiceResult;
  onClose: () => void;
}

export function DiceRollOverlay({ result, onClose }: DiceRollOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 1000);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);

    // Play a random dice sound when rolling starts
    const randomDiceIndex = Math.floor(Math.random() * DICE_SOUNDS.length);
    const selectedSound = DICE_SOUNDS[randomDiceIndex];
    soundManager.playSound(selectedSound.id);

    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, 1500);

    const closeTimer = setTimeout(() => {
      handleClose();
    }, 7000);

    return () => {
      clearTimeout(resultTimer);
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

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
            <Dice6 className={`h-7 w-7 ${!showResult ? 'animate-spin' : ''} text-white`} />
            Fate&apos;s Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 py-6 text-center">
          {!showResult ? (
            <div className="space-y-3">
              <div className="animate-pulse text-3xl font-bold text-white">Rolling...</div>
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
                  result.success ? 'combat-text-heal' : 'combat-text-critical'
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
                    ? 'bg-primary hover:bg-primary/90 text-white'
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
