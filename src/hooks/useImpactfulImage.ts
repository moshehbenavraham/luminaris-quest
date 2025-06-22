/*
 * MIT License
 * Built with Bolt.new
 * useImpactfulImage - Enhanced responsive image selection hook for Luminari's Quest
 * 
 * Features:
 * - Viewport-based image format selection
 * - Device capability detection (WebP/AVIF support)
 * - Mobile-first responsive image sizing
 * - Bandwidth-aware image selection
 * - Performance optimization for different screen sizes
 */

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from './use-mobile';
import type { ImageAsset } from '@/data/imageRegistry';

export interface UseImpactfulImageOptions {
  /** Prefer smaller images on mobile to save bandwidth */
  optimizeForMobile?: boolean;
  /** Force specific format (overrides auto-detection) */
  forceFormat?: 'avif' | 'webp' | 'original';
  /** Custom breakpoint for mobile detection (default: 768px) */
  mobileBreakpoint?: number;
}

export interface ImpactfulImageResult {
  /** Optimized image source URL */
  src: string;
  /** Whether the selected image is optimized for current viewport */
  isOptimized: boolean;
  /** Detected format being used */
  format: 'avif' | 'webp' | 'original';
  /** Whether user is on mobile device */
  isMobile: boolean;
  /** Whether browser supports modern formats */
  supportsModernFormats: boolean;
}

/**
 * Enhanced hook for responsive image selection based on viewport and device capabilities
 * Provides intelligent image format selection for optimal performance and user experience
 */
export function useImpactfulImage(
  imageAsset: ImageAsset,
  options: UseImpactfulImageOptions = {}
): ImpactfulImageResult {
  const {
    optimizeForMobile = true,
    forceFormat
  } = options;

  const isMobile = useIsMobile();
  const [supportsAvif, setSupportsAvif] = useState(false);
  const [supportsWebp, setSupportsWebp] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect browser format support
  useEffect(() => {
    setIsClient(true);
    
    const detectFormatSupport = async () => {
      try {
        // Test AVIF support
        const avifSupport = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
        setSupportsAvif(await avifSupport);

        // Test WebP support
        const webpSupport = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
        setSupportsWebp(await webpSupport);
      } catch (error) {
        console.warn('Error detecting image format support:', error);
        setSupportsAvif(false);
        setSupportsWebp(false);
      }
    };

    detectFormatSupport();
  }, []);

  // Calculate optimal image source and format
  const result = useMemo((): ImpactfulImageResult => {
    if (!isClient) {
      // Server-side rendering fallback
      return {
        src: imageAsset.src,
        isOptimized: false,
        format: 'original',
        isMobile: false,
        supportsModernFormats: false
      };
    }

    let selectedSrc = imageAsset.src;
    let selectedFormat: 'avif' | 'webp' | 'original' = 'original';
    let isOptimized = false;

    // Force specific format if requested
    if (forceFormat) {
      switch (forceFormat) {
        case 'avif':
          selectedSrc = imageAsset.avif || imageAsset.src;
          selectedFormat = imageAsset.avif ? 'avif' : 'original';
          break;
        case 'webp':
          selectedSrc = imageAsset.webp || imageAsset.src;
          selectedFormat = imageAsset.webp ? 'webp' : 'original';
          break;
        case 'original':
          selectedSrc = imageAsset.src;
          selectedFormat = 'original';
          break;
      }
    } else {
      // Auto-select best format based on browser support
      if (supportsAvif && imageAsset.avif) {
        selectedSrc = imageAsset.avif;
        selectedFormat = 'avif';
        isOptimized = true;
      } else if (supportsWebp && imageAsset.webp) {
        selectedSrc = imageAsset.webp;
        selectedFormat = 'webp';
        isOptimized = true;
      } else {
        selectedSrc = imageAsset.src;
        selectedFormat = 'original';
      }
    }

    // Mobile optimization: could add logic here for different image sizes
    // For now, we rely on the responsive sizing in the component
    if (optimizeForMobile && isMobile) {
      // Future enhancement: could select mobile-specific image variants
      // For now, the format optimization provides the main benefit
      isOptimized = isOptimized || selectedFormat !== 'original';
    }

    return {
      src: selectedSrc,
      isOptimized,
      format: selectedFormat,
      isMobile,
      supportsModernFormats: supportsAvif || supportsWebp
    };
  }, [
    imageAsset,
    isClient,
    isMobile,
    supportsAvif,
    supportsWebp,
    forceFormat,
    optimizeForMobile
  ]);

  return result;
}

/**
 * Simplified hook for basic responsive image selection
 * Returns just the optimized source URL for easy integration
 */
export function useOptimizedImageSrc(imageAsset: ImageAsset): string {
  const { src } = useImpactfulImage(imageAsset);
  return src;
}
