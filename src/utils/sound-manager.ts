/**
 * Sound Manager - Utility for managing combat sound effects and audio cues
 * 
 * This utility provides a clean interface for playing sound effects during combat,
 * with features like:
 * - Volume control and muting
 * - Preloading for performance
 * - Error handling for missing files
 * - Browser compatibility checks
 */

export interface SoundEffect {
  id: string;
  src: string;
  volume?: number;
  preload?: boolean;
}

export interface SoundManagerOptions {
  volume: number;
  muted: boolean;
  preloadSounds: boolean;
}

export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private options: SoundManagerOptions;
  private isSupported: boolean;

  constructor(options: Partial<SoundManagerOptions> = {}) {
    this.options = {
      volume: 0.7,
      muted: false,
      preloadSounds: true,
      ...options
    };
    
    // Check if audio is supported
    this.isSupported = typeof Audio !== 'undefined';
  }

  /**
   * Register a sound effect for later use
   */
  registerSound(effect: SoundEffect): void {
    if (!this.isSupported) return;

    try {
      const audio = new Audio(effect.src);
      audio.volume = (effect.volume ?? 1) * this.options.volume;
      audio.preload = effect.preload ? 'auto' : 'none';
      
      // Handle loading errors gracefully
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound effect: ${effect.id} (${effect.src})`);
      });

      this.sounds.set(effect.id, audio);

      // Preload if requested
      if (this.options.preloadSounds && effect.preload !== false) {
        audio.load();
      }
    } catch (error) {
      console.warn(`Failed to register sound effect: ${effect.id}`, error);
    }
  }

  /**
   * Play a sound effect by ID
   */
  async playSound(id: string, duration?: number): Promise<void> {
    if (!this.isSupported || this.options.muted) return;

    const audio = this.sounds.get(id);
    if (!audio) {
      console.warn(`Sound effect not found: ${id}`);
      return;
    }

    try {
      // Reset to beginning if already playing
      audio.currentTime = 0;
      await audio.play();

      // If duration is specified, stop after that time
      if (duration && duration > 0) {
        setTimeout(() => {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }, duration * 1000);
      }
    } catch (error) {
      // Handle autoplay restrictions gracefully
      console.warn(`Failed to play sound effect: ${id}`, error);
    }
  }

  /**
   * Set global volume (0-1)
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all registered sounds
    this.sounds.forEach(audio => {
      audio.volume = this.options.volume;
    });
  }

  /**
   * Mute or unmute all sounds
   */
  setMuted(muted: boolean): void {
    this.options.muted = muted;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.options.volume;
  }

  /**
   * Check if sounds are muted
   */
  isMuted(): boolean {
    return this.options.muted;
  }

  /**
   * Check if audio is supported
   */
  isAudioSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Cleanup all audio resources
   */
  dispose(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.sounds.clear();
  }
}

// Combat-specific sound effects configuration
// Using dedicated sound effect files with soundfx- prefix
export const COMBAT_SOUND_EFFECTS: SoundEffect[] = [
  // Combat Actions - dedicated sound effects
  {
    id: 'illuminate',
    src: '/audio/soundfx-illuminate.mp3',
    volume: 0.5, // Higher volume for dedicated SFX
    preload: true
  },
  {
    id: 'reflect',
    src: '/audio/soundfx-reflect.mp3',
    volume: 0.5,
    preload: true
  },
  {
    id: 'endure',
    src: '/audio/soundfx-endure.mp3',
    volume: 0.4, // Slightly quieter for defensive action
    preload: true
  },
  {
    id: 'embrace',
    src: '/audio/soundfx-embrace.mp3',
    volume: 0.5,
    preload: true
  },

  // Shadow Actions
  {
    id: 'shadow-attack',
    src: '/audio/soundfx-shadow-attack.mp3',
    volume: 0.5,
    preload: true
  },

  // Combat End
  {
    id: 'victory',
    src: '/audio/soundfx-victory.mp3',
    volume: 0.6, // Slightly louder for victory
    preload: true
  },
  {
    id: 'defeat',
    src: '/audio/soundfx-defeat.mp3',
    volume: 0.5,
    preload: true
  }
];

// Global sound manager instance
export const soundManager = new SoundManager({
  volume: 0.7,
  muted: false,
  preloadSounds: true
});

// Initialize combat sound effects
COMBAT_SOUND_EFFECTS.forEach(effect => {
  soundManager.registerSound(effect);
});
