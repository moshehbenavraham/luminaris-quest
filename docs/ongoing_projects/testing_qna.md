# Testing & Quality Assurance Audit

**Goal:** Validate that the safety net actually catches bugs.

## Current Status Summary (2025-12-02)

| Area  | Status                | Notes                                         |
| ----- | --------------------- | --------------------------------------------- |
| Lint  | PASSING               | 0 errors, within 250 warning limit            |
| Build | PASSING               | TypeScript compiles, Vite builds successfully |
| Tests | 1069 PASSED, 7 FAILED | Pre-existing failures in CombatEndModal tests |

## 1. Test Coverage & Gaps

### Critical Paths Missing Coverage

1.  **Game Store Persistence (`src/store/game-store.ts`) - CRITICAL**
    - **Finding:** There is no `src/store/game-store.test.ts`.
    - **Impact:** The `saveToSupabase` method (lines 1239-1480) is complex, involving Supabase calls, error handling, retries, and data mapping. This is a **Single Point of Failure** for user progress.
    - **Recommendation:** Create `src/store/game-store.test.ts` focusing on `saveToSupabase`, `loadFromSupabase`, and error handling logic.

2.  **Combat Store Turn Management (`src/features/combat/store/combat-store.test.ts`) - CRITICAL**
    - **Finding:** Critical tests for turn flow are skipped: `it.skip('handles end turn correctly', ...)` and `it.skip('ends combat when player is defeated', ...)`.
    - **Reason:** Comments cite "complex async setTimeout with dynamic imports".
    - **Impact:** The core combat loop (Player Action -> End Turn -> Enemy Action -> Next Turn) is effectively untested in the store.

3.  **Combat Resolution Integration (`src/test/integration/combat-resolution-flow.test.tsx`) - CRITICAL**
    - **Finding:** The entire file is skipped (`describe.skip`).
    - **Reason:** Comments state tests were based on "failed assumptions" and represent "wasted effort".
    - **Impact:** There is no functioning integration test for the full combat resolution flow (Victory/Defeat screens).

4.  **CombatEndModal Tests (`src/features/combat/components/resolution/CombatEndModal.test.tsx`) - FAILING**
    - **Finding:** 7 tests failing with `updateCombatStatistics` call errors.
    - **Root Cause:** Tests mock `useGameStore` but the mock doesn't include `updateCombatStatistics` function.
    - **Impact:** Combat end flow and reflection button tests are broken.

## 2. React 19 Testing Patterns

### Compliance Status: PARTIAL

- **Helpers Available:** `src/test/utils.tsx` correctly provides `advanceTimersAndAct` and `actWait` for React 19.
- **Usage Issues:**
  - `src/hooks/use-auto-save.test.ts`: Uses `vi.advanceTimersByTime` inside `act`. While technically working, it should be refactored to use `advanceTimersAndAct` for consistency.
  - `src/features/combat/store/combat-store.test.ts`: Skipped tests mention "Objects are not valid as a React child", indicating a React 19 incompatibility in how the hook/store is being mocked or rendered in the test environment.

## 3. Integration Testing Audit

### "Cross-System" Tests

1.  **Scene Engine <-> Game Store (`src/test/integration/experience-points-system.test.ts`) - PASS**
    - **Finding:** Correctly tests the interaction between scene outcomes (`handleSceneOutcome`) and store updates (`modifyExperiencePoints`).
    - **Quality:** Good coverage of edge cases (negative XP, large values).

2.  **Combat System <-> Game Store - FAIL**
    - **Finding:** Due to skipped tests in `combat-resolution-flow.test.tsx` and `combat-store.test.ts`, the integration between the new combat system and the main game store (for syncing resources back after combat) is not reliably tested.

## 4. Infrastructure Audit Integration (2025-12-02)

### Completed Fixes

1.  **Cleaned up technical debt** - Removed all "TEMPORARILY COMMENTED OUT FOR BUILD" code blocks from:
    - `src/store/game-store.ts`
    - `src/lib/database-health.ts`
    - `src/components/ErrorBoundary.tsx`

2.  **Simplified JournalModal.tsx** - Removed redundant `isVisible` state, eliminating one `set-state-in-effect` warning source.

3.  **Improved code documentation** - All `eslint-disable` comments now have clear justifications.

### Justified ESLint Suppressions (Reviewed)

| Rule                                   | Files                            | Justification                          |
| -------------------------------------- | -------------------------------- | -------------------------------------- |
| `react-hooks/set-state-in-effect`      | game-store.ts, settings-store.ts | SSR hydration pattern                  |
| `react-hooks/set-state-in-effect`      | GuardianText.tsx                 | "Show once" pattern requires re-render |
| `@typescript-eslint/no-explicit-any`   | _.test.ts, _.test.tsx            | Mock functions require flexible types  |
| `@typescript-eslint/no-explicit-any`   | Database utilities               | Supabase JSONB fields                  |
| `react-refresh/only-export-components` | UI components                    | Standard shadcn/ui pattern             |

## 5. Action Plan (Prioritized)

### Immediate (Blocking)

1.  **Fix CombatEndModal Tests** - Add missing `updateCombatStatistics` to the mock:

    ```typescript
    updateCombatStatistics: vi.fn(),
    ```

2.  **Unskip Combat Store Tests** - Fix `src/features/combat/store/combat-store.test.ts` by properly mocking dynamic imports.

### Short-term

3.  **Create Game Store Tests** - Implement `src/store/game-store.test.ts` specifically targeting:
    - `saveToSupabase` with success/failure scenarios
    - `loadFromSupabase` with data transformation
    - Error classification and retry logic

4.  **Refactor Auto-Save Tests** - Update `use-auto-save.test.ts` to use `advanceTimersAndAct`.

### Medium-term

5.  **Revive Integration Tests** - Rewrite `combat-resolution-flow.test.tsx` based on actual component behavior.

6.  **Reduce game-store.ts Size** - Extract deprecated combat logic to `legacy-combat-store.ts` (1900+ lines is too large).

7.  **Gradually Type `any` Usages** - Replace `any` with proper interfaces in non-test files where feasible.

## 6. Test Execution Commands

```bash
# Run all tests
npm test -- --run

# Run specific test file
npm test -- --run src/features/combat/store/combat-store.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

---

_Last Updated: 2025-12-02_
_Audit Status: Infrastructure PASSING, Tests PARTIAL (7 failures)_
