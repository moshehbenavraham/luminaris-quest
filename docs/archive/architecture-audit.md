# Architectural Audit: Luminaris Quest

**Date:** 2025-12-02
**Stack:** React 19, Zustand, Supabase, OpenAI, Radix UI, Tailwind CSS
**Auditor:** Senior Frontend Architecture Review

---

## Executive Summary

The codebase has strong foundations - clean atomic design in the combat feature, pure business logic in `/src/engine/`, and comprehensive error handling. The highest-leverage architectural fixes below are now complete; remaining work is optional polish.

### Key Metrics

| Category                  | Status | Notes                                                                      |
| ------------------------- | ------ | -------------------------------------------------------------------------- |
| State Management          | Good   | Shared `usePlayerResources` eliminates resource duplication between stores |
| API/Data Layer            | Good   | Centralized (Zustand + Supabase); no unused query layer                    |
| Component Organization    | Good   | Some misclassifications                                                    |
| Type Hygiene              | Good   | Domain types centralized under `src/types/` (store/UI decoupled)           |
| Business Logic Separation | Good   | Combat store delegates to engine (engine is canonical)                     |

---

## Top 5 Highest-Leverage Changes

### 1. Resource State Duplication (HIGH PRIORITY) — **DONE**

**Files:**

- `src/store/slices/player-resources.ts`
- `src/store/game-store.ts`
- `src/features/combat/store/combat-store.ts`
- `src/features/combat/components/resolution/CombatEndModal.tsx`

**Fix implemented (2025-12-02):**

- Introduced a shared `usePlayerResources` store (health/energy/LP/SP) as the **single source of truth**
- Integrated both game + combat stores to read/write resources via the shared store
- Removed the legacy combat-store sync validation/transaction code (and related UI workarounds)
- Updated tests to reset the shared store between runs

**Impact:**

- Eliminated resource duplication and the entire class of “stores drift out of sync” bugs
- Reduced combat store complexity and simplified combat end flows (resources sync automatically)

---

### 2. Combat Store Ignores Engine (HIGH PRIORITY) — **DONE**

**Files:**

- `src/engine/combat-engine.ts`
- `src/features/combat/store/combat-store.ts`
- `src/engine/combat-balance.ts`
- `src/test/integration/shadow-health-damage.test.ts`
- `src/test/integration/combat-playtesting.test.ts`

**What was wrong (code truth):**

- The engine existed, but it was effectively **legacy-only** (typed around the old `src/store/game-store.ts` combat state shape) and wasn’t used by the new combat store/UI.
- The new `combat-store.ts` duplicated core combat formulas inline (ILLUMINATE damage + enemy turn damage/defense), risking drift.

**Fix implemented (2025-12-16):**

- Refactored `src/engine/combat-engine.ts` to be the canonical source of truth for the **current new combat system**:\n - Added `CombatEngineState` aligned to the new store shape\n - Added pure helpers: `canPerformAction()`, `executePlayerAction()`, `executeEnemyTurn()`, `getActionCost()`, `getActionDescription()`, `checkCombatEnd()`\n- Updated `src/features/combat/store/combat-store.ts` to delegate:\n - `executeAction` → `executePlayerAction`\n - `_executeEnemyTurn` → `executeEnemyTurn`\n - selectors (`selectCanUseAction`, `selectActionCost`, `selectActionDescription`) → engine helpers\n- Store remains responsible for side-effects: sound playback, timer scheduling, persistence, and syncing to `usePlayerResources`.

**Impact:**

- Single source of truth for combat math + UI-facing action metadata.
- Eliminates formula drift risk and reduces maintenance overhead.
- Tests updated/added; `npm test` passes: **725 passing**, **34 skipped**.

---

### 3. ChoiceList Orchestration Lives in a Hook (MEDIUM-HIGH) — **DONE**

**Files:**

- `src/hooks/useSceneChoices.ts`
- `src/components/organisms/ChoiceList.tsx`
- `src/hooks/useSceneChoices.test.ts`

**What was wrong (code truth):**

- `ChoiceList.tsx` mixed UI rendering with most scene-flow orchestration (dice, energy gating, store mutations, combat start), making it hard to test and maintain.

**Fix implemented (2025-12-16):**

- Extracted orchestration into `useSceneChoices` (`src/hooks/useSceneChoices.ts`)
- Slimmed `ChoiceList.tsx` from ~458 → **227 lines** (now under the 250-line guideline)
- Added unit tests for the hook (`src/hooks/useSceneChoices.test.ts`)
- Correctness tweak: combat start now snapshots values from `usePlayerResources` before calling `startCombat`, preventing stale props from overwriting recent energy/resource mutations.

**Impact:**

- Scene orchestration is reusable + unit-testable; `ChoiceList` is now primarily UI.

---

### 4. Domain Types Centralized in `src/types` (MEDIUM) — **DONE**

**Files:**

