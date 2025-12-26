# Session Specification

**Session ID**: `phase00-session03-offline_resilience`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-26

---

## 1. Session Overview

This session adds offline resilience to Luminari's Quest by ensuring critical game state persists to localStorage and gracefully degrades when database operations fail. The therapeutic value of the application depends on players trusting that their progress is preserved - a network hiccup should never cause data loss.

Currently, three important fields (`experiencePoints`, `experienceToNext`, `playerStatistics`) are saved to the database but not included in Zustand's localStorage `partialize` configuration. If a database load fails, these values reset to defaults. Additionally, `pendingMilestoneJournals` uses a JavaScript `Set`, which cannot be JSON-serialized - it silently becomes `{}` in localStorage.

This session fixes both issues and adds explicit fallback logic in `loadFromSupabase()` to use localStorage-cached values when the database is unreachable. After completion, players experiencing network issues will retain their progress until connectivity is restored.

---

## 2. Objectives

1. Add `experiencePoints`, `experienceToNext`, and `playerStatistics` to the localStorage partialize function
2. Convert `pendingMilestoneJournals` from `Set<number>` to `number[]` for proper JSON serialization
3. Update all code paths using `pendingMilestoneJournals` to work with Array API
4. Implement fallback logic in `loadFromSupabase()` to retain localStorage values on database failure
5. Add integration tests verifying offline resilience behavior

---

## 3. Prerequisites

### Required Sessions

- [x] `phase00-session01-schema_and_types` - Database schema updated with max_player_health column
- [x] `phase00-session02-critical_persistence` - Save/load infrastructure working for all resources

### Required Tools/Knowledge

- Understanding of Zustand persist middleware and partialize function
- Knowledge of JavaScript Set vs Array serialization behavior
- Familiarity with async error handling patterns

### Environment Requirements

- Development server running on port 8086
- Access to Supabase project (dev or staging)
- Vitest test runner configured

---

## 4. Scope

### In Scope (MVP)

- Expand `partialize` function with experiencePoints, experienceToNext, playerStatistics, pendingMilestoneJournals
- Change `pendingMilestoneJournals` type from `Set<number>` to `number[]`
- Update GameState interface in `src/types/domain/game.ts`
- Update all usages of pendingMilestoneJournals in game-store.ts
- Update Adventure.tsx to use Array methods instead of Set methods
- Update Adventure.test.tsx mock to use Array
- Add fallback logic in loadFromSupabase() for graceful degradation
- Write integration tests for offline scenarios

### Out of Scope (Deferred)

- Combat history persistence - _Reason: Session 04 scope_
- Mid-combat state recovery - _Reason: Complex, deferred to future phase_
- Network retry logic improvements - _Reason: Existing auto-save already handles retries_
- UI indicators for offline mode - _Reason: Not part of data layer focus_

---

## 5. Technical Approach

### Architecture

The Zustand persist middleware uses `partialize` to select which state fields serialize to localStorage. The `merge` function handles rehydration. This session expands both functions to include previously missing fields.

For `pendingMilestoneJournals`, we convert from Set to Array because:

- `JSON.stringify(new Set([1,2,3]))` produces `{}`
- `JSON.stringify([1,2,3])` produces `[1,2,3]`

The fallback logic follows a "database is truth, localStorage is cache" pattern:

1. Attempt database load
2. On error (except "no rows"), log warning and skip database merge
3. localStorage values remain intact from Zustand's automatic rehydration

### Design Patterns

- **Graceful Degradation**: App continues functioning with cached data when network fails
- **Defensive Programming**: Type guard for pendingMilestoneJournals to handle legacy Set data
- **Single Source of Truth**: Database remains authoritative; localStorage is fallback only

### Technology Stack

- Zustand 5.x with persist middleware
- TypeScript strict mode
- React 19.2 with hydration safety patterns
- Vitest 4.0 for testing

---

## 6. Deliverables

### Files to Modify

| File                           | Changes                                                                         | Est. Lines |
| ------------------------------ | ------------------------------------------------------------------------------- | ---------- |
| `src/types/domain/game.ts`     | Change `pendingMilestoneJournals: Set<number>` to `number[]`                    | ~2         |
| `src/store/game-store.ts`      | Update partialize, merge, loadFromSupabase, all pendingMilestoneJournals usages | ~80        |
| `src/pages/Adventure.tsx`      | Replace Set methods with Array methods                                          | ~10        |
| `src/pages/Adventure.test.tsx` | Update mock to use Array instead of Set                                         | ~2         |

