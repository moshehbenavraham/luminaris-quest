import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import { Profile } from './Profile';

// Mock HealthStatus component at the very top
vi.mock('@/components/HealthStatus', () => {
  const MockHealthStatus = (props: any) => (
    <div data-testid="health-status" {...props}>
      Health Status Component
    </div>
  );
  return {
    HealthStatus: MockHealthStatus,
    default: MockHealthStatus,
  };
});

// Mock the game store
const mockGameStore = {
  guardianTrust: 50,
  journalEntries: [],
  milestones: [],
  updateJournalEntry: vi.fn(),
  deleteJournalEntry: vi.fn(),
  saveToSupabase: vi.fn(),
  saveState: {
    status: 'idle' as const,
    hasUnsavedChanges: false,
    lastSaveTimestamp: Date.now(),
    error: null,
  },
};

vi.mock('@/store/game-store', () => ({
  useGameStore: () => mockGameStore,
  useGameStoreBase: (selector?: any) => selector ? selector(mockGameStore) : mockGameStore,
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



// Mock the database health module
vi.mock('@/lib/database-health', () => ({
  getConnectionStatusIndicator: () => ({
    color: 'green',
    icon: '✓',
    description: 'Connected'
  }),
  useDatabaseHealth: () => ({
    isConnected: true,
    lastChecked: new Date(),
    error: null
  })
}));

// Mock the ImpactfulImage component to ensure it renders
vi.mock('@/components/atoms/ImpactfulImage', () => ({
  ImpactfulImage: ({ src, alt, ratio, priority, fallback, className }: any) => (
    <img
      data-testid="impactful-image"
      src={src}
      alt={alt}
      data-ratio={ratio}
      data-priority={priority}
      data-fallback={fallback}
      className={className}
    />
  ),
}));

describe('Profile Page - ImpactfulImage Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders ImpactfulImage with correct props for profile hero', () => {
    render(<Profile />);

    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage).not.toBeNull();
    expect(heroImage.getAttribute('data-priority')).toBe('false');
    expect(heroImage.getAttribute('data-ratio')).toBe(String(1/1));
    expect(heroImage.className).toContain('md:rounded-full');
    expect(heroImage.className).toContain('md:max-w-[280px]');
    expect(heroImage.className).toContain('mx-auto');
  });

  it('places ImpactfulImage at logical top-of-fold position', () => {
    render(<Profile />);
    
    const heroImage = screen.getByTestId('impactful-image');
    const pageTitle = screen.getByText('Profile');
    
    expect(heroImage).not.toBeNull();
    expect(pageTitle).not.toBeNull();
    
    // Check that image appears after page title but before other content
    const heroImagePosition = Array.from(document.body.querySelectorAll('*')).indexOf(heroImage);
    const pageTitlePosition = Array.from(document.body.querySelectorAll('*')).indexOf(pageTitle);
    expect(heroImagePosition).toBeGreaterThan(pageTitlePosition);
  });

  it('uses correct image source from registry', () => {
    render(<Profile />);
    
    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage.getAttribute('src')).toBe('/images/profile-hero.avif');
    expect(heroImage.getAttribute('alt')).toBe('User profile interface showing personal journey and settings');
  });

  it('maintains existing Profile page functionality with image integration', () => {
    render(<Profile />);

    // Verify all existing components are still present
    expect(screen.getByText('Profile')).not.toBeNull();
    expect(screen.getByText('Manage your account and preferences.')).not.toBeNull();
    expect(screen.getByText('System Status')).not.toBeNull();
    expect(screen.getByText('Account Settings')).not.toBeNull();
    expect(screen.getByTestId('health-status')).not.toBeNull();

    // Verify new image is also present
    expect(screen.getByTestId('impactful-image')).not.toBeNull();
  });
});
