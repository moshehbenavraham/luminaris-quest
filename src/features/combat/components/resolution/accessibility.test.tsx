import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VictoryContent } from '@/features/combat/components/resolution/VictoryContent';
import { DefeatContent } from '@/features/combat/components/resolution/DefeatContent';
import { ReflectionForm } from '@/features/combat/components/resolution/ReflectionForm';
import { CombatEndModal } from '@/features/combat/components/resolution/CombatEndModal';
import type { ShadowManifestation } from '@/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the game store
const mockAddJournalEntry = vi.fn();
vi.mock('@/store/game-store', () => ({
  useGameStore: vi.fn(() => ({
    addJournalEntry: mockAddJournalEntry,
    guardianTrust: 50,
  })),
}));

// Mock the combat store
const mockClearCombatEnd = vi.fn();
vi.mock('@/features/combat/hooks/useCombatStore', () => ({
  useCombatStore: vi.fn(() => ({
    combatEndStatus: { isEnded: false, victory: false },
    enemy: null,
    clearCombatEnd: mockClearCombatEnd,
  })),
}));

describe('Combat Resolution Components - Accessibility', () => {
  const mockEnemy: ShadowManifestation = {
    id: 'shadow-doubt',
    name: 'Shadow of Doubt',
    type: 'doubt',
    description: 'A manifestation of doubt',
    currentHP: 0,
    maxHP: 30,
    abilities: [],
    therapeuticInsight: 'Facing doubt with courage builds inner strength.',
    victoryReward: {
      lpBonus: 0,
      growthMessage: 'Test growth message',
      permanentBenefit: 'Test permanent benefit',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('VictoryContent', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <VictoryContent
          enemy={mockEnemy}
          guardianTrust={50}
          onReflect={vi.fn()}
          onContinue={vi.fn()}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with high trust level', async () => {
      const { container } = render(
        <VictoryContent
          enemy={mockEnemy}
          guardianTrust={95}
          onReflect={vi.fn()}
          onContinue={vi.fn()}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DefeatContent', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <DefeatContent enemy={mockEnemy} onReflect={vi.fn()} onContinue={vi.fn()} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with different enemy types', async () => {
      const anxietyEnemy: ShadowManifestation = {
        id: 'shadow-anxiety',
        name: 'Shadow of Anxiety',
        currentHP: 0,
        maxHP: 25,
        type: 'PHOBIA',
        therapeuticInsight: 'Anxiety reveals what we care about most deeply.',
      };

      const { container } = render(
        <DefeatContent enemy={anxietyEnemy} onReflect={vi.fn()} onContinue={vi.fn()} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ReflectionForm', () => {
    it('should have no accessibility violations for victory state', async () => {
      const { container } = render(
        <ReflectionForm
          enemy={mockEnemy}
          victory={true}
          guardianTrust={50}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for defeat state', async () => {
      const { container } = render(
        <ReflectionForm
          enemy={mockEnemy}
          victory={false}
          guardianTrust={30}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with custom className', async () => {
      const { container } = render(
        <ReflectionForm
          enemy={mockEnemy}
          victory={true}
          guardianTrust={75}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          className="custom-test-class"
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CombatEndModal', () => {
    it('should have no accessibility violations when not opened', async () => {
      const { container } = render(<CombatEndModal onClose={vi.fn()} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with force victory', async () => {
      const { container } = render(<CombatEndModal forceVictory={true} onClose={vi.fn()} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with force defeat', async () => {
      const { container } = render(<CombatEndModal forceVictory={false} onClose={vi.fn()} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Combined Component Accessibility', () => {
    it('should have no violations when VictoryContent and ReflectionForm are rendered together', async () => {
      const { container } = render(
        <div>
          <VictoryContent
            enemy={mockEnemy}
            guardianTrust={60}
            onReflect={vi.fn()}
            onContinue={vi.fn()}
          />
          <ReflectionForm
            enemy={mockEnemy}
            victory={true}
            guardianTrust={60}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when DefeatContent and ReflectionForm are rendered together', async () => {
      const { container } = render(
        <div>
          <DefeatContent enemy={mockEnemy} onReflect={vi.fn()} onContinue={vi.fn()} />
          <ReflectionForm
            enemy={mockEnemy}
            victory={false}
            guardianTrust={25}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
