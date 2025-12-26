# Task Checklist

**Session ID**: `phase00-session04-combat_history`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-26

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0004]` = Session reference (Phase 00, Session 04)
- `TNNN` = Task ID

---

## Progress Summary

| Category       | Total  | Done   | Remaining |
| -------------- | ------ | ------ | --------- |
| Setup          | 3      | 3      | 0         |
| Foundation     | 5      | 5      | 0         |
| Implementation | 8      | 8      | 0         |
| Testing        | 6      | 6      | 0         |
| **Total**      | **22** | **22** | **0**     |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0004] Verify prerequisites: Confirm sessions 01-03 completed and types.ts has combat_history schema
- [x] T002 [S0004] Review combat-store.ts current structure and identify insertion points
- [x] T003 [S0004] Verify Supabase RLS policy allows INSERT on combat_history for authenticated users

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0004] [P] Define ResourcesSnapshot interface for resources_start/resources_end (`src/features/combat/utils/save-combat-history.ts`)
- [x] T005 [S0004] [P] Define ActionCounts type alias for actions tracking (using existing preferredActions)
- [x] T006 [S0004] Add resourcesAtStart state field to CombatState interface (`src/features/combat/store/combat-store.ts`)
- [x] T007 [S0004] Add actionCounts state field to CombatState interface (using existing preferredActions - no duplicate needed)
- [x] T008 [S0004] Add lastCombatHistoryId state field for future journal linking (`src/features/combat/store/combat-store.ts`)

---

## Implementation (8 tasks)

Main feature implementation.

- [x] T009 [S0004] Update initialState to include resourcesAtStart, actionCounts, lastCombatHistoryId (`src/features/combat/store/combat-store.ts`)
- [x] T010 [S0004] Update partialize config to exclude ephemeral combat history fields (`src/features/combat/store/combat-store.ts`)
- [x] T011 [S0004] Capture resourcesAtStart in startCombat() action (`src/features/combat/store/combat-store.ts`)
- [x] T012 [S0004] Initialize actionCounts in startCombat() action (reset preferredActions to zero)
- [x] T013 [S0004] Increment actionCounts in executeAction() (handled by combat-engine via preferredActions)
- [x] T014 [S0004] Implement saveCombatHistory() async function with Supabase insert (`src/features/combat/utils/save-combat-history.ts`)
- [x] T015 [S0004] Add error handling and auth check to saveCombatHistory() (`src/features/combat/utils/save-combat-history.ts`)
- [x] T016 [S0004] Call saveCombatHistory() at start of endCombat() before state reset (`src/features/combat/store/combat-store.ts`)

---

## Testing (6 tasks)

Verification and quality assurance.

- [x] T017 [S0004] Create test file with setup/mocking for Supabase and game-store (`src/features/combat/store/combat-store.test.ts`)
- [x] T018 [S0004] [P] Write integration test: Victory combat creates history record with correct fields (`src/features/combat/store/combat-store.test.ts`)
- [x] T019 [S0004] [P] Write integration test: Defeat combat creates history record (`src/features/combat/store/combat-store.test.ts`)
- [x] T020 [S0004] [P] Write integration test: resources_start matches initial values, resources_end matches final (`src/features/combat/store/combat-store.test.ts`)
- [x] T021 [S0004] [P] Write integration test: actions_used counts are accurate after multiple actions (`src/features/combat/store/combat-store.test.ts`)
- [x] T022 [S0004] Run full test suite, lint, and TypeScript build validation (`npm test && npm run lint && npm run build`)

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (`npm test`) - 780 passed, 34 skipped
- [x] All files ASCII-encoded (no unicode characters)
- [x] Unix LF line endings
- [x] TypeScript compiles with zero errors (`npm run build`)
- [x] ESLint passes with zero warnings (`npm run lint`)
- [x] Combat store stays under 500 lines (496 lines)
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization

Tasks marked `[P]` can be worked on simultaneously. Foundation types (T004, T005) are parallelizable. Integration tests (T018-T021) are parallelizable after test setup (T017) is complete.

### Task Timing

Target ~20-25 minutes per task.

### Dependencies

- T006-T008 depend on T004-T005 (type definitions)
- T009-T016 depend on T006-T008 (state fields)
- T017 must complete before T018-T021 (test setup)
- T022 depends on all previous tasks

### Key Implementation Details

1. **resourcesAtStart** captures LP, SP, energy, and health at combat start
2. **actionCounts** tracks frequency of each action type (ILLUMINATE, REFLECT, ENDURE, EMBRACE)
3. **saveCombatHistory()** is async but non-blocking - errors are logged, not thrown
4. **Cross-store access**: Use `useGameStore.getState().currentSceneIndex` for scene_index
5. **Combat log limit**: Use `.slice(-50)` to limit to last 50 entries
6. **No auth guard blocking**: If no user, log warning and skip save

### Existing State to Leverage

The combat-store already has:

- `preferredActions: Record<CombatAction, number>` - We can use this for actions_used
- `resources`, `playerHealth`, `playerEnergy` - For resources tracking
- `enemy`, `turn`, `combatEndStatus` - For history record fields
- `log: CombatLogEntry[]` - For combat_log field

---

## Next Steps

Run `/implement` to begin AI-led implementation.
