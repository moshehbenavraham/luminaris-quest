import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCombatSounds, COMBAT_SOUND_MAPPINGS, DEFAULT_COMBAT_SOUNDS_CONFIG } from '../hooks/useCombatSounds';
import { soundManager } from '../utils/sound-manager';

// Mock the sound manager
vi.mock('../utils/sound-manager', () => ({
  soundManager: {
    playSound: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
    getVolume: vi.fn().mockReturnValue(0.7)
  }
}));

describe('useCombatSounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => useCombatSounds());
      
      expect(result.current.isSoundsEnabled()).toBe(true);
      expect(soundManager.setVolume).toHaveBeenCalledWith(0.7);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        enabled: false,
        volume: 0.5,
        actionSoundDuration: 3
      };

      const { result } = renderHook(() => useCombatSounds(customOptions));
      
      expect(result.current.isSoundsEnabled()).toBe(false);
      expect(soundManager.setVolume).toHaveBeenCalledWith(0.5);
    });
  });

  describe('Action Sound Effects', () => {
    it('should play ILLUMINATE action sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playActionSound('ILLUMINATE');
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('illuminate', 2);
    });

    it('should play REFLECT action sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playActionSound('REFLECT');
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('reflect', 2);
    });

    it('should play ENDURE action sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playActionSound('ENDURE');
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('endure', 2);
    });

    it('should play EMBRACE action sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playActionSound('EMBRACE');
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('embrace', 2);
    });

    it('should not play action sounds when disabled', async () => {
      const { result } = renderHook(() => useCombatSounds({ enabled: false }));
      
      await act(async () => {
        await result.current.playActionSound('ILLUMINATE');
      });

      expect(soundManager.playSound).not.toHaveBeenCalled();
    });

    it('should use custom action sound duration', async () => {
      const { result } = renderHook(() => useCombatSounds({ actionSoundDuration: 5 }));
      
      await act(async () => {
        await result.current.playActionSound('ILLUMINATE');
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('illuminate', 5);
    });
  });

  describe('Shadow Attack Sound Effects', () => {
    it('should play shadow attack sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playShadowAttackSound();
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('shadow-attack', 2);
    });

    it('should not play shadow attack sound when disabled', async () => {
      const { result } = renderHook(() => useCombatSounds({ enabled: false }));
      
      await act(async () => {
        await result.current.playShadowAttackSound();
      });

      expect(soundManager.playSound).not.toHaveBeenCalled();
    });
  });

  describe('Victory/Defeat Sound Effects', () => {
    it('should play victory sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playVictorySound();
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('victory', 5);
    });

    it('should play defeat sound', async () => {
      const { result } = renderHook(() => useCombatSounds());
      
      await act(async () => {
        await result.current.playDefeatSound();
      });

      expect(soundManager.playSound).toHaveBeenCalledWith('defeat', 3);
    });

    it('should not play victory/defeat sounds when disabled', async () => {
      const { result } = renderHook(() => useCombatSounds({ enabled: false }));
      
      await act(async () => {
        await result.current.playVictorySound();
        await result.current.playDefeatSound();
      });

      expect(soundManager.playSound).not.toHaveBeenCalled();
    });
  });

  describe('Sound Control', () => {
    it('should enable/disable sounds', () => {
      const { result } = renderHook(() => useCombatSounds());
      
      act(() => {
        result.current.setSoundsEnabled(false);
      });

      expect(soundManager.setMuted).toHaveBeenCalledWith(true);
      
      act(() => {
        result.current.setSoundsEnabled(true);
      });

      expect(soundManager.setMuted).toHaveBeenCalledWith(false);
    });

    it('should set sound volume', () => {
      const { result } = renderHook(() => useCombatSounds());
      
      act(() => {
        result.current.setSoundVolume(0.3);
      });

      expect(soundManager.setVolume).toHaveBeenCalledWith(0.3);
    });

    it('should clamp volume to valid range', () => {
      const { result } = renderHook(() => useCombatSounds());
      
      act(() => {
        result.current.setSoundVolume(-0.5);
      });

      expect(soundManager.setVolume).toHaveBeenCalledWith(0);
      
      act(() => {
        result.current.setSoundVolume(1.5);
      });

      expect(soundManager.setVolume).toHaveBeenCalledWith(1);
    });

    it('should check if sounds are enabled', () => {
      const { result } = renderHook(() => useCombatSounds());
      
      expect(result.current.isSoundsEnabled()).toBe(true);
    });
  });
});

describe('COMBAT_SOUND_MAPPINGS', () => {
  it('should contain all combat action mappings', () => {
    expect(COMBAT_SOUND_MAPPINGS.ILLUMINATE).toBe('illuminate');
    expect(COMBAT_SOUND_MAPPINGS.REFLECT).toBe('reflect');
    expect(COMBAT_SOUND_MAPPINGS.ENDURE).toBe('endure');
    expect(COMBAT_SOUND_MAPPINGS.EMBRACE).toBe('embrace');
    expect(COMBAT_SOUND_MAPPINGS.SHADOW_ATTACK).toBe('shadow-attack');
    expect(COMBAT_SOUND_MAPPINGS.VICTORY).toBe('victory');
    expect(COMBAT_SOUND_MAPPINGS.DEFEAT).toBe('defeat');
  });
});

describe('DEFAULT_COMBAT_SOUNDS_CONFIG', () => {
  it('should have valid default configuration', () => {
    expect(DEFAULT_COMBAT_SOUNDS_CONFIG.enabled).toBe(true);
    expect(DEFAULT_COMBAT_SOUNDS_CONFIG.volume).toBe(0.7);
    expect(DEFAULT_COMBAT_SOUNDS_CONFIG.actionSoundDuration).toBe(2);
  });
});
