# Frontend/UI Audit Report

**Date:** 2025-12-16
**Auditor:** Claude Code (frontend-design skill)
**Project:** Luminari's Quest v0.2.0

---

## Executive Summary

This comprehensive audit identifies **critical functional issues**, **design/aesthetic concerns**, **structural problems**, and **code quality issues** in the Luminari's Quest frontend.

**All critical issues resolved (2025-12-16):**

- ~~Combat overlay interaction bug~~ **RESOLVED** - see Issue #1 (pointer-events + focus timing)
- ~~Battle results screen not appearing~~ **RESOLVED** - see Issue #2 (hydration race condition fix)

---

## Critical Functional Issues

### 1. ~~Combat Overlay Interaction Bug~~ (SEVERITY: CRITICAL) - RESOLVED

**Location:** `src/features/combat/components/CombatOverlay.tsx:17-23, 70-80`

**Issue:** ~~Users must click the "Illuminate button area" before the combat overlay becomes fully interactive.~~ This was a **known, documented bug** with multiple failed fix attempts.

**Resolution (2025-12-16):**
The root cause was identified as a combination of:

1. Missing explicit `pointer-events-auto` on the content layer - framer-motion's animation lifecycle was interfering with pointer events during transitions
2. Focus timing mismatch - the 100ms focus delay raced with the 300ms animation, creating a window where interactions weren't properly handled

**Fix applied:**

- `CombatBackdrop.tsx:52-56` - Added explicit `pointer-events: 'auto'` to framer-motion initial/animate states AND `pointer-events-auto` class to ensure interactivity during and after animation transitions
- `CombatContainer.tsx:47-51` - Changed focus timing from 100ms to 320ms (after 300ms animation completes) with `requestAnimationFrame` for browser render cycle synchronization

**Verification:** Build passes, lint passes, all tests pass.

---

### 2. ~~Battle Results Screen Not Appearing~~ (SEVERITY: HIGH) - RESOLVED

**Location:** `src/features/combat/components/resolution/CombatReflectionModal.tsx:10-17`

**Issue:** ~~The `CombatReflectionModal` component exists but does not appear after combat ends, despite being integrated in `CombatOverlay.tsx`.~~

**Resolution (2025-12-16):**
The root cause was a **hydration race condition** in the `useCombatStore` hook:

1. When combat ended, `CombatOverlay` would show the modal
2. `CombatReflectionModal` mounted and called `useCombatStore()`
3. The hook's hydration safety check (`!hasMounted || !hasHydrated`) returned `enemy: null` during the first render
4. With `enemy: null`, `reflectionData` was calculated as `null`
5. The modal returned `null` (rendering nothing) at line 311: `if (!reflectionData) return null`

**Fix applied:**

- `CombatOverlay.tsx` now captures a snapshot of combat data (`CombatEndSnapshot`) when combat ends via `useEffect`
- This snapshot is passed as a prop (`combatSnapshot`) to `CombatReflectionModal`
- The modal uses the snapshot data directly instead of relying on `useCombatStore()` with hydration issues
- This bypasses the race condition where hydration safety defaults caused the modal to render nothing

**Files modified:**

- `CombatOverlay.tsx:77-126` - Added `combatEndSnapshot` state and snapshot capture effect
- `CombatReflectionModal.tsx:50-58` - Added `CombatEndSnapshot` interface export
- `CombatReflectionModal.tsx:86` - Added `combatSnapshot` prop to interface
- `CombatReflectionModal.tsx:152-210` - Updated to use snapshot data instead of store data

**Verification:** Build passes, lint passes, all 26 combat test files pass (290 tests)

---

### 3. ~~Stale Code with Failed Fix Attempts~~ (SEVERITY: HIGH) - RESOLVED

**Locations:**

- ~~`CombatOverlay.tsx:70-80` - "CLAUDE CODE FAILED ASSUMPTION ALERT"~~
- ~~`ActionGrid.tsx:54-57` - Same failed assumption warning~~
- ~~Multiple `keyboardActiveAction` props marked as "NOT needed"~~

**Issue:** ~~The codebase contained implementation attempts that were documented as failures but never cleaned up.~~

