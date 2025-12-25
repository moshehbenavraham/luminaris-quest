# Session Specification

**Session ID**: `phase00-session02-critical_persistence`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-25

---

## 1. Session Overview

This session addresses the critical bug where `maxPlayerHealth` resets to its default value when users log in from a different device or after clearing browser data. Currently, the `saveToSupabase()` function omits `max_player_health` from database writes, and `loadFromSupabase()` does not restore it to the player resources store.

The fix is straightforward but essential: add the missing field to both save and load operations. This session also removes unnecessary `as any` type casts that were required before Session 01 updated the Supabase types. Clean types improve maintainability and catch future persistence bugs at compile time.

After completion, all six player resource variables (health, maxHealth, energy, maxEnergy, LP, SP) will synchronize correctly to the database, providing reliable cross-device state restoration. This fix is foundational to the therapeutic value of the application - users must trust their progress persists.

---

## 2. Objectives

1. **Persist `maxPlayerHealth` to database** - Add `max_player_health` to the `saveToSupabase()` upsert payload
2. **Restore `maxPlayerHealth` from database** - Add `maxPlayerHealth` to the `setAllResources()` call in `loadFromSupabase()`
3. **Remove `as any` type casts** - Replace type casts with proper typing now that Supabase types are updated
4. **Verify all 6 resources sync** - Confirm health, maxHealth, energy, maxEnergy, LP, SP all persist correctly

---

## 3. Prerequisites

### Required Sessions

- [x] `phase00-session01-schema_and_types` - Added `max_player_health` column and regenerated types

### Required Tools/Knowledge

- Understanding of Zustand store structure (`game-store.ts`, `player-resources.ts`)
- Familiarity with Supabase TypeScript types pattern
- Knowledge of cross-store coordination pattern

### Environment Requirements

- Database has `max_player_health` column (verified in Session 01)
- Supabase types include `max_player_health` in `game_states` table
- Test environment can mock Supabase client

---

## 4. Scope

### In Scope (MVP)

- Update `saveToSupabase()` in `game-store.ts` to include `max_player_health`
- Update `loadFromSupabase()` in `game-store.ts` to restore `maxPlayerHealth`
- Remove `as any` casts in persistence logic (lines 841, 1092-1097, 1109-1112)
- Add integration test for `maxPlayerHealth` cross-device restoration
- Verify existing resource persistence tests still pass

### Out of Scope (Deferred)

- localStorage fallback improvements - _Reason: Session 03 scope_
- Combat history persistence - _Reason: Session 04 scope_
- Audio settings persistence - _Reason: Session 05 scope_
- Mid-combat state recovery - _Reason: Deferred to future phase_

---

## 5. Technical Approach

### Architecture

The persistence layer follows a cross-store coordination pattern:

```
                     saveToSupabase()
game-store.ts  <------------------------->  Supabase (game_states)
      |                                            |
      | getResourceSnapshot()                      |
      v                                            |
player-resources.ts  <-------- setAllResources() --+
                              (on loadFromSupabase)
```

The fix adds `max_player_health` to both directions of this data flow.

### Design Patterns

- **Resource Snapshot Pattern**: `getResourceSnapshot()` provides atomic read of all 6 resources
- **Null Coalescing Fallback**: `gameState.field ?? currentValue` preserves local state if DB field is null
- **Type-Safe Database Access**: Supabase generated types provide compile-time safety

### Technology Stack

- TypeScript 5.x with strict mode
- Zustand 5.x with persistence middleware
- Supabase PostgreSQL with generated types
- Vitest 4.x for testing

---

## 6. Deliverables

### Files to Create

| File                                                         | Purpose                       | Est. Lines |
| ------------------------------------------------------------ | ----------------------------- | ---------- |
| `src/test/integration/max-player-health-persistence.test.ts` | Cross-device restoration test | ~80        |

### Files to Modify

