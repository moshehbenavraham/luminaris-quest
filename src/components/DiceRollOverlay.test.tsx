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

  it('should close when clicking the Continue button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    // Show the result first
    await advanceTimersAndAct(1500);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();

    // Click the button and run all timers
    await act(async () => {
      await user.click(continueButton);
      await vi.runAllTimersAsync();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close when clicking the backdrop', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);

    // The backdrop is the outer div with the onClick handler
    // Use data-testid or find by role/class
    const backdrop = screen.getByRole('presentation') || document.querySelector('[class*="fixed"][class*="inset-0"]');
    expect(backdrop).toBeTruthy();

    if (backdrop) {
      await act(async () => {
        await user.click(backdrop);
        await vi.runAllTimersAsync();
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  describe('Dice Sound Effects', () => {
    it('should play a random dice sound when rolling starts', () => {
      render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      
      // Should have played one of the dice sounds
      expect(soundManager.playSound).toHaveBeenCalledTimes(1);
      expect(soundManager.playSound).toHaveBeenCalledWith(
        expect.stringMatching(/^dice[1-3]$/)
      );
    });

    it('should play a different dice sound on each render', () => {
      // Mock Math.random to return predictable values
      const mockRandom = vi.spyOn(Math, 'random');
      
      // First render - will select dice1 (index 0)
      mockRandom.mockReturnValueOnce(0.1);
      const { unmount: unmount1 } = render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      expect(soundManager.playSound).toHaveBeenCalledWith('dice1');
      vi.clearAllMocks();
      unmount1();
      
      // Second render - will select dice2 (index 1) 
      mockRandom.mockReturnValueOnce(0.5);
      const { unmount: unmount2 } = render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      expect(soundManager.playSound).toHaveBeenCalledWith('dice2');
      vi.clearAllMocks();
      unmount2();
      
      // Third render - will select dice3 (index 2)
      mockRandom.mockReturnValueOnce(0.9);
      render(<DiceRollOverlay result={defaultResult} onClose={mockOnClose} />);
      expect(soundManager.playSound).toHaveBeenCalledWith('dice3');
      
      mockRandom.mockRestore();
    });
  });
}); 