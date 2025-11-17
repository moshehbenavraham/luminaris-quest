import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CombatEndModal } from '@/features/combat/components/resolution/CombatEndModal';

// Mock the hooks
vi.mock('@/features/combat/hooks/useCombatStore', () => ({
  useCombatStore: vi.fn(() => ({
    combatEndStatus: {
      isEnded: true,
      victory: true,
      reason: "You've overcome Shadow of Doubt!",
    },
    enemy: {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 0,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    },
    clearCombatEnd: vi.fn(),
  })),
}));

vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    guardianTrust: 50,
  }),
}));

// Import the mocked hook so we can manipulate it
import { useCombatStore } from '@/features/combat/hooks/useCombatStore';

describe('CombatEndModal', () => {
  const mockUseCombatStore = vi.mocked(useCombatStore);
  const mockClearCombatEnd = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: true,
        victory: true,
        reason: "You've overcome Shadow of Doubt!",
      },
      enemy: {
        id: 'shadow-doubt',
        name: 'Shadow of Doubt',
        currentHP: 0,
        maxHP: 30,
        type: 'EMOTIONAL',
        therapeuticInsight: 'Facing doubt with courage builds inner strength.'
      },
      clearCombatEnd: mockClearCombatEnd,
    });
  });

  it('renders victory state correctly', () => {
    render(<CombatEndModal />);

    expect(screen.getByText('✨ Victory! ✨')).toBeInTheDocument();
    expect(screen.getByText("You've overcome Shadow of Doubt!")).toBeInTheDocument();
    expect(screen.getByText(/Facing doubt with courage builds inner strength/)).toBeInTheDocument();
    expect(screen.getByText(/Guardian Trust increased to/)).toBeInTheDocument();
    expect(screen.getByText('55%')).toBeInTheDocument(); // 50 + 5
  });

  it('renders defeat state correctly', () => {
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: true,
        victory: false,
        reason: 'You retreat to gather your strength...',
      },
      enemy: {
        id: 'shadow-doubt',
        name: 'Shadow of Doubt',
        currentHP: 15,
        maxHP: 30,
        type: 'EMOTIONAL',
        therapeuticInsight: 'Facing doubt with courage builds inner strength.'
      },
      clearCombatEnd: mockClearCombatEnd,
    });

    render(<CombatEndModal />);

    expect(screen.getByText('💭 A Learning Moment')).toBeInTheDocument();
    expect(screen.getByText('Every challenge is an opportunity to grow.')).toBeInTheDocument();
    expect(screen.getByText(/This shadow still has lessons to teach/)).toBeInTheDocument();
    expect(screen.queryByText(/Guardian Trust increased/)).not.toBeInTheDocument();
  });

  it('shows appropriate buttons for victory', () => {
    render(<CombatEndModal />);

    expect(screen.getByText('📝 Reflect on Victory')).toBeInTheDocument();
    expect(screen.getByText('Continue Journey')).toBeInTheDocument();
  });

  it('shows appropriate buttons for defeat', () => {
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: true,
        victory: false,
        reason: 'You retreat to gather your strength...',
      },
      enemy: {
        id: 'shadow-doubt',
        name: 'Shadow of Doubt',
        currentHP: 15,
        maxHP: 30,
        type: 'EMOTIONAL',
        therapeuticInsight: 'Facing doubt with courage builds inner strength.'
      },
      clearCombatEnd: mockClearCombatEnd,
    });

    render(<CombatEndModal />);

    expect(screen.getByText('📝 Journal Thoughts')).toBeInTheDocument();
    expect(screen.getByText('Rest & Recover')).toBeInTheDocument();
  });

  it('calls onClose when Continue button is clicked', async () => {
    const onClose = vi.fn();
    render(<CombatEndModal onClose={onClose} />);

    const continueButton = screen.getByText('Continue Journey');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockClearCombatEnd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when Reflect button is clicked', async () => {
    const onClose = vi.fn();
    render(<CombatEndModal onClose={onClose} />);

    const reflectButton = screen.getByText('📝 Reflect on Victory');
    fireEvent.click(reflectButton);

    await waitFor(() => {
      expect(mockClearCombatEnd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not render when there is no enemy', () => {
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: true,
        victory: true,
        reason: 'Victory!',
      },
      enemy: null,
      clearCombatEnd: mockClearCombatEnd,
    });

    const { container } = render(<CombatEndModal />);
    expect(container.firstChild).toBeNull();
  });

  it('does not open when combat has not ended', () => {
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: false,
        victory: false,
        reason: '',
      },
      enemy: {
        id: 'shadow-doubt',
        name: 'Shadow of Doubt',
        currentHP: 15,
        maxHP: 30,
        type: 'EMOTIONAL',
        therapeuticInsight: 'Facing doubt with courage builds inner strength.'
      },
      clearCombatEnd: mockClearCombatEnd,
    });

    render(<CombatEndModal />);

    // Dialog should not be visible
    expect(screen.queryByText('✨ Victory! ✨')).not.toBeInTheDocument();
    expect(screen.queryByText('💭 A Learning Moment')).not.toBeInTheDocument();
  });

  it('respects forceVictory prop', () => {
    mockUseCombatStore.mockReturnValue({
      combatEndStatus: {
        isEnded: true,
        victory: false, // Store says defeat
        reason: 'Defeat',
      },
      enemy: {
        id: 'shadow-doubt',
        name: 'Shadow of Doubt',
        currentHP: 15,
        maxHP: 30,
        type: 'EMOTIONAL',
        therapeuticInsight: 'Facing doubt with courage builds inner strength.'
      },
      clearCombatEnd: mockClearCombatEnd,
    });

    render(<CombatEndModal forceVictory={true} />);

    // Should show victory UI despite store state
    expect(screen.getByText('✨ Victory! ✨')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CombatEndModal className="custom-test-class" />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-test-class');
  });

  it('has proper accessibility attributes', () => {
    render(<CombatEndModal />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-describedby', 'combat-end-description');

    const description = screen.getByText("You've overcome Shadow of Doubt!");
    expect(description).toHaveAttribute('id', 'combat-end-description');
  });
});