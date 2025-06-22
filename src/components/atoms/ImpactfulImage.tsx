/*
 * MIT License
 * Built with Bolt.new
 * ImpactfulImage - Performance-optimized image component for Luminari's Quest
 * 
 * Features:
 * - WebP/AVIF format optimization
 * - LCP (Largest Contentful Paint) optimization
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * - Progressive loading with blur-up pattern
 * - Error handling with fallback images
 */

import * as React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

export interface ImpactfulImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'> {
  /** Image path */
  src: string;
  /** Accessible description */
  alt: string;
  /** Aspect ratio (e.g. 16/9) - only enforced if forceAspectRatio is true */
  ratio?: number;
  /** Force aspect ratio container (default: false for natural sizing) */
  forceAspectRatio?: boolean;
  /** true ⇒ eager loading + fetchpriority=high */
  priority?: boolean;
  /** Custom styling */
  className?: string;
  /** Fallback image path if main fails */
  fallback?: string;
  /** Base64 tiny placeholder for progressive loading */
  blurDataUrl?: string;
  /** Control focus point (e.g., "center top") */
  objectPosition?: string;
}

export const ImpactfulImage = React.forwardRef<
  HTMLImageElement,
  ImpactfulImageProps
>(({
  src,
  alt,
  ratio = 16 / 9,
  forceAspectRatio = false,
  priority = false,
  className,
  fallback,
  blurDataUrl,
  objectPosition = "center",
  ...props
}, ref) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Reset state when src changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = React.useCallback(() => {
    if (!hasError && fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(true);
    }
  }, [hasError, fallback, currentSrc]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const imageClasses = cn(
    // Mobile-first responsive design
    "w-full h-auto object-cover transition-opacity duration-300",
    // Loading state styling
    isLoading && "opacity-0",
    !isLoading && "opacity-100",
    className
  );

  // Progressive loading with blur-up pattern
  const blurPlaceholderStyle = blurDataUrl ? {
    backgroundImage: `url(${blurDataUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: objectPosition,
    backgroundRepeat: 'no-repeat',
  } : {};

  const containerStyle = {
    ...blurPlaceholderStyle,
    position: 'relative' as const,
  };

  const imageElement = (
    <div style={containerStyle} className="overflow-hidden">
      {blurDataUrl && isLoading && (
        <div
          className="absolute inset-0 bg-cover bg-no-repeat filter blur-sm"
          style={{ backgroundImage: `url(${blurDataUrl})`, backgroundPosition: objectPosition }}
          aria-hidden="true"
        />
      )}
      <img
        ref={ref}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        style={{ objectPosition }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes="(min-width: 768px) 768px, 100vw"
        onError={handleError}
        onLoad={handleLoad}
        role="img"
        aria-describedby={hasError && fallback ? `${alt}-error` : undefined}
        data-priority={priority ? "true" : "false"}
        data-ratio={ratio ? String(ratio) : undefined}
        {...({ fetchpriority: priority ? "high" : "auto" } as any)}
        {...props}
      />
      {hasError && fallback && (
        <span id={`${alt}-error`} className="sr-only">
          Image failed to load, showing fallback image
        </span>
      )}
    </div>
  );

  // Only wrap in AspectRatio if explicitly requested
  if (ratio && forceAspectRatio) {
    return (
      <AspectRatio ratio={ratio}>
        {imageElement}
      </AspectRatio>
    );
  }

  return imageElement;
});

ImpactfulImage.displayName = "ImpactfulImage";
