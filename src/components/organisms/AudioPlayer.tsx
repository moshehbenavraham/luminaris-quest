/*
 MIT License
 Luminari's Quest - AudioPlayer Organism
*/
import React, { useCallback, useState, useEffect, useRef } from 'react';
import AudioPlayerLib from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAudioTrackIndex, useSettingsStoreBase } from '@/store/settings-store';

export interface Track {
  src: string;
  title: string;
}

export interface AudioPlayerProps {
  /** Playlist to play */
  tracks: Track[];
  /** Optional callback whenever the active track changes */
  onTrackChange?: (_index: number) => void;
}

/**
 * AudioPlayer - wraps `react-h5-audio-player` to provide a simple playlist with
 * next-track handling. Track index persists to settings store for cross-session UX.
 * Always starts paused for therapeutic safety (unexpected audio can be triggering).
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ tracks, onTrackChange }) => {
  // Use persisted track index from settings store
  const audioTrackIndex = useAudioTrackIndex();
  const setAudioTrackIndex = useSettingsStoreBase((state) => state.setAudioTrackIndex);
  const _hasHydrated = useSettingsStoreBase((state) => state._hasHydrated);

  // Use hydrated index or fallback to 0 during hydration
  // Clamp to valid range in case playlist is shorter than saved index
  const currentIdx = _hasHydrated ? Math.min(audioTrackIndex, Math.max(0, tracks.length - 1)) : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayerLib>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(
    (autoplay = false) => {
      const next = (currentIdx + 1) % tracks.length;
      setAudioTrackIndex(next);
      onTrackChange?.(next);

      // Auto-start next track if:
      // 1. User was playing music (isPlaying is true), OR
      // 2. This is an automatic advance from onEnded event (autoplay is true)
      if ((isPlaying || autoplay) && playerRef.current?.audio?.current) {
        const audio = playerRef.current.audio.current;
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Small delay to allow the src to update
        timeoutRef.current = setTimeout(() => {
          // Safety check for play method existence (important for test environments)
          if (audio && typeof audio.play === 'function') {
            audio.play().catch((error) => {
              console.warn('Autoplay prevented by browser policy:', error);
              setIsPlaying(false);
            });
          }
          timeoutRef.current = null;
        }, 100);
      }
    },
    [currentIdx, tracks.length, onTrackChange, isPlaying, setAudioTrackIndex],
  );

  const handlePrevious = useCallback(() => {
    const previous = currentIdx === 0 ? tracks.length - 1 : currentIdx - 1;
    setAudioTrackIndex(previous);
    onTrackChange?.(previous);
  }, [currentIdx, tracks.length, onTrackChange, setAudioTrackIndex]);

  // Handler for manual next button clicks - doesn't need autoplay
  const handleClickNext = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const togglePlayPause = useCallback(() => {
    const audio = playerRef.current?.audio?.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  }, [isPlaying]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when the audio player is focused or no input is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

      if (isInputFocused) return;

      switch (event.key) {
        case ' ':
        case 'k':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
        case 'l':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'j':
          event.preventDefault();
          handlePrevious();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, handleNext, handlePrevious]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  if (tracks.length === 0) {
    return null;
  }

  const currentTrack = tracks[currentIdx];

  return (
    <div
      className="card-enhanced glass bg-card text-card-foreground shadow-glass hover:shadow-glass-hover rounded-xl border border-white/20 p-4 transition-all duration-200"
      role="region"
      aria-label={`Audio player - ${currentTrack.title} (${currentIdx + 1} of ${tracks.length})`}
      tabIndex={0}
      data-testid="audio-player"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Now playing: {currentTrack.title}, track {currentIdx + 1} of {tracks.length}
      </div>
      <div className="text-muted-foreground mb-2 text-sm">
        Keyboard shortcuts: Space/K = Play/Pause, Left/J = Previous, Right/L = Next
      </div>
      <AudioPlayerLib
        ref={playerRef}
        className="[&_.rhap_header]:text-foreground [&_.rhap_time]:text-muted-foreground [&_.rhap_progress-bar]:bg-muted [&_.rhap_progress-filled]:bg-primary [&_.rhap_progress-indicator]:bg-primary [&_.rhap_button-clear]:text-foreground [&_.rhap_button-clear:hover]:text-primary w-full [&_.rhap_button-clear]:transition-all [&_.rhap_button-clear]:duration-200 [&_.rhap_button-clear:hover]:scale-105 [&_.rhap_container]:!border-none [&_.rhap_container]:!bg-transparent [&_.rhap_container]:!shadow-none [&_.rhap_header]:text-lg [&_.rhap_header]:font-medium"
        src={currentTrack.src}
        autoPlay={false}
        preload="auto"
        showSkipControls
        showJumpControls={false}
        header={currentTrack.title}
        onEnded={() => handleNext(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClickNext={handleClickNext}
        onClickPrevious={handlePrevious}
        aria-label={`Audio player for ${currentTrack.title}`}
      />
    </div>
  );
};

export default AudioPlayer;
