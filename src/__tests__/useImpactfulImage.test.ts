import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImpactfulImage, useOptimizedImageSrc } from '../hooks/useImpactfulImage';
import type { ImageAsset } from '../data/imageRegistry';
import { useIsMobile } from '../hooks/use-mobile';

// Mock the use-mobile hook
vi.mock('../hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false)
}));

// Mock Image constructor for format detection
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: ''
};

Object.defineProperty(global, 'Image', {
  value: vi.fn(() => mockImage),
  writable: true
});

describe('useImpactfulImage', () => {
  const mockImageAsset: ImageAsset = {
    src: '/images/test.png',
    webp: '/images/test.webp',
    avif: '/images/test.avif',
    fallback: '/images/test-fallback.png',
    alt: 'Test image',
    aspectRatio: 16 / 9,
    priority: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Image mock
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('returns original image source when no modern format support', async () => {
      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Initially returns original format during SSR
      expect(result.current.src).toBe('/images/test.png');
      expect(result.current.format).toBe('original');
      expect(result.current.isMobile).toBe(false);

      // Wait for client-side hydration and format detection
      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
        expect(result.current.isOptimized).toBe(false);
        expect(result.current.supportsModernFormats).toBe(false);
      });
    });

    it('detects AVIF support and uses AVIF format', async () => {
      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Simulate AVIF support detection
      await waitFor(() => {
        if (mockImage.onload) {
          // Simulate successful AVIF load
          mockImage.onload();
        }
      });

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.avif');
        expect(result.current.format).toBe('avif');
        expect(result.current.isOptimized).toBe(true);
        expect(result.current.supportsModernFormats).toBe(true);
      });
    });

    it('falls back to WebP when AVIF is not supported', async () => {
      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Simulate AVIF failure and WebP success
      await waitFor(() => {
        if (mockImage.onerror) {
          // First call (AVIF) fails
          mockImage.onerror();
        }
      });

      await waitFor(() => {
        if (mockImage.onload) {
          // Second call (WebP) succeeds
          mockImage.onload();
        }
      });

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.webp');
        expect(result.current.format).toBe('webp');
        expect(result.current.isOptimized).toBe(true);
        expect(result.current.supportsModernFormats).toBe(true);
      });
    });
  });

  describe('Format Override Options', () => {
    it('forces AVIF format when specified', async () => {
      const { result } = renderHook(() => 
        useImpactfulImage(mockImageAsset, { forceFormat: 'avif' })
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.avif');
        expect(result.current.format).toBe('avif');
      });
    });

    it('forces WebP format when specified', async () => {
      const { result } = renderHook(() => 
        useImpactfulImage(mockImageAsset, { forceFormat: 'webp' })
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.webp');
        expect(result.current.format).toBe('webp');
      });
    });

    it('forces original format when specified', async () => {
      const { result } = renderHook(() => 
        useImpactfulImage(mockImageAsset, { forceFormat: 'original' })
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
      });
    });

    it('falls back to original when forced format is not available', async () => {
      const assetWithoutAvif: ImageAsset = {
        ...mockImageAsset,
        avif: undefined
      };

      const { result } = renderHook(() => 
        useImpactfulImage(assetWithoutAvif, { forceFormat: 'avif' })
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
      });
    });
  });

  describe('Mobile Optimization', () => {
    it('detects mobile viewport correctly', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      await waitFor(() => {
        expect(result.current.isMobile).toBe(true);
      });
    });

    it('optimizes for mobile when enabled', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);

      const { result } = renderHook(() =>
        useImpactfulImage(mockImageAsset, { optimizeForMobile: true })
      );

      await waitFor(() => {
        expect(result.current.isMobile).toBe(true);
        // Mobile optimization currently focuses on format selection
        // Future enhancements could include size-specific optimizations
      });
    });
  });

  describe('Error Handling', () => {
    it('handles format detection errors gracefully', async () => {
      // Mock console.warn to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate error in format detection
      vi.mocked(global.Image).mockImplementation(() => {
        throw new Error('Image creation failed');
      });

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
        expect(result.current.supportsModernFormats).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error detecting image format support:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('SSR Compatibility', () => {
    it('provides safe defaults during server-side rendering', () => {
      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Initial render should provide safe defaults
      expect(result.current.src).toBe('/images/test.png');
      expect(result.current.format).toBe('original');
      expect(result.current.isOptimized).toBe(false);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.supportsModernFormats).toBe(false);
    });
  });
});

describe('useOptimizedImageSrc', () => {
  const mockImageAsset: ImageAsset = {
    src: '/images/test.png',
    webp: '/images/test.webp',
    avif: '/images/test.avif',
    fallback: '/images/test-fallback.png',
    alt: 'Test image',
    aspectRatio: 16 / 9,
    priority: false
  };

  it('returns optimized image source URL', async () => {
    const { result } = renderHook(() => useOptimizedImageSrc(mockImageAsset));

    // Should return the source from useImpactfulImage
    expect(typeof result.current).toBe('string');
    expect(result.current).toBe('/images/test.png'); // Initial value

    // After format detection, should potentially return optimized format
    await waitFor(() => {
      expect(typeof result.current).toBe('string');
      expect(result.current.startsWith('/images/test')).toBe(true);
    });
  });
});
