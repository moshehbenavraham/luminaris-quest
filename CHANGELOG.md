# Changelog

All notable changes to **Luminari's Quest** follow
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
[SemVer](https://semver.org/spec/v2.0.0.html).

For the full, verbose log see `docs/CHANGELOG_OLD.md`.

---

## [Unreleased] – 2025-06-26

### Fixed
- **Combat Overlay Visual Strip Fix**: Fixed critical visual issue where a visual strip appeared at the top of the combat overlay. **Root Causes**: (1) Backdrop blur padding gaps - `p-4` padding on backdrop element prevented blur from reaching screen edges, (2) Z-index conflict - combat overlay and navbar both had `z-50`, allowing navbar to show through. **Solution**: (1) Restructured overlay to separate backdrop blur (`fixed inset-0 z-[60] backdrop-blur-sm`) from content positioning (inner container with padding), (2) Increased combat overlay z-index from `z-50` to `z-[60]` to ensure it renders above navbar. **Impact**: Combat overlay now provides seamless full-screen backdrop blur without visual artifacts or navbar bleed-through. Mobile-first responsive design maintained. All tests passing (6 backdrop + 3 z-index + 33 existing CombatOverlay). No breaking changes.
- **Combat Text Visibility (Critical)**: Fixed critical usability issue where multiple text elements were too dark to see in the combat overlay. Applied `text-white font-bold` styling to enemy name, `text-white/90` to enemy description, `text-white` to Shadow Strength label, and `text-white font-bold` to "Resources" and "Choose Your Response" titles. This ensures high contrast against the dark `bg-black/70 backdrop-blur-sm` background. Updated ActionSelector test to reflect keyboard shortcuts now showing "1-5 keys" (including End Turn). **Impact**: Critical accessibility issue resolved - users can now clearly see all essential combat UI text including enemy names, descriptions, and UI labels. All tests passing (24/24 ActionSelector + 33/33 CombatOverlay).
- **Combat Overlay Text Visibility**: Fixed critical usability issue where text in [`CombatOverlay.tsx`](src/components/combat/CombatOverlay.tsx) was unreadable on dark backgrounds. Replaced generic text classes (`text-foreground`, `text-muted-foreground`) with combat-specific high-contrast classes (`combat-text-light`, `combat-text-shadow`) to ensure all text is clearly readable. This resolves user reports of "dark text on dark background making it impossible to see." Comprehensive test coverage added with 19 new text visibility tests. All 52 tests passing (19 text visibility + 33 existing combat tests). **Impact**: Critical accessibility issue resolved - all combat text now has proper contrast and visibility.
- **End Turn Button Placement**: Fixed critical combat UX issue where End Turn functionality was duplicated between ActionSelector and main combat UI. Removed End Turn from ActionSelector (where it appeared in "Choose Your Response" section) and consolidated it to appear only next to the Surrender button as intended. Updated keyboard shortcuts from 1-5 to 1-4 keys in ActionSelector. All 56 tests pass (23 ActionSelector + 33 CombatOverlay tests).
- **Combat Overlay Z-Index Layering**: Fixed visual issue where the navbar created a white strip at the top of the combat overlay in desktop mode. Changed combat overlay z-index from `z-50` to `z-[60]` to ensure it renders above the navbar (which has `z-50`). Added comprehensive test coverage to verify proper layering behavior. **Impact**: Combat overlay now properly covers the entire viewport without visual artifacts. No breaking changes.

## [Previous] – 2025-06-25

### Added
- **End Turn Button**: Added an "End Turn" button to the combat interface, allowing players to manually end their turn. This was a missing feature that is critical for gameplay.
- **Combat Text Visibility Fix**: Added simple recent combat action display in CombatOverlay to address user feedback about "whacky visual effects" and text not staying present long enough during enemy attacks. Combat action messages now appear in a clear, readable format below the enemy HP bar with proper contrast and sufficient display time for slow readers.
- **Combat overlay UX**
  - Bright white / gray text on dark background.
  - Resources panel now shows **Health, Energy & Experience**.
  - “Surrender” button for immediate combat exit.
- **Shadow health-damage system**
  - Player health (0-100); damage = `scene DC – (LP × 0.5 + trust × 0.1)`, min 1.
  - Live health bar in `StatsBar`.
- **Scene engine expansion**
  - +15 scenes (total 20) across four therapeutic cycles.
- **Light & Shadow combat loop**
  - 4 therapeutic actions, 8 shadow abilities, full React UI, >370 tests.
- **Infrastructure & perf**
  - Longer DB health-check intervals, optimised Supabase token refresh,
    audio player auto-advance reliability.

### Fixed
- **Combat Overlay Sizing**: Fixed the combat overlay layout to be responsive and mobile-first. The overlay now stacks vertically on smaller screens and adjusts to a two-column layout on larger screens, resolving layout issues.
- **Enemy Turn System**: Restored the enemy turn system, which was non-functional. The combat flow is now correctly sequenced, with the enemy taking its turn after the player ends theirs. This resolves a critical issue that broke combat gameplay.
- **Build & tests** – missing `sceneDC` compile error; all 553 tests green.
- **UI/UX** – hook-order violation, dialog ARIA, React-Router v7 flags,
  overlay text contrast, StatsBar visibility, audio autoplay.
- **Gameplay** – 20-turn cap, initial LP/SP, action-execution wiring.
- **Perf / misc** – health-check load, token refresh overhead,
  hydration edge-cases, assorted test flakiness.

### Technical Highlights
- 100 % passing 370 + automated tests.
- Strict TypeScript, ESLint **zero-warning**, Tailwind + Shadcn/UI.
- Vite dev-server :8080 with vendor chunk splitting.

---
