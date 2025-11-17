import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsBar } from '@/components/StatsBar';
import { useGameStore } from '@/store/game-store';
import '@testing-library/jest-dom';

// Mock the game store
vi.mock('@/store/game-store', () => ({
  useGameStore: vi.fn()
}));

describe('StatsBar Visual Alignment', () => {
  beforeEach(() => {
    // Set up default store values
    (useGameStore as any).mockReturnValue({
      lightPoints: 10,
      shadowPoints: 5,
      playerHealth: 75,
      playerEnergy: 80,
      maxPlayerEnergy: 100,
      experiencePoints: 120,
      experienceToNext: 200,
      playerLevel: 3
    });
  });

  it('should have consistent layout structure for all stat rows', () => {
    const { container } = render(<StatsBar trust={50} showCombatResources={true} />);

    // Find the grid container that holds all stats
    const statsGrid = container.querySelector('.grid.grid-cols-1.gap-3');
    expect(statsGrid).toBeTruthy();

    // Find all individual stat rows within the grid
    const statRows = statsGrid?.querySelectorAll(':scope > div > div');
    
    // Should have 3 stat rows (health, energy, level)
    expect(statRows?.length).toBeGreaterThanOrEqual(3);

    // Check that each row has consistent flex layout
    if (statRows) {
      Array.from(statRows).forEach(row => {
        // Each stat row should use flex layout
        expect(row).toHaveClass('flex', 'items-center');
      });
    }
  });

  it('should have consistent width for left-side labels', () => {
    render(<StatsBar trust={50} showCombatResources={true} />);

    // Find all label spans (containing icon and text) - need to get the parent span
    const healthLabel = screen.getByText('Health').closest('span')?.parentElement;
    const energyLabel = screen.getByText('Energy').closest('span')?.parentElement;
    const levelLabel = screen.getByText(/Level \d+/).closest('span')?.parentElement;

    // All labels should have consistent width class
    expect(healthLabel).toHaveClass('w-24');
    expect(energyLabel).toHaveClass('w-24');
    expect(levelLabel).toHaveClass('w-24');
  });

  it('should have consistent width for progress bars', () => {
    const { container } = render(<StatsBar trust={50} showCombatResources={true} />);

    // Find all progress bar containers
    const progressBars = container.querySelectorAll('.h-2.rounded-full.bg-gray-200');
    
    // Should have 3 progress bars (health, energy, level)
    expect(progressBars).toHaveLength(3);

    // All progress bars should have the same width class
    progressBars.forEach(bar => {
      expect(bar).toHaveClass('w-20');
    });
  });

  it('should have properly aligned values with tabular-nums for consistent number width', () => {
    render(<StatsBar trust={50} showCombatResources={true} />);

    // Find value spans by their text content patterns
    const healthValue = screen.getByText('75');
    const energyValue = screen.getByText('80');
    const levelValue = screen.getByText('120/200');

    // All values should have tabular-nums for consistent number width
    expect(healthValue).toHaveClass('tabular-nums', 'text-right');
    expect(energyValue).toHaveClass('tabular-nums', 'text-right');
    expect(levelValue).toHaveClass('tabular-nums', 'text-right');

    // Health and Energy should have w-10, Level should have w-16 (due to longer format)
    expect(healthValue).toHaveClass('w-10');
    expect(energyValue).toHaveClass('w-10');
    expect(levelValue).toHaveClass('w-16');
  });

  it('should use flex-1 and justify-end for right-side content alignment', () => {
    const { container } = render(<StatsBar trust={50} showCombatResources={true} />);

    // Find all right-side containers (containing bar and value)
    const rightContainers = container.querySelectorAll('.flex-1.justify-end');
    
    // Should have 3 right-side containers
    expect(rightContainers).toHaveLength(3);

    // Each should contain a progress bar and a value
    rightContainers.forEach(container => {
      const progressBar = container.querySelector('.h-2.rounded-full');
      const value = container.querySelector('span');
      
      expect(progressBar).toBeTruthy();
      expect(value).toBeTruthy();
    });
  });

  it('should have flex-shrink-0 on icons to prevent icon compression', () => {
    const { container } = render(<StatsBar trust={50} showCombatResources={true} />);

    // Find all icons (Shield, Zap, Star)
    const icons = container.querySelectorAll('svg.h-4.w-4');
    
    // Filter for the stat icons (not combat resource icons)
    const statIcons = Array.from(icons).filter(icon => 
      icon.classList.contains('combat-text-heal') || 
      icon.classList.contains('combat-text-mana') || 
      icon.classList.contains('combat-text-critical')
    );

    // Should have 3 stat icons
    expect(statIcons).toHaveLength(3);

    // All should have flex-shrink-0 to maintain size
    statIcons.forEach(icon => {
      expect(icon).toHaveClass('flex-shrink-0');
    });
  });

  it('should maintain alignment even with low energy state', () => {
    // Set energy to low value
    (useGameStore as any).mockReturnValue({
      lightPoints: 10,
      shadowPoints: 5,
      playerHealth: 75,
      playerEnergy: 15, // Low energy
      maxPlayerEnergy: 100,
      experiencePoints: 120,
      experienceToNext: 200,
      playerLevel: 3
    });

    render(<StatsBar trust={50} showCombatResources={true} />);

    // Energy row should still maintain alignment despite additional warning icon
    const energyRow = screen.getByText('Energy').closest('.flex');
    const energyLabel = screen.getByText('Energy').closest('span')?.parentElement;
    const energyValue = screen.getByText('15');

    // Check that alignment classes are still present
    expect(energyRow).toHaveClass('flex', 'items-center');
    expect(energyLabel).toHaveClass('w-24');
    expect(energyValue).toHaveClass('w-10', 'tabular-nums', 'text-right');
  });

  it('should align all progress bars at the same horizontal position', () => {
    const { container } = render(<StatsBar trust={50} showCombatResources={true} />);

    // Get all progress bar containers
    const progressBars = container.querySelectorAll('.h-2.rounded-full.bg-gray-200');
    
    // Should have 3 progress bars
    expect(progressBars).toHaveLength(3);

    // Get the parent containers that hold bar + value
    const rightContainers = container.querySelectorAll('.flex-1.justify-end');
    
    // All right containers should have identical structure
    rightContainers.forEach(container => {
      expect(container).toHaveClass('flex', 'items-center', 'gap-2', 'flex-1', 'justify-end');
      
      // Each should have a progress bar as first child
      const progressBar = container.querySelector('.h-2.w-20.rounded-full');
      expect(progressBar).toBeTruthy();
    });
  });
}); 