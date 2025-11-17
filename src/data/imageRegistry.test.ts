import { describe, it, expect } from 'vitest';
import { imageRegistry, type ImageAsset } from '../data/imageRegistry';

describe('Image Registry', () => {
  it('contains all required page images', () => {
    const requiredImages = ['homeHero', 'adventureHero', 'progressHero', 'profileHero'];
    
    requiredImages.forEach(imageKey => {
      expect(imageRegistry[imageKey]).toBeDefined();
      expect(imageRegistry[imageKey]).toHaveProperty('src');
      expect(imageRegistry[imageKey]).toHaveProperty('alt');
    });
  });

  it('has proper fallback images for all entries', () => {
    Object.values(imageRegistry).forEach((image: ImageAsset) => {
      expect(image.fallback).toBeDefined();
      expect(typeof image.fallback).toBe('string');
      expect(image.fallback!.length).toBeGreaterThan(0);
    });
  });

  it('has meaningful alt text for accessibility', () => {
    Object.values(imageRegistry).forEach((image: ImageAsset) => {
      expect(image.alt).toBeDefined();
      expect(typeof image.alt).toBe('string');
      expect(image.alt.length).toBeGreaterThan(10); // Meaningful alt text should be descriptive
    });
  });

  it('sets priority correctly for LCP optimization', () => {
    // Home hero should be priority for LCP
    expect(imageRegistry.homeHero.priority).toBe(true);
    
    // Other images should not be priority
    expect(imageRegistry.adventureHero.priority).toBe(false);
    expect(imageRegistry.progressHero.priority).toBe(false);
    expect(imageRegistry.profileHero.priority).toBe(false);
  });

  it('has valid aspect ratios', () => {
    Object.values(imageRegistry).forEach((image: ImageAsset) => {
      if (image.aspectRatio) {
        expect(typeof image.aspectRatio).toBe('number');
        expect(image.aspectRatio).toBeGreaterThan(0);
      }
    });
  });

  it('follows consistent naming convention', () => {
    Object.values(imageRegistry).forEach((image: ImageAsset) => {
      expect(image.src).toMatch(/^\/images\//);
      if (image.webp) expect(image.webp).toMatch(/^\/images\/.*\.webp$/);
      if (image.avif) expect(image.avif).toMatch(/^\/images\/.*\.avif$/);
    });
  });
});
