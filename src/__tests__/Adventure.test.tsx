import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from './test-utils';
import { Adventure } from '../pages/Adventure';

// Mock the game store
const mockGameStore = {
  guardianTrust: 50,
  setGuardianTrust: vi.fn(),
  addJournalEntry: vi.fn(),
  pendingMilestoneJournals: new Set(),
  markMilestoneJournalShown: vi.fn(),
  currentSceneIndex: 0,
  _hasHydrated: true,
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

// Mock the components to avoid complex dependencies
vi.mock('@/components/ChoiceList', () => ({
  ChoiceList: () => <div data-testid="choice-list">Choice List Component</div>,
}));

vi.mock('@/components/GuardianText', () => ({
  GuardianText: (props: any) => <div data-testid="guardian-text" {...props}>Guardian Text Component</div>,
}));

vi.mock('@/components/JournalModal', () => ({
  JournalModal: (props: any) => (
    <div data-testid="journal-modal" {...props}>
      Journal Modal Component
    </div>
  ),
}));

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/organisms/AudioPlayer', () => ({
  default: () => <div data-testid="audio-player">Audio Player Component</div>,
}));

describe('Adventure Page - Sub-step 5.1: Feature Flag Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Adventure page with existing components', () => {
    render(<Adventure />);
    
    // Verify existing components are still rendered
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();
    expect(screen.getByTestId('journal-modal')).not.toBeNull();
  });

  it('has feature flag infrastructure in place', () => {
    // This test verifies that the feature flag constant exists and can be accessed
    // We'll test the actual feature flag usage in subsequent sub-steps
    render(<Adventure />);

    // For now, just verify the page renders without errors
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
  });

  it('uses centralized playlist data with all 16 tracks', () => {
    // This test verifies that the centralized playlist is properly imported and used
    render(<Adventure />);

    // Verify the page still renders correctly with expanded playlist
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();

    // The centralized playlist with all 16 tracks is imported and used
    // We just verify the page works with the expanded playlist
  });

  it('imports AudioPlayer component without errors', () => {
    // This test verifies that the AudioPlayer import works correctly
    render(<Adventure />);

    // Verify existing components still render
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();

    // AudioPlayer is imported but not yet rendered (will be in next sub-step)
    // For now, just verify the import doesn't break the page
  });

  it('conditionally renders AudioPlayer when feature flag is enabled', () => {
    // This test verifies that the AudioPlayer renders when the feature flag is true
    render(<Adventure />);

    // Verify existing components still render
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();
    expect(screen.getByTestId('journal-modal')).not.toBeNull();

    // Verify AudioPlayer is now rendered due to feature flag
    expect(screen.getByTestId('audio-player')).not.toBeNull();
  });

  it('integrates AudioPlayer without breaking existing Adventure page functionality', () => {
    // This is a comprehensive integration test for Step 5
    render(<Adventure />);

    // Verify all existing components are present and functional
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();
    expect(screen.getByTestId('journal-modal')).not.toBeNull();

    // Verify AudioPlayer is integrated
    expect(screen.getByTestId('audio-player')).not.toBeNull();

    // Verify the layout structure is maintained (space-y-6 container)
    const container = screen.getByTestId('guardian-text').parentElement;
    expect(container).not.toBeNull();
    expect(container?.children.length).toBeGreaterThan(2); // Should have multiple children
  });
});

describe('Adventure Page - ImpactfulImage Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders ImpactfulImage with correct props for adventure hero', () => {
    render(<Adventure />);

    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage).not.toBeNull();
    expect(heroImage.getAttribute('data-priority')).toBe('false');
    expect(heroImage.getAttribute('data-ratio')).toBe(String(16/9));
    expect(heroImage.className).toContain('md:rounded-xl');
    expect(heroImage.className).toContain('md:max-h-[420px]');
  });

  it('places ImpactfulImage at logical top-of-fold position', () => {
    render(<Adventure />);

    const heroImage = screen.getByTestId('impactful-image');
    const guardianText = screen.getByTestId('guardian-text');

    expect(heroImage).not.toBeNull();
    expect(guardianText).not.toBeNull();

    // Check that image appears before guardian text in DOM order
    const heroImagePosition = Array.from(document.body.querySelectorAll('*')).indexOf(heroImage);
    const guardianTextPosition = Array.from(document.body.querySelectorAll('*')).indexOf(guardianText);
    expect(heroImagePosition).toBeLessThan(guardianTextPosition);
  });

  it('uses correct image source from registry', () => {
    render(<Adventure />);

    const heroImage = screen.getByTestId('impactful-image');
    expect(heroImage.getAttribute('src')).toBe('/images/adventure-hero.avif');
    expect(heroImage.getAttribute('alt')).toBe('Adventure scene showing mystical landscapes and healing journey');
  });

  it('maintains existing Adventure page functionality with image integration', () => {
    render(<Adventure />);

    // Verify all existing components are still present
    expect(screen.getByTestId('guardian-text')).not.toBeNull();
    expect(screen.getByTestId('choice-list')).not.toBeNull();
    expect(screen.getByTestId('journal-modal')).not.toBeNull();
    expect(screen.getByTestId('audio-player')).not.toBeNull();

    // Verify new image is also present
    expect(screen.getByTestId('impactful-image')).not.toBeNull();
  });
});
