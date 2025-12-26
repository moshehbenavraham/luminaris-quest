# Session Specification

**Session ID**: `phase00-session06-therapeutic_data`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-26

---

## 1. Session Overview

This session completes Phase 00 by implementing persistence for the two remaining therapeutic data types: `growthInsights` and `combatReflections`. These represent the core therapeutic value of the application - the insights and reflections that players record during their healing journey.

Currently, `CombatReflectionModal` creates journal entries but does not link them to the `combat_history` table. The `growthInsights` array exists in the type definitions but is never persisted. This session bridges these gaps by: (1) adding `growthInsights` to the `PlayerStatistics` JSONB field, (2) modifying the combat reflection save flow to link journal entries to combat_history records, and (3) writing integration tests to verify the persistence and linking.

After completion, all critical therapeutic data is captured and persisted, providing the foundation for future features like therapeutic dashboards, growth timelines, and AI-assisted insight summaries.

---

## 2. Objectives

1. Persist `growthInsights` to `playerStatistics` JSONB field in game_states table
2. Link combat reflection journal entries to `combat_history` records via `journal_entry_id`
3. Preserve therapeutic context (enemy name, outcome, turns) in journal metadata
4. Write integration tests verifying therapeutic data persistence and linking

---

## 3. Prerequisites

### Required Sessions

- [x] `phase00-session04-combat_history` - Provides active combat_history table with journal_entry_id FK
- [x] `phase00-session05-user_settings` - Established JSONB persistence patterns

### Required Tools/Knowledge

- Understanding of Zustand store patterns and persistence middleware
- Familiarity with Supabase JSONB queries and foreign key relationships
- Knowledge of React Testing Library and Vitest patterns

### Environment Requirements

- Node.js 20+ with npm
- Supabase project with existing schema (no migrations needed)
- Local development server on port 8086

---

## 4. Scope

### In Scope (MVP)

- Add `growthInsights: string[]` to `PlayerStatistics` interface
- Create `addGrowthInsight` action in game-store
- Persist `growthInsights` via existing `saveToSupabase()` flow
- Modify `CombatReflectionModal.handleSave` to update combat_history with journal_entry_id
- Create helper function to link journal entries to combat_history
- Add integration tests for therapeutic data persistence
- Ensure localStorage fallback includes growthInsights

### Out of Scope (Deferred)

- Therapeutic analytics dashboard - _Reason: Future phase feature_
- AI-generated insight summaries - _Reason: Future phase feature_
- Export/share functionality - _Reason: Future phase feature_
- UI for reviewing past growth insights - _Reason: Future phase feature_

---

## 5. Technical Approach

### Architecture

The implementation follows the existing patterns in the codebase:

1. **PlayerStatistics Extension**: Add `growthInsights: string[]` to the existing JSONB structure. This piggybacks on the already-working `player_statistics` persistence in `saveToSupabase()`.

2. **Combat History Linking**: After saving a journal entry, update the corresponding `combat_history` record with the new `journal_entry_id`. The `lastCombatHistoryId` is already tracked in the combat store.

3. **Cross-Store Communication**: The linking requires coordination between `combat-store` (has `lastCombatHistoryId`) and `game-store` (creates journal entries). Use the existing pattern of direct store access.

### Design Patterns

- **JSONB Extension**: Add to existing `PlayerStatistics` interface rather than new DB column
- **Async Non-Blocking Update**: Link to combat_history after journal save completes
- **Co-located Tests**: Tests next to modified source files

### Technology Stack

- TypeScript 5.8 with strict mode
- Zustand 5.0 with persist middleware
- Supabase PostgreSQL with RLS
- Vitest 4.0 with React Testing Library

---

## 6. Deliverables

### Files to Create

| File                                                       | Purpose                              | Est. Lines |
| ---------------------------------------------------------- | ------------------------------------ | ---------- |
| `src/store/game-store.therapeutic.test.ts`                 | Integration tests for growthInsights | ~80        |
| `src/features/combat/utils/link-journal-to-combat.ts`      | Helper to update combat_history FK   | ~40        |
| `src/features/combat/utils/link-journal-to-combat.test.ts` | Tests for linking utility            | ~60        |

