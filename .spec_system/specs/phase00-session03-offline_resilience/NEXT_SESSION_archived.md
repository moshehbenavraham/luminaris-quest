# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-26
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 2 of 6

---

## Recommended Next Session

**Session ID**: `phase00-session03-offline_resilience`
**Session Name**: Offline Resilience
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~22

---

## Why This Session Next?

### Prerequisites Met

- [x] Session 02 completed (save/load for maxPlayerHealth working)
- [x] Understanding of current partialize function (game-store.ts)
- [x] Schema and types updated (Session 01)

### Dependencies

- **Builds on**: Session 02 (critical_persistence) - database save/load infrastructure
- **Enables**: Session 04 (combat_history) - which depends on resilient state handling

### Project Progression

This is the natural sequential progression through Phase 00. Sessions 01 and 02 established the database schema and critical save/load paths. Session 03 now adds defensive resilience - ensuring the app degrades gracefully when network connectivity fails. This is essential before tackling combat history (Session 04), which will make heavier database writes.

The pendingMilestoneJournals Set-to-Array migration is a blocking issue that prevents proper localStorage serialization. Fixing this early avoids cascading bugs in later sessions.

---

## Session Overview

### Objective

Add localStorage fallback for key state variables and fix the `pendingMilestoneJournals` serialization issue to ensure offline resilience when database loads fail.

### Key Deliverables

1. **Updated partialize()**: Add experiencePoints, experienceToNext, playerStatistics to localStorage persistence
2. **Array migration**: Convert pendingMilestoneJournals from Set to Array for proper JSON serialization
3. **Fallback logic**: Implement graceful degradation in loadFromSupabase() when database is unavailable
4. **Tests**: Integration tests verifying offline resilience scenarios

### Scope Summary

- **In Scope (MVP)**: partialize expansion, Set-to-Array migration, fallback logic, tests
- **Out of Scope**: Combat history (Session 04), mid-combat recovery (deferred), network retry logic (existing auto-save handles)

---

## Technical Considerations

### Technologies/Patterns

- Zustand persist middleware with partialize configuration
- localStorage as offline fallback layer
- Array vs Set for JSON serialization compatibility
- Error handling in async database operations

### Potential Challenges

- Ensuring all code paths using pendingMilestoneJournals are updated for Array API
- Handling race conditions between localStorage and database state
- Testing offline scenarios reliably in Vitest

### Relevant Considerations

- **Architecture**: Zustand store with persistence middleware - this session directly extends that pattern
- **What Worked**: Selective Zustand subscriptions - apply same pattern to new persisted fields
- **React 19.2**: Requires stricter testing patterns - wrap timer advances in act()

---

## Alternative Sessions

If this session is blocked:

1. **Session 05 (user_settings)** - Could be done independently if audio persistence is urgent, but less impactful
2. **Session 06 (therapeutic_data)** - Also independent, but requires Session 03's resilience patterns

**Note**: Session 04 (combat_history) is NOT a viable alternative - it explicitly requires Session 03 as a prerequisite.

---

## Next Steps

Run `/sessionspec` to generate the formal specification with task breakdown.
