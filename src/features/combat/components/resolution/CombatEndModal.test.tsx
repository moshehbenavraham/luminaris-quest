import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { CombatEndModal } from '@/features/combat/components/resolution/CombatEndModal';

// Mock the combat store
const mockCombatStore = {
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
  resources: {
    lp: 10,
    sp: 5,
  },
  clearCombatEnd: vi.fn(),
  beginSyncTransaction: vi.fn(() => ({ success: false })),
  commitSyncTransaction: vi.fn(),
  rollbackSyncTransaction: vi.fn(),
};

vi.mock('@/features/combat/store/combat-store', () => ({
  useCombatStore: vi.fn(() => mockCombatStore),
}));

vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    guardianTrust: 50,
    lightPoints: 10,
    shadowPoints: 5,
    playerEnergy: 100,
    modifyLightPoints: vi.fn(),
    modifyShadowPoints: vi.fn(),
    modifyExperiencePoints: vi.fn(),
    endCombat: vi.fn(),
  }),
}));

describe('CombatEndModal', () => {
  const mockClearCombatEnd = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Reset to default state
    mockCombatStore.combatEndStatus = {
      isEnded: true,
      victory: true,
      reason: "You've overcome Shadow of Doubt!",
    };
    mockCombatStore.enemy = {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 0,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    };
    mockCombatStore.resources = {
      lp: 10,
      sp: 5,
    };
    mockCombatStore.clearCombatEnd = mockClearCombatEnd;
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
    mockCombatStore.combatEndStatus = {
      isEnded: true,
      victory: false,
      reason: 'You retreat to gather your strength...',
    };
    mockCombatStore.enemy = {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 15,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    };

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
    mockCombatStore.combatEndStatus = {
      isEnded: true,
      victory: false,
      reason: 'You retreat to gather your strength...',
    };
    mockCombatStore.enemy = {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 15,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    };

    render(<CombatEndModal />);

    expect(screen.getByText('📝 Journal Thoughts')).toBeInTheDocument();
    expect(screen.getByText('Rest & Recover')).toBeInTheDocument();
  });

  it('calls onClose when Continue button is clicked', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<CombatEndModal onClose={onClose} />);

    // Wait for canClose to be true (1 second delay in component)
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    const continueButton = screen.getByText('Continue Journey');
    fireEvent.click(continueButton);

    expect(mockClearCombatEnd).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('calls onClose when Reflect button is clicked', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<CombatEndModal onClose={onClose} />);

    // Wait for canClose to be true (1 second delay in component)
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    const reflectButton = screen.getByText('📝 Reflect on Victory');
    fireEvent.click(reflectButton);

    expect(mockClearCombatEnd).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('does not render when there is no enemy', () => {
    mockCombatStore.combatEndStatus = {
      isEnded: true,
      victory: true,
      reason: 'Victory!',
    };
    mockCombatStore.enemy = null;

    const { container } = render(<CombatEndModal />);
    expect(container.firstChild).toBeNull();
  });

  it('does not open when combat has not ended', () => {
    mockCombatStore.combatEndStatus = {
      isEnded: false,
      victory: false,
      reason: '',
    };
    mockCombatStore.enemy = {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 15,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    };

    render(<CombatEndModal />);

    // Dialog should not be visible
    expect(screen.queryByText('✨ Victory! ✨')).not.toBeInTheDocument();
    expect(screen.queryByText('💭 A Learning Moment')).not.toBeInTheDocument();
  });

  it('respects forceVictory prop', () => {
    mockCombatStore.combatEndStatus = {
      isEnded: true,
      victory: false, // Store says defeat
      reason: 'Defeat',
    };
    mockCombatStore.enemy = {
      id: 'shadow-doubt',
      name: 'Shadow of Doubt',
      currentHP: 15,
      maxHP: 30,
      type: 'EMOTIONAL',
      therapeuticInsight: 'Facing doubt with courage builds inner strength.'
    };

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