| File                      | Changes                                                                 | Est. Lines Changed |
| ------------------------- | ----------------------------------------------------------------------- | ------------------ |
| `src/store/game-store.ts` | Add `max_player_health` to save, restore to load, remove `as any` casts | ~15                |

---

## 7. Success Criteria

### Functional Requirements

- [ ] `saveToSupabase()` includes `max_player_health` in database upsert payload
- [ ] `loadFromSupabase()` restores `maxPlayerHealth` via `setAllResources()`
- [ ] All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) sync to DB
- [ ] Modified `maxPlayerHealth` survives: save -> reset local state -> load cycle

### Testing Requirements

- [ ] New integration test for `maxPlayerHealth` persistence passes
- [ ] Existing `energy-persistence.test.ts` tests still pass
- [ ] Manual cross-device simulation successful

### Quality Gates

- [ ] All files ASCII-encoded (UTF-8 LF)
- [ ] Zero TypeScript compilation errors
- [ ] No `as any` casts remain in save/load logic
- [ ] Lint passes with zero warnings

---

## 8. Implementation Notes

### Key Considerations

- **Backwards compatibility**: Use `?? currentResources.maxPlayerHealth` fallback for existing DB rows with null values
- **Atomic operations**: Save all resources in single upsert to maintain consistency
- **Type inference**: After removing `as any`, let TypeScript infer types from Supabase schema

### Potential Challenges

- **Existing type casts**: Multiple `(gameState as any)` casts need careful replacement
- **Cross-store timing**: Ensure `usePlayerResources` state is updated before game-store completes load
- **Test mocking**: Mock must return `max_player_health` in DB response

### Relevant Considerations

- **[Lesson]** Using `any` types without justification - This session removes existing type casts, improving type safety
- **[Architecture]** Auto-save with 30-second debounce - Changes integrate with existing flow; no debounce modifications needed
- **[Architecture]** Zustand persistence middleware - player-resources uses separate localStorage; DB sync is manual via game-store

### ASCII Reminder

All output files must use ASCII-only characters (0-127). Avoid unicode quotes, dashes, or special characters.

---

## 9. Testing Strategy

### Unit Tests

- Verify `getResourceSnapshot()` includes all 6 fields (already covered)
- Verify `setAllResources()` updates all 6 fields (already covered)

### Integration Tests

- **New test**: `maxPlayerHealth` persists and restores across save/load cycle
- **Verify**: Set maxPlayerHealth to 150, save, reset local state, load, expect 150
- **Edge case**: Load when DB has null `max_player_health` (uses default)

### Manual Testing

1. Login, increase maxPlayerHealth to 150
2. Trigger save (wait 30 seconds or force via dev tools)
3. Clear localStorage, refresh page
4. Verify maxPlayerHealth shows 150 (restored from DB)
5. Open incognito window, login, verify maxPlayerHealth is 150

### Edge Cases

- DB row exists but `max_player_health` is null (use default 100)
- Network failure during save (existing retry logic handles)
- User not authenticated (skip save, handled by existing guards)

---

## 10. Dependencies

### External Libraries

- `@supabase/supabase-js`: ^2.x (existing)
- `zustand`: ^5.x (existing)

### Other Sessions

- **Depends on**: `phase00-session01-schema_and_types` (column exists, types updated)
- **Depended by**: `phase00-session03-offline_resilience` (extends save/load functions)

---

## Code Reference

### saveToSupabase() Location

`src/store/game-store.ts:841-860` - Add `max_player_health` after line 853

### loadFromSupabase() Location

`src/store/game-store.ts:1091-1098` - Add `maxPlayerHealth` to `setAllResources()` call

### Type Cast Locations

- Line 841: `const gameState: any = {` - Remove `any`, use inferred type
- Lines 1092-1097: `(gameState as any).field` - Remove casts, types are now correct
- Lines 1109-1112: `(gameState as any).field` - Remove casts, types are now correct

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