### Files to Modify

| File                                                                  | Changes                                        | Est. Lines Changed |
| --------------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| `src/types/domain/combat.ts`                                          | Add growthInsights to PlayerStatistics         | ~5                 |
| `src/store/game-store.ts`                                             | Add addGrowthInsight action, update partialize | ~30                |
| `src/features/combat/components/resolution/CombatReflectionModal.tsx` | Call link function after save                  | ~20                |

---

## 7. Success Criteria

### Functional Requirements

- [ ] `growthInsights` persists to `player_statistics` JSONB in database
- [ ] `growthInsights` included in localStorage partialize for offline fallback
- [ ] Combat reflection journal entries link to `combat_history.journal_entry_id`
- [ ] Therapeutic context preserved in journal entry tags/metadata
- [ ] Data retrievable for future review features

### Testing Requirements

- [ ] Integration tests for growthInsights persistence and restore
- [ ] Unit tests for link-journal-to-combat utility
- [ ] Manual testing of combat reflection save flow

### Quality Gates

- [ ] All files ASCII-encoded with Unix LF line endings
- [ ] TypeScript strict mode - zero compilation errors
- [ ] ESLint passes with zero warnings
- [ ] All existing tests continue to pass
- [ ] Code follows CONVENTIONS.md patterns

---

## 8. Implementation Notes

### Key Considerations

1. **Existing Flow Preservation**: The current `CombatReflectionModal.handleSave` flow works correctly. We're extending it, not replacing it.

2. **ID Timing**: `lastCombatHistoryId` is set asynchronously in `combat-store.endCombat()`. The linking must wait for this ID to be available.

3. **Error Handling**: Linking is non-critical - if it fails, the journal entry should still save. Log errors but don't block the user.

4. **Backwards Compatibility**: The `PlayerStatistics` JSONB field already exists. Adding `growthInsights` array is additive - existing records will have `undefined` which the merge function handles.

### Potential Challenges

- **Async Coordination**: `lastCombatHistoryId` may not be immediately available
  - _Mitigation_: Use short polling or Promise.resolve chain in endCombat flow

- **Cross-Store State**: Need combat store ID in journal save context
  - _Mitigation_: Pass `lastCombatHistoryId` as parameter or access store directly

### Relevant Considerations

- **Auto-save System**: growthInsights changes will trigger hasUnsavedChanges, picked up by 30-second debounce
- **Co-located Tests**: Place tests next to modified store files per CONVENTIONS.md
- **React 19.2 Testing**: Wrap timer advances in act() for async tests

### ASCII Reminder

All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests

- `link-journal-to-combat.test.ts`: Test update function with mocked Supabase
- Verify error handling when combat_history record not found
- Verify success case updates journal_entry_id

### Integration Tests

- `game-store.therapeutic.test.ts`: Test growthInsights CRUD
  - Add insight, verify state update
  - Verify included in saveToSupabase payload
  - Verify included in localStorage partialize
  - Verify restore from localStorage on hydration

### Manual Testing

1. Start combat, defeat enemy, enter reflection, save
2. Check Supabase: journal_entries has new record
3. Check Supabase: combat_history.journal_entry_id links to journal entry
4. Add growth insight via game action
5. Check Supabase: player_statistics contains growthInsights array
6. Clear localStorage, reload - verify data restores from database

### Edge Cases

- Combat reflection saved when offline (link fails gracefully)
- Multiple combats without page refresh (IDs update correctly)
- Empty reflection text (save blocked by existing validation)
- Concurrent saves (debounce prevents race conditions)

---

## 10. Dependencies

### External Libraries

- `zustand`: 5.0.0 (existing)
- `@supabase/supabase-js`: 2.49.0 (existing)

### Other Sessions

- **Depends on**: phase00-session04-combat_history (active table, journal_entry_id FK)
- **Depended by**: Future therapeutic analytics features (Phase 01+)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
