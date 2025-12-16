import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCombatEffects } from '../../hooks/useCombatEffects';

interface TherapeuticInsightProps {
  message: string;
  type: 'encouragement' | 'guidance' | 'reflection' | 'celebration';
  guardianName?: string;
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
  className?: string;
  playSound?: boolean;
}

export const TherapeuticInsight: React.FC<TherapeuticInsightProps> = ({
  message,
  type,
  guardianName = 'Your Guardian',
  autoHide = true,
  duration = 5000,
  onClose,
  className,
  playSound = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const { playStatusSound } = useCombatEffects();

  useEffect(() => {
    // Play sound effect when insight appears
    if (playSound) {
      // All therapeutic insights use positive sound
      playStatusSound('positive').catch((error) => {
        console.warn(`Failed to play therapeutic insight sound for ${type}:`, error);
      });
    }

    const enterTimer = setTimeout(() => setAnimationPhase('visible'), 200);

    let exitTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    if (autoHide) {
      exitTimer = setTimeout(() => setAnimationPhase('exit'), duration - 400);
      closeTimer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
    }

    return () => {
      clearTimeout(enterTimer);
      if (exitTimer) clearTimeout(exitTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [autoHide, duration, onClose, playSound, type, playStatusSound]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'encouragement':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-400';
      case 'guidance':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-400';
      case 'reflection':
        return 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-400';
      case 'celebration':
        return 'bg-gradient-to-r from-green-600 to-green-700 border-green-400';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'encouragement':
        return '🌟';
      case 'guidance':
        return '💡';
      case 'reflection':
        return '🤔';
      case 'celebration':
        return '🎉';
      default:
        return '✨';
    }
  };

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'enter':
        return 'opacity-0 translate-y-4 scale-95';
      case 'visible':
        return 'opacity-100 translate-y-0 scale-100';
      case 'exit':
        return 'opacity-0 translate-y-4 scale-95';
      default:
        return '';
    }
  };

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 400);
  };

  return (
    <div
      className={cn(
        'fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md',
        'rounded-xl border-2 p-4 shadow-2xl',
        'transition-all duration-400 ease-out',
        'backdrop-blur-sm',
        getTypeStyles(),
        getAnimationClasses(),
        className,
      )}
      role="dialog"
      aria-live="polite"
      aria-labelledby="therapeutic-insight-title"
    >
      <div className="flex items-start space-x-3 text-white">
        <div className="mt-1 shrink-0 text-2xl">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <div id="therapeutic-insight-title" className="mb-1 text-sm font-semibold text-white/90">
            {guardianName}
          </div>
          <div className="text-sm leading-relaxed text-white/95">{message}</div>
        </div>
        {!autoHide && (
          <button
            onClick={handleClose}
            className="ml-2 shrink-0 text-white/60 transition-colors hover:text-white/80"
            aria-label="Close insight"
          >
            ✕
          </button>
        )}
      </div>

      {autoHide && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white/60 transition-all ease-linear"
            style={{
              width: animationPhase === 'visible' ? '0%' : '100%',
              transitionDuration: animationPhase === 'visible' ? `${duration}ms` : '0ms',
            }}
          />
        </div>
      )}
    </div>
  );
};