**Resolution (2025-12-16):**
All "CLAUDE CODE FAILED ASSUMPTION" comments and warnings were removed from:

- `CombatOverlay.tsx` - File header updated, failed assumption block removed
- `ActionGrid.tsx` - Interface comment and function body comment removed
- Props are now clean without deprecation warnings

---

## Design & Aesthetic Issues

### 4. ~~Generic Typography~~ (SEVERITY: MEDIUM) - RESOLVED (v2)

**Location:** `tailwind.config.ts:79-82`, `src/index.css:45, 116-119, 137`

**Issue:** ~~The application uses extremely generic, "AI slop" fonts:~~

- ~~**Heading:** `'Roboto', Arial, sans-serif`~~
- ~~**Body:** `'Arial', system-ui, sans-serif`~~

**Resolution (2025-12-16 - Ember Hearth Redesign):**
Typography overhauled with warm, editorial fonts appropriate for trauma-informed therapeutic context:

- **Display:** `'Libre Baskerville', Georgia, serif` — Warm editorial serif with refined character, used for hero titles and section headers
- **Heading:** `'Cormorant Garamond', Georgia, serif` — Elegant italic serif for quotes and accents
- **Body:** `'DM Sans', system-ui, sans-serif` — Friendly, modern geometric sans-serif for readable body text

**Design rationale:** Shifted from "mystical fantasy" (Cinzel) to "warm editorial" (Libre Baskerville) to feel more like a sanctuary than an escape — more appropriate for young adults processing trauma.

**Changes made:**

- `index.html` — Updated Google Fonts import (Libre Baskerville, Cormorant Garamond, DM Sans)
- `tailwind.config.ts:79-83` — Updated font family definitions
- `src/index.css` — Updated all typography declarations with warm editorial styling

**Verification:** Build passes, lint passes.

---

### 5. ~~Purple Gradient Overuse~~ (SEVERITY: LOW) - RESOLVED (Landing Page)

**Location:** Throughout codebase

**Issue:** ~~Heavy reliance on purple gradients (`#865DFF` to `#a855f7`) creates a generic "AI-generated" aesthetic that appears in countless AI-generated projects.~~

**Examples (still present in internal pages):**

- `src/index.css:166` - `btn-primary` uses this gradient
- `src/components/layout/Navbar.tsx:16, 19` - Logo and title
- `src/components/layout/Sidebar.tsx:43, 61, 78` - Navigation elements

**Resolution (2025-12-16 - Ember Hearth Redesign):**
The landing page (`src/pages/Home.tsx`) now uses a completely new **"Ember Hearth"** warm color palette:

**Foundation (warm charcoal, not pure black):**

- `--hearth-deep: #151118` — Base background
- `--hearth-mid: #1e1a21` — Mid-tone surfaces
- `--hearth-surface: #2a252e` — Card backgrounds

**Warm accent colors:**

- `--ember-gold: #e8a87c` — Primary accent (candlelight warmth)
- `--ember-rose: #c4918a` — Secondary accent (dusty terracotta)
- `--ember-sage: #8ba888` — Tertiary accent (growth/healing)
- `--ember-lavender: #a89bc4` — Subtle purple (reserved for guardian)

**Text colors:**

- `--cream: #f5f0e8` — Primary text (warm white)
- `--cream-muted: #d4cfc6` — Muted particles
- `--taupe: #a89b94` — Secondary text

**Design rationale:** Warm earth tones feel like "coming home" rather than "escaping to fantasy" — more emotionally appropriate for therapeutic healing context.

**Remaining work:** Apply Ember Hearth palette to Navbar, Sidebar, and internal pages.

---

### 6. ~~Limited Animation Variety~~ (SEVERITY: LOW) - RESOLVED (v2)

**Location:** `tailwind.config.ts:106-181`, `src/index.css:295-1272`

**Issue:** ~~Animations are limited to basic patterns:~~

- ~~`fade-in`, `slide-up` (generic)~~
- ~~`glow` (pulsing box-shadow)~~
- ~~`damage-float` (combat-specific)~~
- ~~`accordion-down/up` (shadcn default)~~

