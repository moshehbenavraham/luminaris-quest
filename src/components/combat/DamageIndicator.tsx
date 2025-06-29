/**
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 * 
 * This file is part of the DEPRECATED combat system.
 * It only exists for backwards compatibility when using ?legacyCombat=1
 * 
 * DO NOT USE THIS FILE FOR NEW DEVELOPMENT!
 * 
 * For new development, use the NEW combat system at:
 * → /src/features/combat/
 * 
 * See COMBAT_MIGRATION_GUIDE.md for migration details.
 * 
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DamageIndicator - Visual feedback component for showing damage taken
 * 
 * This component provides clear visual feedback when the player takes damage:
 * - Animated damage numbers that float up and fade out
 * - Screen shake effect for impact
 * - Color-coded damage types (health damage = red)
 * - Accessible announcements for screen readers
 */

interface DamageIndicatorProps {
  /** Amount of damage taken */
  damage: number;
  /** Type of damage for color coding */
  damageType?: 'health' | 'resource';
  /** Whether to show the damage indicator */
  show: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

export const DamageIndicator = React.memo(function DamageIndicator({
  damage,
  damageType = 'health',
  show,
  onComplete,
  'data-testid': testId
}: DamageIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && damage > 0) {
      setIsVisible(true);
      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, damage, onComplete]);

  // Don't render if no damage or not visible
  if (!isVisible || damage <= 0) {
    return null;
  }

  // Color scheme based on damage type - using high-contrast classes
  const colorScheme = damageType === 'health' 
    ? 'combat-text-damage'
    : 'combat-text-mana'; // Using mana class for resource damage as it provides good contrast

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0, 1, 1, 0], 
          y: [-20, -40, -60, -80], 
          scale: [0.5, 1.2, 1, 0.8] 
        }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ 
          duration: 2,
          times: [0, 0.2, 0.8, 1],
          ease: "easeOut"
        }}
        className={`
          fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          pointer-events-none z-50
          font-bold text-4xl ${colorScheme}
          select-none
        `}
        data-testid={testId || 'damage-indicator'}
        role="status"
        aria-live="polite"
        aria-label={`Took ${damage} ${damageType} damage`}
      >
        -{damage}
      </motion.div>
    </AnimatePresence>
  );
});

/**
 * ScreenShake - Screen shake effect component for impact feedback
 */
interface ScreenShakeProps {
  /** Whether to trigger the shake effect */
  trigger: boolean;
  /** Intensity of the shake (1-10) */
  intensity?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Callback when shake completes */
  onComplete?: () => void;
  /** Children to apply shake effect to */
  children: React.ReactNode;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

export const ScreenShake = React.memo(function ScreenShake({
  trigger,
  intensity = 3,
  duration = 500,
  onComplete,
  children,
  'data-testid': testId
}: ScreenShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete]);

  // Generate random shake values based on intensity
  const shakeKeyframes = Array.from({ length: 10 }, () => ({
    x: (Math.random() - 0.5) * intensity * 2,
    y: (Math.random() - 0.5) * intensity * 2,
  }));

  return (
    <motion.div
      animate={isShaking ? {
        x: shakeKeyframes.map(k => k.x),
        y: shakeKeyframes.map(k => k.y),
      } : { x: 0, y: 0 }}
      transition={{
        duration: duration / 1000,
        ease: "easeInOut",
        times: Array.from({ length: 10 }, (_, i) => i / 9)
      }}
      data-testid={testId || 'screen-shake'}
    >
      {children}
    </motion.div>
  );
});

/**
 * CombinedDamageEffect - Combines damage indicator and screen shake
 */
interface CombinedDamageEffectProps {
  /** Amount of damage taken */
  damage: number;
  /** Whether to show the damage effect */
  show: boolean;
  /** Callback when all effects complete */
  onComplete?: () => void;
  /** Children to apply effects to */
  children: React.ReactNode;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

export const CombinedDamageEffect = React.memo(function CombinedDamageEffect({
  damage,
  show,
  onComplete,
  children,
  'data-testid': testId
}: CombinedDamageEffectProps) {
  // Track completion of both shake and damage indicator effects
  // Note: effectsCompleted state is managed through setEffectsCompleted callback
  const [/* effectsCompleted */, setEffectsCompleted] = useState(0);

  const handleEffectComplete = () => {
    setEffectsCompleted(prev => {
      const newCount = prev + 1;
      if (newCount >= 2) { // Both shake and damage indicator completed
        onComplete?.();
        return 0; // Reset for next time
      }
      return newCount;
    });
  };

  return (
    <ScreenShake
      trigger={show && damage > 0}
      intensity={Math.min(damage, 5)} // Scale intensity with damage, max 5
      onComplete={handleEffectComplete}
      data-testid={testId ? `${testId}-shake` : 'combined-damage-shake'}
    >
      {children}
      <DamageIndicator
        damage={damage}
        show={show}
        onComplete={handleEffectComplete}
        data-testid={testId ? `${testId}-indicator` : 'combined-damage-indicator'}
      />
    </ScreenShake>
  );
});

export default DamageIndicator;
