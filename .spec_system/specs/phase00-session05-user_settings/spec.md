# Session Specification

**Session ID**: `phase00-session05-user_settings`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-26

---

## 1. Session Overview

This session implements persistence for audio player track index and combat preferredActions, completing the user experience consistency improvements for Phase 00. Players returning to the game will find their audio preferences preserved - the right track ready to play when they choose. The preferredActions data enables future features like action suggestions based on player patterns.

The implementation follows established patterns from previous sessions: Zustand store state management with Supabase persistence, debounced saves, and hydration-safe hooks. The AudioPlayer component will migrate from local state to the settings store, while combat-store will be updated to persist preferredActions to the game-store's playerStatistics field after each combat.

This session is critical for therapeutic UX - unexpected audio can be triggering for trauma survivors, so we persist track selection (not playing state) while always starting paused. The preferredActions persistence supports therapeutic analytics by tracking which coping mechanisms players naturally gravitate toward.

---

## 2. Objectives

1. Persist audio track index to user_settings via settings-store
2. Refactor AudioPlayer.tsx to use settings store instead of local state
3. Persist preferredActions to playerStatistics JSONB after combat ends
4. Write tests verifying settings persistence across sessions

---

## 3. Prerequisites

### Required Sessions

- [x] `phase00-session01-schema_and_types` - Database schema foundation
- [x] `phase00-session02-critical_persistence` - Core persistence patterns
- [x] `phase00-session03-offline_resilience` - localStorage fallback patterns
- [x] `phase00-session04-combat_history` - Combat persistence patterns

### Required Tools/Knowledge

- Zustand store with persistence middleware patterns
- Settings-store.ts structure and save flow
- AudioPlayer.tsx component architecture
- Combat-store.ts endCombat flow

### Environment Requirements

- Supabase connection for user_settings table
- Existing tests passing (`npm test`)

---

## 4. Scope

### In Scope (MVP)

- Add `audioTrackIndex` field to settings-store.ts state interface
- Add `setAudioTrackIndex` action to settings-store.ts
- Update settings-store `saveToSupabase()` to include audioTrackIndex in ui_preferences
- Update settings-store `loadFromSupabase()` to restore audioTrackIndex
- Refactor AudioPlayer.tsx to use settings store for track index
- Add `updatePlayerStatistics` action to game-store.ts for partial updates
- Update combat-store.ts `endCombat()` to persist preferredActions via game-store
- Add partialize for audioTrackIndex in settings-store localStorage
- Write unit tests for settings persistence
- Write integration test for preferredActions persistence flow

### Out of Scope (Deferred)

- Audio playing state persistence - _Reason: Always start paused for therapeutic safety_
- Audio volume/mute persistence - _Reason: Already implemented in settings-store_
- Mid-combat state recovery - _Reason: Session 06+ scope_
- growthInsights persistence - _Reason: Session 06 scope_
- combatReflections persistence - _Reason: Session 06 scope_

---

## 5. Technical Approach

### Architecture

The implementation uses three stores with unidirectional data flow:

```
[settings-store] <--> [Supabase user_settings]
       |
       v
[AudioPlayer.tsx] (reads audioTrackIndex)

[combat-store] --> [game-store] <--> [Supabase game_states]
       |                  |
       +-- preferredActions copied to playerStatistics on combat end
```

### Design Patterns

- **Selective Zustand Subscriptions**: AudioPlayer subscribes only to audioTrackIndex to minimize re-renders
- **Hydration Safety Pattern**: Settings store uses \_hasHydrated flag and hasMounted check
- **Debounced Persistence**: Settings changes debounce 2 seconds before Supabase save
- **Cross-Store Communication**: Combat-store calls game-store action on combat end

### Technology Stack

- React 19.2 with TypeScript strict mode
- Zustand 5.x with persist middleware
- Supabase PostgreSQL with JSONB fields
- Vitest 4.0 for testing

---

## 6. Deliverables

### Files to Create

| File                                                         | Purpose                                        | Est. Lines |
| ------------------------------------------------------------ | ---------------------------------------------- | ---------- |
| `src/store/settings-store.test.ts`                           | Unit tests for audioTrackIndex persistence     | ~80        |
| `src/test/integration/preferred-actions-persistence.test.ts` | Integration test for combat -> game store flow | ~60        |

### Files to Modify

