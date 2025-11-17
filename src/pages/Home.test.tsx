import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { Home } from './Home';

// Mock the ImpactfulImage component
vi.mock('@/components/atoms/ImpactfulImage', () => ({
  ImpactfulImage: ({ src, alt, priority, ratio, className, ...props }: any) => (
    <img
      data-testid="impactful-image"
      src={src}
      alt={alt}
      data-priority={priority ? "true" : "false"}
      data-ratio={ratio}
      className={className}
      {...props}
    />
  ),
}));

// Mock the AuthForm component
vi.mock('@/components/auth/AuthForm', () => ({
  AuthForm: (props: any) => <div data-testid="auth-form" {...props}>Auth Form Component</div>,
}));

describe('Home Page - ImpactfulImage Integration', () => {
  it('renders ImpactfulImage with correct props for home hero', () => {
    render(<Home />);

    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('data-priority', 'true');
    // Note: ratio prop is not passed in Home component, so no need to check data-ratio
    expect(heroImage).toHaveClass('rounded-lg', 'shadow-lg');
  });

  it('places ImpactfulImage above AuthForm in hero section', () => {
    render(<Home />);
    
    const heroImage = screen.getByTestId('impactful-image');
    const authForm = screen.getByTestId('auth-form');
    
    expect(heroImage).toBeInTheDocument();
    expect(authForm).toBeInTheDocument();
    
    // Check that image appears before auth form in DOM order
    const heroImagePosition = Array.from(document.body.querySelectorAll('*')).indexOf(heroImage);
    const authFormPosition = Array.from(document.body.querySelectorAll('*')).indexOf(authForm);
    expect(heroImagePosition).toBeLessThan(authFormPosition);
  });

  it('uses correct image source from registry', () => {
    render(<Home />);
    
    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage).toHaveAttribute('src', '/images/home-hero.avif');
    expect(heroImage).toHaveAttribute('alt', 'Luminari\'s Quest - A therapeutic RPG journey for healing and growth');
  });

  it('maintains existing page structure and content', () => {
    render(<Home />);

    expect(screen.getByText('Welcome to Luminari\'s Quest')).toBeInTheDocument();
    expect(screen.getByText('Your journey to healing and growth begins here.')).toBeInTheDocument();
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
  });

  it('ensures proper layout structure to prevent overlap', () => {
    render(<Home />);

    const heroImage = screen.getByTestId('impactful-image');
    const authForm = screen.getByTestId('auth-form');

    // Verify both elements exist and are in the correct order
    expect(heroImage).toBeInTheDocument();
    expect(authForm).toBeInTheDocument();

    // Check that the image is within a container with proper spacing
    const imageContainer = heroImage.closest('div');
    expect(imageContainer).toHaveClass('mt-6', 'mb-16', 'relative', 'z-0');

    // Check that the auth form is in a separate container with proper spacing and z-index
    const authFormContainer = authForm.closest('div[class*="mt-16"]');
    expect(authFormContainer).toBeInTheDocument();
    expect(authFormContainer).toHaveClass('mt-16', 'relative', 'z-10', 'clear-both');
  });

  it('uses responsive layout classes for proper mobile-first design', () => {
    render(<Home />);

    // Check that the image container has proper spacing and z-index
    const imageContainer = screen.getByTestId('impactful-image').closest('div[class*="mt-6"]');
    expect(imageContainer).toBeInTheDocument();
    expect(imageContainer).toHaveClass('mt-6', 'mb-16', 'relative', 'z-0');

    // Check auth form container has proper spacing and z-index
    const authFormContainer = screen.getByTestId('auth-form').closest('div[class*="mt-16"]');
    expect(authFormContainer).toHaveClass('mt-16', 'relative', 'z-10', 'clear-both');
  });
});
