import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DamageIndicator } from '../../../../../features/combat/components/feedback/DamageIndicator';

// Mock useCombatEffects hook
vi.mock('../../../../../features/combat/hooks/useCombatEffects', () => ({
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

// Mock timer functions
vi.useFakeTimers();

describe('DamageIndicator', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('renders damage indicator with correct styling', () => {
    render(
      <DamageIndicator 
        damage={25} 
        type="damage" 
        position={{ x: 100, y: 100 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('25');
    expect(indicator).toHaveClass('text-red-500');
  });

  it('renders heal indicator with correct styling and prefix', () => {
    render(
      <DamageIndicator 
        damage={15} 
        type="heal" 
        position={{ x: 100, y: 100 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveTextContent('+15');
    expect(indicator).toHaveClass('text-green-500');
  });

  it('renders miss indicator', () => {
    render(
      <DamageIndicator 
        damage={0} 
        type="miss" 
        position={{ x: 100, y: 100 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveTextContent('MISS!');
    expect(indicator).toHaveClass('text-gray-400');
  });

  it('applies correct positioning styles', () => {
    render(
      <DamageIndicator 
        damage={10} 
        type="damage" 
        position={{ x: 200, y: 150 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveStyle({
      left: '200px',
      top: '150px'
    });
  });

  it('calls onComplete after animation duration', async () => {
    const onComplete = vi.fn();
    
    render(
      <DamageIndicator 
        damage={10} 
        type="damage" 
        position={{ x: 100, y: 100 }}
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    // Fast-forward through the animation
    vi.advanceTimersByTime(1200);

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('has proper accessibility attributes', () => {
    render(
      <DamageIndicator 
        damage={10} 
        type="damage" 
        position={{ x: 100, y: 100 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(
      <DamageIndicator 
        damage={10} 
        type="damage" 
        position={{ x: 100, y: 100 }}
        className="custom-class"
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('custom-class');
  });

  it('handles negative damage values correctly', () => {
    render(
      <DamageIndicator 
        damage={-20} 
        type="damage" 
        position={{ x: 100, y: 100 }} 
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveTextContent('20'); // Should show absolute value
  });
});