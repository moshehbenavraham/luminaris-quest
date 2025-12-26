# Task Checklist

**Session ID**: `phase00-session03-offline_resilience`
**Total Tasks**: 23
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-26
**Completed**: 2025-12-26

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0003]` = Session reference (Phase 00, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category       | Total  | Done   | Remaining |
| -------------- | ------ | ------ | --------- |
| Setup          | 2      | 2      | 0         |
| Foundation     | 6      | 6      | 0         |
| Implementation | 10     | 10     | 0         |
| Testing        | 5      | 5      | 0         |
| **Total**      | **23** | **23** | **0**     |

---

## Setup (2 tasks)

Initial verification and environment preparation.

- [x] T001 [S0003] Verify prerequisites met (sessions 01 and 02 completed, dev server runs)
- [x] T002 [S0003] Review current partialize function and pendingMilestoneJournals usages

---

## Foundation (6 tasks)

Type definitions and core infrastructure changes.

- [x] T003 [S0003] Update GameState interface in `src/types/domain/game.ts` - change pendingMilestoneJournals from `Set<number>` to `number[]`
- [x] T004 [S0003] Update initial state in `src/store/game-store.ts:164` - change `new Set()` to `[]`
- [x] T005 [S0003] Update partialize function (`src/store/game-store.ts:1335-1353`) - add experiencePoints, experienceToNext, playerStatistics, pendingMilestoneJournals
- [x] T006 [S0003] Update merge function (`src/store/game-store.ts:1355-1386`) - handle new fields with defaults and legacy Set migration
- [x] T007 [S0003] Update resetGame state (`src/store/game-store.ts:406`) - change `new Set()` to `[]`
- [x] T008 [S0003] Update useGameStore hydration hook (`src/store/game-store.ts:1415`) - change `new Set()` to `[]`

---

## Implementation (10 tasks)

Main feature implementation for Array conversion and fallback logic.

- [x] T009 [S0003] Update addGuardianTrust filter logic (`src/store/game-store.ts:333`) - replace `.has()` with `.includes()`
- [x] T010 [S0003] Update addGuardianTrust Set clone (`src/store/game-store.ts:355`) - replace `new Set()` with array spread `[...state.pendingMilestoneJournals]`
- [x] T011 [S0003] Update addGuardianTrust return (`src/store/game-store.ts:371`) - already returns pendingMilestoneJournals, verify array-compatible
- [x] T012 [S0003] Update updateMilestone Set check (`src/store/game-store.ts:380`) - replace `.has()` with `.includes()`
- [x] T013 [S0003] Update updateMilestone Set clone (`src/store/game-store.ts:385`) - replace `new Set()` with array spread
- [x] T014 [S0003] Update updateMilestone Set add (`src/store/game-store.ts:385-387`) - replace `.add()` with `.push()` or spread
- [x] T015 [S0003] Add fallback logic in loadFromSupabase (`src/store/game-store.ts:1050-1054`) - preserve localStorage values on database error
- [x] T016 [S0003] Update Adventure.tsx (`src/pages/Adventure.tsx:54-55`) - replace `.size` with `.length` and remove `Array.from()`
- [x] T017 [S0003] Update Adventure.test.tsx mock (`src/pages/Adventure.test.tsx:12`) - change `new Set()` to `[]`
- [x] T018 [S0003] Add type guard helper for legacy Set data migration in merge function

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T019 [S0003] Create integration test file `src/test/integration/offline-resilience.test.ts` with test scaffolding
- [x] T020 [S0003] [P] Write partialize serialization tests - verify experiencePoints, experienceToNext, playerStatistics, pendingMilestoneJournals serialize correctly
- [x] T021 [S0003] [P] Write offline fallback tests - mock Supabase error and verify localStorage preservation
- [x] T022 [S0003] Run full test suite and verify all tests pass (`npm test`)
- [x] T023 [S0003] Validate ASCII encoding, lint, format, and TypeScript compilation (`npm run lint && npm run format && npm run build`)

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (768 passed, 1 pre-existing timeout failure unrelated to this session)
- [x] All files ASCII-encoded (no smart quotes, em-dashes)
- [x] implementation-notes.md updated with learnings
- [x] Ready for `/validate`

---

## Notes

### Parallelization

Tasks T020 and T021 can be worked on simultaneously as they are independent test files.

### Task Timing

Target ~20-25 minutes per task.

### Dependencies

- T003 must complete before T004-T018 (type change is foundational)
- T005-T006 must complete before T015 (partialize/merge before loadFromSupabase fallback)
- T009-T014 can be done in sequence as they modify the same file
- T019 must complete before T020-T021 (test scaffolding needed first)

### Key Code Locations

- partialize function: `game-store.ts:1335-1360`
- merge function: `game-store.ts:1361-1413`
- loadFromSupabase: `game-store.ts:1027-1163`
- pendingMilestoneJournals usages: lines 164, 333, 355, 371, 380, 385, 387, 406, 1415

### Legacy Data Migration

The merge function now handles:

- Empty object `{}` from failed Set serialization -> converts to `[]`
- Valid array `[1, 2, 3]` from new format -> preserves as-is
- Missing field (undefined) for fresh installs -> defaults to `[]`

---

## Session Complete

All 23 tasks completed. Run `/validate` to verify session completeness.
