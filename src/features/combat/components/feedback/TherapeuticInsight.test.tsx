import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { TherapeuticInsight } from '@/features/combat/components/feedback/TherapeuticInsight';
import { advanceTimersAndAct } from '@/test/utils';

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

describe('TherapeuticInsight', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('renders therapeutic insight with message and guardian name', () => {
    render(
      <TherapeuticInsight
        message="You're doing great!"
        type="encouragement"
        guardianName="Spirit Guide"
      />,
    );

    expect(screen.getByText('Spirit Guide')).toBeInTheDocument();
    expect(screen.getByText("You're doing great!")).toBeInTheDocument();
  });

  it('uses default guardian name when not provided', () => {
    render(<TherapeuticInsight message="Keep going!" type="encouragement" />);

    expect(screen.getByText('Your Guardian')).toBeInTheDocument();
  });

  it('displays correct icons for different types', () => {
    const { rerender } = render(<TherapeuticInsight message="Test" type="encouragement" />);
    expect(screen.getByText('🌟')).toBeInTheDocument();

    rerender(<TherapeuticInsight message="Test" type="guidance" />);
    expect(screen.getByText('💡')).toBeInTheDocument();

    rerender(<TherapeuticInsight message="Test" type="reflection" />);
    expect(screen.getByText('🤔')).toBeInTheDocument();

    rerender(<TherapeuticInsight message="Test" type="celebration" />);
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('applies correct styling for different types', () => {
    const { rerender } = render(<TherapeuticInsight message="Test" type="encouragement" />);
    let dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('from-purple-600');

    rerender(<TherapeuticInsight message="Test" type="guidance" />);
    dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('from-blue-600');

    rerender(<TherapeuticInsight message="Test" type="reflection" />);
    dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('from-indigo-600');

    rerender(<TherapeuticInsight message="Test" type="celebration" />);
    dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('from-green-600');
  });

  it('auto-hides after specified duration', async () => {
    const onClose = vi.fn();

    render(
      <TherapeuticInsight message="Test" type="encouragement" duration={2000} onClose={onClose} />,
    );

    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runAllTimersAsync();
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not auto-hide when autoHide is false', async () => {
    const onClose = vi.fn();

    render(
      <TherapeuticInsight message="Test" type="encouragement" autoHide={false} onClose={onClose} />,
    );

    await advanceTimersAndAct(10000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows close button when autoHide is false', () => {
    render(<TherapeuticInsight message="Test" type="encouragement" autoHide={false} />);

    const closeButton = screen.getByRole('button', { name: /close insight/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const onClose = vi.fn();

    render(
      <TherapeuticInsight message="Test" type="encouragement" autoHide={false} onClose={onClose} />,
    );

    const closeButton = screen.getByRole('button', { name: /close insight/i });

    await act(async () => {
      fireEvent.click(closeButton);
      await vi.runAllTimersAsync();
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows progress bar when auto-hiding', () => {
    render(
      <TherapeuticInsight message="Test" type="encouragement" autoHide={true} duration={3000} />,
    );

    // Progress bar should be present
    const progressBar = screen.getByRole('dialog').querySelector('.bg-white\\/60');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not show progress bar when not auto-hiding', () => {
    render(<TherapeuticInsight message="Test" type="encouragement" autoHide={false} />);

    const progressBar = screen.getByRole('dialog').querySelector('.bg-white\\/60');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TherapeuticInsight
        message="Test message"
        type="encouragement"
        guardianName="Test Guardian"
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-live', 'polite');
    expect(dialog).toHaveAttribute('aria-labelledby', 'therapeutic-insight-title');

    const title = screen.getByText('Test Guardian');
    expect(title).toHaveAttribute('id', 'therapeutic-insight-title');
  });

  it('applies custom className', () => {
    render(<TherapeuticInsight message="Test" type="encouragement" className="custom-class" />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-class');
  });

  it('uses default duration when not specified', async () => {
    const onClose = vi.fn();

    render(<TherapeuticInsight message="Test" type="encouragement" onClose={onClose} />);

    // Default duration should be 5000ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
