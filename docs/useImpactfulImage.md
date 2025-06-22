# useImpactfulImage Hook

Enhanced responsive image selection hook for Luminari's Quest that provides intelligent image format selection based on viewport and device capabilities.

## Features

- 🎯 **Viewport-based image format selection** - Automatically selects optimal format based on device capabilities
- 📱 **Mobile-first responsive optimization** - Optimizes image selection for mobile devices
- 🚀 **Performance optimization** - Uses AVIF/WebP when supported, falls back gracefully
- 🔧 **Device capability detection** - Automatically detects browser support for modern formats
- ⚡ **SSR-safe** - Works correctly with server-side rendering and client-side hydration
- 🛡️ **Error handling** - Comprehensive error handling with graceful fallbacks
- 📊 **Optimization metadata** - Provides detailed information about optimization status

## Installation

The hook is already included in the project. Import it from:

```typescript
import { useImpactfulImage, useOptimizedImageSrc } from '@/hooks/useImpactfulImage';
```

## Basic Usage

### Simple Image Optimization

For basic usage, use the simplified `useOptimizedImageSrc` hook:

```tsx
import { useOptimizedImageSrc } from '@/hooks/useImpactfulImage';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

function MyComponent() {
  const homeHeroImage = imageRegistry.homeHero;
  const optimizedSrc = useOptimizedImageSrc(homeHeroImage);

  return (
    <ImpactfulImage
      src={optimizedSrc}
      alt={homeHeroImage.alt}
      ratio={homeHeroImage.aspectRatio}
      priority={homeHeroImage.priority}
      fallback={homeHeroImage.fallback}
      className="rounded-lg shadow-lg"
    />
  );
}
```

### Advanced Usage with Metadata

For advanced usage with optimization metadata:

```tsx
import { useImpactfulImage } from '@/hooks/useImpactfulImage';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

function AdvancedComponent() {
  const homeHeroImage = imageRegistry.homeHero;
  const {
    src,
    isOptimized,
    format,
    isMobile,
    supportsModernFormats
  } = useImpactfulImage(homeHeroImage, {
    optimizeForMobile: true
  });

  return (
    <div>
      <ImpactfulImage
        src={src}
        alt={homeHeroImage.alt}
        ratio={homeHeroImage.aspectRatio}
        priority={homeHeroImage.priority}
        fallback={homeHeroImage.fallback}
        className="rounded-lg shadow-lg"
      />
      
      {/* Optional: Display optimization status */}
      <div className="text-sm text-muted-foreground">
        Format: {format} | Optimized: {isOptimized ? 'Yes' : 'No'}
      </div>
    </div>
  );
}
```

## API Reference

### useImpactfulImage

```typescript
function useImpactfulImage(
  imageAsset: ImageAsset,
  options?: UseImpactfulImageOptions
): ImpactfulImageResult
```

#### Parameters

- **imageAsset**: `ImageAsset` - Image asset from the image registry
- **options**: `UseImpactfulImageOptions` (optional) - Configuration options

#### Options

```typescript
interface UseImpactfulImageOptions {
  /** Prefer smaller images on mobile to save bandwidth */
  optimizeForMobile?: boolean; // default: true
  
  /** Force specific format (overrides auto-detection) */
  forceFormat?: 'avif' | 'webp' | 'original';
  
  /** Custom breakpoint for mobile detection (default: 768px) */
  mobileBreakpoint?: number;
}
```

#### Return Value

```typescript
interface ImpactfulImageResult {
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
```

### useOptimizedImageSrc

```typescript
function useOptimizedImageSrc(imageAsset: ImageAsset): string
```

Simplified hook that returns just the optimized image source URL.

## Examples

### Format Override

Force a specific format for testing or special cases:

```tsx
// Force AVIF format
const avifResult = useImpactfulImage(imageAsset, { forceFormat: 'avif' });

// Force WebP format
const webpResult = useImpactfulImage(imageAsset, { forceFormat: 'webp' });

// Force original format
const originalResult = useImpactfulImage(imageAsset, { forceFormat: 'original' });
```

### Mobile Optimization

```tsx
const {
  src,
  isMobile,
  isOptimized
} = useImpactfulImage(imageAsset, {
  optimizeForMobile: true,
  mobileBreakpoint: 640 // Custom mobile breakpoint
});

// Use different styling based on mobile detection
const className = isMobile 
  ? "w-full rounded-lg" 
  : "max-w-md rounded-xl shadow-lg";
```

## Browser Support Detection

The hook automatically detects browser support for modern image formats:

- **AVIF**: Uses a tiny AVIF data URL to test support
- **WebP**: Uses a tiny WebP data URL to test support
- **Fallback**: Falls back to original format if modern formats aren't supported

## Performance Benefits

### Format Optimization

- **AVIF**: ~50% smaller than JPEG, ~20% smaller than WebP
- **WebP**: ~25-30% smaller than JPEG
- **Automatic selection**: Uses best supported format

### Mobile Optimization

- Detects mobile devices using viewport width
- Future enhancement: Could serve different image sizes for mobile
- Reduces bandwidth usage on mobile connections

## SSR Compatibility

The hook is designed to work correctly with server-side rendering:

1. **Server-side**: Returns safe defaults (original format)
2. **Client-side**: Hydrates with optimized format selection
3. **No hydration mismatch**: Smooth transition from SSR to client

## Error Handling

The hook includes comprehensive error handling:

- **Format detection errors**: Gracefully falls back to original format
- **Image loading errors**: Uses fallback images from image registry
- **Network issues**: Handles detection failures without breaking

## Testing

The hook includes comprehensive test coverage:

- Format detection simulation
- Mobile viewport detection
- Error handling scenarios
- SSR compatibility
- Format override functionality

Run tests with:

```bash
npm test src/__tests__/useImpactfulImage.test.ts
```

## Migration Guide

### From Manual Format Selection

**Before:**
```tsx
const src = imageAsset.avif || imageAsset.webp || imageAsset.src;
```

**After:**
```tsx
const src = useOptimizedImageSrc(imageAsset);
```

### Benefits of Migration

- ✅ Browser capability detection
- ✅ Mobile optimization
- ✅ Better error handling
- ✅ Performance monitoring
- ✅ Future-proof format selection

## Best Practices

1. **Use the simplified hook** for basic optimization needs
2. **Use the full hook** when you need optimization metadata
3. **Enable mobile optimization** for better mobile performance
4. **Test with different formats** using format override options
5. **Monitor optimization status** in development for debugging

## Future Enhancements

- **Bandwidth detection**: Serve different image sizes based on connection speed
- **Lazy loading integration**: Enhanced lazy loading with intersection observer
- **Image size variants**: Serve different image sizes for different viewports
- **Performance monitoring**: Built-in performance metrics and monitoring
