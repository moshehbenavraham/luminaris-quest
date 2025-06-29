// Built with Bolt.new
/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * useCombatEffects Hook - Sound/animation effects integration for combat system
 * 
 * This hook provides centralized sound and animation effect management for the
 * new combat system, integrating with the existing sound manager and ensuring
 * proper timing and coordination of audio-visual feedback.
 */

import { useCallback } from 'react';
import { useCombatSounds } from '@/hooks/useCombatSounds';
import type { CombatAction } from '@/store/game-store';

export interface CombatEffectsOptions {
  /** Enable/disable sound effects */
  soundEnabled?: boolean;
  /** Enable/disable animations */
  animationsEnabled?: boolean;
  /** Volume for combat sounds (0-1) */
  volume?: number;
}

export interface CombatEffectsReturn {
  // Sound effects
  playActionSound: (action: CombatAction) => Promise<void>;
  playShadowAttackSound: () => Promise<void>;
  playVictorySound: () => Promise<void>;
  playDefeatSound: () => Promise<void>;
  playDamageSound: (type: 'damage' | 'heal' | 'miss') => Promise<void>;
  playStatusSound: (type: 'positive' | 'negative' | 'neutral') => Promise<void>;
  playTurnTransitionSound: () => Promise<void>;
  
  // Configuration
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  isSoundEnabled: () => boolean;
  
  // Animation coordination
  triggerDamageAnimation: (damage: number, type: 'damage' | 'heal' | 'miss', position: { x: number; y: number }) => void;
  triggerCombatAnimation: (type: 'attack' | 'defend' | 'spell' | 'special', direction: 'player-to-enemy' | 'enemy-to-player') => void;
  triggerStatusNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerTherapeuticInsight: (message: string, type: 'encouragement' | 'guidance' | 'reflection' | 'celebration') => void;
}

export function useCombatEffects(options: CombatEffectsOptions = {}): CombatEffectsReturn {
  const {
    soundEnabled = true,
    animationsEnabled = true,
    volume = 0.7
  } = options;

  // Initialize combat sounds hook
  const {
    playActionSound: basePlayActionSound,
    playShadowAttackSound: basePlayShadowAttackSound,
    playVictorySound: basePlayVictorySound,
    playDefeatSound: basePlayDefeatSound,
    setSoundsEnabled,
    setSoundVolume,
    isSoundsEnabled
  } = useCombatSounds({
    enabled: soundEnabled,
    volume,
    actionSoundDuration: 2
  });

  // Enhanced action sound with error handling
  const playActionSound = useCallback(async (action: CombatAction): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      await basePlayActionSound(action);
    } catch (error) {
      console.warn(`Failed to play action sound for ${action}:`, error);
    }
  }, [soundEnabled, basePlayActionSound]);

  // Shadow attack sound with error handling
  const playShadowAttackSound = useCallback(async (): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      await basePlayShadowAttackSound();
    } catch (error) {
      console.warn('Failed to play shadow attack sound:', error);
    }
  }, [soundEnabled, basePlayShadowAttackSound]);

  // Victory sound with error handling
  const playVictorySound = useCallback(async (): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      await basePlayVictorySound();
    } catch (error) {
      console.warn('Failed to play victory sound:', error);
    }
  }, [soundEnabled, basePlayVictorySound]);

  // Defeat sound with error handling
  const playDefeatSound = useCallback(async (): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      await basePlayDefeatSound();
    } catch (error) {
      console.warn('Failed to play defeat sound:', error);
    }
  }, [soundEnabled, basePlayDefeatSound]);

  // Damage-specific sounds (using existing action sounds creatively)
  const playDamageSound = useCallback(async (type: 'damage' | 'heal' | 'miss'): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      switch (type) {
        case 'damage':
          // Use shadow attack sound for damage taken
          await basePlayShadowAttackSound();
          break;
        case 'heal':
          // Use reflect sound for healing
          await basePlayActionSound('REFLECT');
          break;
        case 'miss':
          // No sound for miss (intentional silence for misses)
          break;
      }
    } catch (error) {
      console.warn(`Failed to play damage sound for ${type}:`, error);
    }
  }, [soundEnabled, basePlayShadowAttackSound, basePlayActionSound]);

  // Status effect sounds
  const playStatusSound = useCallback(async (type: 'positive' | 'negative' | 'neutral'): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      switch (type) {
        case 'positive':
          // Use endure sound for positive effects
          await basePlayActionSound('ENDURE');
          break;
        case 'negative':
          // Use shadow attack for negative effects
          await basePlayShadowAttackSound();
          break;
        case 'neutral':
          // Use illuminate sound for neutral effects
          await basePlayActionSound('ILLUMINATE');
          break;
      }
    } catch (error) {
      console.warn(`Failed to play status sound for ${type}:`, error);
    }
  }, [soundEnabled, basePlayActionSound, basePlayShadowAttackSound]);

  // Turn transition sound (subtle)
  const playTurnTransitionSound = useCallback(async (): Promise<void> => {
    if (!soundEnabled) return;
    
    try {
      // Use a short burst of illuminate sound for turn transitions
      await basePlayActionSound('ILLUMINATE');
    } catch (error) {
      console.warn('Failed to play turn transition sound:', error);
    }
  }, [soundEnabled, basePlayActionSound]);

  // Animation triggers (placeholder implementations for future integration)
  const triggerDamageAnimation = useCallback((
    _damage: number, 
    _type: 'damage' | 'heal' | 'miss', 
    _position: { x: number; y: number }
  ): void => {
    if (!animationsEnabled) return;
    // Future: Trigger damage indicator animation
    // This would integrate with a global animation queue/system
  }, [animationsEnabled]);

  const triggerCombatAnimation = useCallback((
    _type: 'attack' | 'defend' | 'spell' | 'special', 
    _direction: 'player-to-enemy' | 'enemy-to-player'
  ): void => {
    if (!animationsEnabled) return;
    // Future: Trigger combat animation
    // This would integrate with a global animation system
  }, [animationsEnabled]);

  const triggerStatusNotification = useCallback((
    _message: string, 
    _type: 'success' | 'warning' | 'error' | 'info'
  ): void => {
    if (!animationsEnabled) return;
    // Future: Trigger status notification
    // This would integrate with a notification system
  }, [animationsEnabled]);

  const triggerTherapeuticInsight = useCallback((
    _message: string, 
    _type: 'encouragement' | 'guidance' | 'reflection' | 'celebration'
  ): void => {
    if (!animationsEnabled) return;
    // Future: Trigger therapeutic insight
    // This would integrate with the insight system
  }, [animationsEnabled]);

  return {
    // Sound effects
    playActionSound,
    playShadowAttackSound,
    playVictorySound,
    playDefeatSound,
    playDamageSound,
    playStatusSound,
    playTurnTransitionSound,
    
    // Configuration
    setSoundEnabled: setSoundsEnabled,
    setSoundVolume,
    isSoundEnabled: isSoundsEnabled,
    
    // Animation coordination (placeholder for future expansion)
    triggerDamageAnimation,
    triggerCombatAnimation,
    triggerStatusNotification,
    triggerTherapeuticInsight
  };
}