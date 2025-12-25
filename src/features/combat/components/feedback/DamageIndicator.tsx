import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCombatEffects } from '../../hooks/useCombatEffects';

interface DamageIndicatorProps {
  damage: number;
  type: 'damage' | 'heal' | 'miss';
  position: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
  playSound?: boolean;
}

export const DamageIndicator: React.FC<DamageIndicatorProps> = ({
  damage,
  type,
  position,
  onComplete,
  className,
  playSound = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'appear' | 'float' | 'fade'>('appear');
  const { playDamageSound } = useCombatEffects();

  useEffect(() => {
    // Play sound effect when component first appears
    if (playSound) {
      playDamageSound(type).catch((error) => {
        console.warn(`Failed to play damage sound for ${type}:`, error);
      });
    }

    const timer1 = setTimeout(() => setAnimationPhase('float'), 100);
    const timer2 = setTimeout(() => setAnimationPhase('fade'), 800);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, playSound, type, playDamageSound]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'damage':
        return 'text-red-500 font-bold text-2xl';
      case 'heal':
        return 'text-green-500 font-bold text-xl';
      case 'miss':
        return 'text-gray-400 font-medium text-lg';
      default:
        return 'text-white font-medium text-lg';
    }
  };

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'appear':
        return 'scale-150 opacity-100';
      case 'float':
        return 'scale-100 opacity-100 -translate-y-8';
      case 'fade':
        return 'scale-75 opacity-0 -translate-y-12';
      default:
        return '';
    }
  };

  const displayText = type === 'miss' ? 'MISS!' : Math.abs(damage).toString();

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-50 select-none',
        'transition-all duration-300 ease-out',
        getTypeStyles(),
        getAnimationClasses(),
        className,
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
      }}
      aria-live="polite"
      role="status"
    >
      {type === 'heal' && '+'}
      {displayText}
    </div>
  );
};
