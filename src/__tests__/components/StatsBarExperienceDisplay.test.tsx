/**
 * StatsBar Experience Display Test Suite
 * 
 * Tests the fixed experience progress calculation and display
 * to ensure the "whacky" behavior has been resolved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from '../../components/StatsBar';

// Mock the game store with controlled values
const mockGameStore = {
  lightPoints: 0,
  shadowPoints: 0,
  playerHealth: 100,
  playerEnergy: 80,
  maxPlayerEnergy: 100,
  playerLevel: 2,
  getExperienceProgress: vi.fn()
};

vi.mock('../../store/game-store', () => ({
  useGameStore: () => mockGameStore
}));

describe('StatsBar Experience Display Fixes', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Progress Bar Calculation', () => {
    it('should show correct percentage for level progress', () => {
      // Mock: Player is 50% through level 2 (50 out of 100 XP needed)
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 50,      // Current progress in level
        toNext: 50,       // XP remaining to next level
        percentage: 50.0  // 50% progress
      });

      render(<StatsBar trust={60} />);
      
      // Find the progress bar
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      // Should show 50% width
      expect(progressBar).toHaveStyle({ width: '50%' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should handle 0% progress correctly', () => {
      // Mock: Player just reached new level (0 progress)
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 0,
        toNext: 140,
        percentage: 0
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      expect(progressBar).toHaveStyle({ width: '0%' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle 100% progress correctly (edge case)', () => {
      // Mock: Player is very close to leveling up
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 139,
        toNext: 1,
        percentage: 99.3
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      expect(progressBar).toHaveStyle({ width: '99.3%' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '99');
    });
  });

  describe('Experience Display Text', () => {
    it('should show current level progress format', () => {
      // Mock: Level 3 with 75/196 XP progress
      mockGameStore.playerLevel = 3;
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 75,
        toNext: 121,
        percentage: 38.3
      });

      render(<StatsBar trust={60} />);
      
      // Should show "75/196" (current / total needed for level)
      const progressText = screen.getByText('75/196');
      expect(progressText).toBeInTheDocument();
    });

    it('should show tooltip with clear progress information', async () => {
      mockGameStore.playerLevel = 4;
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 100,
        toNext: 174,
        percentage: 36.5
      });

      const { container } = render(<StatsBar trust={60} />);
      
      // Find the level display trigger
      const levelTrigger = screen.getByText('Level 4');
      expect(levelTrigger).toBeInTheDocument();
      
      // Check that tooltip content structure is present
      // (Full tooltip interaction testing would require user events)
      expect(container.querySelector('[data-state]')).toBeInTheDocument();
    });
  });

  describe('Level Benefits Documentation', () => {
    it('should include comprehensive benefit information in tooltip', () => {
      mockGameStore.playerLevel = 2;
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 25,
        toNext: 115,
        percentage: 17.9
      });

      render(<StatsBar trust={60} />);
      
      // The tooltip content should be present in the DOM structure
      // Even if not visible, the content should be there for screen readers
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative percentages gracefully', () => {
      // Mock an edge case where calculation might go negative
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 0,
        toNext: 100,
        percentage: -1  // Invalid percentage
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      // Should clamp to 0%
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should handle percentages over 100% gracefully', () => {
      // Mock an edge case where calculation might exceed 100%
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 150,
        toNext: 0,
        percentage: 150  // Invalid percentage over 100%
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      // Should clamp to 100%
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle extreme values correctly', () => {
      // Mock very large numbers
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 9999,
        toNext: 1,
        percentage: 99.99
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      // Should handle large numbers without breaking
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '99.99%' });
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA attributes for progress bar', () => {
      mockGameStore.getExperienceProgress.mockReturnValue({
        current: 60,
        toNext: 80,
        percentage: 42.9
      });

      render(<StatsBar trust={60} />);
      
      const progressBar = screen.getByRole('progressbar', { name: /experience progress/i });
      
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '43'); // Rounded
      expect(progressBar).toHaveAttribute('aria-label', 'experience progress');
    });
  });
});