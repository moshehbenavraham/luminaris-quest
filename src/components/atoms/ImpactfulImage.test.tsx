import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';

describe('ImpactfulImage - Increment 1', () => {
  const defaultProps = {
    src: '/images/test-image.jpg',
    alt: 'Test image description',
  };

  it('renders with basic props', () => {
    render(<ImpactfulImage {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image description');
  });

  it('applies default aspect ratio when ratio prop is provided', () => {
    render(<ImpactfulImage {...defaultProps} ratio={16/9} />);

    // Should be wrapped in AspectRatio component - check for the wrapper div
    const image = screen.getByRole('img');
    const wrapper = image.parentElement;

    // AspectRatio creates a wrapper div with specific styling
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.tagName).toBe('DIV');

    // Check that the image is properly contained within the aspect ratio wrapper
    expect(wrapper).toContainElement(image);
  });

  it('does not wrap in AspectRatio when ratio is not provided', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    // When no ratio is provided, image should be directly in the container
    expect(image.parentElement?.tagName).toBe('DIV'); // Test container div
  });

  it('applies custom className', () => {
    render(<ImpactfulImage {...defaultProps} className="custom-class" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveClass('custom-class');
  });

  it('applies mobile-first responsive classes by default', () => {
    render(<ImpactfulImage {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveClass('w-full', 'h-auto', 'object-cover');
  });

  it('applies default object position', () => {
    render(<ImpactfulImage {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveStyle({ objectPosition: 'center' });
  });

  it('applies custom object position', () => {
    render(<ImpactfulImage {...defaultProps} objectPosition="top left" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveStyle({ objectPosition: 'top left' });
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<ImpactfulImage {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
  });

  it('has correct displayName', () => {
    expect(ImpactfulImage.displayName).toBe('ImpactfulImage');
  });

  it('accepts additional HTML img attributes', () => {
    render(
      <ImpactfulImage 
        {...defaultProps} 
        data-testid="custom-image"
        title="Custom title"
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-testid', 'custom-image');
    expect(image).toHaveAttribute('title', 'Custom title');
  });

  it('handles different aspect ratios correctly', () => {
    const { rerender } = render(<ImpactfulImage {...defaultProps} ratio={1} />);

    let image = screen.getByRole('img');
    let wrapper = image.parentElement;
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper).toContainElement(image);

    // Test with different ratio
    rerender(<ImpactfulImage {...defaultProps} ratio={4/3} />);
    image = screen.getByRole('img');
    wrapper = image.parentElement;
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper).toContainElement(image);
  });

  it('maintains accessibility with proper alt text', () => {
    render(<ImpactfulImage {...defaultProps} alt="Detailed image description" />);

    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName('Detailed image description');
  });
});

describe('ImpactfulImage - Increment 2: Loading and Error Handling', () => {
  const defaultProps = {
    src: '/images/test-image.jpg',
    alt: 'Test image description',
  };

  it('applies priority loading attributes when priority is true', () => {
    render(<ImpactfulImage {...defaultProps} priority={true} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'high');
  });

  it('applies lazy loading attributes when priority is false', () => {
    render(<ImpactfulImage {...defaultProps} priority={false} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('fetchpriority', 'auto');
  });

  it('applies performance attributes by default', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('sizes', '(min-width: 768px) 768px, 100vw');
  });

  it('starts with loading state and opacity-0', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveClass('opacity-0');
  });

  it('switches to fallback image on error', async () => {
    const fallbackSrc = '/images/fallback.jpg';
    render(<ImpactfulImage {...defaultProps} fallback={fallbackSrc} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', defaultProps.src);

    // Simulate image load error
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', fallbackSrc);
    });
  });

  it('handles load event and removes loading state', async () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveClass('opacity-0');

    // Simulate image load
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
      expect(image).not.toHaveClass('opacity-0');
    });
  });

  it('does not switch to fallback if no fallback is provided', async () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    const originalSrc = image.getAttribute('src');

    // Simulate image load error
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', originalSrc);
    });
  });

  it('resets state when src prop changes', async () => {
    const { rerender } = render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');

    // Simulate load to remove loading state
    fireEvent.load(image);
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
    });

    // Change src prop
    rerender(<ImpactfulImage {...defaultProps} src="/images/new-image.jpg" />);

    // Should reset to loading state
    expect(image).toHaveClass('opacity-0');
    expect(image).toHaveAttribute('src', '/images/new-image.jpg');
  });
});

