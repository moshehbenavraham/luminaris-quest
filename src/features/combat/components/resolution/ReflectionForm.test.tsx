import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ReflectionForm } from '@/features/combat/components/resolution/ReflectionForm';
import type { ShadowManifestation } from '@/store/game-store';

// Mock the game store
const mockAddJournalEntry = vi.fn();
vi.mock('@/store/game-store', () => ({
  useGameStore: vi.fn(() => ({
    addJournalEntry: mockAddJournalEntry,
  })),
}));

describe('ReflectionForm', () => {
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
    victory: true,
    guardianTrust: 50,
    onSave: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with victory theme when victory is true', () => {
    render(<ReflectionForm {...defaultProps} />);

    expect(screen.getByText(/Reflect on Your Victory/)).toBeInTheDocument();
    expect(screen.getByText(/Congratulations on overcoming Shadow of Doubt/)).toBeInTheDocument();
    expect(screen.getByText('Save Reflection')).toHaveClass('bg-amber-600');
  });

  it('renders form with defeat theme when victory is false', () => {
    render(<ReflectionForm {...defaultProps} victory={false} />);

    expect(screen.getByText(/Journal Your Thoughts/)).toBeInTheDocument();
    expect(screen.getByText(/Every challenge teaches us something valuable/)).toBeInTheDocument();
    expect(screen.getByText('Save Reflection')).toHaveClass('bg-slate-600');
  });

  it('displays different reflection prompts based on victory status', () => {
    const { rerender } = render(<ReflectionForm {...defaultProps} victory={true} />);

    // Victory prompts
    expect(screen.getByText(/How can you carry this sense of accomplishment forward/)).toBeInTheDocument();
    expect(screen.getByText(/What strategies worked well that you might use again/)).toBeInTheDocument();

    rerender(<ReflectionForm {...defaultProps} victory={false} />);

    // Defeat prompts
    expect(screen.getByText(/What would you try differently next time/)).toBeInTheDocument();
    expect(screen.getByText(/How can this setback become a stepping stone/)).toBeInTheDocument();
  });

  it('displays enemy information and therapeutic insight', () => {
    render(<ReflectionForm {...defaultProps} />);

    expect(screen.getByText('Shadow Encountered:')).toBeInTheDocument();
    expect(screen.getByText('Shadow of Doubt')).toBeInTheDocument();
    expect(screen.getByText(/Facing doubt with courage builds inner strength/)).toBeInTheDocument();
  });

  it('updates character count as user types', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const testText = 'This is my reflection on the combat experience.';
    
    fireEvent.change(textarea, { target: { value: testText } });

    expect(screen.getByText(`${testText.length}/1000`)).toBeInTheDocument();
  });

  it('disables submit button when textarea is empty', () => {
    render(<ReflectionForm {...defaultProps} />);

    const submitButton = screen.getByText('Save Reflection');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when textarea has content', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const submitButton = screen.getByText('Save Reflection');

    fireEvent.change(textarea, { target: { value: 'My reflection' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('calls onCancel when skip button is clicked', () => {
    const onCancel = vi.fn();
    render(<ReflectionForm {...defaultProps} onCancel={onCancel} />);

    const skipButton = screen.getByText('Skip for Now');
    fireEvent.click(skipButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('has form structure and save button functionality', async () => {
    const onSave = vi.fn();
    render(<ReflectionForm {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const submitButton = screen.getByText('Save Reflection');
    const reflectionText = 'This experience taught me about resilience.';

    // Check form is structured correctly
    expect(textarea).toBeRequired();
    expect(submitButton).toHaveAttribute('type', 'submit');
    
    // Add content and verify button becomes enabled
    fireEvent.change(textarea, { target: { value: reflectionText } });
    expect(submitButton).not.toBeDisabled();
    
    // Verify the form has the right structure for victory
    expect(screen.getByText(/Reflect on Your Victory/)).toBeInTheDocument();
  });

  it('displays defeat-specific content', () => {
    render(<ReflectionForm {...defaultProps} victory={false} />);

    // Should show defeat-specific prompts and content
    expect(screen.getByText(/Journal Your Thoughts/)).toBeInTheDocument();
    expect(screen.getByText(/Every challenge teaches us something valuable/)).toBeInTheDocument();
    expect(screen.getByText(/What would you try differently next time/)).toBeInTheDocument();
  });

  it('displays appropriate content for different trust levels', () => {
    const { rerender } = render(<ReflectionForm {...defaultProps} guardianTrust={73} />);

    // Should render regardless of trust level
    expect(screen.getByText(/Reflect on Your Victory/)).toBeInTheDocument();

    rerender(<ReflectionForm {...defaultProps} guardianTrust={27} />);
    expect(screen.getByText(/Reflect on Your Victory/)).toBeInTheDocument();
  });

  it('prevents submission with only whitespace', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const submitButton = screen.getByText('Save Reflection');

    fireEvent.change(textarea, { target: { value: '   \n   \t   ' } });

    expect(submitButton).toBeDisabled();
  });

  it('handles text input correctly', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const testText = '  My reflection with spaces  ';
    
    fireEvent.change(textarea, { target: { value: testText } });
    expect(textarea).toHaveValue(testText);
  });

  it('has proper button states', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const submitButton = screen.getByText('Save Reflection');

    // Button disabled when empty
    expect(submitButton).toBeDisabled();

    // Button enabled when text added
    fireEvent.change(textarea, { target: { value: 'Test reflection' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ReflectionForm {...defaultProps} className="custom-test-class" />
    );

    expect(container.firstChild).toHaveClass('custom-test-class');
  });

  it('has proper form accessibility', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByLabelText('Your Reflection');
    const submitButton = screen.getByText('Save Reflection');

    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute('maxlength', '1000');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('has proper form structure', () => {
    render(<ReflectionForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Share your thoughts and feelings/);
    const submitButton = screen.getByText('Save Reflection');
    const skipButton = screen.getByText('Skip for Now');

    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute('maxlength', '1000');
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(skipButton).toHaveAttribute('type', 'button');
  });

  it('handles different enemy types correctly', () => {
    const anxietyEnemy: ShadowManifestation = {
      id: 'shadow-anxiety',
      name: 'Shadow of Anxiety',
      currentHP: 0,
      maxHP: 25,
      type: 'PHOBIA',
      therapeuticInsight: 'Anxiety reveals what we care about most deeply.'
    };

    render(<ReflectionForm {...defaultProps} enemy={anxietyEnemy} />);

    expect(screen.getByText('Shadow of Anxiety')).toBeInTheDocument();
    expect(screen.getByText(/Anxiety reveals what we care about most deeply/)).toBeInTheDocument();
  });
});