### Files to Create

| File                                              | Purpose                                         | Est. Lines |
| ------------------------------------------------- | ----------------------------------------------- | ---------- |
| `src/test/integration/offline-resilience.test.ts` | Integration tests for offline fallback behavior | ~150       |

---

## 7. Success Criteria

### Functional Requirements

- [ ] experiencePoints persists to localStorage via partialize
- [ ] experienceToNext persists to localStorage via partialize
- [ ] playerStatistics persists to localStorage via partialize
- [ ] pendingMilestoneJournals serializes correctly as Array (not `{}`)
- [ ] All pendingMilestoneJournals usages work with Array API
- [ ] loadFromSupabase() gracefully handles database errors without resetting state
- [ ] localStorage values survive a simulated database failure

### Testing Requirements

- [ ] Unit tests for partialize function output
- [ ] Integration tests for offline fallback scenario
- [ ] Adventure.tsx tests pass with Array-based pendingMilestoneJournals
- [ ] All existing tests continue to pass

### Quality Gates

- [ ] All files ASCII-encoded (no special characters)
- [ ] Unix LF line endings
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied

---

## 8. Implementation Notes

### Key Considerations

- The `partialize` function (line 1335) returns a plain object for localStorage - ensure all added fields serialize correctly
- The `merge` function (line 1355) handles rehydration - must handle missing fields gracefully
- Legacy users may have empty `{}` for pendingMilestoneJournals in localStorage - add migration guard

### Potential Challenges

- **Legacy Data Migration**: Existing localStorage may have `{}` for pendingMilestoneJournals - add type guard to convert to empty array
- **Hydration Timing**: Ensure fallback logic doesn't race with Zustand's automatic rehydration
- **Test Isolation**: Mocking Supabase errors in tests requires careful setup

### Relevant Considerations

- **CONV-136**: "Sets must be converted to Arrays before serialization" - directly applicable
- **CONV-134**: "Database is source of truth; localStorage is fallback cache" - guides our fallback design
- **React 19.2**: Wrap timer advances in `act()` for tests (from CONSIDERATIONS.md)

### ASCII Reminder

All output files must use ASCII-only characters (0-127). Do not use smart quotes, em-dashes, or other special characters.

---

## 9. Testing Strategy

### Unit Tests

- Verify partialize output includes experiencePoints, experienceToNext, playerStatistics, pendingMilestoneJournals
- Verify pendingMilestoneJournals serializes as array `[1, 2, 3]` not `{}`
- Verify merge handles missing fields with defaults

### Integration Tests

Create `src/test/integration/offline-resilience.test.ts`:

- Mock Supabase to throw network error on load
- Verify localStorage values are preserved after failed load
- Verify game state remains usable after offline scenario
- Test migration from legacy Set data to Array

### Manual Testing

1. Play game, earn XP, trigger milestone journal
2. Open DevTools, verify localStorage has experiencePoints, pendingMilestoneJournals as array
3. Disconnect network, refresh page
4. Verify game loads with cached values

### Edge Cases

- Empty pendingMilestoneJournals array serializes correctly
- Large playerStatistics object serializes without truncation
- Concurrent save during offline transition

---

## 10. Dependencies

### External Libraries

- zustand: ^5.0.0
- @supabase/supabase-js: ^2.49.0
- vitest: ^4.0.0

### Other Sessions

- **Depends on**: `phase00-session01-schema_and_types`, `phase00-session02-critical_persistence`
- **Depended by**: `phase00-session04-combat_history` (requires resilient state handling)

---

## Appendix: Code Locations

### Current partialize (game-store.ts:1335-1353)

```typescript
partialize: (state) => ({
  guardianTrust: state.guardianTrust,
  playerLevel: state.playerLevel,
  currentSceneIndex: state.currentSceneIndex,
  journalEntries: state.journalEntries.map(...),
  milestones: state.milestones.map(...),
  sceneHistory: state.sceneHistory.map(...),
  // MISSING: experiencePoints, experienceToNext, playerStatistics, pendingMilestoneJournals
}),
```

### pendingMilestoneJournals usages

- `src/types/domain/game.ts:14` - Type definition
- `src/store/game-store.ts:164` - Initial value `new Set()`
- `src/store/game-store.ts:333,355,371,380,385,387,406,1415` - Set operations
- `src/pages/Adventure.tsx:25,54,55,62` - Destructure, .size, Array.from()
- `src/pages/Adventure.test.tsx:12` - Mock with `new Set()`

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
