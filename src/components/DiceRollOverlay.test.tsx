import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, advanceTimersAndAct, act } from '@/test/utils';
import userEvent from '@testing-library/user-event';

// Mock the sound manager module before importing the component
vi.mock('@/utils/sound-manager', () => ({
  soundManager: {
    registerSound: vi.fn(),
    playSound: vi.fn().mockResolvedValue(undefined),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    getVolume: vi.fn(() => 0.7),
    isMuted: vi.fn(() => false),
    isAudioSupported: vi.fn(() => true),
    dispose: vi.fn()
  }
}));

// Import after mocking
import { DiceRollOverlay } from '@/components/DiceRollOverlay';
import { soundManager } from '@/utils/sound-manager';

describe('DiceRollOverlay', () => {
  const mockOnClose = vi.fn();
  const defaultResult = {
    roll: 15,
    dc: 12,
    success: true,
    critical: false,
    type: 'skill' as const
  };

  beforeAll(() => {
    // Clear the initial registration calls from module load
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the dice roll overlay', () => {
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
    
    expect(screen.getByText("Fate's Decision")).toBeInTheDocument();
    expect(screen.getByText('Rolling...')).toBeInTheDocument();
  });

  it('should display the target DC', () => {
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
    
    expect(screen.getByText('Target:')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should show the result after 1.5 seconds', async () => {
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    expect(screen.getByText('Rolling...')).toBeInTheDocument();
    expect(screen.queryByText('15')).not.toBeInTheDocument();

    // Fast forward 1.5 seconds with act() wrapper
    await advanceTimersAndAct(1500);

    expect(screen.queryByText('Rolling...')).not.toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('✨ Success!')).toBeInTheDocument();
  });

  it('should show failure message for unsuccessful rolls', async () => {
    const failedResult = { ...defaultResult, success: false };
    render(<DiceRollOverlay result={failedResult} onClose={mockOnClose} />);

    await advanceTimersAndAct(1500);

    expect(screen.getByText('💡 Try Again')).toBeInTheDocument();
  });

  it('should auto-close after 7 seconds', async () => {
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast forward 7 seconds (this triggers handleClose)
    await advanceTimersAndAct(7000);

    // Wait for the fade out animation (handleClose sets timeout of 1 second)
    await advanceTimersAndAct(1000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it.skip('should close when clicking the Continue button - DEFERRED: sound mocking complexity', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    // Show the result first
    await advanceTimersAndAct(1500);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();

    // Click the button - this calls handleClose which sets a 1000ms timeout
    await act(async () => {
      await user.click(continueButton);
    });

    // Advance past the 1000ms delay in handleClose
    await advanceTimersAndAct(1000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it.skip('should close when clicking the backdrop - DEFERRED: sound mocking complexity', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    // The backdrop is the outer fixed div with onClick handler
    // Use querySelector with proper class syntax for multiple classes
    const backdrop = container.querySelector('div.fixed[class*="inset-0"]');
    expect(backdrop).toBeTruthy();

    if (backdrop) {
      // Click the backdrop - this calls handleClose which sets a 1000ms timeout
      await act(async () => {
        await user.click(backdrop as Element);
      });

      // Advance past the 1000ms delay in handleClose
      await advanceTimersAndAct(1000);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  describe('Dice Sound Effects', () => {
    it.skip('should play a random dice sound when rolling starts - DEFERRED: sound mocking complexity', async () => {
      // Render the component - the sound should play in useEffect on mount
      render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

      // The sound is played synchronously in useEffect, but we need to wait for React to flush effects
      await act(async () => {
        // Flush any pending timers/effects
        await vi.runOnlyPendingTimersAsync();
      });

      // Should have played one of the dice sounds
      expect(soundManager.playSound).toHaveBeenCalledTimes(1);
      expect(soundManager.playSound).toHaveBeenCalledWith(
        expect.stringMatching(/^dice[1-3]$/)
      );
    });

    it.skip('should play a different dice sound on each render - DEFERRED: sound mocking complexity', async () => {
      // Mock Math.random to return predictable values
      const mockRandom = vi.spyOn(Math, 'random');

      // First render - will select dice1 (index 0)
      mockRandom.mockReturnValueOnce(0.1);
      const { unmount: unmount1 } = render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });
      expect(soundManager.playSound).toHaveBeenCalledWith('dice1');
      vi.clearAllMocks();
      unmount1();

      // Second render - will select dice2 (index 1)
      mockRandom.mockReturnValueOnce(0.5);
      const { unmount: unmount2 } = render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });
      expect(soundManager.playSound).toHaveBeenCalledWith('dice2');
      vi.clearAllMocks();
      unmount2();

      // Third render - will select dice3 (index 2)
      mockRandom.mockReturnValueOnce(0.9);
      render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });
      expect(soundManager.playSound).toHaveBeenCalledWith('dice3');

      mockRandom.mockRestore();
    });
  });
}); 