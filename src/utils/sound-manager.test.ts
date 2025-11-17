import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundManager, COMBAT_SOUND_EFFECTS } from '../utils/sound-manager';

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  volume = 1;
  preload = 'none';
  currentTime = 0;
  paused = true;
  
  private eventListeners: { [key: string]: Function[] } = {};

  constructor(src?: string) {
    if (src) this.src = src;
  }

  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  async play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {
    // Mock load method
  }

  // Helper to trigger events
  triggerEvent(event: string) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback());
    }
  }
}

// Mock global Audio
global.Audio = MockAudio as any;

describe('SoundManager', () => {
  let soundManager: SoundManager;
  let consoleSpy: any;

  beforeEach(() => {
    soundManager = new SoundManager();
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    soundManager.dispose();
    consoleSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const manager = new SoundManager();
      expect(manager.getVolume()).toBe(0.7);
      expect(manager.isMuted()).toBe(false);
      expect(manager.isAudioSupported()).toBe(true);
    });

    it('should initialize with custom options', () => {
      const manager = new SoundManager({
        volume: 0.5,
        muted: true,
        preloadSounds: false
      });
      expect(manager.getVolume()).toBe(0.5);
      expect(manager.isMuted()).toBe(true);
    });
  });

  describe('Sound Registration', () => {
    it('should register a sound effect', () => {
      const effect = {
        id: 'test-sound',
        src: '/test.mp3',
        volume: 0.8,
        preload: true
      };

      soundManager.registerSound(effect);
      
      // Should not throw when trying to play registered sound
      expect(() => soundManager.playSound('test-sound')).not.toThrow();
    });

    it('should handle registration errors gracefully', () => {
      // Mock Audio constructor to throw
      const originalAudio = global.Audio;
      global.Audio = vi.fn().mockImplementation(() => {
        throw new Error('Audio not supported');
      });

      const effect = {
        id: 'error-sound',
        src: '/error.mp3'
      };

      soundManager.registerSound(effect);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to register sound effect: error-sound',
        expect.any(Error)
      );

      global.Audio = originalAudio;
    });
  });

  describe('Sound Playback', () => {
    beforeEach(() => {
      soundManager.registerSound({
        id: 'test-sound',
        src: '/test.mp3'
      });
    });

    it('should play a registered sound', async () => {
      await soundManager.playSound('test-sound');
      // Should not throw or log warnings for valid sound
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should warn when playing unregistered sound', async () => {
      await soundManager.playSound('nonexistent-sound');
      expect(consoleSpy).toHaveBeenCalledWith('Sound effect not found: nonexistent-sound');
    });

    it('should not play when muted', async () => {
      soundManager.setMuted(true);
      await soundManager.playSound('test-sound');
      // Should return early without attempting to play
    });

    it('should handle playback errors gracefully', async () => {
      // Mock play method to reject
      const mockAudio = new MockAudio();
      mockAudio.play = vi.fn().mockRejectedValue(new Error('Autoplay blocked'));
      
      soundManager.registerSound({
        id: 'error-sound',
        src: '/error.mp3'
      });

      await soundManager.playSound('error-sound');
      // Should handle error gracefully
    });
  });

  describe('Volume Control', () => {
    it('should set and get volume', () => {
      soundManager.setVolume(0.5);
      expect(soundManager.getVolume()).toBe(0.5);
    });

    it('should clamp volume to valid range', () => {
      soundManager.setVolume(-0.5);
      expect(soundManager.getVolume()).toBe(0);

      soundManager.setVolume(1.5);
      expect(soundManager.getVolume()).toBe(1);
    });

    it('should update volume for all registered sounds', () => {
      const effect1 = { id: 'sound1', src: '/sound1.mp3' };
      const effect2 = { id: 'sound2', src: '/sound2.mp3' };
      
      soundManager.registerSound(effect1);
      soundManager.registerSound(effect2);
      
      soundManager.setVolume(0.3);
      
      // Volume should be applied to all sounds
      expect(soundManager.getVolume()).toBe(0.3);
    });
  });

  describe('Mute Control', () => {
    it('should mute and unmute sounds', () => {
      expect(soundManager.isMuted()).toBe(false);
      
      soundManager.setMuted(true);
      expect(soundManager.isMuted()).toBe(true);
      
      soundManager.setMuted(false);
      expect(soundManager.isMuted()).toBe(false);
    });
  });

  describe('Audio Support Detection', () => {
    it('should detect audio support', () => {
      expect(soundManager.isAudioSupported()).toBe(true);
    });

    it('should handle unsupported audio gracefully', () => {
      // Mock unsupported environment
      const originalAudio = global.Audio;
      delete (global as any).Audio;
      
      const manager = new SoundManager();
      expect(manager.isAudioSupported()).toBe(false);
      
      // Should not throw when registering sounds
      manager.registerSound({ id: 'test', src: '/test.mp3' });
      
      global.Audio = originalAudio;
    });
  });

  describe('Cleanup', () => {
    it('should dispose of all audio resources', () => {
      soundManager.registerSound({ id: 'test1', src: '/test1.mp3' });
      soundManager.registerSound({ id: 'test2', src: '/test2.mp3' });
      
      soundManager.dispose();
      
      // Should warn when trying to play disposed sounds
      soundManager.playSound('test1');
      expect(consoleSpy).toHaveBeenCalledWith('Sound effect not found: test1');
    });
  });
});

describe('COMBAT_SOUND_EFFECTS', () => {
  it('should contain all required combat sound effects', () => {
    const expectedSounds = [
      'illuminate',
      'reflect', 
      'endure',
      'embrace',
      'shadow-attack',
      'victory',
      'defeat'
    ];

    const soundIds = COMBAT_SOUND_EFFECTS.map(effect => effect.id);
    expectedSounds.forEach(expectedId => {
      expect(soundIds).toContain(expectedId);
    });
  });

  it('should have valid sound effect configurations', () => {
    COMBAT_SOUND_EFFECTS.forEach(effect => {
      expect(effect.id).toBeTruthy();
      expect(effect.src).toBeTruthy();
      expect(effect.src).toMatch(/^\/audio\/soundfx-/);
      expect(typeof effect.volume).toBe('number');
      expect(effect.volume).toBeGreaterThan(0);
      expect(effect.volume).toBeLessThanOrEqual(1);
      expect(typeof effect.preload).toBe('boolean');
    });
  });

  it('should use dedicated soundfx files with correct naming convention', () => {
    const expectedMappings = {
      'illuminate': '/audio/soundfx-illuminate.mp3',
      'reflect': '/audio/soundfx-reflect.mp3',
      'endure': '/audio/soundfx-endure.mp3',
      'embrace': '/audio/soundfx-embrace.mp3',
      'shadow-attack': '/audio/soundfx-shadow-attack.mp3',
      'victory': '/audio/soundfx-victory.mp3',
      'defeat': '/audio/soundfx-defeat.mp3'
    };

    COMBAT_SOUND_EFFECTS.forEach(effect => {
      expect(expectedMappings[effect.id as keyof typeof expectedMappings]).toBe(effect.src);
    });
  });
});
