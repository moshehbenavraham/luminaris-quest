# Task Checklist

**Session ID**: `phase00-session02-critical_persistence`
**Total Tasks**: 18
**Estimated Duration**: 4-6 hours
**Created**: 2025-12-25

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0002]` = Session reference (Phase 00, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category       | Total  | Done   | Remaining |
| -------------- | ------ | ------ | --------- |
| Setup          | 3      | 3      | 0         |
| Foundation     | 3      | 3      | 0         |
| Implementation | 6      | 6      | 0         |
| Testing        | 6      | 6      | 0         |
| **Total**      | **18** | **18** | **0**     |

---

## Setup (3 tasks)

Initial verification and preparation.

- [x] T001 [S0002] Verify `max_player_health` column exists in database schema
- [x] T002 [S0002] Verify Supabase types include `max_player_health` field in `game_states` type
- [x] T003 [S0002] Run TypeScript build to confirm current state compiles without errors (`npm run build`)

---

## Foundation (3 tasks)

Analyze existing code and identify exact change locations.

- [x] T004 [S0002] Identify `as any` type cast on line 841 in saveToSupabase (`src/store/game-store.ts`)
- [x] T005 [S0002] Identify `as any` type casts on lines 1092-1097 in loadFromSupabase (`src/store/game-store.ts`)
- [x] T006 [S0002] Identify `as any` type casts on lines 1109-1112 in loadFromSupabase (`src/store/game-store.ts`)

---

## Implementation (6 tasks)

Core persistence fixes and type safety improvements.

- [x] T007 [S0002] Add `max_player_health: resourceSnapshot.maxPlayerHealth` to save payload after line 853 (`src/store/game-store.ts`)
- [x] T008 [S0002] Add `maxPlayerHealth` to `setAllResources()` call on lines 1091-1098 with null coalescing fallback (`src/store/game-store.ts`)
- [x] T009 [S0002] Remove `any` type from `const gameState: any` on line 841, let TypeScript infer type (`src/store/game-store.ts`)
- [x] T010 [S0002] [P] Remove `(gameState as any)` casts on lines 1092-1097 for resource fields (`src/store/game-store.ts`)
- [x] T011 [S0002] [P] Remove `(gameState as any)` casts on lines 1109-1112 for experience/statistics fields (`src/store/game-store.ts`)
- [x] T012 [S0002] Verify TypeScript compiles with zero errors after all changes (`npm run build`)

---

## Testing (6 tasks)

Verification and quality assurance.

- [x] T013 [S0002] Create test file `src/test/integration/max-player-health-persistence.test.ts` with mock setup
- [x] T014 [S0002] Add test: `saveToSupabase()` includes `max_player_health` in upsert payload
- [x] T015 [S0002] Add test: `loadFromSupabase()` restores `maxPlayerHealth` via `setAllResources()`
- [x] T016 [S0002] Add test: null `max_player_health` from DB falls back to current value (100 default)
- [x] T017 [S0002] Run existing `energy-persistence.test.ts` to verify no regressions (`npm test -- energy-persistence`)
- [x] T018 [S0002] Run full test suite and lint to verify all quality gates pass (`npm test && npm run lint`)

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization

Tasks T010 and T011 can be worked on simultaneously as they modify different code sections.

### Task Timing

Target ~20-25 minutes per task.

### Dependencies

- T007-T012 must complete before T013-T018 (implementation before testing)
- T009 should complete before T010-T011 (main type fix enables other fixes)

### Key File Locations

- **Save logic**: `src/store/game-store.ts:841-860`
- **Load logic**: `src/store/game-store.ts:1088-1113`
- **Test template**: `src/test/integration/energy-persistence.test.ts`

### ASCII Reminder

All output files must use ASCII-only characters (0-127). Avoid unicode quotes, dashes, or special characters.

---

## Next Steps

Run `/implement` to begin AI-led implementation.
