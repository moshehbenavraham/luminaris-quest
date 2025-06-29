import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCombatEffects } from '../../hooks/useCombatEffects';
import type { CombatAction } from '@/store/game-store';

interface CombatAnimationProps {
  type: 'attack' | 'defend' | 'spell' | 'special';
  direction: 'player-to-enemy' | 'enemy-to-player';
  onComplete?: () => void;
  className?: string;
  action?: CombatAction;
  playSound?: boolean;
}

export const CombatAnimation: React.FC<CombatAnimationProps> = ({
  type,
  direction,
  onComplete,
  className,
  action,
  playSound = true
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'windup' | 'strike' | 'recovery'>('idle');
  const [isVisible, setIsVisible] = useState(true);
  const { playActionSound, playShadowAttackSound } = useCombatEffects();

  useEffect(() => {
    // Play sound effect when animation starts
    if (playSound) {
      const playAnimationSound = async () => {
        try {
          if (action) {
            // If we have a specific action, play its sound
            await playActionSound(action);
          } else if (direction === 'enemy-to-player') {
            // Enemy attacks use shadow attack sound
            await playShadowAttackSound();
          }
          // For player actions without specific action mapping, we rely on the action being passed
        } catch (error) {
          console.warn(`Failed to play animation sound for ${type}:`, error);
        }
      };
      playAnimationSound();
    }

    const sequence = [
      { phase: 'windup', delay: 0 },
      { phase: 'strike', delay: 200 },
      { phase: 'recovery', delay: 400 },
    ] as const;

    const timers = sequence.map(({ phase, delay }) =>
      setTimeout(() => setAnimationPhase(phase), delay)
    );

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete, playSound, action, direction, type, playActionSound, playShadowAttackSound]);

  if (!isVisible) return null;

  const getAnimationIcon = () => {
    switch (type) {
      case 'attack':
        return '⚔️';
      case 'defend':
        return '🛡️';
      case 'spell':
        return '✨';
      case 'special':
        return '💥';
      default:
        return '⚡';
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';

    switch (animationPhase) {
      case 'windup':
        return cn(baseClasses, 'scale-75 opacity-80', {
          'translate-x-2': direction === 'player-to-enemy',
          '-translate-x-2': direction === 'enemy-to-player'
        });
      case 'strike':
        return cn(baseClasses, 'scale-125 opacity-100', {
          'translate-x-8': direction === 'player-to-enemy',
          '-translate-x-8': direction === 'enemy-to-player'
        });
      case 'recovery':
        return cn(baseClasses, 'scale-100 opacity-60', {
          'translate-x-4': direction === 'player-to-enemy',
          '-translate-x-4': direction === 'enemy-to-player'
        });
      default:
        return baseClasses;
    }
  };

  const getPositionClasses = () => {
    return direction === 'player-to-enemy' 
      ? 'left-1/4 transform -translate-x-1/2'
      : 'right-1/4 transform translate-x-1/2';
  };

  return (
    <div
      className={cn(
        'absolute top-1/2 transform -translate-y-1/2 z-40',
        'pointer-events-none select-none',
        'text-4xl filter drop-shadow-lg',
        getPositionClasses(),
        getAnimationClasses(),
        className
      )}
      role="img"
      aria-label={`${type} animation ${direction}`}
    >
      {getAnimationIcon()}
    </div>
  );
};

