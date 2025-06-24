import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceDisplay } from '../components/combat/ResourceDisplay';

describe('ResourceDisplay Component', () => {
  describe('Basic Rendering', () => {
    it('should render in detailed mode by default', () => {
      render(<ResourceDisplay lp={10} sp={5} />);
      
      expect(screen.getByTestId('resource-display-detailed')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render in compact mode when specified', () => {
      render(<ResourceDisplay lp={15} sp={8} mode="compact" />);
      
      expect(screen.getByTestId('resource-display-compact')).toBeInTheDocument();
      expect(screen.getByText('LP')).toBeInTheDocument();
      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    });

    it('should display custom title when provided', () => {
      render(<ResourceDisplay lp={10} sp={5} title="Combat Resources" />);
      
      expect(screen.getByText('Combat Resources')).toBeInTheDocument();
      expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      render(<ResourceDisplay lp={10} sp={5} className="custom-class" />);
      
      const container = screen.getByTestId('resource-display-detailed');
      expect(container).toHaveClass('custom-class');
    });

    it('should use custom test ID when provided', () => {
      render(<ResourceDisplay lp={10} sp={5} data-testid="custom-resource-display" />);
      
      expect(screen.getByTestId('custom-resource-display')).toBeInTheDocument();
      expect(screen.queryByTestId('resource-display-detailed')).not.toBeInTheDocument();
    });
  });

  describe('Resource Values Display', () => {
    it('should display zero values correctly', () => {
      render(<ResourceDisplay lp={0} sp={0} />);
      
      const lpValues = screen.getAllByText('0');
      expect(lpValues).toHaveLength(2); // One for LP, one for SP
    });

    it('should display large values correctly', () => {
      render(<ResourceDisplay lp={999} sp={888} />);
      
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('888')).toBeInTheDocument();
    });

    it('should display negative values correctly', () => {
      render(<ResourceDisplay lp={-5} sp={-3} />);
      
      expect(screen.getByText('-5')).toBeInTheDocument();
      expect(screen.getByText('-3')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render Light Points with amber styling', () => {
      render(<ResourceDisplay lp={10} sp={5} />);
      
      const lpValue = screen.getByText('10');
      expect(lpValue).toHaveClass('text-amber-600', 'dark:text-amber-400');
    });

    it('should render Shadow Points with purple styling', () => {
      render(<ResourceDisplay lp={10} sp={5} />);
      
      const spValue = screen.getByText('5');
      expect(spValue).toHaveClass('text-purple-600', 'dark:text-purple-400');
    });

    it('should render icons for both resource types in detailed mode', () => {
      render(<ResourceDisplay lp={10} sp={5} />);
      
      // Check for icon containers with proper background colors
      const iconContainers = screen.getAllByRole('generic');
      const amberContainer = iconContainers.find(el => 
        el.className.includes('bg-amber-400')
      );
      const purpleContainer = iconContainers.find(el => 
        el.className.includes('bg-purple-400')
      );
      
      expect(amberContainer).toBeInTheDocument();
      expect(purpleContainer).toBeInTheDocument();
    });

    it('should render smaller icons in compact mode', () => {
      render(<ResourceDisplay lp={10} sp={5} mode="compact" />);
      
      // In compact mode, icons should be w-8 h-8 instead of w-10 h-10
      const iconContainers = screen.getAllByRole('generic');
      const amberContainer = iconContainers.find(el => 
        el.className.includes('bg-amber-400') && el.className.includes('w-8')
      );
      const purpleContainer = iconContainers.find(el => 
        el.className.includes('bg-purple-400') && el.className.includes('w-8')
      );
      
      expect(amberContainer).toBeInTheDocument();
      expect(purpleContainer).toBeInTheDocument();
    });
  });

  describe('Mode Differences', () => {
    it('should show full labels in detailed mode', () => {
      render(<ResourceDisplay lp={10} sp={5} mode="detailed" />);
      
      expect(screen.getByText('Light Points')).toBeInTheDocument();
      expect(screen.getByText('Shadow Points')).toBeInTheDocument();
    });

    it('should show abbreviated labels in compact mode', () => {
      render(<ResourceDisplay lp={10} sp={5} mode="compact" />);
      
      expect(screen.getByText('LP')).toBeInTheDocument();
      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.queryByText('Light Points')).not.toBeInTheDocument();
      expect(screen.queryByText('Shadow Points')).not.toBeInTheDocument();
    });

    it('should render card structure only in detailed mode', () => {
      const { rerender } = render(<ResourceDisplay lp={10} sp={5} mode="detailed" />);
      
      expect(screen.getByText('Resources')).toBeInTheDocument();
      
      rerender(<ResourceDisplay lp={10} sp={5} mode="compact" />);
      
      expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for both modes', () => {
      const { rerender } = render(<ResourceDisplay lp={10} sp={5} mode="detailed" />);
      
      expect(screen.getByTestId('resource-display-detailed')).toBeInTheDocument();
      
      rerender(<ResourceDisplay lp={10} sp={5} mode="compact" />);
      
      expect(screen.getByTestId('resource-display-compact')).toBeInTheDocument();
    });

    it('should maintain semantic structure in both modes', () => {
      const { rerender } = render(<ResourceDisplay lp={10} sp={5} mode="detailed" />);

      // Detailed mode should have title text (CardTitle doesn't render as semantic heading)
      expect(screen.getByText('Resources')).toBeInTheDocument();

      rerender(<ResourceDisplay lp={10} sp={5} mode="compact" />);

      // Compact mode should not have title text
      expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle missing optional props gracefully', () => {
      expect(() => {
        render(<ResourceDisplay lp={10} sp={5} />);
      }).not.toThrow();
    });

    it('should handle all optional props together', () => {
      expect(() => {
        render(
          <ResourceDisplay 
            lp={10} 
            sp={5} 
            mode="compact"
            showAnimations={false}
            title="Custom Title"
            data-testid="custom-test-id"
            className="custom-class"
          />
        );
      }).not.toThrow();
    });
  });
});
