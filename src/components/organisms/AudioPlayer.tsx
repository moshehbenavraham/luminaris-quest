/*
 MIT License
 Luminari's Quest - AudioPlayer Organism
 Built with Bolt.new
*/
import React, { useCallback, useState, useEffect, useRef } from 'react';
import AudioPlayerLib from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

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
 * AudioPlayer – wraps `react-h5-audio-player` to provide a simple playlist with
 * next-track handling. Meant to live at the organism layer.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ tracks, onTrackChange }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayerLib>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = (prev + 1) % tracks.length;
      onTrackChange?.(next);
      return next;
    });

    // Ensure the next track starts playing if the current track was playing
    // This helps with browser autoplay policies by maintaining playback state
    if (isPlaying && playerRef.current?.audio?.current) {
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
  }, [tracks.length, onTrackChange, isPlaying]);

  const handlePrevious = useCallback(() => {
    setCurrentIdx((prev) => {
      const previous = prev === 0 ? tracks.length - 1 : prev - 1;
      onTrackChange?.(previous);
      return previous;
    });
  }, [tracks.length, onTrackChange]);

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
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

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
      className="card-enhanced glass rounded-xl border border-white/20 bg-card text-card-foreground shadow-glass p-4 transition-all duration-200 hover:shadow-glass-hover"
      role="region"
      aria-label={`Audio player - ${currentTrack.title} (${currentIdx + 1} of ${tracks.length})`}
      tabIndex={0}
      data-testid="audio-player"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Now playing: {currentTrack.title}, track {currentIdx + 1} of {tracks.length}
      </div>
      <div className="mb-2 text-sm text-muted-foreground">
        Keyboard shortcuts: Space/K = Play/Pause, ←/J = Previous, →/L = Next
      </div>
      <AudioPlayerLib
        ref={playerRef}
        className="w-full [&_.rhap_container]:!bg-transparent [&_.rhap_container]:!border-none [&_.rhap_container]:!shadow-none [&_.rhap_header]:text-foreground [&_.rhap_header]:font-medium [&_.rhap_header]:text-lg [&_.rhap_time]:text-muted-foreground [&_.rhap_progress-bar]:bg-muted [&_.rhap_progress-filled]:bg-primary [&_.rhap_progress-indicator]:bg-primary [&_.rhap_button-clear]:text-foreground [&_.rhap_button-clear:hover]:text-primary [&_.rhap_button-clear:hover]:scale-105 [&_.rhap_button-clear]:transition-all [&_.rhap_button-clear]:duration-200"
        src={currentTrack.src}
        autoPlay={false}
        preload="auto"
        showSkipControls
        showJumpControls={false}
        header={currentTrack.title}
        onEnded={handleNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClickNext={handleNext}
        onClickPrevious={handlePrevious}
        aria-label={`Audio player for ${currentTrack.title}`}
      />
    </div>
  );
};

export default AudioPlayer;
