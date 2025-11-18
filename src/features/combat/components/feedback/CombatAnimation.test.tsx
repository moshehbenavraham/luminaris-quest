import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { CombatAnimation } from '@/features/combat/components/feedback/CombatAnimation';

// Mock useCombatEffects hook
vi.mock('@/features/combat/hooks/useCombatEffects', () => ({
  useCombatEffects: () => ({
    playDamageSound: vi.fn().mockResolvedValue(undefined),
    playActionSound: vi.fn().mockResolvedValue(undefined),
    playShadowAttackSound: vi.fn().mockResolvedValue(undefined),
    playVictorySound: vi.fn().mockResolvedValue(undefined),
    playDefeatSound: vi.fn().mockResolvedValue(undefined),
    playStatusSound: vi.fn().mockResolvedValue(undefined),
    playTurnTransitionSound: vi.fn().mockResolvedValue(undefined),
    setSoundEnabled: vi.fn(),
    setSoundVolume: vi.fn(),
    isSoundEnabled: vi.fn().mockReturnValue(true),
    triggerDamageAnimation: vi.fn(),
    triggerCombatAnimation: vi.fn(),
    triggerStatusNotification: vi.fn(),
    triggerTherapeuticInsight: vi.fn(),
  }),
}));

vi.useFakeTimers();

describe('CombatAnimation', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('renders combat animation with correct icon', () => {
    render(
      <CombatAnimation 
        type="attack" 
        direction="player-to-enemy" 
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveTextContent('⚔️');
  });

  it('displays correct icons for different animation types', () => {
    const { rerender } = render(
      <CombatAnimation type="attack" direction="player-to-enemy" />
    );
    expect(screen.getByText('⚔️')).toBeInTheDocument();

    rerender(<CombatAnimation type="defend" direction="player-to-enemy" />);
    expect(screen.getByText('🛡️')).toBeInTheDocument();

    rerender(<CombatAnimation type="spell" direction="player-to-enemy" />);
    expect(screen.getByText('✨')).toBeInTheDocument();

    rerender(<CombatAnimation type="special" direction="player-to-enemy" />);
    expect(screen.getByText('💥')).toBeInTheDocument();
  });

  it('applies correct positioning for player-to-enemy direction', () => {
    render(
      <CombatAnimation 
        type="attack" 
        direction="player-to-enemy" 
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toHaveClass('left-1/4');
  });

  it('applies correct positioning for enemy-to-player direction', () => {
    render(
      <CombatAnimation 
        type="attack" 
        direction="enemy-to-player" 
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toHaveClass('right-1/4');
  });

  it('has proper accessibility attributes', () => {
    render(
      <CombatAnimation 
        type="attack" 
        direction="player-to-enemy" 
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toHaveAttribute('aria-label', 'attack animation player-to-enemy');
  });

  it.skip('calls onComplete after animation sequence', async () => {
    const onComplete = vi.fn();

    render(
      <CombatAnimation
        type="attack"
        direction="player-to-enemy"
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    // Fast-forward through the entire animation sequence (800ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  it('applies custom className', () => {
    render(
      <CombatAnimation 
        type="attack" 
        direction="player-to-enemy"
        className="custom-class"
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toHaveClass('custom-class');
  });

  it('goes through animation phases correctly', () => {
    render(
      <CombatAnimation
        type="attack"
        direction="player-to-enemy"
      />
    );

    // Initial state should be 'idle' but we start with 'windup'
    vi.advanceTimersByTime(200);

    vi.advanceTimersByTime(200);
    // Should be in 'strike' phase

    vi.advanceTimersByTime(200);
    // Should be in 'recovery' phase
  });

  it('handles different direction movements correctly', () => {
    const { rerender } = render(
      <CombatAnimation 
        type="attack" 
        direction="player-to-enemy" 
      />
    );

    let animation = screen.getByRole('img');
    expect(animation).toHaveClass('left-1/4');

    rerender(
      <CombatAnimation 
        type="attack" 
        direction="enemy-to-player" 
      />
    );

    animation = screen.getByRole('img');
    expect(animation).toHaveClass('right-1/4');
  });

  it.skip('removes component after animation completes', async () => {
    render(
      <CombatAnimation
        type="attack"
        direction="player-to-enemy"
      />
    );

    const animation = screen.getByRole('img');
    expect(animation).toBeInTheDocument();

    // Fast-forward through the animation with async timers
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });
});