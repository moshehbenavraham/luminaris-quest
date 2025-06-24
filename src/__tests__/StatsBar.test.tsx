import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from '../components/StatsBar';

// Mock the game store
const mockGameStore = {
  lightPoints: 0,
  shadowPoints: 0,
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
    it('renders trust bond section correctly', () => {
      render(<StatsBar trust={50} />);
      
      expect(screen.getByText('Trust Bond')).toBeInTheDocument();
      expect(screen.getByText('Growing Bond')).toBeInTheDocument();
      expect(screen.getByText('50/100')).toBeInTheDocument();
    });

    it('renders default stats (health, energy, experience)', () => {
      render(<StatsBar trust={50} />);
      
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
    });

    it('renders custom stat values when provided', () => {
      render(<StatsBar trust={75} health={80} energy={60} experience={25} />);
      
      expect(screen.getByText('Strong Trust')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Trust Level Labels and Colors', () => {
    it('shows correct trust labels for different levels', () => {
      const { rerender } = render(<StatsBar trust={10} />);
      expect(screen.getByText('Fragile Bond')).toBeInTheDocument();

      rerender(<StatsBar trust={30} />);
      expect(screen.getByText('Cautious Trust')).toBeInTheDocument();

      rerender(<StatsBar trust={50} />);
      expect(screen.getByText('Growing Bond')).toBeInTheDocument();

      rerender(<StatsBar trust={70} />);
      expect(screen.getByText('Strong Trust')).toBeInTheDocument();

      rerender(<StatsBar trust={90} />);
      expect(screen.getByText('Deep Bond')).toBeInTheDocument();
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

      expect(screen.getByText('Deep Bond')).toBeInTheDocument();
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
      expect(sections).toHaveLength(2); // One after trust, one after combat resources
    });

    it('maintains proper section order without combat resources', () => {
      mockGameStore.lightPoints = 0;
      mockGameStore.shadowPoints = 0;
      
      render(<StatsBar trust={50} />);
      
      const sections = screen.getAllByRole('separator'); // hr elements
      expect(sections).toHaveLength(1); // Only one after trust
    });
  });
});
