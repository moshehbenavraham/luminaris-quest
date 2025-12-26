# PRD Phase 00: DB Audit and Improvements

**Status**: Complete
**Sessions**: 6
**Duration**: 2025-12-25 to 2025-12-26

**Progress**: 6/6 sessions (100%)

---

## Overview

This phase addresses critical data persistence gaps identified in the State Persistence Audit (2025-12-25). The primary focus is eliminating data loss scenarios that undermine therapeutic trust - users must be confident their progress, reflections, and growth are preserved across devices and sessions.

Reliable state persistence is foundational to the therapeutic value of the application. Players processing trauma need to trust that their journey, insights, and growth are never lost.

---

## Progress Tracker

| Session | Name                 | Status   | Tasks | Validated  |
| ------- | -------------------- | -------- | ----- | ---------- |
| 01      | Schema and Types     | Complete | 18    | 2025-12-25 |
| 02      | Critical Persistence | Complete | 18    | 2025-12-26 |
| 03      | Offline Resilience   | Complete | 23    | 2025-12-26 |
| 04      | Combat History       | Complete | 22    | 2025-12-26 |
| 05      | User Settings        | Complete | 22    | 2025-12-26 |
| 06      | Therapeutic Data     | Complete | 22    | 2025-12-26 |

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

### Session 04: Combat History (2025-12-26)

- Implemented saveCombatHistory() utility to persist combat records to Supabase
- Added resourcesAtStart state field to capture LP, SP, energy, health at combat start
- Integrated combat history save into endCombat() flow (victory and defeat)
- Added lastCombatHistoryId for future journal linking (Session 06)
- Created 10 integration tests for combat history persistence

### Session 05: User Settings (2025-12-26)

- Added audioTrackIndex persistence to settings-store with Supabase sync
- Refactored AudioPlayer.tsx to use settings store instead of local state
- Implemented updatePlayerStatistics action for partial playerStatistics updates
- Combat preferredActions now persist to game-store playerStatistics after each combat
- Created 14 new tests (9 unit tests for settings, 5 integration tests for combat flow)

### Session 06: Therapeutic Data (2025-12-26)

- Added growthInsights to PlayerStatistics interface and game-store state
- Created linkJournalToCombatHistory utility to link journal entries to combat records
- Integrated journal-combat linking in CombatReflectionModal.handleSave
- Added therapeutic context tags (turns, action, enemy) to journal entries
- Created 22 tests (13 for growthInsights persistence, 9 for link utility)

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

## Files Modified

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

- [x] All 6 sessions completed
- [x] All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) sync to database
- [x] Cross-device login preserves all state including maxPlayerHealth
- [x] experiencePoints, experienceToNext, playerStatistics have localStorage fallback
- [x] pendingMilestoneJournals serializes correctly (Array instead of Set)
- [x] combat_history receives records after each combat
- [x] Audio track index persists in user_settings
- [x] Integration tests verify cross-device state restoration
- [x] Supabase types regenerated and type-safe

---

## Dependencies

### Depends On

- State Persistence Audit (completed 2025-12-25)

### Enables

- Phase 01: Future gameplay features with reliable persistence
- Therapeutic analytics dashboards (combat_history data)
- Cross-device play confidence

---

## Phase Statistics

| Metric         | Value  |
| -------------- | ------ |
| Sessions       | 6      |
| Total Tasks    | 125    |
| Tests Added    | ~80    |
| Files Created  | 12     |
| Files Modified | 25+    |
| Duration       | 2 days |

---

## Resolved Questions

1. **Combat-in-progress persistence**: Post-combat only (Sessions 04, 06)
2. **combat_history retention**: Keep all records for therapeutic review
3. **Audio playing state**: Persist track index, always start paused for safety
