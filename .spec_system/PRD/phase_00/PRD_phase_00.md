# PRD Phase 00: DB Audit and Improvements

**Status**: In Progress
**Sessions**: 6 (initial estimate)
**Estimated Duration**: 3-4 days

**Progress**: 3/6 sessions (50%)

---

## Overview

This phase addresses critical data persistence gaps identified in the State Persistence Audit (2025-12-25). The primary focus is eliminating data loss scenarios that undermine therapeutic trust - users must be confident their progress, reflections, and growth are preserved across devices and sessions.

Reliable state persistence is foundational to the therapeutic value of the application. Players processing trauma need to trust that their journey, insights, and growth are never lost.

---

## Progress Tracker

| Session | Name                 | Status      | Est. Tasks | Validated  |
| ------- | -------------------- | ----------- | ---------- | ---------- |
| 01      | Schema and Types     | Complete    | 18         | 2025-12-25 |
| 02      | Critical Persistence | Complete    | 18         | 2025-12-26 |
| 03      | Offline Resilience   | Complete    | 23         | 2025-12-26 |
| 04      | Combat History       | Not Started | ~20        | -          |
| 05      | User Settings        | Not Started | ~18        | -          |
| 06      | Therapeutic Data     | Not Started | ~15        | -          |

---

## Completed Sessions

### Session 01: Schema and Types (2025-12-25)

- Added `max_player_health` column to `game_states` table
- Regenerated TypeScript types from database schema
- Documented type audit for Session 02 cleanup

### Session 02: Critical Persistence (2025-12-26)

- Added `max_player_health` to `saveToSupabase()` and `loadFromSupabase()`
- Removed all `as any` type casts in persistence logic
- All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) now sync to DB
- Created integration tests for cross-device state restoration

### Session 03: Offline Resilience (2025-12-26)

- Added experiencePoints, experienceToNext, playerStatistics to localStorage partialize
- Converted pendingMilestoneJournals from Set<number> to number[] for proper serialization
- Implemented graceful fallback in loadFromSupabase() when database is unreachable
- Created 17 integration tests for offline resilience scenarios

---

## Upcoming Sessions

- Session 04: Combat History

---

## Objectives

1. **Fix critical data loss bugs** - Add `maxPlayerHealth` column to database schema
2. **Implement offline resilience** - localStorage fallbacks for key state variables
3. **Activate combat_history table** - Enable therapeutic analytics tracking
4. **Ensure cross-device sync** - Complete state restoration on any device/browser

---

## Prerequisites

- State Persistence Audit completed (2025-12-25)
- Supabase CLI access for type generation
- Database migration permissions
- All existing tests passing

---

## Technical Considerations

### Architecture

- Zustand stores with persistence middleware (game-store, combat-store, settings-store)
- Supabase PostgreSQL with RLS for secure data access
- Auto-save system with 30-second debounce
- Player resources shared via `player-resources.ts` slice

### Technologies

- Supabase PostgreSQL with Row Level Security
- Zustand with persist middleware
- TypeScript with strict mode
- Vitest for integration tests

### Risks

- **Migration Risk**: Schema changes could break existing user data
  - _Mitigation_: Reversible migrations with sensible defaults (max_player_health DEFAULT 100)
- **Type Safety Risk**: Supabase types out of sync after schema change
  - _Mitigation_: Regenerate types as first step of Session 01
- **Combat State Complexity**: Combat store has many interdependent fields
  - _Mitigation_: Focus on post-combat persistence first (Session 04)

### Relevant Considerations

<!-- From CONSIDERATIONS.md -->

- **Zustand Patterns**: Use selective subscriptions and hydration safety patterns
- **React 19.2 Testing**: Wrap timer advances in act(), use 2000ms timeout for Radix components
- **RLS Security**: All database access via RLS policies - audit after schema changes

---

## Key Findings from Audit

### Critical (Priority 1) - Session 01-02

- `maxPlayerHealth` not saved to database - column missing from schema
- Users lose max health bonuses on cross-device login (resets to 100)

### High (Priority 2) - Session 03-04

- `experiencePoints`, `experienceToNext`, `playerStatistics` have no localStorage fallback
- `pendingMilestoneJournals` uses Set (not serializable)
- `combat_history` table exists but is never used

### Medium (Priority 3) - Session 05-06

- Audio track index not persisted
- `preferredActions`, `growthInsights`, `combatReflections` not saved

### Deferred (Priority 4)

- Mid-combat state recovery (complex, consider future phase)
- Combat log persistence for therapeutic review

---

## Database Changes Required

```sql
-- Priority 1: Add missing column
ALTER TABLE game_states
ADD COLUMN max_player_health INTEGER DEFAULT 100;
```

---

## Files to Modify

1. `supabase/migrations/` - New migration file
2. `src/store/game-store.ts` - saveToSupabase(), loadFromSupabase(), partialize()
3. `src/integrations/supabase/types.ts` - Regenerate after migration
4. `src/store/slices/player-resources.ts` - Verify sync logic
5. `src/features/combat/store/combat-store.ts` - Add combat_history writes
6. `src/components/organisms/AudioPlayer.tsx` - Add settings persistence
7. `src/store/settings-store.ts` - Add audio track fields

---

## Success Criteria

Phase complete when:

- [ ] All 6 sessions completed
- [ ] All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) sync to database
- [ ] Cross-device login preserves all state including maxPlayerHealth
- [ ] experiencePoints, experienceToNext, playerStatistics have localStorage fallback
- [ ] pendingMilestoneJournals serializes correctly (Array instead of Set)
- [ ] combat_history receives records after each combat
- [ ] Audio track index persists in user_settings
- [ ] Integration tests verify cross-device state restoration
- [ ] Supabase types regenerated and type-safe

---

## Dependencies

### Depends On

- State Persistence Audit (completed 2025-12-25)

### Enables

- Phase 01: Future gameplay features with reliable persistence
- Therapeutic analytics dashboards (combat_history data)
- Cross-device play confidence

---

## Open Questions

1. **Combat-in-progress persistence**: Should mid-combat state be persisted (complex) or only post-combat results (simpler)?
   - _Current decision_: Post-combat only (Sessions 04, 06)
2. **combat_history retention**: Keep all records, rolling window, or user-deletable?
   - _To be decided in Session 04_
3. **Audio playing state**: Should it persist or always start paused for safety?
   - _To be decided in Session 05_
