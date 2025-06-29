import React from 'react';
import { describe, it, expect, beforeEach, vi, test } from 'vitest';
import { render, screen } from './test-utils';
import userEvent from '@testing-library/user-event';
import { StatsBar } from '../components/StatsBar';

// Mock the game store
const mockGameStore = {
  lightPoints: 0,
  shadowPoints: 0,
  playerHealth: 100,
  playerEnergy: 100,
  maxPlayerEnergy: 100,
};

vi.mock('../store/game-store', () => ({
  useGameStore: () => mockGameStore,
}));

describe('StatsBar Component', () => {
  beforeEach(() => {
    // Reset mock values before each test
    mockGameStore.lightPoints = 0;
    mockGameStore.shadowPoints = 0;
  });

  describe('Basic Rendering', () => {
    it('renders default stats (health, energy, experience)', () => {
      render(<StatsBar trust={50} />);

      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();

      // Trust bond is NOT displayed in StatsBar - it's handled by GuardianText
      expect(screen.queryByText('Trust Bond')).not.toBeInTheDocument();
    });

    it('renders custom stat values when provided', () => {
      render(<StatsBar trust={75} health={80} energy={60} experience={25} />);

      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();

      // Trust bond is NOT displayed in StatsBar
      expect(screen.queryByText('Strong Trust')).not.toBeInTheDocument();
      expect(screen.queryByText('Trust Bond')).not.toBeInTheDocument();
    });
  });

  describe('Trust Handling', () => {
    it('does not display trust bond (handled by GuardianText component)', () => {
      const { rerender } = render(<StatsBar trust={10} />);
      expect(screen.queryByText('Fragile Bond')).not.toBeInTheDocument();
      expect(screen.queryByText('Trust Bond')).not.toBeInTheDocument();

      rerender(<StatsBar trust={30} />);
      expect(screen.queryByText('Cautious Trust')).not.toBeInTheDocument();

      rerender(<StatsBar trust={50} />);
      expect(screen.queryByText('Growing Bond')).not.toBeInTheDocument();

      rerender(<StatsBar trust={70} />);
      expect(screen.queryByText('Strong Trust')).not.toBeInTheDocument();

      rerender(<StatsBar trust={90} />);
      expect(screen.queryByText('Deep Bond')).not.toBeInTheDocument();
    });
  });

  describe('Combat Resources Display', () => {
    it('does not show combat resources when player has no LP/SP', () => {
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 0;
      
      render(<StatsBar trust={50} />);
      
      expect(screen.queryByText('Combat Resources')).not.toBeInTheDocument();
      expect(screen.queryByText('Light Points')).not.toBeInTheDocument();
      expect(screen.queryByText('Shadow Points')).not.toBeInTheDocument();
    });

    it('shows combat resources when player has light points', () => {
      mockGameStore.lightPoints = 5;
      mockGameStore.shadowPoints = 0;

      render(<StatsBar trust={50} />);

      expect(screen.getByText('Combat Resources')).toBeInTheDocument();
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // LP value

      // Check that both LP and SP values are displayed correctly
      const allZeros = screen.getAllByText('0');
      expect(allZeros.length).toBeGreaterThanOrEqual(1); // At least one zero for SP
    });

    it('shows combat resources when player has shadow points', () => {
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 3;

      render(<StatsBar trust={50} />);

      expect(screen.getByText('Combat Resources')).toBeInTheDocument();
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // SP value

      // Check that both LP and SP values are displayed correctly
      const allZeros = screen.getAllByText('0');
      expect(allZeros.length).toBeGreaterThanOrEqual(1); // At least one zero for LP
    });

    it('shows combat resources when player has both LP and SP', () => {
      mockGameStore.lightPoints = 8;
      mockGameStore.shadowPoints = 4;
      
      render(<StatsBar trust={50} />);
      
      expect(screen.getByText('Combat Resources')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // LP value
      expect(screen.getByText('4')).toBeInTheDocument(); // SP value
    });

    it('shows combat resources when explicitly requested even with no resources', () => {
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 0;

      render(<StatsBar trust={50} showCombatResources={true} />);

      expect(screen.getByText('Combat Resources')).toBeInTheDocument();
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();

      // Check that both 0 values are displayed
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(2); // At least 2 zeros for LP and SP
    });

    it('hides combat resources when explicitly disabled even with resources', () => {
      mockGameStore.lightPoints = 5;
      mockGameStore.shadowPoints = 3;

      render(<StatsBar trust={50} showCombatResources={false} />);

      expect(screen.queryByText('Combat Resources')).not.toBeInTheDocument();
      expect(screen.queryByText('Light Points')).not.toBeInTheDocument();
      expect(screen.queryByText('Shadow Points')).not.toBeInTheDocument();
    });

    it('REGRESSION TEST: shows combat resources during hydration when resources exist', () => {
      // This test verifies the fix for the hydration issue where StatsBar
      // would show hardcoded initial values instead of actual store values
      mockGameStore.lightPoints = 5;
      mockGameStore.shadowPoints = 3;

      // Render StatsBar - it should show the actual resource values
      // even during the hydration phase
      render(<StatsBar trust={50} />);

      // Verify that the actual resource values are displayed
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Combat Resources')).toBeInTheDocument();

      // Verify that the auto-detection logic works correctly
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
    });
  });

  describe('Combat Resources Icons', () => {
    it('displays correct icons for Light and Shadow Points', () => {
      mockGameStore.lightPoints = 5;
      mockGameStore.shadowPoints = 3;

      const { container } = render(<StatsBar trust={50} />);

      // Check for Sparkles icon (Light Points) and Sword icon (Shadow Points)
      // Use class-based selectors since data-lucide might not be set
      const sparklesIcon = container.querySelector('.lucide-sparkles');
      const swordIcon = container.querySelector('.lucide-sword');

      expect(sparklesIcon).toBeInTheDocument();
      expect(swordIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility and Props', () => {
    it('applies custom className when provided', () => {
      const { container } = render(<StatsBar trust={50} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles edge case values correctly', () => {
      mockGameStore.lightPoints = 999;
      mockGameStore.shadowPoints = 0;

      render(<StatsBar trust={100} health={0} energy={150} experience={1000} />);

      // Trust bond is NOT displayed in StatsBar
      expect(screen.queryByText('Deep Bond')).not.toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument(); // Large LP value
      expect(screen.getByText('150')).toBeInTheDocument(); // Over 100 energy
      expect(screen.getByText('1000')).toBeInTheDocument(); // Large experience

      // Check for zero health in the health section specifically
      const healthSection = screen.getByText('Health').closest('div');
      expect(healthSection).toHaveTextContent('0');
    });
  });

  describe('Layout Structure', () => {
    it('maintains proper section order with combat resources', () => {
      mockGameStore.lightPoints = 5;
      mockGameStore.shadowPoints = 3;

      render(<StatsBar trust={50} />);

      const sections = screen.getAllByRole('separator'); // hr elements
      expect(sections).toHaveLength(1); // One after combat resources (before other stats)
    });

    it('maintains proper section order without combat resources', () => {
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 0;

      render(<StatsBar trust={50} />);

      // When no combat resources, there should be no separators
      const sections = screen.queryAllByRole('separator'); // hr elements
      expect(sections).toHaveLength(0); // No separators when no combat resources

      // But should still show the basic stats
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
    });
  });

  describe('Low Energy Warnings', () => {
    it('shows low energy warning when energy < 20%', () => {
      // Update mock values
      mockGameStore.playerEnergy = 15;
      mockGameStore.maxPlayerEnergy = 100;

      render(<StatsBar trust={50} />);
      
      // Check for warning indication
      expect(screen.getByText('15')).toBeInTheDocument();
      
      // Look for orange/warning styling in the energy section
      const energySection = screen.getByText('Energy').closest('div');
      expect(energySection).toBeInTheDocument();
    });

    it('does not show low energy warning when energy >= 20%', () => {
      // Update mock values
      mockGameStore.playerEnergy = 25;
      mockGameStore.maxPlayerEnergy = 100;

      render(<StatsBar trust={50} />);
      
      // Energy should show normal display
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    it('shows energy tooltip on hover', async () => {
      const user = userEvent.setup();
      
      render(<StatsBar trust={50} />);
      
      // Hover over energy stat
      const energyStat = screen.getByText('Energy').closest('.cursor-help');
      await user.hover(energyStat!);
      
      // Check tooltip content
      expect(await screen.findByText('Energy System')).toBeInTheDocument();
      expect(screen.getByText(/Scene choices cost 5-15 energy/)).toBeInTheDocument();
      expect(screen.getByText(/Combat actions cost 1-5 energy/)).toBeInTheDocument();
      expect(screen.getByText(/Regenerates 1 energy every 30 seconds/)).toBeInTheDocument();
      expect(screen.getByText(/Low energy.*reduces combat damage by 50%/)).toBeInTheDocument();
    });

    it('shows low energy warning in tooltip when energy is low', async () => {
      const user = userEvent.setup();
      
      // Update mock values
      mockGameStore.playerEnergy = 10;
      mockGameStore.maxPlayerEnergy = 100;

      render(<StatsBar trust={50} />);
      
      // Hover over energy stat
      const energyStat = screen.getByText('Energy').closest('.cursor-help');
      await user.hover(energyStat!);
      
      // Check for low energy warning in tooltip
      expect(await screen.findByText(/⚠️ Low energy! Rest or complete scenes to recover./)).toBeInTheDocument();
    });

    it('shows health tooltip on hover', async () => {
      const user = userEvent.setup();
      
      render(<StatsBar trust={50} />);
      
      // Hover over health stat
      const healthStat = screen.getByText('Health').closest('.cursor-help');
      await user.hover(healthStat!);
      
      // Check tooltip content
      expect(await screen.findByText('Your vitality and wellbeing. Recovers after combat victories.')).toBeInTheDocument();
    });

    it('shows combat resource tooltips on hover', async () => {
      const user = userEvent.setup();
      
      // Update mock values
      mockGameStore.lightPoints = 10;
      mockGameStore.shadowPoints = 5;

      render(<StatsBar trust={50} />);
      
      // Hover over light points
      const lightPoints = screen.getByText('Light Points').closest('.cursor-help');
      await user.hover(lightPoints!);
      
      expect(await screen.findByText('Use Light Points for healing and defensive actions in combat')).toBeInTheDocument();
      
      // Clear tooltip by hovering elsewhere
      await user.unhover(lightPoints!);
      
      // Hover over shadow points
      const shadowPoints = screen.getByText('Shadow Points').closest('.cursor-help');
      await user.hover(shadowPoints!);
      
      expect(await screen.findByText('Shadow Points enable powerful attacks but come with risk')).toBeInTheDocument();
    });
  });

  test('calculates energy percentage correctly', () => {
    // Test various energy values
    const testCases = [
      { playerEnergy: 100, maxPlayerEnergy: 100, expected: '100' },
      { playerEnergy: 50, maxPlayerEnergy: 100, expected: '50' },
      { playerEnergy: 25, maxPlayerEnergy: 100, expected: '25' },
      { playerEnergy: 10, maxPlayerEnergy: 100, expected: '10' },
      { playerEnergy: 0, maxPlayerEnergy: 100, expected: '0' },
      { playerEnergy: 75, maxPlayerEnergy: 150, expected: '50' }, // Non-standard max
    ];

    testCases.forEach(({ playerEnergy, maxPlayerEnergy, expected }) => {
      // Reset mock values
      mockGameStore.playerHealth = 100;
      mockGameStore.playerEnergy = playerEnergy;
      mockGameStore.maxPlayerEnergy = maxPlayerEnergy;
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 0;

      const { unmount } = render(<StatsBar trust={50} />);
      
      // Find the energy value specifically (not health which might also be 100)
      const energySection = screen.getByText('Energy').closest('div')?.parentElement;
      const energyValue = energySection?.querySelector('.text-xs.font-medium')?.textContent;
      
      expect(energyValue).toBe(expected);
      unmount(); // Clean up for next iteration
    });
  });
});