| File                                        | Changes                                          | Est. Lines Changed |
| ------------------------------------------- | ------------------------------------------------ | ------------------ |
| `src/store/settings-store.ts`               | Add audioTrackIndex state, action, save/load     | ~35                |
| `src/components/organisms/AudioPlayer.tsx`  | Use settings store instead of local state        | ~25                |
| `src/store/game-store.ts`                   | Add updatePlayerStatistics partial update action | ~20                |
| `src/features/combat/store/combat-store.ts` | Call updatePlayerStatistics in endCombat         | ~15                |

---

## 7. Success Criteria

### Functional Requirements

- [ ] audioTrackIndex persists to user_settings.ui_preferences JSONB
- [ ] AudioPlayer resumes at last selected track on page reload
- [ ] Audio always starts paused (never auto-plays)
- [ ] preferredActions saved to playerStatistics JSONB after combat ends
- [ ] Settings sync to Supabase correctly with debounced saves
- [ ] Existing audio volume/mute settings continue working

### Testing Requirements

- [ ] Unit tests for audioTrackIndex get/set/persist
- [ ] Unit tests for updatePlayerStatistics action
- [ ] Integration test for preferredActions combat -> game store flow
- [ ] All existing tests continue passing

### Quality Gates

- [ ] All files ASCII-encoded (UTF-8 LF)
- [ ] Unix LF line endings
- [ ] Zero TypeScript compilation errors (`npm run build`)
- [ ] Zero ESLint warnings (`npm run lint`)
- [ ] Component under 250 lines limit

---

## 8. Implementation Notes

### Key Considerations

- AudioPlayer must work during hydration - show default track (0) until hydrated
- preferredActions in combat-store are per-combat counts, reset each startCombat()
- playerStatistics in game-store are cumulative totals, merge on update
- Debounced save (2000ms) may not fire if user navigates away quickly

### Potential Challenges

- **Hydration timing**: AudioPlayer may flash to track 0 before hydration completes
  - _Mitigation_: Use hasMounted pattern, accept brief flash as acceptable
- **Cross-store coordination**: Combat-store importing game-store creates tight coupling
  - _Mitigation_: Use action call pattern (get().action()) rather than direct state access
- **Default values for existing users**: audioTrackIndex undefined in existing data
  - _Mitigation_: Default to 0 with nullish coalescing in loadFromSupabase

### Relevant Considerations

- **[Architecture]** Zustand store with persistence middleware - follow established debouncedSave pattern
- **[What Worked]** Selective Zustand subscriptions - apply separate selectors for audioTrackIndex
- **[What to Avoid]** Direct store usage without hydration check - AudioPlayer must check \_hasHydrated
- **[Tool Note]** React 19.2 requires stricter testing patterns - wrap timer advances in act()

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No curly quotes, em-dashes, or special Unicode.

---

## 9. Testing Strategy

### Unit Tests

- `settings-store.test.ts`:
  - Initial audioTrackIndex is 0
  - setAudioTrackIndex updates state correctly
  - setAudioTrackIndex triggers debouncedSave
  - audioTrackIndex included in partialize for localStorage
  - saveToSupabase includes audioTrackIndex in ui_preferences
  - loadFromSupabase restores audioTrackIndex with default fallback

### Integration Tests

- `preferred-actions-persistence.test.ts`:
  - Combat ends with victory -> preferredActions merged to playerStatistics
  - Combat ends with defeat -> preferredActions still persisted
  - Multiple combats accumulate action counts correctly
  - Game store saveToSupabase includes updated playerStatistics

### Manual Testing

- Start app fresh, note audio track is 0
- Navigate tracks, refresh page, verify track preserved
- Complete combat, check playerStatistics in Supabase dashboard
- Test cross-device: change track on one device, login on another

### Edge Cases

- audioTrackIndex out of bounds (playlist shorter than saved index)
- User navigates away before debounce timer fires
- Supabase offline during settings save (localStorage should cache)
- Empty preferredActions object (no actions taken in combat)

---

## 10. Dependencies

### External Libraries

- zustand: ^5.0.0 (existing)
- react-h5-audio-player: ^3.9.0 (existing)
- @supabase/supabase-js: ^2.x (existing)

### Other Sessions

- **Depends on**: phase00-session01-04 (database schema, persistence patterns)
- **Depended by**: phase00-session06-therapeutic_data (uses playerStatistics patterns)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
