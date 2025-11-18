/*
 * MIT License
 
 * Example usage of useImpactfulImage hook for enhanced responsive image selection
 */


import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { useImpactfulImage, useOptimizedImageSrc } from '@/hooks/useImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

/**
 * Example 1: Basic usage with the simplified hook
 * This is the easiest way to get optimized image sources
 */
export function BasicExample() {
  const homeHeroImage = imageRegistry.homeHero;
  const optimizedSrc = useOptimizedImageSrc(homeHeroImage);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Basic Usage Example</h2>
      <p className="text-muted-foreground">
        Using useOptimizedImageSrc for simple image optimization
      </p>
      
      <ImpactfulImage
        src={optimizedSrc}
        alt={homeHeroImage.alt}
        ratio={homeHeroImage.aspectRatio}
        priority={homeHeroImage.priority}
        fallback={homeHeroImage.fallback}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}

/**
 * Example 2: Advanced usage with full hook capabilities
 * This shows how to access all the hook's features and metadata
 */
export function AdvancedExample() {
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Advanced Usage Example</h2>
      <p className="text-muted-foreground">
        Using full useImpactfulImage hook with optimization metadata
      </p>
      
      {/* Image with optimized source */}
      <ImpactfulImage
        src={src}
        alt={homeHeroImage.alt}
        ratio={homeHeroImage.aspectRatio}
        priority={homeHeroImage.priority}
        fallback={homeHeroImage.fallback}
        className="rounded-lg shadow-lg"
      />
      
      {/* Optimization status display */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Optimization Status:</h3>
        <ul className="space-y-1">
          <li>Format: <span className="font-mono">{format}</span></li>
          <li>Optimized: <span className={isOptimized ? 'text-green-600' : 'text-yellow-600'}>
            {isOptimized ? 'Yes' : 'No'}
          </span></li>
          <li>Mobile Device: <span className={isMobile ? 'text-blue-600' : 'text-gray-600'}>
            {isMobile ? 'Yes' : 'No'}
          </span></li>
          <li>Modern Format Support: <span className={supportsModernFormats ? 'text-green-600' : 'text-gray-600'}>
            {supportsModernFormats ? 'Yes' : 'No'}
          </span></li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example 3: Format override usage
 * This shows how to force specific formats for testing or special cases
 */
export function FormatOverrideExample() {
  const adventureImage = imageRegistry.adventureHero;
  
  const avifResult = useImpactfulImage(adventureImage, { forceFormat: 'avif' });
  const webpResult = useImpactfulImage(adventureImage, { forceFormat: 'webp' });
  const originalResult = useImpactfulImage(adventureImage, { forceFormat: 'original' });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Format Override Example</h2>
      <p className="text-muted-foreground">
        Comparing different format selections for the same image
      </p>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* AVIF Version */}
        <div className="space-y-2">
          <h3 className="font-semibold">Forced AVIF</h3>
          <ImpactfulImage
            src={avifResult.src}
            alt={adventureImage.alt}
            ratio={adventureImage.aspectRatio}
            priority={false}
            fallback={adventureImage.fallback}
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">
            Format: {avifResult.format}
          </p>
        </div>
        
        {/* WebP Version */}
        <div className="space-y-2">
          <h3 className="font-semibold">Forced WebP</h3>
          <ImpactfulImage
            src={webpResult.src}
            alt={adventureImage.alt}
            ratio={adventureImage.aspectRatio}
            priority={false}
            fallback={adventureImage.fallback}
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">
            Format: {webpResult.format}
          </p>
        </div>
        
        {/* Original Version */}
        <div className="space-y-2">
          <h3 className="font-semibold">Original</h3>
          <ImpactfulImage
            src={originalResult.src}
            alt={adventureImage.alt}
            ratio={adventureImage.aspectRatio}
            priority={false}
            fallback={adventureImage.fallback}
            className="rounded-lg"
          />
          <p className="text-xs text-muted-foreground">
            Format: {originalResult.format}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Comparison between traditional and hook approaches
 * This shows the difference between manual format selection and hook-based selection
 */
export function ComparisonExample() {
  const profileImage = imageRegistry.profileHero;
  
  // Traditional approach (manual format selection)
  const traditionalSrc = profileImage.avif || profileImage.webp || profileImage.src;
  
  // Hook approach (intelligent format selection)
  const { src: hookSrc, format, isOptimized } = useImpactfulImage(profileImage);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Traditional vs Hook Comparison</h2>
      <p className="text-muted-foreground">
        Comparing manual format selection with intelligent hook-based selection
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Traditional Approach */}
        <div className="space-y-4">
          <h3 className="font-semibold">Traditional Approach</h3>
          <ImpactfulImage
            src={traditionalSrc}
            alt={profileImage.alt}
            ratio={profileImage.aspectRatio}
            priority={false}
            fallback={profileImage.fallback}
            className="md:rounded-full md:max-w-[280px] mx-auto"
          />
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Method:</strong> Manual fallback chain</p>
            <p><strong>Source:</strong> {traditionalSrc}</p>
            <p><strong>Limitations:</strong> No browser capability detection</p>
          </div>
        </div>
        
        {/* Hook Approach */}
        <div className="space-y-4">
          <h3 className="font-semibold">Hook Approach</h3>
          <ImpactfulImage
            src={hookSrc}
            alt={profileImage.alt}
            ratio={profileImage.aspectRatio}
            priority={false}
            fallback={profileImage.fallback}
            className="md:rounded-full md:max-w-[280px] mx-auto"
          />
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Method:</strong> Intelligent selection</p>
            <p><strong>Source:</strong> {hookSrc}</p>
            <p><strong>Format:</strong> {format}</p>
            <p><strong>Optimized:</strong> {isOptimized ? 'Yes' : 'No'}</p>
            <p><strong>Benefits:</strong> Browser capability detection, mobile optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Complete example page showcasing all useImpactfulImage features
 */
export function UseImpactfulImageExamples() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">useImpactfulImage Hook Examples</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Demonstrating enhanced responsive image selection with intelligent format detection
          and mobile-first optimization for Luminari's Quest.
        </p>
      </div>
      
      <BasicExample />
      <AdvancedExample />
      <FormatOverrideExample />
      <ComparisonExample />
      
      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>✅ Automatic browser capability detection (AVIF/WebP support)</li>
          <li>✅ Mobile-first responsive image optimization</li>
          <li>✅ Intelligent format selection for optimal performance</li>
          <li>✅ SSR-safe with client-side hydration</li>
          <li>✅ Comprehensive error handling and fallbacks</li>
          <li>✅ TypeScript support with full type safety</li>
          <li>✅ Easy integration with existing ImpactfulImage component</li>
        </ul>
      </div>
    </div>
  );
}
