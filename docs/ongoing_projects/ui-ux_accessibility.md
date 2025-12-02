# UI/UX & Accessibility (A11y) Audit Report

**Date:** December 2, 2025
**Auditor:** Senior Dev Engineer (AI)
**Status:** 🟡 Partial Compliance (Action Required)

## 1. Atomic Design Consistency

**Status:** 🟡 Needs Improvement

### Findings

- **Missing Directory:** The `src/components/molecules` directory is missing, despite being a standard Atomic Design folder.
- **Uncategorized Components:** A significant number of "loose" components exist in `src/components/` that should be categorized as atoms, molecules, or organisms:
  - `ChoiceList.tsx`
  - `DiceRollOverlay.tsx`
  - `GuardianText.tsx`
  - `HealthStatus.tsx`
  - `JournalEntryCard.tsx`
  - `JournalModal.tsx`
  - `SaveStatusIndicator.tsx`
  - `StatsBar.tsx`
- **Good Practices:**
  - Component sizes are well-managed (<250 lines generally).
  - `src/features/combat` (New System) uses a logical, feature-based structure (`actions`, `display`, `feedback`, `resolution`) which is superior to strict atomic design for complex features.

### Recommendations

1.  **Create `src/components/molecules`**.
2.  **Refactor:** Move loose components to their appropriate categories (e.g., `StatsBar` -> `organisms`, `GuardianText` -> `atoms` or `molecules`).

## 2. Tailwind 4 Migration

**Status:** 🟢 Ready (Minor Cleanup)

### Findings

- **Version:** Project is correctly using Tailwind CSS v4 (`^4.1.17`).
- **Deprecated Utilities:**
  - Found **21 instances** of `flex-shrink-0`. In Tailwind 4, this should be updated to `shrink-0`.
  - No instances of deprecated opacity utilities (e.g., `bg-opacity-*`, `text-opacity-*`) were found; the project correctly uses the alpha modifier syntax (e.g., `text-black/50`).

### Recommendations

1.  **Global Search & Replace:** Replace all instances of `flex-shrink-0` with `shrink-0`.

## 3. Accessibility (WCAG 2.1 AA)

**Status:** 🟢 Strong Foundation (Verification Gap)

### Findings

- **ARIA & Roles:**
  - Excellent usage in key components:
    - `CombatContainer`: `role="dialog"`, `aria-modal="true"`, `aria-label`.
    - `TherapeuticInsight`: `role="dialog"`, `aria-live="polite"`.
    - `StatsBar`: `role="progressbar"`, `aria-valuenow`.
    - `ImpactfulImage`: `role="img"`, robust fallback handling with `aria-describedby`.
- **Focus Management:**
  - `CombatContainer` implements a focus trap logic, which is critical for modal accessibility.
- **Testing Gap:**
  - `jest-axe` is installed (`^10.0.0`) but **not used** in checked test files (`DiceRollOverlay.test.tsx`, `StatsBar.test.tsx`). Accessibility is implemented but not automatedly verified.

### Recommendations

1.  **Integrate `jest-axe`:** Add automated a11y checks to component tests (e.g., `expect(await axe(container)).toHaveNoViolations()`).

## 4. Responsive Behavior

**Status:** 🟢 Excellent

### Findings

- **Mobile-First Architecture:**
  - `CombatOverlay` correctly implements mobile-first design:
    - Default layout is mobile (flex column).
    - `lg:` utility classes used for desktop overrides (grid layout).
- **Images:**
  - `ImpactfulImage` component properly handles responsive sizing with `sizes` attribute and object-fit utilities.

## Action Plan (Next Session)

1.  **[Refactor]** Move loose components in `src/components` to `atoms`/`molecules`/`organisms`.
2.  **[Fix]** Replace `flex-shrink-0` with `shrink-0` globally.
3.  **[Test]** Add `jest-axe` tests to `StatsBar.test.tsx` and `DiceRollOverlay.test.tsx` as a pilot.
