import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CombatLog, type CombatLogEntry } from '@/features/combat/components/feedback/CombatLog';

// Mock useCombatEffects hook (even though CombatLog doesn't use it, for consistency)
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

const mockEntries: CombatLogEntry[] = [
  {
    id: '1',
    timestamp: Date.now() - 3000,
    type: 'action',
    actor: 'player',
    message: 'Player attacks with sword',
    metadata: { actionType: 'melee' }
  },
  {
    id: '2',
    timestamp: Date.now() - 2000,
    type: 'damage',
    actor: 'enemy',
    message: 'Enemy takes 25 damage',
    metadata: { damage: 25 }
  },
  {
    id: '3',
    timestamp: Date.now() - 1000,
    type: 'turn',
    actor: 'system',
    message: 'Enemy turn begins',
  },
  {
    id: '4',
    timestamp: Date.now(),
    type: 'heal',
    actor: 'player',
    message: 'Player heals for 10 HP',
    metadata: { healing: 10 }
  }
];

describe('CombatLog', () => {
  it('renders combat log with entries', () => {
    render(<CombatLog entries={mockEntries} />);

    expect(screen.getByText('Combat Log')).toBeInTheDocument();
    expect(screen.getByText('Player attacks with sword')).toBeInTheDocument();
    expect(screen.getByText('Enemy takes 25 damage')).toBeInTheDocument();
    expect(screen.getByText('Player heals for 10 HP')).toBeInTheDocument();
  });

  it('displays entry count', () => {
    render(<CombatLog entries={mockEntries} />);

    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<CombatLog entries={[]} />);

    expect(screen.getByText('Combat log is empty')).toBeInTheDocument();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('limits visible entries based on maxVisible prop', () => {
    const manyEntries = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      timestamp: Date.now() - (100 - i) * 1000,
      type: 'system' as const,
      actor: 'system' as const,
      message: `Entry ${i}`,
    }));

    render(<CombatLog entries={manyEntries} maxVisible={5} />);

    // Should only show the last 5 entries
    expect(screen.getByText('Entry 95')).toBeInTheDocument();
    expect(screen.getByText('Entry 99')).toBeInTheDocument();
    expect(screen.queryByText('Entry 94')).not.toBeInTheDocument();
  });

  it('displays correct icons for different entry types', () => {
    render(<CombatLog entries={mockEntries} />);

    // Check that different entry types have appropriate icons
    const entries = screen.getAllByText(/⚔️|💥|🔄|💚/);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('applies correct styling for different entry types', () => {
    render(<CombatLog entries={mockEntries} />);

    const playerAction = screen.getByText('Player attacks with sword');
    const damageEntry = screen.getByText('Enemy takes 25 damage');
    const healEntry = screen.getByText('Player heals for 10 HP');

    expect(playerAction.closest('div')).toHaveClass('text-blue-300');
    expect(damageEntry.closest('div')).toHaveClass('text-red-400');
    expect(healEntry.closest('div')).toHaveClass('text-green-400');
  });

  it('displays metadata information', () => {
    render(<CombatLog entries={mockEntries} />);

    expect(screen.getByText('Damage: 25')).toBeInTheDocument();
    expect(screen.getByText('Healing: 10')).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    const entry: CombatLogEntry = {
      id: '1',
      timestamp: new Date('2023-01-01T12:30:45').getTime(),
      type: 'system',
      actor: 'system',
      message: 'Test message',
    };

    render(<CombatLog entries={[entry]} />);

    expect(screen.getByText('12:30:45')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CombatLog entries={mockEntries} className="custom-class" />);

    const combatLog = screen.getByText('Combat Log').closest('div')?.parentElement;
    expect(combatLog).toHaveClass('custom-class');
  });

  it('shows jump to bottom button when not auto-scrolling', () => {
    render(<CombatLog entries={mockEntries} autoScroll={false} />);

    const jumpButton = screen.getByText('↓ Jump to Bottom');
    expect(jumpButton).toBeInTheDocument();

    fireEvent.click(jumpButton);
    // Button should still be visible since we're not actually scrolling in test
  });

  it('handles empty entries array gracefully', () => {
    render(<CombatLog entries={[]} />);

    expect(screen.getByText('0 entries')).toBeInTheDocument();
    expect(screen.getByText('Combat log is empty')).toBeInTheDocument();
  });
});