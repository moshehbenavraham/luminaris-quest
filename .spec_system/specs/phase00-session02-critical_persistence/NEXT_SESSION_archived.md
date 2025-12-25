# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-25
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 1

---

## Recommended Next Session

**Session ID**: `phase00-session02-critical_persistence`
**Session Name**: Critical Persistence
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~18

---

## Why This Session Next?

### Prerequisites Met

- [x] Session 01 completed (schema_and_types)
- [x] `max_player_health` column exists in database
- [x] Updated Supabase types include `max_player_health`

### Dependencies

- **Builds on**: Session 01 (schema_and_types) - uses new database column and types
- **Enables**: Session 03 (offline_resilience) - extends save/load functions

### Project Progression

Session 02 is the critical bug fix session that resolves the primary user-facing issue: `maxPlayerHealth` resets to default when users log in from a different device. This is the foundational persistence fix that all subsequent sessions build upon.

The dependency chain is clear:

1. ~~Session 01: Schema~~ (done) - Database column and types
2. **Session 02: Persistence** - Save/load functions use new schema
3. Session 03: Offline - Extends persistence with localStorage fallback
4. Session 04: Combat History - Additional persistence for analytics

---

## Session Overview

### Objective

Update the game store's save and load functions to persist `maxPlayerHealth` to the database, fixing the critical cross-device data loss bug.

### Key Deliverables

1. **Updated saveToSupabase()**: Includes `max_player_health` in database upsert
2. **Updated loadFromSupabase()**: Restores `maxPlayerHealth` from database
3. **Integration tests**: Verify cross-device restoration of all 6 resource variables
4. **Type cleanup**: Remove unnecessary `as any` casts in persistence logic

### Scope Summary

- **In Scope (MVP)**: Update save/load functions, verify all 6 resources sync, integration tests, type cleanup
- **Out of Scope**: localStorage fallback (Session 03), combat history (Session 04), audio settings (Session 05)

---

## Technical Considerations

### Technologies/Patterns

- Zustand store with Supabase persistence
- Selective state subscriptions for performance
- Cross-store resource coordination (game-store + player-resources)

### Potential Challenges

- Ensuring backwards compatibility with existing save data (null handling)
- Cross-store state synchronization between game-store and player-resources
- Type safety after removing `as any` casts

### Relevant Considerations

- **[Lesson]** Using `any` types without justification should be avoided - this session removes existing type casts
- **[Architecture]** Auto-save system with 30-second debounce - changes must integrate with existing flow
- **[External]** Supabase PostgreSQL with RLS - all saves go through authenticated user context

---

## Alternative Sessions

If this session is blocked:

1. **Session 05: User Settings** - Audio track persistence is independent of resource persistence; could proceed in parallel if needed
2. **Session 06: Therapeutic Data** - Growth insights and reflections could be implemented independently, though less critical

**Note**: Sessions 03 and 04 have explicit prerequisites on Session 02, so they cannot proceed if Session 02 is blocked.

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
