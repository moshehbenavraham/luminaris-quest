/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImpactfulImage, useOptimizedImageSrc } from '../hooks/useImpactfulImage';
import type { ImageAsset } from '../data/imageRegistry';
import { useIsMobile } from '../hooks/use-mobile';

// Mock the use-mobile hook
vi.mock('../hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

// Mock Image constructor for format detection
// Need to create a factory that returns fresh objects for each new Image()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let latestImageInstance: any = null;
let imageInstances: any[] = [];

// Control whether images should succeed or fail when src is set
let shouldSupportAvif = false;
let shouldSupportWebp = false;

// Create a proper constructor function instead of vi.fn()
function MockImage(this: any) {
  let _src = '';
  let _onload: (() => void) | null = null;
  let _onerror: (() => void) | null = null;

  Object.defineProperties(this, {
    src: {
      get() {
        return _src;
      },
      set(value: string) {
        _src = value;
        // Trigger callback immediately but asynchronously using queueMicrotask
        // This ensures callbacks run after the current synchronous code completes
        queueMicrotask(() => {
          if (value.includes('avif')) {
            if (shouldSupportAvif && _onload) {
              _onload();
            } else if (!shouldSupportAvif && _onerror) {
              _onerror();
            }
          } else if (value.includes('webp')) {
            if (shouldSupportWebp && _onload) {
              _onload();
            } else if (!shouldSupportWebp && _onerror) {
              _onerror();
            }
          } else {
            // For other formats, fail by default
            if (_onerror) {
              _onerror();
            }
          }
        });
      },
      enumerable: true,
      configurable: true,
    },
    onload: {
      get() {
        return _onload;
      },
      set(callback: (() => void) | null) {
        _onload = callback;
      },
      enumerable: true,
      configurable: true,
    },
    onerror: {
      get() {
        return _onerror;
      },
      set(callback: (() => void) | null) {
        _onerror = callback;
      },
      enumerable: true,
      configurable: true,
    },
    addEventListener: {
      value: vi.fn(),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    removeEventListener: {
      value: vi.fn(),
      writable: true,
      enumerable: true,
      configurable: true,
    },
  });

  latestImageInstance = this;
  imageInstances.push(this);
}

Object.defineProperty(global, 'Image', {
  value: MockImage,
  writable: true,
  configurable: true,
});

describe('useImpactfulImage', () => {
  const mockImageAsset: ImageAsset = {
    src: '/images/test.png',
    webp: '/images/test.webp',
    avif: '/images/test.avif',
    fallback: '/images/test-fallback.png',
    alt: 'Test image',
    aspectRatio: 16 / 9,
    priority: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Image instance references
    latestImageInstance = null;
    imageInstances = [];
    // Reset format support flags
    shouldSupportAvif = false;
    shouldSupportWebp = false;
    // Reset useIsMobile mock to default false value
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('returns original image source when no modern format support', async () => {
      // Set flags to NOT support any modern formats
      shouldSupportAvif = false;
      shouldSupportWebp = false;

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Initially returns original format during SSR
      expect(result.current.src).toBe('/images/test.png');
      expect(result.current.format).toBe('original');
      expect(result.current.isMobile).toBe(false);

      // Wait for client-side hydration and format detection
      await waitFor(
        () => {
          expect(result.current.src).toBe('/images/test.png');
          expect(result.current.format).toBe('original');
          expect(result.current.isOptimized).toBe(false);
          expect(result.current.supportsModernFormats).toBe(false);
        },
        { timeout: 3000 },
      );
    });

    it('detects AVIF support and uses AVIF format', async () => {
      // Set flags to support AVIF
      shouldSupportAvif = true;
      shouldSupportWebp = true;

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Wait for format detection to complete
      await waitFor(
        () => {
          expect(result.current.src).toBe('/images/test.avif');
          expect(result.current.format).toBe('avif');
          expect(result.current.isOptimized).toBe(true);
          expect(result.current.supportsModernFormats).toBe(true);
        },
        { timeout: 3000 },
      );
    });

    it('falls back to WebP when AVIF is not supported', async () => {
      // Set flags to NOT support AVIF but support WebP
      shouldSupportAvif = false;
      shouldSupportWebp = true;

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      // Wait for format detection to complete
      await waitFor(
        () => {
          expect(result.current.src).toBe('/images/test.webp');
          expect(result.current.format).toBe('webp');
          expect(result.current.isOptimized).toBe(true);
          expect(result.current.supportsModernFormats).toBe(true);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Format Override Options', () => {
    it('forces AVIF format when specified', async () => {
      const { result } = renderHook(() =>
        useImpactfulImage(mockImageAsset, { forceFormat: 'avif' }),
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.avif');
        expect(result.current.format).toBe('avif');
      });
    });

    it('forces WebP format when specified', async () => {
      const { result } = renderHook(() =>
        useImpactfulImage(mockImageAsset, { forceFormat: 'webp' }),
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.webp');
        expect(result.current.format).toBe('webp');
      });
    });

    it('forces original format when specified', async () => {
      const { result } = renderHook(() =>
        useImpactfulImage(mockImageAsset, { forceFormat: 'original' }),
      );

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
      });
    });

    it('falls back to original when forced format is not available', async () => {
      const assetWithoutAvif: ImageAsset = {
        ...mockImageAsset,
        avif: undefined,
      };

      const { result } = renderHook(() =>
        useImpactfulImage(assetWithoutAvif, { forceFormat: 'avif' }),
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
        useImpactfulImage(mockImageAsset, { optimizeForMobile: true }),
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

      // Save the original MockImage
      const originalImage = global.Image;

      // Replace with a throwing constructor
      (global as any).Image = function () {
        throw new Error('Image creation failed');
      };

      const { result } = renderHook(() => useImpactfulImage(mockImageAsset));

      await waitFor(() => {
        expect(result.current.src).toBe('/images/test.png');
        expect(result.current.format).toBe('original');
        expect(result.current.supportsModernFormats).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error detecting image format support:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
      // Restore original mock
      (global as any).Image = originalImage;
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
    priority: false,
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
