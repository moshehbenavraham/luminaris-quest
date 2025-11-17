# Mobile-First Image Overlap Fix Template

## 🎯 Overview

This document provides a systematic methodology for fixing image overlap issues using mobile-first responsive design principles. Based on the successful Progress page fix, this template can be applied to similar layout issues across the application.

## 🔍 Problem Identification

### Common Symptoms
- Hero images overlapping with content cards below
- Images dominating mobile viewport (375px)
- Inconsistent spacing between image and subsequent content
- Layout breaking on different screen sizes

### Root Cause Analysis Checklist

#### 1. **Aspect Ratio Impact**
```bash
# Check image aspect ratios in imageRegistry.ts
- 1:1 (Square): Takes more vertical space than expected
- 4:3 (Portrait-ish): ~33% taller than 16:9, causes mobile overlap
- 16:9 (Landscape): Standard ratio, usually well-behaved
```

#### 2. **Container Wrapper Issues**
```tsx
// ❌ PROBLEMATIC: Extra wrapper with custom spacing
<div className="max-w-2xl mx-auto mb-8 lg:mb-10">
  <ImpactfulImage />
</div>

// ✅ CORRECT: Direct placement in flow
<ImpactfulImage />
```

#### 3. **Missing Height Constraints**
```tsx
// ❌ PROBLEMATIC: No height limits
className="md:rounded-xl w-full object-cover"

// ✅ CORRECT: Responsive height constraints
className="md:rounded-xl md:max-h-[280px] w-full object-cover"
```

#### 4. **Spacing Inconsistencies**
```tsx
// ❌ PROBLEMATIC: Mixed spacing approaches
<div className="space-y-8">
  <div className="mb-8"> {/* Custom spacing conflicts */}
    <ImpactfulImage />
  </div>
  <Card />
</div>

// ✅ CORRECT: Consistent parent spacing
<div className="space-y-8 lg:space-y-10">
  <ImpactfulImage /> {/* No custom margins */}
  <Card />
</div>
```

## 🛠️ Systematic Fix Pattern

### Step 1: Remove Wrapper Containers

**Before:**
```tsx
<div className="max-w-2xl mx-auto mb-8 lg:mb-10">
  <ImpactfulImage
    src={image.src}
    alt={image.alt}
    className="md:rounded-xl w-full object-cover"
  />
</div>
```

**After:**
```tsx
<ImpactfulImage
  src={image.src}
  alt={image.alt}
  className="md:rounded-xl md:max-h-[280px] w-full object-cover"
/>
```

### Step 2: Apply Responsive Height Constraints

**Height Guidelines by Aspect Ratio:**
```css
/* Square images (1:1) */
md:max-h-[320px]

/* Portrait-ish images (4:3) */
md:max-h-[280px]

/* Landscape images (16:9) */
md:max-h-[420px]

/* Ultra-wide images (21:9) */
md:max-h-[200px]
```

### Step 3: Ensure Consistent Spacing

**Parent Container Pattern:**
```tsx
<div className="px-4 py-6 lg:px-8 lg:py-8">
  <div className="mx-auto max-w-4xl space-y-8 lg:space-y-10">
    <ImpactfulImage /> {/* Spacing handled by parent */}
    <Card />
    <Card />
  </div>
</div>
```

## 📱 Mobile-First Implementation

### Core Principles

1. **Start with Mobile (375px)**
   - Test image height at mobile viewport first
   - Ensure no viewport domination
   - Verify proper spacing between elements

2. **Progressive Enhancement**
   - Add desktop constraints with `md:` prefix
   - Enhance spacing with `lg:` variants
   - Maintain mobile functionality at all breakpoints

3. **Accessibility First**
   - Preserve `object-cover` for proper scaling
   - Maintain meaningful alt text
   - Keep WCAG 2.1 AA compliance

### CSS Class Pattern

```tsx
className="md:rounded-xl md:max-h-[XXXpx] w-full object-cover"
//         ^desktop-only  ^height-limit  ^responsive ^proper-scaling
```

## 🧪 Testing Checklist

### Before Implementation
- [ ] Identify aspect ratio of problematic image
- [ ] Measure current image height at 375px viewport
- [ ] Document spacing issues between image and next element
- [ ] Note any wrapper containers with custom spacing

### After Implementation
- [ ] Test at 375px mobile viewport - no overlap
- [ ] Test at 768px tablet viewport - proper scaling
- [ ] Test at 1024px desktop viewport - height constraints work
- [ ] Verify all existing functionality preserved
- [ ] Run component tests - 100% pass rate required
- [ ] Check accessibility with screen reader

## 🔧 Troubleshooting Guide

### Issue: Image Still Too Tall on Mobile
**Solution:** Reduce height constraint
```tsx
// Try smaller constraint
md:max-h-[240px] // Instead of md:max-h-[280px]
```

### Issue: Image Looks Squished on Desktop
**Solution:** Adjust object-position
```tsx
<ImpactfulImage
  objectPosition="center top" // Focus on top of image
  className="md:rounded-xl md:max-h-[280px] w-full object-cover"
/>
```

### Issue: Spacing Still Inconsistent
**Solution:** Check parent container
```tsx
// Ensure parent has proper spacing
<div className="space-y-8 lg:space-y-10"> {/* Not space-y-6 */}
```

### Issue: Tests Failing After Fix
**Solution:** Update test expectations
```tsx
// Tests may expect old wrapper structure
// Update to match new direct placement
```

## 📋 Implementation Template

```tsx
// 1. Remove wrapper div
// 2. Add height constraint based on aspect ratio
// 3. Ensure parent container handles spacing

{/* BEFORE */}
<div className="max-w-2xl mx-auto mb-8 lg:mb-10">
  <ImpactfulImage
    src={imageAsset.avif || imageAsset.src}
    alt={imageAsset.alt}
    ratio={imageAsset.aspectRatio}
    priority={imageAsset.priority}
    fallback={imageAsset.fallback}
    className="md:rounded-xl w-full object-cover"
  />
</div>

{/* AFTER */}
<ImpactfulImage
  src={imageAsset.avif || imageAsset.src}
  alt={imageAsset.alt}
  ratio={imageAsset.aspectRatio}
  priority={imageAsset.priority}
  fallback={imageAsset.fallback}
  className="md:rounded-xl md:max-h-[280px] w-full object-cover"
/>
```

## ✅ Success Criteria

- [ ] No image overlap with content below
- [ ] Mobile viewport (375px) properly handled
- [ ] Responsive behavior across all breakpoints
- [ ] All existing functionality preserved
- [ ] 100% test success rate maintained
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Consistent with established design patterns

## 🔄 Reusability

This template can be applied to:
- Any page with hero images
- Image galleries with overlap issues
- Card layouts with image headers
- Profile pages with avatar images
- Landing pages with feature images

**Key:** Always start with mobile-first analysis and apply systematic height constraints based on aspect ratio.
