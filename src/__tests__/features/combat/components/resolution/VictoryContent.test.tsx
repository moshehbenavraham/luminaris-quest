import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { VictoryContent } from '../../../../../features/combat/components/resolution/VictoryContent';
import type { ShadowManifestation } from '@/store/game-store';

describe('VictoryContent', () => {
  const mockEnemy: ShadowManifestation = {
    id: 'shadow-doubt',
    name: 'Shadow of Doubt',
    currentHP: 0,
    maxHP: 30,
    type: 'EMOTIONAL',
    therapeuticInsight: 'Facing doubt with courage builds inner strength.'
  };

  const defaultProps = {
    enemy: mockEnemy,
    guardianTrust: 50,
    onReflect: vi.fn(),
    onContinue: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders guardian message with therapeutic insight', () => {
    render(<VictoryContent {...defaultProps} />);

    expect(screen.getByText(/Facing doubt with courage builds inner strength/)).toBeInTheDocument();
    expect(screen.getByText(/Your trust in yourself grows stronger/)).toBeInTheDocument();
    expect(screen.getByText('— Your Guardian Spirit')).toBeInTheDocument();
  });

  it('displays updated trust level correctly', () => {
    render(<VictoryContent {...defaultProps} />);

    expect(screen.getByText('Guardian Trust increased to')).toBeInTheDocument();
    expect(screen.getByText('55%')).toBeInTheDocument(); // 50 + 5
  });

  it('caps trust level at 100%', () => {
    render(<VictoryContent {...defaultProps} guardianTrust={98} />);

    expect(screen.getByText('100%')).toBeInTheDocument(); // 98 + 5 = 103, capped at 100
  });

  it('shows combat summary message', () => {
    render(<VictoryContent {...defaultProps} />);

    expect(screen.getByText('You faced your fears with courage and wisdom.')).toBeInTheDocument();
  });

  it('renders action buttons with correct styling', () => {
    render(<VictoryContent {...defaultProps} />);

    const reflectButton = screen.getByText('📝 Reflect on Victory');
    const continueButton = screen.getByText('Continue Journey');

    expect(reflectButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();

    // Check button styles
    expect(reflectButton).toHaveClass('bg-amber-600', 'hover:bg-amber-700', 'text-white');
    expect(continueButton).toHaveClass('border-amber-300', 'hover:bg-amber-50');
  });

  it('calls onReflect when reflect button is clicked', () => {
    const onReflect = vi.fn();
    render(<VictoryContent {...defaultProps} onReflect={onReflect} />);

    const reflectButton = screen.getByText('📝 Reflect on Victory');
    fireEvent.click(reflectButton);

    expect(onReflect).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue when continue button is clicked', () => {
    const onContinue = vi.fn();
    render(<VictoryContent {...defaultProps} onContinue={onContinue} />);

    const continueButton = screen.getByText('Continue Journey');
    fireEvent.click(continueButton);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <VictoryContent {...defaultProps} className="custom-test-class" />
    );

    expect(container.firstChild).toHaveClass('custom-test-class');
  });

  it('has proper styling for victory theme', () => {
    render(<VictoryContent {...defaultProps} />);

    // Check guardian message styling
    const guardianMessage = screen.getByText(/Facing doubt with courage builds inner strength/).closest('div');
    expect(guardianMessage).toHaveClass('bg-amber-100', 'border-amber-200');

    // Check trust level styling
    const trustLevel = screen.getByText('55%');
    expect(trustLevel).toHaveClass('font-bold', 'text-amber-700');
  });

  it('handles different enemy types correctly', () => {
    const shadowFear: ShadowManifestation = {
      id: 'shadow-fear',
      name: 'Shadow of Fear',
      currentHP: 0,
      maxHP: 25,
      type: 'PHOBIA',
      therapeuticInsight: 'Courage is not the absence of fear, but action despite it.'
    };

    render(<VictoryContent {...defaultProps} enemy={shadowFear} />);

    expect(screen.getByText(/Courage is not the absence of fear, but action despite it/)).toBeInTheDocument();
  });

  it('maintains accessibility standards', () => {
    render(<VictoryContent {...defaultProps} />);

    // Buttons should be focusable and have role
    const reflectButton = screen.getByText('📝 Reflect on Victory');
    const continueButton = screen.getByText('Continue Journey');

    expect(reflectButton).toBeVisible();
    expect(continueButton).toBeVisible();
    expect(reflectButton.tagName).toBe('BUTTON');
    expect(continueButton.tagName).toBe('BUTTON');
  });
});