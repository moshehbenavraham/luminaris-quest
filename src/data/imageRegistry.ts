/*
 * MIT License
 * Built with Bolt.new
 * Centralized image registry for Luminari's Quest
 */

export interface ImageAsset {
  /** Original source path */
  src: string;
  /** WebP optimized version */
  webp?: string;
  /** AVIF optimized version (best compression) */
  avif?: string;
  /** Fallback image if main sources fail */
  fallback?: string;
  /** Descriptive alt text for accessibility */
  alt: string;
  /** Recommended aspect ratio (width/height) */
  aspectRatio?: number;
  /** Whether this image is critical for LCP */
  priority?: boolean;
  /** Base64 tiny placeholder for progressive loading */
  blurDataUrl?: string;
}

export const imageRegistry: Record<string, ImageAsset> = {
  homeHero: {
    src: '/images/home-page.png',
    webp: '/images/home-hero.webp',
    avif: '/images/home-hero.avif',
    fallback: '/images/home-page.png',
    alt: 'Luminari\'s Quest - A therapeutic RPG journey for healing and growth',
    aspectRatio: 16 / 9,
    priority: true, // Critical for LCP on home page
  },
  adventureHero: {
    src: '/images/adventure.png',
    webp: '/images/adventure-hero.webp',
    avif: '/images/adventure-hero.avif',
    fallback: '/images/adventure.png',
    alt: 'Adventure scene showing mystical landscapes and healing journey',
    aspectRatio: 16 / 9,
    priority: false,
  },
  progressHero: {
    src: '/images/progress.png',
    webp: '/images/progress-hero.webp',
    avif: '/images/progress-hero.avif',
    fallback: '/images/progress.png',
    alt: 'Progress tracking visualization showing growth and achievements',
    aspectRatio: 4 / 3,
    priority: false,
  },
  profileHero: {
    src: '/images/profile.png',
    webp: '/images/profile-hero.webp',
    avif: '/images/profile-hero.avif',
    fallback: '/images/profile.png',
    alt: 'User profile interface showing personal journey and settings',
    aspectRatio: 1 / 1,
    priority: false,
  },
};