**Resolution (2025-12-16 - Ember Hearth Redesign):**
Animation system redesigned with slower, more organic "breathing" animations appropriate for a calming, therapeutic context:

**Staggered Reveals:**

- `.reveal` base class with `revealUp` keyframe animation
- `.reveal-delay-1` through `.reveal-delay-5` for orchestrated page load

**Scroll-Triggered Animations:**

- `.fade-in-section` with IntersectionObserver integration
- Threshold and rootMargin tuned for smooth reveal timing

**Micro-Interactions (refined, less aggressive):**

- `.feature-card-enhanced` hover: `translateY(-6px)` — subtle lift, no scale
- `.btn-portal` hover: `translateY(-2px)` + light sweep — understated elegance
- `.icon-glow` with `iconBreathe` animation (6s cycle) — gentle pulse

**Ambient Animations (slower, breathing rhythm):**

- `emberGlow`: Ember particles pulse softly (4s cycle)
- `orbBreathe`: Ambient orbs breathe with subtle movement (12s cycle)
- `warmthFlow`: Warm aurora waves drift slowly (30-40s cycles)
- `ringBreathe`: Sanctuary rings pulse gently (10s cycle)
- `sigilDrift`: Geometric accents drift vertically (25s cycle)
- `dustFloat`: Dust particles rise slowly (20s cycle)
- `moteRise`: Ember motes rise from auth section (10s cycle)
- `scrollFloat`: Scroll indicator floats gently (3s cycle)

**Design philosophy:** Animations are slower (6-25s cycles vs 3-8s) and more organic to create a calm, safe atmosphere rather than an exciting, dynamic one.

**Changes made:**

- `src/index.css:295-1272` - Ember Hearth CSS replacing Portal Sanctuary
- `src/pages/Home.tsx` - Updated with warm ember particle colors

**Verification:** Build passes, lint passes.

---

## Structural Issues

### 7. Unused Fallback Index Page

**Location:** `src/pages/Index.tsx`

**Issue:** Contains placeholder content ("Welcome to Your Blank App") that is never rendered because routing goes to `Home.tsx`.

```typescript
const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
```

**Recommendation:** Delete this file or repurpose it.

---

### 8. ~~Mixed CSS Architecture~~ (SEVERITY: HIGH) - RESOLVED

**Locations:**

- `src/index.css` - Custom CSS classes (`.glass`, `.btn-primary`, `.card-enhanced`)
- Components use mix of Tailwind utilities and custom classes
- Some components use inline styles

**Issues:**

- ~~`.glass` class defined outside `@layer` for "Tailwind v4 compatibility" (line 144)~~ **DOCUMENTED**
- ~~Duplicate style definitions (e.g., `glow` keyframes defined in both `index.css:195-202` and `tailwind.config.ts:135-142`)~~ **RESOLVED**
- ~~Some shadcn components modified, others use defaults~~ **RESOLVED**

**Resolution (2025-12-17):**

All actively-used shadcn components migrated to consistent Ember Hearth styling:

| Component      | Changes                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `input.tsx`    | `rounded-xl`, glass bg (`bg-white/5`), warm focus (`ring-primary`), `h-10`                     |
| `textarea.tsx` | `rounded-xl`, glass bg, warm focus, `min-h-[100px]`                                            |
| `dialog.tsx`   | Warm overlay (`bg-hearth-deep/90`), `rounded-2xl`, glassmorphism content, `font-heading` title |
| `badge.tsx`    | `rounded-lg`, ember-gold/sage/rose variants, added `success` variant                           |
| `tooltip.tsx`  | `rounded-xl`, glass bg (`bg-hearth-surface/95`), warm text (`text-cream`)                      |
| `select.tsx`   | `rounded-xl` trigger/content, glass bg, warm hover (`bg-ember-gold/15`)                        |
| `switch.tsx`   | `bg-ember-gold` checked state, `bg-cream` thumb                                                |
| `slider.tsx`   | Ember gradient range (`from-ember-gold to-ember-rose`), warm thumb styling                     |

**Styling patterns applied:**