- `src/types/domain/*` + `src/types/index.ts`
- `src/store/game-store.ts`
- `src/components/molecules/JournalModal.tsx`
- (repo-wide import updates)

**What was wrong (code truth):**

- Domain types lived in `src/store/game-store.ts` (mixed with implementation), and `JournalEntry` lived in a UI component (`JournalModal.tsx`), creating a store→UI type dependency and awkward imports.

**Fix implemented (2025-12-16):**

- Added `src/types/domain/` modules: `save.ts`, `progression.ts`, `combat.ts`, `game.ts`, `journal.ts`, with barrel exports via `src/types/index.ts`
- Removed the exported type block from `src/store/game-store.ts`; store now imports types from `@/types`
- Moved `JournalEntry` out of `JournalModal.tsx` into `src/types/domain/journal.ts` and updated imports across the codebase

**Impact:**

- No store→UI type imports
- Domain types are importable without pulling store implementation

---

### 5. TanStack Query Removed (LOW-MEDIUM) — **DONE**

**Files:**

- `src/App.tsx`
- `vite.config.ts`
- `package.json` / `package-lock.json`
- `docs/licenses/third-party.md`

**Fix implemented (2025-12-16):**

- Removed the `QueryProvider` wrapper from `src/App.tsx`
- Deleted `src/lib/providers/query-provider.tsx`
- Uninstalled `@tanstack/react-query`
- Removed `@tanstack/react-query` from Vite manual chunking (`vite.config.ts`)
- Updated third-party notices (`docs/licenses/third-party.md`)

**Impact:**

- Removed unused dependency + provider indirection
- Reduced bundle size and eliminated “configured but unused” confusion

---

## Additional Findings (Not Priority)

These issues exist but don't warrant immediate action:

### Large Combat Modals

**Files:**

- `src/features/combat/components/resolution/CombatReflectionModal.tsx` (529 lines)
- `src/features/combat/components/resolution/CombatEndModal.tsx` (419 lines)

**Status:** Over the 250-line limit (500 for combat), but:

- Contained within feature boundary
- Not causing integration issues
- Would split into smaller modals but low ROI

### Test File `any` Types

