/* eslint-disable react-hooks/set-state-in-effect -- SSR hydration pattern in useSettingsStore hook */
/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase upsert requires flexible type assertion for JSONB fields */

/**
 * Settings Store
 *
 * Manages user preferences and settings with cross-device persistence via Supabase.
 * Settings are also cached in localStorage for offline access.
 *
 * Categories:
 * - Audio: Volume, mute states
 * - Accessibility: Text size, reduced motion, high contrast
 * - UI Preferences: Combat UI style, tooltip verbosity
 * - Tutorial State: Onboarding progress, dismissed tooltips
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/lib/environment';

const logger = createLogger('SettingsStore');

// Audio settings interface
export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicMuted: boolean;
  sfxMuted: boolean;
}

// Accessibility settings interface
export interface AccessibilitySettings {
  textSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

// UI preferences interface
export interface UIPreferences {
  combatUI: 'legacy' | 'new';
  tooltipVerbosity: 'minimal' | 'normal' | 'detailed';
}

// Tutorial state interface
export interface TutorialState {
  hasSeenWelcome: boolean;
  hasSeenCombatIntro: boolean;
  dismissedTooltips: string[];
}

// Save status for settings
export type SettingsSaveStatus = 'idle' | 'saving' | 'success' | 'error';

// Settings store state interface
export interface SettingsState {
  // Settings categories
  audio: AudioSettings;
  accessibility: AccessibilitySettings;
  ui: UIPreferences;
  tutorial: TutorialState;

  // Audio player track index (persisted separately for UX)
  audioTrackIndex: number;

  // Save state
  saveStatus: SettingsSaveStatus;
  lastSyncTimestamp?: number;
  syncError?: string;

  // Actions - Audio
  updateAudio: (settings: Partial<AudioSettings>) => void;
  setMasterVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;

  // Actions - Audio Player Track
  setAudioTrackIndex: (index: number) => void;

  // Actions - Accessibility
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  setTextSize: (size: AccessibilitySettings['textSize']) => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;

  // Actions - UI Preferences
  updateUI: (settings: Partial<UIPreferences>) => void;
  setCombatUI: (style: UIPreferences['combatUI']) => void;
  setTooltipVerbosity: (level: UIPreferences['tooltipVerbosity']) => void;

  // Actions - Tutorial
  markWelcomeSeen: () => void;
  markCombatIntroSeen: () => void;
  dismissTooltip: (tooltipId: string) => void;
  hasSeenTooltip: (tooltipId: string) => boolean;
  resetTutorialState: () => void;

  // Actions - Persistence
  saveToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  resetSettings: () => void;

  // Internal methods
  debouncedSave: () => void;
  applyAccessibilityToDOM: () => void;

  // Hydration
  _hasHydrated: boolean;
  _setHasHydrated: (hasHydrated: boolean) => void;
}

// Default values
const defaultAudio: AudioSettings = {
  masterVolume: 0.7,
  musicMuted: false,
  sfxMuted: false,
};

const defaultAccessibility: AccessibilitySettings = {
  textSize: 'medium',
  reducedMotion: false,
  highContrast: false,
};

const defaultUI: UIPreferences = {
  combatUI: 'new',
  tooltipVerbosity: 'normal',
};

const defaultTutorial: TutorialState = {
  hasSeenWelcome: false,
  hasSeenCombatIntro: false,
  dismissedTooltips: [],
};

// Debounce timer for save operations
let saveDebounceTimer: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 2000;

// Create the base store
export const useSettingsStoreBase = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      audio: defaultAudio,
      accessibility: defaultAccessibility,
      ui: defaultUI,
      tutorial: defaultTutorial,

      // Audio player track index (default to first track)
      audioTrackIndex: 0,

      saveStatus: 'idle',
      _hasHydrated: false,

      // Audio actions
      updateAudio: (settings) => {
        set((state) => ({
          audio: { ...state.audio, ...settings },
        }));
        get().debouncedSave();
      },

      setMasterVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set((state) => ({
          audio: { ...state.audio, masterVolume: clampedVolume },
        }));
        get().debouncedSave();
      },

      toggleMusicMute: () => {
        set((state) => ({
          audio: { ...state.audio, musicMuted: !state.audio.musicMuted },
        }));
        get().debouncedSave();
      },

      toggleSfxMute: () => {
        set((state) => ({
          audio: { ...state.audio, sfxMuted: !state.audio.sfxMuted },
        }));
        get().debouncedSave();
      },

      // Audio player track index action
      setAudioTrackIndex: (index) => {
        set({ audioTrackIndex: Math.max(0, index) });
        get().debouncedSave();
      },

      // Accessibility actions
      updateAccessibility: (settings) => {
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        }));
        get().debouncedSave();

        // Apply accessibility changes to document
        get().applyAccessibilityToDOM();
      },

      setTextSize: (size) => {
        set((state) => ({
          accessibility: { ...state.accessibility, textSize: size },
        }));
        get().debouncedSave();
        get().applyAccessibilityToDOM();
      },

      toggleReducedMotion: () => {
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            reducedMotion: !state.accessibility.reducedMotion,
          },
        }));
        get().debouncedSave();
        get().applyAccessibilityToDOM();
      },

      toggleHighContrast: () => {
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            highContrast: !state.accessibility.highContrast,
          },
        }));
        get().debouncedSave();
        get().applyAccessibilityToDOM();
      },

      // UI Preferences actions
      updateUI: (settings) => {
        set((state) => ({
          ui: { ...state.ui, ...settings },
        }));
        get().debouncedSave();
      },

      setCombatUI: (style) => {
        set((state) => ({
          ui: { ...state.ui, combatUI: style },
        }));
        get().debouncedSave();
      },

      setTooltipVerbosity: (level) => {
        set((state) => ({
          ui: { ...state.ui, tooltipVerbosity: level },
        }));
        get().debouncedSave();
      },

      // Tutorial actions
      markWelcomeSeen: () => {
        set((state) => ({
          tutorial: { ...state.tutorial, hasSeenWelcome: true },
        }));
        get().debouncedSave();
      },

      markCombatIntroSeen: () => {
        set((state) => ({
          tutorial: { ...state.tutorial, hasSeenCombatIntro: true },
        }));
        get().debouncedSave();
      },

      dismissTooltip: (tooltipId) => {
        set((state) => {
          if (state.tutorial.dismissedTooltips.includes(tooltipId)) {
            return state;
          }
          return {
            tutorial: {
              ...state.tutorial,
              dismissedTooltips: [...state.tutorial.dismissedTooltips, tooltipId],
            },
          };
        });
        get().debouncedSave();
      },

      hasSeenTooltip: (tooltipId) => {
        return get().tutorial.dismissedTooltips.includes(tooltipId);
      },

      resetTutorialState: () => {
        set({
          tutorial: defaultTutorial,
        });
        get().debouncedSave();
      },

      // Internal: Debounced save
      debouncedSave: () => {
        if (saveDebounceTimer) {
          clearTimeout(saveDebounceTimer);
        }
        saveDebounceTimer = setTimeout(() => {
          get().saveToSupabase();
        }, SAVE_DEBOUNCE_MS);
      },

      // Internal: Apply accessibility to DOM
      applyAccessibilityToDOM: () => {
        const { accessibility } = get();

        // Apply text size
        document.documentElement.dataset.textSize = accessibility.textSize;

        // Apply reduced motion
        if (accessibility.reducedMotion) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }

        // Apply high contrast
        if (accessibility.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      },

      // Persistence actions
      saveToSupabase: async () => {
        const state = get();

        // Don't save if already saving
        if (state.saveStatus === 'saving') {
          logger.debug('Settings save already in progress, skipping');
          return;
        }

        try {
          set({ saveStatus: 'saving' });

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            logger.warn('No authenticated user, skipping settings save');
            set({ saveStatus: 'idle' });
            return;
          }

          logger.debug('Saving settings to Supabase', { userId: user.id });

          const { error } = await supabase.from('user_settings').upsert(
            {
              user_id: user.id,
              audio_settings: state.audio as unknown as Record<string, unknown>,
              accessibility: state.accessibility as unknown as Record<string, unknown>,
              ui_preferences: {
                ...state.ui,
                audioTrackIndex: state.audioTrackIndex,
              } as unknown as Record<string, unknown>,
              tutorial_state: state.tutorial as unknown as Record<string, unknown>,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: 'user_id' },
          );

          if (error) {
            logger.error('Failed to save settings', error);
            set({
              saveStatus: 'error',
              syncError: error.message,
            });
            return;
          }

          logger.info('Settings saved successfully');
          set({
            saveStatus: 'success',
            lastSyncTimestamp: Date.now(),
            syncError: undefined,
          });

          // Reset status after brief success indicator
          setTimeout(() => {
            set({ saveStatus: 'idle' });
          }, 2000);
        } catch (error) {
          logger.error('Settings save threw exception', error);
          set({
            saveStatus: 'error',
            syncError: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      loadFromSupabase: async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            logger.warn('No authenticated user, skipping settings load');
            return;
          }

          logger.debug('Loading settings from Supabase', { userId: user.id });

          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            // PGRST116 = no rows found - this is okay for new users
            if (error.code !== 'PGRST116') {
              logger.error('Failed to load settings', error);
            }
            return;
          }

          if (data) {
            logger.info('Settings loaded from Supabase');

            // Extract audioTrackIndex from ui_preferences with fallback to 0
            const uiPrefs = data.ui_preferences as unknown as Record<string, unknown>;
            const audioTrackIndex =
              typeof uiPrefs?.audioTrackIndex === 'number' ? uiPrefs.audioTrackIndex : 0;

            set({
              audio: data.audio_settings as unknown as AudioSettings,
              accessibility: data.accessibility as unknown as AccessibilitySettings,
              ui: data.ui_preferences as unknown as UIPreferences,
              tutorial: data.tutorial_state as unknown as TutorialState,
              audioTrackIndex,
              lastSyncTimestamp: new Date(data.updated_at || Date.now()).getTime(),
            });

            // Apply accessibility settings to DOM after loading
            get().applyAccessibilityToDOM();
          }
        } catch (error) {
          logger.error('Settings load threw exception', error);
        }
      },

      resetSettings: () => {
        set({
          audio: defaultAudio,
          accessibility: defaultAccessibility,
          ui: defaultUI,
          tutorial: defaultTutorial,
          saveStatus: 'idle',
          syncError: undefined,
        });
        get().applyAccessibilityToDOM();
        get().saveToSupabase();
      },

      _setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'luminari-settings',
      partialize: (state) => ({
        audio: state.audio,
        accessibility: state.accessibility,
        ui: state.ui,
        tutorial: state.tutorial,
        audioTrackIndex: state.audioTrackIndex,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
        // Apply accessibility settings after rehydration
        state?.applyAccessibilityToDOM();
      },
    },
  ),
);

// Hydration-safe hook
export const useSettingsStore = () => {
  const store = useSettingsStoreBase();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return default values during SSR/hydration
  if (!hasMounted || !store._hasHydrated) {
    return {
      audio: defaultAudio,
      accessibility: defaultAccessibility,
      ui: defaultUI,
      tutorial: defaultTutorial,
      audioTrackIndex: 0,
      saveStatus: 'idle' as SettingsSaveStatus,
      _hasHydrated: false,

      // Actions return store methods (they'll work once hydrated)
      updateAudio: store.updateAudio,
      setMasterVolume: store.setMasterVolume,
      toggleMusicMute: store.toggleMusicMute,
      toggleSfxMute: store.toggleSfxMute,
      setAudioTrackIndex: store.setAudioTrackIndex,
      updateAccessibility: store.updateAccessibility,
      setTextSize: store.setTextSize,
      toggleReducedMotion: store.toggleReducedMotion,
      toggleHighContrast: store.toggleHighContrast,
      updateUI: store.updateUI,
      setCombatUI: store.setCombatUI,
      setTooltipVerbosity: store.setTooltipVerbosity,
      markWelcomeSeen: store.markWelcomeSeen,
      markCombatIntroSeen: store.markCombatIntroSeen,
      dismissTooltip: store.dismissTooltip,
      hasSeenTooltip: store.hasSeenTooltip,
      resetTutorialState: store.resetTutorialState,
      saveToSupabase: store.saveToSupabase,
      loadFromSupabase: store.loadFromSupabase,
      resetSettings: store.resetSettings,
      debouncedSave: store.debouncedSave,
      applyAccessibilityToDOM: store.applyAccessibilityToDOM,
      _setHasHydrated: store._setHasHydrated,
    };
  }

  return store;
};

// Selector for specific settings
export const useAudioSettings = () => useSettingsStore().audio;
export const useAccessibilitySettings = () => useSettingsStore().accessibility;
export const useUIPreferences = () => useSettingsStore().ui;
export const useTutorialState = () => useSettingsStore().tutorial;

// Selector for audio track index (selective subscription for AudioPlayer)
export const useAudioTrackIndex = () =>
  useSettingsStoreBase((state) => (state._hasHydrated ? state.audioTrackIndex : 0));
