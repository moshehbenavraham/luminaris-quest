# Infrastructure & Architecture Audit

## Goal

Ensure the foundation is stable, up-to-date, and secure.

## 1. Dependency Health & Configuration

**Status: HEALTHY**

- **Dependencies:** Project is running on bleeding-edge dependencies:
  - React: `19.2.0`
  - Vite: `7.2.2`
  - Tailwind CSS: `4.1.17`
  - TypeScript: `5.9.3`
- **Vite Configuration:** `vite.config.ts` is properly configured with:
  - Explicit manual chunks to manage bundle size.
  - Warning limits adjusted for large bundles.
  - Plugins for React and TS path resolution.
- **TypeScript Config:** `tsconfig.app.json` is set to `"strict": true`, which is the gold standard. However, the _adherence_ to this strictness is failing (see Section 2).
- **Environment Variables:** `src/integrations/supabase/client.ts` correctly uses `import.meta.env` and implements robust environment detection (local/dev/staging/prod).

## 2. Linting & Code Quality

**Status: PASSING (with justified suppressions)**

- **Lint Check:** Passing. `npm run lint` exits with code 0.
- **Warning Count:** Within the 250 warning limit.
- **Suppression Strategy:** The codebase uses `eslint-disable` comments with justifications for legitimate patterns:

### Justified Suppressions (Reviewed 2025-12-02):

1.  **`react-hooks/set-state-in-effect`** - Used in components that require state updates to trigger re-renders after effects:
    - `src/store/game-store.ts` - SSR hydration pattern
    - `src/store/settings-store.ts` - SSR hydration pattern
    - `src/components/GuardianText.tsx` - "Show once" pattern that needs re-render to hide intro
    - `src/pages/Adventure.tsx` - SSR hydration and milestone sync
    - `src/components/combat/DamageIndicator.tsx` - Deprecated file (OLD combat system)

2.  **`@typescript-eslint/no-explicit-any`** - Used where type flexibility is required:
    - Test files (`*.test.ts`, `*.test.tsx`) - Mock functions require `any`
    - Database utilities - Supabase JSONB fields and RPC responses
    - Store files - Complex state management with external data
    - Performance monitoring - Analytics data structures

3.  **`react-refresh/only-export-components`** - shadcn/ui pattern:
    - UI components export variant functions alongside components
    - This is the standard shadcn/ui pattern and works correctly

### Cleaned Up Issues (2025-12-02):

1.  **Removed "TEMPORARILY COMMENTED OUT FOR BUILD" comments** from:
    - `src/store/game-store.ts` - Cleaned up unused imports and comments
    - `src/lib/database-health.ts` - Removed commented import
    - `src/components/ErrorBoundary.tsx` - Fixed unused parameter

2.  **Improved `eslint-disable` justifications** - All suppressions now have clear comments explaining why they're needed.

3.  **Simplified JournalModal.tsx** - Removed redundant `isVisible` state that was duplicating `isOpen` prop.

## 3. Architecture & Technical Debt

**Status: NEEDS ATTENTION**

- **Dual Combat Systems:** The project explicitly maintains two combat systems:
  - **Legacy:** `src/store/game-store.ts` (Contains deprecated combat logic).
  - **New:** `src/features/combat/store/combat-store.ts` (Active development).
  - _Risk:_ `game-store.ts` is bloated (1900+ lines) and contains mixed responsibilities.
- **State Management:**
  - `game-store.ts` is extremely large and acts as a "God Object".
  - Hydration safety patterns (`_hasHydrated`) are implemented correctly.

## Recommendations (Prioritized)

### Completed (2025-12-02):

1.  Cleaned up "TEMPORARILY COMMENTED OUT" code blocks
2.  Improved all `eslint-disable` comment justifications
3.  Simplified JournalModal.tsx by removing redundant state
4.  Lint now passes cleanly within warning limits

### Remaining Work:

1.  **Reduce `game-store.ts` size:** Consider extracting the deprecated combat logic to a separate `legacy-combat-store.ts` to reduce noise in the main store.
2.  **Gradually type `any` usages:** Where feasible, replace `any` with proper interfaces, especially in non-test files.
3.  **Document the dual combat system:** Ensure the migration guide is up to date and clearly marks which system to use.

## Workspace

**Last Updated:** 2025-12-02
**Audit Status:** PASSING
