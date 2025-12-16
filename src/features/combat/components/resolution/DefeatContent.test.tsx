import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DefeatContent } from '@/features/combat/components/resolution/DefeatContent';
import type { ShadowManifestation } from '@/types';

describe('DefeatContent', () => {
  const mockEnemy: ShadowManifestation = {
    id: 'shadow-doubt',
    name: 'Shadow of Doubt',
    type: 'doubt',
    description: 'A manifestation of doubt',
    currentHP: 15,
    maxHP: 30,
    abilities: [],
    therapeuticInsight: 'Facing doubt with courage builds inner strength.',
    victoryReward: {
      lpBonus: 0,
      growthMessage: 'Test growth message',
      permanentBenefit: 'Test permanent benefit',
    },
  };

  const defaultProps = {
    enemy: mockEnemy,
    onReflect: vi.fn(),
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders guardian message for learning moment', () => {
    render(<DefeatContent {...defaultProps} />);

    expect(screen.getByText(/This shadow still has lessons to teach/)).toBeInTheDocument();
    expect(screen.getByText(/Take a moment to reflect on what you've learned/)).toBeInTheDocument();
    expect(screen.getByText('— Your Guardian Spirit')).toBeInTheDocument();
  });

  it('displays learning moment message', () => {
    render(<DefeatContent {...defaultProps} />);

    expect(
      screen.getByText('Every challenge teaches us something valuable about ourselves.'),
    ).toBeInTheDocument();
  });

  it('shows combat summary message', () => {
    render(<DefeatContent {...defaultProps} />);

    expect(screen.getByText('Sometimes stepping back is the wisest choice.')).toBeInTheDocument();
  });

  it('displays therapeutic reflection prompt', () => {
    render(<DefeatContent {...defaultProps} />);

    expect(screen.getByText(/💡/)).toBeInTheDocument();
    expect(screen.getByText('Reflection Prompt:')).toBeInTheDocument();
    expect(screen.getByText(/What emotions did this shadow bring up/)).toBeInTheDocument();
    expect(
      screen.getByText(/How might facing similar feelings in real life help you grow/),
    ).toBeInTheDocument();
  });

  it('renders action buttons with correct styling', () => {
    render(<DefeatContent {...defaultProps} />);

    const reflectButton = screen.getByText('📝 Journal Thoughts');
    const continueButton = screen.getByText('Rest & Recover');

    expect(reflectButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();

    // Check button styles
    expect(reflectButton).toHaveClass('bg-slate-600', 'hover:bg-slate-700', 'text-white');
    expect(continueButton).toHaveClass('border-slate-300', 'hover:bg-slate-50');
  });

  it('calls onReflect when journal button is clicked', () => {
    const onReflect = vi.fn();
    render(<DefeatContent {...defaultProps} onReflect={onReflect} />);

    const reflectButton = screen.getByText('📝 Journal Thoughts');
    fireEvent.click(reflectButton);

    expect(onReflect).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue when rest button is clicked', () => {
    const onContinue = vi.fn();
    render(<DefeatContent {...defaultProps} onContinue={onContinue} />);

    const continueButton = screen.getByText('Rest & Recover');
    fireEvent.click(continueButton);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<DefeatContent {...defaultProps} className="custom-test-class" />);

    expect(container.firstChild).toHaveClass('custom-test-class');
  });

  it('has proper styling for defeat theme', () => {
    render(<DefeatContent {...defaultProps} />);

    // Check guardian message styling
    const guardianMessage = screen
      .getByText(/This shadow still has lessons to teach/)
      .closest('div');
    expect(guardianMessage).toHaveClass('bg-slate-100', 'border-slate-200');

    // Check therapeutic insight styling
    const therapeuticInsight = screen.getByText(/Reflection Prompt:/).closest('div');
    expect(therapeuticInsight).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('handles different enemy types correctly', () => {
    const shadowAnxiety: ShadowManifestation = {
      id: 'shadow-anxiety',
      name: 'Shadow of Anxiety',
      currentHP: 20,
      maxHP: 35,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Anxiety reveals what we care about most deeply.',
    };

    render(<DefeatContent {...defaultProps} enemy={shadowAnxiety} />);

    // The guardian message doesn't change based on enemy, but enemy prop is used for context
    expect(screen.getByText(/This shadow still has lessons to teach/)).toBeInTheDocument();
  });

  it('maintains accessibility standards', () => {
    render(<DefeatContent {...defaultProps} />);

    // Buttons should be focusable and have role
    const reflectButton = screen.getByText('📝 Journal Thoughts');
    const continueButton = screen.getByText('Rest & Recover');

    expect(reflectButton).toBeVisible();
    expect(continueButton).toBeVisible();
    expect(reflectButton.tagName).toBe('BUTTON');
    expect(continueButton.tagName).toBe('BUTTON');
  });

  it('has proper semantic structure', () => {
    render(<DefeatContent {...defaultProps} />);

    // Check that the reflection prompt has proper emphasis
    const strongElement = screen.getByText('Reflection Prompt:');
    expect(strongElement.tagName).toBe('STRONG');
  });

  it('provides therapeutic value through messaging', () => {
    render(<DefeatContent {...defaultProps} />);

    // Ensure all therapeutic messaging is present
    expect(screen.getByText(/every challenge teaches us something valuable/i)).toBeInTheDocument();
    expect(screen.getByText(/sometimes stepping back is the wisest choice/i)).toBeInTheDocument();
    expect(screen.getByText(/what emotions did this shadow bring up/i)).toBeInTheDocument();
    expect(screen.getByText(/facing similar feelings in real life/i)).toBeInTheDocument();
  });
});
