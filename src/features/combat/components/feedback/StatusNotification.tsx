import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCombatEffects } from '../../hooks/useCombatEffects';

interface StatusNotificationProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  className?: string;
  playSound?: boolean;
}

export const StatusNotification: React.FC<StatusNotificationProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
  className,
  playSound = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const { playStatusSound } = useCombatEffects();

  useEffect(() => {
    // Play sound effect when notification appears
    if (playSound) {
      const soundType = type === 'success' ? 'positive' : type === 'error' ? 'negative' : 'neutral';
      playStatusSound(soundType).catch((error) => {
        console.warn(`Failed to play status sound for ${type}:`, error);
      });
    }

    const enterTimer = setTimeout(() => setAnimationPhase('visible'), 100);
    const exitTimer = setTimeout(() => setAnimationPhase('exit'), duration - 300);
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose, playSound, type, playStatusSound]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-green-50';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-yellow-50';
      case 'error':
        return 'bg-red-600 border-red-500 text-red-50';
      case 'info':
        return 'bg-blue-600 border-blue-500 text-blue-50';
      default:
        return 'bg-gray-600 border-gray-500 text-gray-50';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'enter':
        return 'opacity-0 translate-y-2 scale-95';
      case 'visible':
        return 'opacity-100 translate-y-0 scale-100';
      case 'exit':
        return 'opacity-0 translate-y-2 scale-95';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-full max-w-sm',
        'rounded-lg border-l-4 px-4 py-3 shadow-lg',
        'transition-all duration-300 ease-out',
        'flex items-center space-x-3',
        getTypeStyles(),
        getAnimationClasses(),
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0 text-lg font-bold">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => {
          setAnimationPhase('exit');
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 300);
        }}
        className="shrink-0 text-white/80 transition-colors hover:text-white"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
