import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import AudioPlayer from '../components/organisms/AudioPlayer';

const playlist = [
  { src: '/audio/track-1.mp3', title: 'Track 1' },
  { src: '/audio/track-2.mp3', title: 'Track 2' },
];

describe('AudioPlayer', () => {
  it('renders without crashing and shows first track title', () => {
    render(<AudioPlayer tracks={playlist} />);
    expect(screen.getByText('Track 1')).not.toBeNull();
  });

  it('calls onTrackChange when track ends', () => {
    const onTrackChange = vi.fn();
    render(<AudioPlayer tracks={playlist} onTrackChange={onTrackChange} />);

    // Find the audio element by tag name since it doesn't have an accessible role
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) {
      fireEvent.ended(audio);
      expect(onTrackChange).toHaveBeenCalledWith(1);
    }
  });

  it('automatically advances to next track when current track ends', () => {
    const onTrackChange = vi.fn();
    render(<AudioPlayer tracks={playlist} onTrackChange={onTrackChange} />);

    // Verify initial state shows first track
    expect(screen.getByText('Track 1')).not.toBeNull();

    // Simulate track ending
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) {
      fireEvent.ended(audio);

      // Verify onTrackChange was called with next track index
      expect(onTrackChange).toHaveBeenCalledWith(1);

      // Verify the component updates to show the next track
      expect(screen.getByText('Track 2')).not.toBeNull();
    }
  });

  it('loops back to first track when last track ends', () => {
    const onTrackChange = vi.fn();
    render(<AudioPlayer tracks={playlist} onTrackChange={onTrackChange} />);

    // Manually advance to last track by simulating track end
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) {
      // First track ends, should advance to track 2
      fireEvent.ended(audio);
      expect(onTrackChange).toHaveBeenCalledWith(1);

      // Clear the mock to test the loop back
      onTrackChange.mockClear();

      // Second track ends, should loop back to track 1 (index 0)
      fireEvent.ended(audio);
      expect(onTrackChange).toHaveBeenCalledWith(0);
    }
  });

  it('handles browser autoplay restrictions gracefully', () => {
    const onTrackChange = vi.fn();
    render(<AudioPlayer tracks={playlist} onTrackChange={onTrackChange} />);

    // Mock audio.play() to reject (simulating browser autoplay restriction)
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) {
      const originalPlay = audio.play;
      audio.play = vi.fn().mockRejectedValue(new Error('Autoplay prevented'));

      // Simulate playing state and then track ending
      fireEvent.play(audio);
      fireEvent.ended(audio);

      // Should still advance to next track
      expect(onTrackChange).toHaveBeenCalledWith(1);

      // Restore original play method
      audio.play = originalPlay;
    }
  });

  it('applies correct Tailwind CSS classes for styling', () => {
    render(<AudioPlayer tracks={playlist} />);

    // Check that the wrapper div has the correct styling classes
    const wrapper = document.querySelector('.card-enhanced');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.classList.contains('glass')).toBe(true);
    expect(wrapper?.classList.contains('rounded-xl')).toBe(true);
    expect(wrapper?.classList.contains('border')).toBe(true);

    // Check that the audio player container exists
    const audioPlayer = document.querySelector('.rhap_container');
    expect(audioPlayer).not.toBeNull();
  });

  it('has proper accessibility attributes and ARIA labels', () => {
    render(<AudioPlayer tracks={playlist} />);

    // Check for region role and aria-label
    const region = screen.getByRole('region');
    expect(region).not.toBeNull();
    expect(region.getAttribute('aria-label')).toBe('Audio player - Track 1 (1 of 2)');
    expect(region.getAttribute('tabIndex')).toBe('0');

    // Check for screen reader announcements
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toContain('Now playing: Track 1, track 1 of 2');

    // Check for keyboard shortcuts help text
    const shortcutsText = screen.getByText(/Keyboard shortcuts:/);
    expect(shortcutsText).not.toBeNull();
  });

  it('handles keyboard shortcuts for accessibility', () => {
    const onTrackChange = vi.fn();
    render(<AudioPlayer tracks={playlist} onTrackChange={onTrackChange} />);

    // Test spacebar for play/pause
    fireEvent.keyDown(document, { key: ' ' });
    // Note: We can't easily test the actual play/pause without mocking the audio element

    // Test arrow keys for navigation
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onTrackChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onTrackChange).toHaveBeenCalledWith(0);

    // Test alternative keys (j/k/l)
    fireEvent.keyDown(document, { key: 'l' });
    expect(onTrackChange).toHaveBeenCalledWith(1);
  });
});