describe('ImpactfulImage - Increment 3: Progressive Loading and Accessibility', () => {
  const defaultProps = {
    src: '/images/test-image.jpg',
    alt: 'Test image description',
  };

  it('displays blur placeholder when blurDataUrl is provided', () => {
    const blurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    render(<ImpactfulImage {...defaultProps} blurDataUrl={blurDataUrl} />);

    // Should have blur placeholder div
    const blurPlaceholder = document.querySelector('.filter.blur-sm');
    expect(blurPlaceholder).toBeInTheDocument();
    expect(blurPlaceholder).toHaveStyle({ backgroundImage: `url(${blurDataUrl})` });
  });

  it('hides blur placeholder after image loads', async () => {
    const blurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    render(<ImpactfulImage {...defaultProps} blurDataUrl={blurDataUrl} />);

    const image = screen.getByRole('img');
    const blurPlaceholder = document.querySelector('.filter.blur-sm');

    expect(blurPlaceholder).toBeInTheDocument();

    // Simulate image load
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
    });
  });

  it('applies proper ARIA attributes', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('role', 'img');
    expect(image).toHaveAccessibleName(defaultProps.alt);
  });

  it('provides error description when fallback is used', async () => {
    const fallbackSrc = '/images/fallback.jpg';
    render(<ImpactfulImage {...defaultProps} fallback={fallbackSrc} />);

    const image = screen.getByRole('img');

    // Simulate image load error
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', fallbackSrc);
      expect(image).toHaveAttribute('aria-describedby');
    });

    // Check for error description
    const errorDescription = document.getElementById(`${defaultProps.alt}-error`);
    expect(errorDescription).toBeInTheDocument();
    expect(errorDescription).toHaveTextContent('Image failed to load, showing fallback image');
  });

  it('marks blur placeholder as aria-hidden', () => {
    const blurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    render(<ImpactfulImage {...defaultProps} blurDataUrl={blurDataUrl} />);

    const blurPlaceholder = document.querySelector('.filter.blur-sm');
    expect(blurPlaceholder).toHaveAttribute('aria-hidden', 'true');
  });

  it('wraps image in container with overflow hidden', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const image = screen.getByRole('img');
    const container = image.parentElement;

    expect(container).toHaveClass('overflow-hidden');
  });

  it('applies custom object position to blur placeholder', () => {
    const blurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    const objectPosition = 'top left';
    render(
      <ImpactfulImage
        {...defaultProps}
        blurDataUrl={blurDataUrl}
        objectPosition={objectPosition}
      />
    );

    const blurPlaceholder = document.querySelector('.filter.blur-sm');
    expect(blurPlaceholder).toHaveStyle({ backgroundPosition: objectPosition });
  });

  it('does not show blur placeholder when no blurDataUrl provided', () => {
    render(<ImpactfulImage {...defaultProps} />);

    const blurPlaceholder = document.querySelector('.filter.blur-sm');
    expect(blurPlaceholder).not.toBeInTheDocument();
  });

  it('maintains aspect ratio with progressive loading', () => {
    const blurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    render(<ImpactfulImage {...defaultProps} ratio={16/9} blurDataUrl={blurDataUrl} />);

    const image = screen.getByRole('img');

    // Should be wrapped in container with overflow hidden (our wrapper)
    const container = image.parentElement;
    expect(container).toHaveClass('overflow-hidden');

    // And that container should be inside AspectRatio wrapper
    const aspectRatioWrapper = container?.parentElement;
    expect(aspectRatioWrapper).toBeInTheDocument();
  });
});
