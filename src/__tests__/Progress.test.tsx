import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from './test-utils';
import { Progress } from '../pages/Progress';

// Mock the game store
const mockGameStore = {
  guardianTrust: 50,
  journalEntries: [],
  milestones: [],
  updateJournalEntry: vi.fn(),
  deleteJournalEntry: vi.fn(),
};

vi.mock('@/store/game-store', () => ({
  useGameStore: () => mockGameStore,
}));

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

// Mock the JournalEntryCard component
vi.mock('@/components/JournalEntryCard', () => ({
  JournalEntryCard: ({ entry }: any) => (
    <div data-testid="journal-entry-card">Journal Entry: {entry.id}</div>
  ),
}));

describe('Progress Page - ImpactfulImage Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders ImpactfulImage with correct props for progress hero', () => {
    render(<Progress />);
    
    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage).not.toBeNull();
    expect(heroImage.getAttribute('data-priority')).toBe('false');
    // Image now uses natural sizing without forced aspect ratio
    expect(heroImage.className).toContain('w-full');
    expect(heroImage.className).toContain('h-auto');
    expect(heroImage.className).toContain('md:rounded-xl');
  });

  it('places ImpactfulImage at logical top-of-fold position', () => {
    render(<Progress />);
    
    const heroImage = screen.getByTestId('impactful-image');
    const pageTitle = screen.getByText('Progress');
    
    expect(heroImage).not.toBeNull();
    expect(pageTitle).not.toBeNull();
    
    // Check that image appears after page title but before other content
    const heroImagePosition = Array.from(document.body.querySelectorAll('*')).indexOf(heroImage);
    const pageTitlePosition = Array.from(document.body.querySelectorAll('*')).indexOf(pageTitle);
    expect(heroImagePosition).toBeGreaterThan(pageTitlePosition);
  });

  it('uses correct image source from registry', () => {
    render(<Progress />);
    
    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage.getAttribute('src')).toBe('/images/progress-hero.avif');
    expect(heroImage.getAttribute('alt')).toBe('Progress tracking visualization showing growth and achievements');
  });

  it('maintains existing Progress page functionality with image integration', () => {
    render(<Progress />);
    
    // Verify all existing components are still present
    expect(screen.getByText('Progress')).not.toBeNull();
    expect(screen.getByText('Track your journey and achievements.')).not.toBeNull();
    expect(screen.getByText('Guardian Trust Bond')).not.toBeNull();
    expect(screen.getByText('Journal Entries')).not.toBeNull();
    
    // Verify new image is also present
    expect(screen.getByTestId('impactful-image')).not.toBeNull();
  });
});