- Corner radius: `rounded-xl` (inputs/select) or `rounded-2xl` (modals/cards)
- Glass backgrounds: `bg-white/5` or `bg-hearth-surface/95`
- Borders: `border-white/20` instead of `border-input`
- Focus states: `focus-visible:ring-2 focus-visible:ring-primary`
- Transitions: `transition-all duration-200`
- Hover states: `bg-ember-gold/15` or `bg-white/10`

**Verification:** Build passes, lint passes.

**CSS Architecture (now established):**

1. Use Tailwind utilities for one-off styles
2. Use CSS custom properties for design tokens
3. Reserve custom classes for reusable patterns only
4. Shadcn components customized with Ember Hearth color palette

---

### 9. Tailwind CSS 4 Migration Inconsistencies

**Location:** `postcss.config.js`, `tailwind.config.ts`, `src/index.css`

**Issues:**

- Using `@tailwindcss/postcss` (Tailwind 4 approach)
- But `tailwind.config.ts` uses Tailwind 3 configuration pattern
- Custom CSS uses `@custom-variant dark (&:is(.dark *));` which is Tailwind 4 syntax
- Some styles moved outside `@layer` with comment "for Tailwind v4 compatibility"

**Evidence:**

```css
/* src/index.css:38 */
@custom-variant dark (&:is(.dark *));

/* src/index.css:144 - Comment indicates awareness of issue */
/* Glassmorphism Utilities - Moved outside @layer for Tailwind v4 compatibility */
```

---

### 10. Outdated Copyright Year

**Location:** `src/components/layout/Sidebar.tsx:92`

```typescript
<p className="text-muted-foreground text-center text-xs">
  © 2024 Luminari's Quest
</p>
```

**Issue:** Should be 2025.

---

### 11. Force Override Styling (Code Smell)

**Location:** `src/components/auth/AuthForm.tsx:146`

```typescript
<Card className="mx-auto w-full max-w-md !bg-background/95 !backdrop-filter-none !border-border">
```

**Issue:** Using `!important` style overrides (`!bg-background/95`) indicates:

- Base component styles are too opinionated
- Specificity conflicts in the CSS architecture
- Potential maintenance headache

---

## Component-Specific Issues

### 12. Card Component Double Glass Effect

**Location:** `src/components/ui/card.tsx:9`

```typescript
className={cn(
  'card-enhanced glass rounded-2xl border border-white/20 bg-card text-card-foreground shadow-glass',
```

**Issue:** `card-enhanced` already applies glass effect, then `glass` class is also added, plus `bg-card` CSS variable. Triple-layered background definitions.

---

### 13. Progress Bars Using Inline Width

**Locations:**

- `src/components/molecules/GuardianText.tsx:86`
- `src/pages/Progress.tsx:67-68`
- `src/components/organisms/StatsBar.tsx:129, 184, 237`

**Issue:** All progress bars use inline `style={{ width: '${value}%' }}` instead of CSS custom properties or data attributes, which:

- Prevents CSS-only animations
- Makes transitions less smooth
- Harder to maintain

---

### 14. Combat Text Classes Defined in Global CSS

**Location:** `src/index.css:1-36`

**Issue:** Combat-specific utility classes (`.combat-text-light`, `.combat-text-damage`, etc.) are defined globally but only used in combat components. Should be scoped or moved to combat feature CSS.

---

### 15. DiceRollOverlay Animation Timing

**Location:** `src/components/molecules/DiceRollOverlay.tsx:43-46`

```typescript
const closeTimer = setTimeout(() => {
  handleClose();
}, 7000);
```

**Issue:** 7-second auto-close timer is hardcoded. Combined with the 1500ms result reveal delay, users see results for only ~5.5 seconds before auto-dismiss. May be too fast for therapeutic reflection, too slow for engaged players.

---

## Accessibility Issues

### 16. Animation Without Reduced Motion Support

**Location:** Multiple components

**Issue:** While `settings.accessibility.reducedMotion` exists in the settings store (`src/pages/Profile.tsx:223-234`), animations throughout the app don't check this preference:

- `src/components/ui/spinner.tsx` - No reduced motion check
- `CombatBackdrop` framer-motion animations
- DiceRollOverlay animations
- Progress bar transitions

