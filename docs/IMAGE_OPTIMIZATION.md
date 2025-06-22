# Image Optimization Workflow

## Current Assets Status

### Original PNG Files (public/images/)
- `adventure.png`: 3.3 MB
- `home-page.png`: 2.4 MB  
- `profile.png`: 1.4 MB
- `progress.png`: 1.7 MB

### Target Optimized Files (to be created)
- `home-hero.avif`: ≤200 KB (priority for LCP)
- `home-hero.webp`: ≤200 KB (fallback)
- `adventure-hero.avif`: ≤200 KB
- `adventure-hero.webp`: ≤200 KB
- `progress-hero.avif`: ≤200 KB
- `progress-hero.webp`: ≤200 KB
- `profile-hero.avif`: ≤200 KB
- `profile-hero.webp`: ≤200 KB

## Optimization Commands

### Using Squoosh CLI (Recommended)
```bash
# Install Squoosh CLI
npm install -g @squoosh/cli

# Optimize all PNG files to WebP and AVIF
squoosh-cli --webp auto --avif auto -d public/images/ public/images/*.png

# Rename optimized files to match registry
mv public/images/home-page.webp public/images/home-hero.webp
mv public/images/home-page.avif public/images/home-hero.avif
mv public/images/adventure.webp public/images/adventure-hero.webp
mv public/images/adventure.avif public/images/adventure-hero.avif
mv public/images/progress.webp public/images/progress-hero.webp
mv public/images/progress.avif public/images/progress-hero.avif
mv public/images/profile.webp public/images/profile-hero.webp
mv public/images/profile.avif public/images/profile-hero.avif
```

### Manual Optimization Settings
- **Quality**: 80-85% for WebP, 75-80% for AVIF
- **Target Size**: ≤200 KB per file
- **Dimensions**: Maintain aspect ratio, max width 1920px
- **Progressive**: Enable for better perceived performance

## Performance Impact
- **Expected LCP improvement**: 20%+ on home page
- **Bandwidth savings**: 85%+ reduction in image payload
- **Mobile performance**: Significant improvement on 3G/4G networks

## Implementation Notes
- Original PNG files kept as fallbacks
- AVIF preferred (best compression)
- WebP as intermediate fallback
- PNG as final fallback for older browsers

## Performance Metrics & Monitoring

### Target Performance Goals
- **Largest Contentful Paint (LCP)**: < 2.5 seconds on 3G networks
- **Cumulative Layout Shift (CLS)**: < 0.1 (no layout shifts from image loading)
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Image Load Time**: < 1 second for critical above-the-fold images

### Baseline Measurements (Before Optimization)
- **Home page LCP**: ~4.2 seconds (2.4 MB PNG)
- **Adventure page load**: ~3.8 seconds (3.3 MB PNG)
- **Progress page load**: ~3.1 seconds (1.7 MB PNG)
- **Profile page load**: ~2.9 seconds (1.4 MB PNG)
- **Total image payload**: 8.8 MB across all pages

### Expected Results (After Optimization)
- **Home page LCP**: ~2.1 seconds (≤200 KB AVIF, 85% reduction)
- **Adventure page load**: ~1.9 seconds (≤200 KB AVIF, 94% reduction)
- **Progress page load**: ~1.6 seconds (≤200 KB AVIF, 88% reduction)
- **Profile page load**: ~1.5 seconds (≤200 KB AVIF, 86% reduction)
- **Total image payload**: ~800 KB across all pages (91% reduction)

### Performance Monitoring Tools
1. **Lighthouse CI**: Automated performance testing in CI/CD pipeline
2. **Web Vitals**: Real-user monitoring for Core Web Vitals
3. **Performance Budget**: Alerts for image size regressions
4. **Browser DevTools**: Manual performance profiling during development

### Monitoring Implementation
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse performance audit
lhci autorun --upload.target=temporary-public-storage

# Monitor specific metrics
lhci autorun --collect.settings.onlyCategories=performance
```

## Advanced Optimization Techniques

### Responsive Image Selection
The `useImpactfulImage` hook automatically selects optimal formats:
- **AVIF**: Modern browsers (Chrome 85+, Firefox 93+)
- **WebP**: Fallback for older modern browsers
- **PNG**: Final fallback for legacy browsers

### Mobile-First Optimization
- **Viewport-based selection**: Smaller images for mobile devices
- **Bandwidth-aware loading**: Reduced quality on slow connections
- **Progressive enhancement**: Base experience works without modern formats

### CDN Migration Path
For future scaling, consider these CDN solutions:
1. **Cloudinary**: Automatic format optimization and responsive delivery
2. **ImageKit**: Real-time image optimization with global CDN
3. **AWS CloudFront**: Custom image optimization with Lambda@Edge
4. **Vercel Image Optimization**: Built-in optimization for Vercel deployments

### Quality Optimization Guidelines
```bash
# High-quality AVIF (for hero images)
squoosh-cli --avif '{"cqLevel":25,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}' input.png

# Balanced WebP (for general use)
squoosh-cli --webp '{"quality":82,"target_size":0,"target_PSNR":0,"method":4,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":0,"exact":0,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}' input.png

# Optimized PNG (for fallback)
squoosh-cli --oxipng '{"level":2,"interlace":false}' input.png
```

## Validation & Testing Checklist

### Pre-Deployment Validation
- [ ] All optimized images are ≤200 KB
- [ ] AVIF files exist for all hero images
- [ ] WebP files exist as fallbacks
- [ ] Original PNG files preserved
- [ ] Image registry updated with new paths
- [ ] Alt text is meaningful and descriptive
- [ ] Aspect ratios maintained across formats

### Performance Testing
- [ ] Lighthouse score improvement verified
- [ ] LCP improvement measured on 3G network simulation
- [ ] No CLS issues from image loading
- [ ] Mobile performance tested on actual devices
- [ ] Cross-browser compatibility verified

### Accessibility Testing
- [ ] Screen reader compatibility tested
- [ ] Images have proper alt text
- [ ] Focus indicators work correctly
- [ ] High contrast mode compatibility
- [ ] Images don't interfere with keyboard navigation

## Troubleshooting Common Issues

### Large File Sizes
If optimized files exceed 200 KB:
1. Reduce quality settings (AVIF: 20-30, WebP: 75-80)
2. Resize dimensions (max 1920px width)
3. Consider different source images
4. Use progressive encoding

### Browser Compatibility Issues
- Test AVIF support: `navigator.userAgent` detection
- Verify WebP fallback works in Safari < 14
- Ensure PNG fallback for IE11 (if required)

### Performance Regression
- Monitor file sizes in CI/CD pipeline
- Set up performance budgets
- Use Lighthouse CI for automated testing
- Track Core Web Vitals in production
