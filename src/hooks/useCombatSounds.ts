// Built with Bolt.new
/**
 * useCombatSounds Hook - Integration between combat system and sound effects
 * 
 * This hook provides sound effect integration for the combat system,
 * automatically playing appropriate sounds for:
 * - Combat actions (ILLUMINATE, REFLECT, ENDURE, EMBRACE)
 * - Shadow attacks
 * - Victory/defeat scenarios
 */

import { useCallback, useEffect } from 'react';
import { soundManager } from '../utils/sound-manager';
import type { CombatAction } from '../store/game-store';

export interface CombatSoundsOptions {
  /** Enable/disable combat sound effects */
  enabled: boolean;
  /** Volume for combat sounds (0-1) */
  volume: number;
  /** Duration for action sounds in seconds */
  actionSoundDuration: number;
}

export interface CombatSoundsReturn {
  /** Play sound for a combat action */
  playActionSound: (_action: CombatAction) => Promise<void>;
  /** Play sound for shadow attack */
  playShadowAttackSound: () => Promise<void>;
  /** Play victory sound */
  playVictorySound: () => Promise<void>;
  /** Play defeat sound */
  playDefeatSound: () => Promise<void>;
  /** Enable/disable sounds */
  setSoundsEnabled: (_enabled: boolean) => void;
  /** Set volume for combat sounds */
  setSoundVolume: (_volume: number) => void;
  /** Check if sounds are enabled */
  isSoundsEnabled: () => boolean;
}

export function useCombatSounds(
  options: Partial<CombatSoundsOptions> = {}
): CombatSoundsReturn {
  const config: CombatSoundsOptions = {
    enabled: true,
    volume: 0.7,
    actionSoundDuration: 2, // 2 seconds for action sounds
    ...options
  };

  // Initialize sound manager volume
  useEffect(() => {
    soundManager.setVolume(config.volume);
  }, [config.volume]);

  // Play sound for combat actions
  const playActionSound = useCallback(async (action: CombatAction): Promise<void> => {
    if (!config.enabled) return;

    const soundId = action.toLowerCase();
    await soundManager.playSound(soundId, config.actionSoundDuration);
  }, [config.enabled, config.actionSoundDuration]);

  // Play shadow attack sound
  const playShadowAttackSound = useCallback(async (): Promise<void> => {
    if (!config.enabled) return;

    await soundManager.playSound('shadow-attack', config.actionSoundDuration);
  }, [config.enabled, config.actionSoundDuration]);

  // Play victory sound
  const playVictorySound = useCallback(async (): Promise<void> => {
    if (!config.enabled) return;

    await soundManager.playSound('victory', 5); // Longer duration for victory
  }, [config.enabled]);

  // Play defeat sound
  const playDefeatSound = useCallback(async (): Promise<void> => {
    if (!config.enabled) return;

    await soundManager.playSound('defeat', 3); // Medium duration for defeat
  }, [config.enabled]);

  // Enable/disable sounds (React 19 purity compliance - avoid config mutation)
  const setSoundsEnabled = useCallback((enabled: boolean): void => {
    soundManager.setMuted(!enabled);
  }, []);

  // Set sound volume (React 19 purity compliance - avoid config mutation)
  const setSoundVolume = useCallback((volume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    soundManager.setVolume(clampedVolume);
  }, []);

  // Check if sounds are enabled
  const isSoundsEnabled = useCallback((): boolean => {
    return config.enabled && !soundManager.isMuted();
  }, [config.enabled]);

  return {
    playActionSound,
    playShadowAttackSound,
    playVictorySound,
    playDefeatSound,
    setSoundsEnabled,
    setSoundVolume,
    isSoundsEnabled
  };
}

/**
 * Combat sound effect mappings for different actions
 */
export const COMBAT_SOUND_MAPPINGS = {
  ILLUMINATE: 'illuminate',
  REFLECT: 'reflect', 
  ENDURE: 'endure',
  EMBRACE: 'embrace',
  SHADOW_ATTACK: 'shadow-attack',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
} as const;

/**
 * Default combat sounds configuration
 */
export const DEFAULT_COMBAT_SOUNDS_CONFIG: CombatSoundsOptions = {
  enabled: true,
  volume: 0.7,
  actionSoundDuration: 2
};
