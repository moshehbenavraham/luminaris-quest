import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusNotification } from '@/features/combat/components/feedback/StatusNotification';

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

describe('StatusNotification', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('renders notification with correct message and styling', () => {
    render(
      <StatusNotification 
        message="Test notification" 
        type="success" 
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toBeInTheDocument();
    expect(notification).toHaveTextContent('Test notification');
    expect(notification).toHaveClass('bg-green-600');
  });

  it('displays correct icons for different types', () => {
    const { rerender } = render(
      <StatusNotification message="Success" type="success" />
    );
    expect(screen.getByText('✓')).toBeInTheDocument();

    rerender(<StatusNotification message="Warning" type="warning" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();

    rerender(<StatusNotification message="Error" type="error" />);
    expect(screen.getByText('✕')).toBeInTheDocument();

    rerender(<StatusNotification message="Info" type="info" />);
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('applies correct styling for different types', () => {
    const { rerender } = render(
      <StatusNotification message="Test" type="success" />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-green-600');

    rerender(<StatusNotification message="Test" type="warning" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-600');

    rerender(<StatusNotification message="Test" type="error" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-600');

    rerender(<StatusNotification message="Test" type="info" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-600');
  });

  it('closes notification when close button is clicked', async () => {
    const onClose = vi.fn();
    
    render(
      <StatusNotification 
        message="Test" 
        type="info" 
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);

    // Wait for animation
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('auto-closes after specified duration', async () => {
    const onClose = vi.fn();
    
    render(
      <StatusNotification 
        message="Test" 
        type="info" 
        duration={2000}
        onClose={onClose}
      />
    );

    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('has proper accessibility attributes', () => {
    render(
      <StatusNotification 
        message="Test notification" 
        type="info" 
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(
      <StatusNotification 
        message="Test" 
        type="info"
        className="custom-class"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('custom-class');
  });

  it('uses default duration when not specified', async () => {
    const onClose = vi.fn();
    
    render(
      <StatusNotification 
        message="Test" 
        type="info" 
        onClose={onClose}
      />
    );

    // Default duration should be 3000ms
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});