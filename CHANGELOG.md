# Changelog

All notable changes to **Luminari's Quest** follow
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
[SemVer](https://semver.org/spec/v2.0.0.html).

For the full, verbose log see `docs/CHANGELOG_OLD.md`.

---

## [Unreleased] – 2025-06-26

### Added
- **Combat System Complete Rebuild - Phase 1**: Started complete rebuild of combat overlay system with proper architecture after multiple failed fix attempts. **Phase 1 Complete**: (1) Created new feature folder structure at `src/features/combat/` with MIT headers, (2) Implemented Zustand combat store with persistence and hydration safety, (3) Extended Tailwind theme with combat-specific colors (`combat.backdrop`, `combat.card`, `combat.text.*`), z-indices (`combat-backdrop: 100`, `combat-content: 101`), and animations (`combat-fade-in`, `combat-slide-up`, `damage-float`), (4) Built `CombatBackdrop` component for proper fullscreen coverage without gaps, (5) Created `CombatContainer` component with mobile-first responsive layout, (6) Implemented feature flag system - new UI enabled by default, can be disabled with `?legacyCombat=1` URL parameter. **Impact**: Foundation laid for properly architected combat system. Build passing, feature flag switches between old and new implementations in `ChoiceList.tsx`.

### Work in Progress
- **Combat System Rebuild - Phase 2**: Building atomic components for new combat UI architecture. **Atomic Components Complete**: (1) Built `HealthBar` component with accessibility support, player/enemy variants, critical state animations, and proper ARIA attributes, (2) Created `ResourceMeter` for LP/SP display with type-specific styling, glow effects, and screen reader support, (3) Implemented `StatusBadge` for buff/debuff/neutral status effects with duration display and icons, (4) Added `TurnBadge` with player/enemy states, turn counter, animation indicators, and loading dots for enemy turn. **Testing**: All 30 atomic component tests passing with comprehensive coverage of accessibility, edge cases, and visual states. Components follow mobile-first design principles and integrate with Tailwind combat theme.

### Failed Fix Attempts (Abandoned in favor of complete rebuild)
- ~~**Combat Overlay Mobile-First Responsive Design**~~: Multiple attempts to fix "does not deal with resizing well at all" issue failed due to fundamental architecture problems.
- ~~**Combat Overlay Visual Strip Fix**~~: Multiple attempts to fix visual strip at top of overlay failed due to improper backdrop/content separation.
- ~~**Combat Text Visibility**~~: Multiple attempts to fix dark text on dark background with CSS classes partially worked but underlying architecture remained problematic.
- ~~**End Turn Button Placement**~~: Attempted fixes but combat flow issues persisted.

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
