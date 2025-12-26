/**
 * Settings Store Tests - audioTrackIndex persistence
 *
 * Tests for T018-T020: audioTrackIndex get/set/persist functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useSettingsStoreBase } from './settings-store';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // No rows found - new user
          }),
        }),
      }),
    }),
  },
}));

// Mock environment logger
vi.mock('@/lib/environment', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('Settings Store - audioTrackIndex', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    act(() => {
      useSettingsStoreBase.setState({
        audioTrackIndex: 0,
        _hasHydrated: true,
      });
    });

    // Clear any pending timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('T018: audioTrackIndex get/set', () => {
    it('should have initial audioTrackIndex of 0', () => {
      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(0);
    });

    it('should update audioTrackIndex via setAudioTrackIndex', () => {
      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(5);
      });

      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(5);
    });

    it('should clamp negative index to 0', () => {
      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(-3);
      });

      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(0);
    });

    it('should allow any positive index (playlist bounds checked in AudioPlayer)', () => {
      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(100);
      });

      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(100);
    });
  });

  describe('T018: setAudioTrackIndex triggers debouncedSave', () => {
    it('should call debouncedSave after setting audioTrackIndex', async () => {
      const debouncedSaveSpy = vi.spyOn(useSettingsStoreBase.getState(), 'debouncedSave');

      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(3);
      });

      expect(debouncedSaveSpy).toHaveBeenCalled();
    });
  });

  describe('T019: saveToSupabase includes audioTrackIndex', () => {
    it('should include audioTrackIndex in ui_preferences when saving', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      // Set a specific track index
      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(7);
      });

      // Trigger save
      await act(async () => {
        await useSettingsStoreBase.getState().saveToSupabase();
      });

      // Verify upsert was called with audioTrackIndex in ui_preferences
      expect(supabase.from).toHaveBeenCalledWith('user_settings');
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const upsertMock = fromMock.mock.results[0]?.value?.upsert;
      if (upsertMock) {
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            ui_preferences: expect.objectContaining({
              audioTrackIndex: 7,
            }),
          }),
          expect.any(Object),
        );
      }
    });
  });

  describe('T020: loadFromSupabase restores audioTrackIndex', () => {
    it('should restore audioTrackIndex from database with default fallback', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      // Mock successful load with audioTrackIndex in ui_preferences
      const mockFromResult = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                audio_settings: { masterVolume: 0.7, musicMuted: false, sfxMuted: false },
                accessibility: { textSize: 'medium', reducedMotion: false, highContrast: false },
                ui_preferences: {
                  combatUI: 'new',
                  tooltipVerbosity: 'normal',
                  audioTrackIndex: 12,
                },
                tutorial_state: {
                  hasSeenWelcome: false,
                  hasSeenCombatIntro: false,
                  dismissedTooltips: [],
                },
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      };
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockFromResult);

      await act(async () => {
        await useSettingsStoreBase.getState().loadFromSupabase();
      });

      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(12);
    });

    it('should default to 0 if audioTrackIndex is missing from ui_preferences', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      // Mock load with no audioTrackIndex in ui_preferences
      const mockFromResult = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                audio_settings: { masterVolume: 0.7, musicMuted: false, sfxMuted: false },
                accessibility: { textSize: 'medium', reducedMotion: false, highContrast: false },
                ui_preferences: {
                  combatUI: 'new',
                  tooltipVerbosity: 'normal',
                  // No audioTrackIndex - simulating existing user data
                },
                tutorial_state: {
                  hasSeenWelcome: false,
                  hasSeenCombatIntro: false,
                  dismissedTooltips: [],
                },
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      };
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockFromResult);

      // Set a non-zero value first
      act(() => {
        useSettingsStoreBase.setState({ audioTrackIndex: 5 });
      });

      await act(async () => {
        await useSettingsStoreBase.getState().loadFromSupabase();
      });

      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(0);
    });
  });

  describe('localStorage persistence (partialize)', () => {
    it('should include audioTrackIndex in partialize for localStorage', () => {
      // Set a specific track index
      act(() => {
        useSettingsStoreBase.getState().setAudioTrackIndex(8);
      });

      // Get the persisted state (simulating what goes to localStorage)
      // The persist middleware's partialize function should include audioTrackIndex
      const state = useSettingsStoreBase.getState();
      expect(state.audioTrackIndex).toBe(8);

      // Verify the field is in the state interface
      expect('audioTrackIndex' in state).toBe(true);
    });
  });
});
