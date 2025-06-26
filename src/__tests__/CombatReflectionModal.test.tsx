import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CombatReflectionModal, type CombatReflectionData } from '../components/combat/CombatReflectionModal';
import type { ShadowManifestation } from '../store/game-store';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock shadow manifestation for testing
const mockShadowManifestation: ShadowManifestation = {
  id: 'whisper-of-doubt',
  name: 'The Whisper of Doubt',
  type: 'doubt',
  description: 'A shadowy figure that echoes your deepest uncertainties',
  currentHP: 0,
  maxHP: 15,
  abilities: [],
  therapeuticInsight: 'Doubt is natural - it shows you care about making good choices.',
  victoryReward: {
    lpBonus: 5,
    growthMessage: 'You have learned to acknowledge doubt without being controlled by it.',
    permanentBenefit: 'Increased tolerance for uncertainty'
  }
};

const mockReflectionData: CombatReflectionData = {
  enemy: mockShadowManifestation,
  victory: true,
  turnsElapsed: 8,
  mostUsedAction: 'ILLUMINATE',
  lpGained: 5,
  spGained: 2,
  therapeuticInsight: 'Doubt is natural - it shows you care about making good choices.',
  growthMessage: 'You have learned to acknowledge doubt without being controlled by it.'
};

describe('CombatReflectionModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSaveReflection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(
      <CombatReflectionModal
        isOpen={false}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.queryByText('Combat Reflection')).not.toBeInTheDocument();
  });

  it('renders nothing when reflectionData is null', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={null}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.queryByText('Combat Reflection')).not.toBeInTheDocument();
  });

  it('renders modal with combat summary when open', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
        data-testid="combat-reflection-modal"
      />
    );

    expect(screen.getByText('Combat Reflection')).toBeInTheDocument();
    expect(screen.getByText('Take a moment to reflect on your encounter with The Whisper of Doubt')).toBeInTheDocument();
    expect(screen.getByText('Combat Summary')).toBeInTheDocument();
    expect(screen.getByText('Victory')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // turns elapsed
    expect(screen.getByText('ILLUMINATE')).toBeInTheDocument(); // most used action
  });

  it('displays correct victory status and styling', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('Victory')).toBeInTheDocument();
    // Check for victory icon (CheckCircle)
    const titleElement = screen.getByText('Combat Reflection').closest('h2');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays correct defeat status for failed combat', () => {
    const defeatData = { ...mockReflectionData, victory: false };
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={defeatData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('Learning Experience')).toBeInTheDocument();
  });

  it('displays resource gains correctly', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('+5')).toBeInTheDocument(); // LP gained
    expect(screen.getByText('+2')).toBeInTheDocument(); // SP gained
  });

  it('displays therapeutic insight and growth message', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('Doubt is natural - it shows you care about making good choices.')).toBeInTheDocument();
    expect(screen.getByText('You have learned to acknowledge doubt without being controlled by it.')).toBeInTheDocument();
  });

  it('displays shadow-specific therapeutic prompts', () => {
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('Reflection Prompts')).toBeInTheDocument();
    expect(screen.getByText('What specific self-doubts showed up during this encounter? Notice them without judgment.')).toBeInTheDocument();
    expect(screen.getByText('When uncertainty arose, what helped you take action anyway? What inner resources did you discover?')).toBeInTheDocument();
  });

  it('handles prompt selection correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    const promptButton = screen.getByText('What specific self-doubts showed up during this encounter? Notice them without judgment.');
    await user.click(promptButton);

    const textarea = screen.getByTestId('reflection-textarea');
    expect(textarea).toHaveValue('What specific self-doubts showed up during this encounter? Notice them without judgment.\n');
    
    // Prompts should be hidden after selection
    await waitFor(() => {
      expect(screen.queryByText('Reflection Prompts')).not.toBeInTheDocument();
    });
  });

  it('allows free writing without prompts', async () => {
    const user = userEvent.setup();
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    const skipButton = screen.getByText('Skip prompts and write freely');
    await user.click(skipButton);

    // Prompts should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Reflection Prompts')).not.toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reflection-textarea');
    await user.type(textarea, 'This is my free reflection text.');
    
    expect(textarea).toHaveValue('This is my free reflection text.');
  });

  it('enables save button only when reflection text is provided', async () => {
    const user = userEvent.setup();
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    const saveButton = screen.getByText('Save Reflection');
    expect(saveButton).toBeDisabled();

    const textarea = screen.getByTestId('reflection-textarea');
    await user.type(textarea, 'My reflection');

    expect(saveButton).toBeEnabled();
  });

  it('saves reflection with correct journal entry format', async () => {
    const user = userEvent.setup();
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    const textarea = screen.getByTestId('reflection-textarea');
    await user.type(textarea, 'This was a meaningful encounter.');

    const saveButton = screen.getByText('Save Reflection');
    await user.click(saveButton);

    expect(mockOnSaveReflection).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'learning',
        content: 'This was a meaningful encounter.',
        title: 'Reflection: The Whisper of Doubt',
        sceneId: 'combat-whisper-of-doubt',
        tags: ['combat', 'reflection', 'doubt', 'victory'],
        isEdited: false
      })
    );

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles different shadow types with appropriate prompts', () => {
    const isolationData = {
      ...mockReflectionData,
      enemy: {
        ...mockShadowManifestation,
        type: 'isolation' as const,
        name: 'The Veil of Isolation'
      }
    };

    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={isolationData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    expect(screen.getByText('When do you notice yourself withdrawing from others? What triggers this protective response?')).toBeInTheDocument();
  });

  it('allows closing modal without saving', async () => {
    const user = userEvent.setup();
    
    render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    const skipButton = screen.getByText('Skip Reflection');
    await user.click(skipButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSaveReflection).not.toHaveBeenCalled();
  });

  it('resets state when modal reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    // Type some text
    const textarea = screen.getByTestId('reflection-textarea');
    await user.type(textarea, 'Some text');

    // Close modal
    rerender(
      <CombatReflectionModal
        isOpen={false}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    // Reopen modal
    rerender(
      <CombatReflectionModal
        isOpen={true}
        onClose={mockOnClose}
        reflectionData={mockReflectionData}
        onSaveReflection={mockOnSaveReflection}
      />
    );

    // Text should be reset
    const newTextarea = screen.getByTestId('reflection-textarea');
    expect(newTextarea).toHaveValue('');
  });
});