---

### 17. Color Contrast Concerns

**Locations:**

- Combat text colors against dark backgrounds
- Muted foreground text (`text-muted-foreground`)
- Disabled button states

**Issue:** Several color combinations may not meet WCAG AA contrast requirements, especially:

- Yellow text (`combat-text-critical`) on dark backgrounds
- Blue text (`combat-text-mana`) against purple-tinted cards

---

## Performance Concerns

### 18. Large Component Files

**Location:** `src/features/combat/components/resolution/CombatReflectionModal.tsx`

**Issue:** 529 lines - exceeds the 250-line component guideline (500 for combat allowed, but this is a modal, not core combat).

---

### 19. Framer Motion Bundle Size

**Location:** `package.json:57`

```json
"framer-motion": "^12.23.24"
```

**Issue:** Only used in:

- `CombatBackdrop.tsx` - AnimatePresence with basic fade
- `CombatReflectionModal.tsx` - AnimatePresence with basic height animation

For such simple animations, CSS transitions would suffice without the 50KB+ bundle addition.

---

## Recommendations Summary

### Priority 1 (Critical)

1. ~~**Fix combat overlay interaction bug** - Root cause investigation needed~~ **DONE** (pointer-events + focus timing fix)
2. ~~**Fix battle results modal not appearing** - Debug state management flow~~ **DONE** (hydration race condition fix via snapshot props)
3. ~~**Clean up failed fix code** - Remove commented failure warnings~~ **DONE** (removed as part of #1 and #2 fixes)

### Priority 2 (High)

4. ~~**Typography overhaul** - Replace generic fonts with distinctive choices~~ **DONE**
5. **CSS architecture cleanup** - Resolve Tailwind 4 migration inconsistencies
6. **Remove unused Index.tsx** - Clean dead code

### Priority 3 (Medium)

7. ~~**Color palette refinement** - Reduce purple gradient dependency~~ **PARTIAL** (landing page done, internal pages pending)
8. ~~**Animation system enhancement** - Add staggered reveals, micro-interactions~~ **DONE**
9. **Accessibility audit** - Reduced motion support, contrast checking
10. **Update copyright year** - Simple fix

### Priority 4 (Low)

11. **Refactor large components** - Split CombatReflectionModal
12. **Evaluate Framer Motion** - Consider CSS-only alternatives
13. **Consolidate progress bar patterns** - Use consistent approach
14. **Scope combat CSS** - Move from global to feature-specific

---

## Files Reviewed

| File                                                                  | Lines | Issues Found                                                            |
| --------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| `tailwind.config.ts`                                                  | 186   | Typography updated (Libre Baskerville, DM Sans)                         |
| `src/index.css`                                                       | ~1272 | Mixed patterns, **Ember Hearth CSS** replacing Portal Sanctuary         |
| `src/App.tsx`                                                         | 112   | Clean                                                                   |
| `src/components/layout/Layout.tsx`                                    | 71    | Clean                                                                   |
| `src/components/layout/Navbar.tsx`                                    | 62    | Purple gradient overuse                                                 |
| `src/components/layout/Sidebar.tsx`                                   | 100   | Outdated copyright                                                      |
| `src/components/layout/Footer.tsx`                                    | 23    | Clean                                                                   |
| `src/pages/Home.tsx`                                                  | 409   | **Redesigned v2:** "Ember Hearth" warm sanctuary landing page           |
| `src/pages/Index.tsx`                                                 | 16    | Unused placeholder                                                      |
| `src/pages/Adventure.tsx`                                             | 182   | Clean                                                                   |
| `src/pages/Progress.tsx`                                              | 172   | Inline progress styles                                                  |
| `src/pages/Profile.tsx`                                               | 356   | Clean, good settings UI                                                 |
| `src/components/ui/button.tsx`                                        | 54    | Clean, well-customized                                                  |
| `src/components/ui/card.tsx`                                          | 62    | Double glass effect                                                     |
| `src/components/ui/dialog.tsx`                                        | 103   | Clean                                                                   |
| `src/components/auth/AuthForm.tsx`                                    | 215   | Force override styling                                                  |
| `src/components/atoms/ImpactfulImage.tsx`                             | 152   | Well-implemented                                                        |
| `src/components/molecules/GuardianText.tsx`                           | 98    | Inline progress style                                                   |
| `src/components/molecules/DiceRollOverlay.tsx`                        | 118   | Hardcoded timing                                                        |
| `src/components/organisms/StatsBar.tsx`                               | 279   | Clean, good tooltips                                                    |
| `src/components/organisms/ChoiceList.tsx`                             | 223   | Clean                                                                   |
| `src/features/combat/components/CombatOverlay.tsx`                    | 197   | ~~CRITICAL: Interaction bug~~ **FIXED**                                 |
| `src/features/combat/components/CombatBackdrop.tsx`                   | 66    | ~~Part of interaction bug~~ **FIXED** (pointer-events-auto)             |
| `src/features/combat/components/CombatContainer.tsx`                  | 113   | ~~Part of interaction bug~~ **FIXED** (focus timing)                    |
| `src/features/combat/components/actions/ActionButton.tsx`             | 159   | Clean                                                                   |
| `src/features/combat/components/actions/ActionGrid.tsx`               | 135   | ~~Failed assumption code~~ **CLEANED**                                  |
| `src/features/combat/components/display/organisms/EnemyCard.tsx`      | 73    | Clean                                                                   |
| `src/features/combat/components/resolution/CombatReflectionModal.tsx` | 529   | ~~Not appearing~~ **FIXED** (hydration race condition), still too large |

---

**Total Issues Identified:** 19
**Critical:** 2 (2 resolved)
**High:** 2 (2 resolved)
**Medium:** 9 (2 resolved, 1 partial)
**Low:** 6 (1 resolved, 1 partial)

**Resolved:** 6 / 19 (+ 2 partial)

---

## Resolution Log

| Date       | Issue # | Description                                                                          | Status             |
| ---------- | ------- | ------------------------------------------------------------------------------------ | ------------------ |
| 2025-12-16 | #4      | Typography overhaul (Cinzel + Cormorant Garamond + Nunito)                           | Resolved           |
| 2025-12-16 | #5      | Color palette refinement (Portal Sanctuary landing page)                             | Partial            |
| 2025-12-16 | #6      | Animation system (aurora, portal, sigils, constellations, dust)                      | Resolved           |
| 2025-12-16 | #4 v2   | Typography redesign (Libre Baskerville + DM Sans - "Ember Hearth")                   | Resolved           |
| 2025-12-16 | #5 v2   | Color palette overhaul (Ember Hearth warm earth tones)                               | Resolved (landing) |
| 2025-12-16 | #6 v2   | Animation system redesign (slower breathing animations)                              | Resolved           |
| 2025-12-16 | #1      | Combat overlay interaction bug (pointer-events + focus timing)                       | Resolved           |
| 2025-12-16 | #2      | Battle results modal not appearing (hydration race condition fix via snapshot props) | Resolved           |
| 2025-12-16 | #3      | Stale code cleanup (removed failed assumption comments)                              | Resolved           |

---

## Landing Page Redesign Details

### Version 1: Portal Sanctuary (2025-12-16 AM)

Initial redesign with mystical portal aesthetic using Cinzel font and purple/amber color scheme. **Superseded by Ember Hearth redesign.**

### Version 2: Ember Hearth (2025-12-16 PM) - CURRENT

The `Home.tsx` page was completely redesigned with the **frontend-design** skill to create a warm **"Ember Hearth"** sanctuary experience:

### Aesthetic Direction

- **Theme:** "Ember Hearth" - warm sanctuary homecoming rather than mystical fantasy escape
- **Purpose:** Create emotional safety and warmth for young adults processing trauma from parental loss and homelessness
- **Differentiation:** Feels like coming home to a warm, safe space rather than escaping into a fantasy world
- **Tone:** Editorial sophistication that respects the audience's intelligence

### Typography System (2-tier)

1. **Libre Baskerville** - Warm editorial serif for hero titles, section headers (negative letter-spacing, refined)
2. **DM Sans** - Friendly geometric sans-serif for body text, buttons, labels
3. **Cormorant Garamond** - Retained for italicized quotes and accents

### Color Palette (Ember Hearth)

**Foundation:**

- `--hearth-deep: #151118` - Warm charcoal base (not pure black)
- `--hearth-mid: #1e1a21` - Mid-tone surfaces
- `--hearth-surface: #2a252e` - Card backgrounds

**Accents:**

- `--ember-gold: #e8a87c` - Primary warmth (candlelight)
- `--ember-rose: #c4918a` - Secondary (dusty terracotta)
- `--ember-sage: #8ba888` - Tertiary (growth/healing)
- `--ember-lavender: #a89bc4` - Subtle purple (guardian only)

**Text:**

- `--cream: #f5f0e8` - Primary text
- `--taupe: #a89b94` - Secondary text

### Visual Elements

1. **Warm Aurora** - Three layered waves of amber/rose/sage light (30-40s slow cycles)
2. **Sanctuary Rings** - Three concentric breathing rings around hero (10s cycle)
3. **Ember Particles** - 60 warm-toned particles (cream, gold, rose) with gentle glow (4s cycle)
4. **Geometric Accents** - Minimal circles, diamonds, triangles in warm colors (25s drift)
5. **Dust Particles** - 20 cream-colored motes rising slowly (20s cycle)
6. **Ambient Orbs** - Three warm gradient orbs breathing slowly (12s cycle)
7. **Ember Motes** - 8 gold particles rising around auth form (10s cycle)
8. **Grain Texture** - Subtle film grain (2.5% opacity)
9. **Dividers** - Minimal gold circles with gradient lines

### Component Styling

- **Hero Title** - `.hero-title-mystical` - Libre Baskerville with `<em>` accent in ember-gold, subtle drop-shadow
- **CTA Button** - `.btn-portal` - Rectangular (2px radius), solid ember-gold, uppercase, subtle lift on hover
- **Feature Cards** - `.feature-card-enhanced` - 6px rounded, warm gradient background, 6px lift on hover
- **Quote Block** - `.quote-block-enhanced` - Left border accent, large decorative quote mark
- **Icon Containers** - Circular with color-coded gradients (lavender/gold/sage)

### Content Updates (Trauma-Informed Copy)

- **Tagline:** "A Space for Healing" (not "A Therapeutic Adventure")
- **Subtitle:** "You've carried so much. This is a place to set it down..." (acknowledges burden)
- **Section headers:** "What This Space Offers", "Ready to Begin?" (invitational, not commanding)
- **Feature descriptions:** Emphasize pace, safety, privacy ("no rush", "your own pace", "private")
- **Quote:** "Between who you were and who you're becoming, there's a bridge..." (hopeful but grounded)
- **Footer:** "A sanctuary for healing through play" / "Created with care for those finding their way forward"

### Animation Philosophy

Animations are intentionally slower (6-25s cycles) and organic to create calm rather than excitement:

- Breathing rhythm rather than pulsing
- Drifting rather than bouncing
- Subtle lifts rather than dramatic transforms

### Sections

1. **Hero** - Full-viewport with sanctuary rings, warm particles, staggered reveals
2. **What This Space Offers** - Mission statement acknowledging audience experience
3. **Feature Cards** (3) - Your Guardian, Light & Shadow, Your Journal with warm icon colors
4. **Quote Block** - Grounded, hopeful Guardian quote
5. **Auth Section** - Glass-wrapped form with ember motes
6. **Footer** - Minimal, supportive messaging

### Technical Implementation

- Deterministic pseudo-random particle generation (avoids hydration issues)
- IntersectionObserver for scroll-triggered fade-ins
- CSS-only animations (no Framer Motion for landing page)
- CSS custom properties for all colors
- Semantic HTML with `aria-hidden` on decorative elements

### Files Changed

- `index.html` - Updated Google Fonts (Libre Baskerville, DM Sans)
- `tailwind.config.ts:79-83` - Updated font families
- `src/pages/Home.tsx` - 409 lines (warm ember aesthetic)
- `src/index.css` - ~1272 lines (Ember Hearth replacing Portal Sanctuary)

---

_This is a living document. Issues are marked resolved as they are fixed._