**Status:** 17+ test files use `any` for mocking with proper eslint-disable comments:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */
```

This is acceptable for test utilities.

### Hydration Wrapper Inconsistency

**Files:**

- `src/store/game-store.ts` - Has `useGameStore()` wrapper with mount check
- `src/features/combat/store/combat-store.ts` - No wrapper, uses store directly

**Status:** Both work correctly, just inconsistent patterns. Could standardize but low priority.

### Settings Store Missing Retry Logic

**File:** `src/store/settings-store.ts`

Game store has comprehensive retry logic with exponential backoff; settings store doesn't. However, settings are low-traffic and non-critical, so this is acceptable.

### Orphaned Combat State in Game Store

**File:** `src/store/game-store.ts:202-224`

```typescript
export interface CombatState {
  isInCombat: boolean;
  currentEnemy: ShadowManifestation | null;
  combatLog: CombatLogEntry[];
  // ... more fields
}
```

This interface exists but is largely unused since the new combat store was created. Consider removing it during **Phase 4 (types cleanup)** once no imports depend on it.

---

## Summary Matrix

| Issue                     | Pain Level | Fix Complexity | Lines Affected | Priority | Status   |
| ------------------------- | ---------- | -------------- | -------------- | -------- | -------- |
| Resource duplication      | High       | Medium         | ~200           | **1st**  | **DONE** |
| Store ignores engine      | High       | Low            | ~150           | **2nd**  | **DONE** |
| ChoiceList classification | Medium     | Medium         | ~535           | **3rd**  | **DONE** |
| Scattered domain types    | Medium     | Low            | ~600           | **4th**  | **DONE** |
| TanStack Query unused     | Low        | Trivial        | ~120           | **5th**  | **DONE** |

---

## Remaining Implementation Sequence

All planned phases are complete.

---

## Implementation Progress

### Phase 1: Foundation - COMPLETE

**Completed:**

- [x] Created `src/store/slices/player-resources.ts` - Shared resource store
- [x] Created `src/store/slices/index.ts` - Barrel export
- [x] Integrated shared store into `game-store.ts`:
  - Updated all resource mutations to delegate to shared store
  - Updated `resetGame` to reset shared store
  - Updated `endCombat` to sync via shared store
  - Updated `regenerateEnergy` to use shared store
  - Updated `saveToSupabase` to get resources from shared store
  - Updated `loadFromSupabase` to populate shared store
  - Updated `useGameStore` hook to include shared store values
  - Updated `modifyExperiencePoints` to sync level-up benefits to shared store
- [x] Integrated shared store into `combat-store.ts`:
  - Updated `startCombat` to read from shared store
  - Updated `endCombat` to sync resources back to shared store
- [x] TypeScript compiles without errors
- [x] Updated combat-store tests to reset shared store between tests
- [x] All tests passing (as of 2025-12-16: 725 passing, 34 skipped)

**Skipped Tests (async timing issues with dynamic import in setTimeout):**

- `combat-store.test.ts`: 4 tests skipped - enemy turn callback with dynamic import doesn't resolve properly with fake timers
  - "handles end turn correctly"
  - "ends combat when player is defeated"
  - "uses different enemy actions based on HP"
  - "maintains combat log chronologically"
- `combat-focus-management.test.tsx`: Suite skipped - JSDOM doesn't properly simulate focus behavior

**Sync Validation Cleanup (Completed 2025-12-02):**

- [x] Removed legacy sync validation code from `combat-store.ts` (~200 lines removed):
  - Removed `SyncValidation` interface
  - Removed `SyncTransaction` interface
  - Removed `SyncTransactionResult` interface
  - Removed `generateSyncChecksum()` function
  - Removed `validateSyncChecksum()` function
  - Removed `createSyncTransaction()` function
  - Removed `validateSyncTransaction()` function
  - Removed all sync transaction actions from store
  - Removed sync state fields from `CombatState` interface
  - Removed sync state from `initialState`
- [x] Simplified `CombatEndModal.tsx`:
  - Removed transaction-based sync logic (~80 lines)
  - Resources now sync via shared store automatically
  - Kept XP rewards, combat statistics, and victory bonus logic
- [x] Updated `combat/index.ts` - removed sync type/function exports
- [x] Updated `ChoiceList.tsx` - removed `syncChecksum` from combat start

**Test Status:**

- 725 tests passing (as of 2025-12-16)
- 34 tests skipped (async timing issues with setTimeout + dynamic import)

**Phase 1: FULLY COMPLETE** - Resource duplication eliminated, sync code removed

---

### Phase 2: Combat Reliability - COMPLETE

**Completed (2025-12-16):**

- [x] Refactored `src/engine/combat-engine.ts` to match the new combat system state shape and become the canonical source of truth
- [x] Updated `src/features/combat/store/combat-store.ts` to delegate player action + enemy turn math to the engine (store keeps sounds/timers/persist/resource sync)
- [x] Updated `src/engine/combat-balance.ts` + tests to reflect the new level-based ILLUMINATE damage model
- [x] Updated integration tests (`shadow-health-damage`, `combat-playtesting`) to the new engine API/state shape
- [x] `npm test` passes (725 passing, 34 skipped)

---

### Phase 3: Testability - COMPLETE

**Completed (2025-12-16):**

- [x] Extracted scene-flow orchestration into `src/hooks/useSceneChoices.ts`
- [x] Refactored `src/components/organisms/ChoiceList.tsx` into a thin UI component (**227 lines**)
- [x] Added unit test coverage: `src/hooks/useSceneChoices.test.ts`
- [x] Ensured combat start uses a fresh `usePlayerResources` snapshot to avoid overwriting recent energy/resource mutations
- [x] `npm test` passes (725 passing, 34 skipped)

---

### Phase 4: Ongoing Cleanup - COMPLETE

**Completed (2025-12-16):**

- [x] Created `src/types/domain/*` + `src/types/index.ts` as the canonical domain-type export surface
- [x] Migrated all game-store exported types into `src/types`
- [x] Moved `JournalEntry` out of `JournalModal.tsx` and updated imports repo-wide
- [x] `npm test` passes (725 passing, 34 skipped)

---

### Phase 5: Dependency Cleanup - COMPLETE

**Completed (2025-12-16):**

- [x] Removed `@tanstack/react-query` and deleted the unused `QueryProvider`
- [x] Updated Vite chunking and third-party notices
- [x] `npm test` passes (725 passing, 34 skipped)

---

## Validation Checklist

- [x] Bundle size reduced (TanStack Query removal - Phase 5)
- [x] ChoiceList hook has unit test coverage (Phase 3)
- [x] Type imports don't pull in store implementations (Phase 4)

---

## References

**Key Files for Context:**

- `src/store/game-store.ts` - Main state management
- `src/store/slices/player-resources.ts` - Shared resource store (single source of truth)
- `src/features/combat/store/combat-store.ts` - Combat state (new system)
- `src/features/combat/components/resolution/CombatEndModal.tsx` - Combat resolution UI
- `src/engine/combat-engine.ts` - Combat rules (canonical)
- `src/engine/scene-engine.ts` - Scene progression logic
- `src/types/index.ts` - Domain type exports (source of truth)
- `src/hooks/useSceneChoices.ts` - Scene/choice orchestration hook (308 lines)
- `src/components/organisms/ChoiceList.tsx` - Choice UI (227 lines)

**Documentation:**

- `CLAUDE.md` - Project standards and patterns
- `docs/archive/COMBAT_MIGRATION_GUIDE.md` - Combat system history

---

_Last Updated: 2025-12-16 (Phase 5 Complete - TanStack Query removed)_
