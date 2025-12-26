# Task Checklist

**Session ID**: `phase00-session05-user_settings`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-26

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0005]` = Session reference (Phase 00, Session 05)
- `TNNN` = Task ID

---

## Progress Summary

| Category       | Total  | Done   | Remaining |
| -------------- | ------ | ------ | --------- |
| Setup          | 3      | 3      | 0         |
| Foundation     | 6      | 6      | 0         |
| Implementation | 8      | 8      | 0         |
| Testing        | 5      | 5      | 0         |
| **Total**      | **22** | **22** | **0**     |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0005] Verify prerequisites met - all existing tests pass (`npm test`)
- [x] T002 [S0005] Verify TypeScript compilation clean (`npm run build`)
- [x] T003 [S0005] Review existing patterns in settings-store.ts and combat-store.ts

---

## Foundation (6 tasks)

Core structures and type definitions.

- [x] T004 [S0005] Add `audioTrackIndex: number` to settings-store.ts state interface (`src/store/settings-store.ts`)
- [x] T005 [S0005] Add `setAudioTrackIndex` action signature to SettingsState interface (`src/store/settings-store.ts`)
- [x] T006 [S0005] Add default value `audioTrackIndex: 0` to initial state (`src/store/settings-store.ts`)
- [x] T007 [S0005] Implement `setAudioTrackIndex` action with debouncedSave call (`src/store/settings-store.ts`)
- [x] T008 [S0005] Update partialize to include audioTrackIndex for localStorage persistence (`src/store/settings-store.ts`)
- [x] T009 [S0005] Add `updatePlayerStatistics` action signature to GameState interface (`src/store/game-store.ts`)

---

## Implementation (8 tasks)

Main feature implementation.

- [x] T010 [S0005] Update saveToSupabase to include audioTrackIndex in ui_preferences JSONB (`src/store/settings-store.ts`)
- [x] T011 [S0005] Update loadFromSupabase to restore audioTrackIndex with default fallback (`src/store/settings-store.ts`)
- [x] T012 [S0005] Update useSettingsStore hydration-safe hook to include audioTrackIndex in defaults (`src/store/settings-store.ts`)
- [x] T013 [S0005] Create useAudioTrackIndex selector for selective subscription (`src/store/settings-store.ts`)
- [x] T014 [S0005] Refactor AudioPlayer.tsx to use settings store for track index (`src/components/organisms/AudioPlayer.tsx`)
- [x] T015 [S0005] Add hydration safety pattern to AudioPlayer component (`src/components/organisms/AudioPlayer.tsx`)
- [x] T016 [S0005] Implement updatePlayerStatistics action with partial merge logic (`src/store/game-store.ts`)
- [x] T017 [S0005] Update combat-store endCombat to call game-store updatePlayerStatistics (`src/features/combat/store/combat-store.ts`)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T018 [S0005] [P] Write unit tests for audioTrackIndex get/set/persist (`src/store/settings-store.test.ts`)
- [x] T019 [S0005] [P] Write unit tests for saveToSupabase audioTrackIndex inclusion (`src/store/settings-store.test.ts`)
- [x] T020 [S0005] [P] Write unit tests for loadFromSupabase audioTrackIndex restoration (`src/store/settings-store.test.ts`)
- [x] T021 [S0005] Write integration test for preferredActions combat -> game store flow (`src/test/integration/preferred-actions-persistence.test.ts`)
- [x] T022 [S0005] Run full test suite and verify all tests passing, validate ASCII encoding

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (`npm test`) - 794 passed
- [x] All files ASCII-encoded (UTF-8 LF)
- [x] Zero TypeScript errors (`npm run build`)
- [x] Zero ESLint warnings (`npm run lint`)
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization

Tasks T018, T019, T020 can be worked on simultaneously as they create different test cases in the same file.

### Task Timing

Target ~20-25 minutes per task.

### Dependencies

- T004-T008 must complete before T010-T013 (settings store foundation before persistence)
- T009 must complete before T016-T017 (game-store action before combat-store integration)
- T014-T015 depend on T013 (AudioPlayer refactor needs selector)
- T021 depends on T016-T017 (integration test needs implementations)
- T022 must be last (final verification)

### Key Implementation Details

**AudioPlayer Hydration Pattern (T014-T015):**

```typescript
const audioTrackIndex = useAudioTrackIndex();
const setAudioTrackIndex = useSettingsStoreBase((state) => state.setAudioTrackIndex);
const _hasHydrated = useSettingsStoreBase((state) => state._hasHydrated);

// Show default track 0 until hydrated
const currentIdx = _hasHydrated ? audioTrackIndex : 0;
```

**Cross-Store Communication Pattern (T17):**

```typescript
// In combat-store endCombat:
import { useGameStoreBase } from '@/store/game-store';

// Call game-store action
useGameStoreBase.getState().updatePlayerStatistics(state.preferredActions);
```

**Settings Store audioTrackIndex in ui_preferences (T10):**

```typescript
ui_preferences: {
  ...state.ui,
  audioTrackIndex: state.audioTrackIndex,
} as unknown as Record<string, unknown>,
```

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No curly quotes, em-dashes, or special Unicode.

---

## Next Steps

Run `/implement` to begin AI-led implementation.
