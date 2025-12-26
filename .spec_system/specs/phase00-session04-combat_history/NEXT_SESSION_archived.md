# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-26
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 3 of 6

---

## Recommended Next Session

**Session ID**: `phase00-session04-combat_history`
**Session Name**: Combat History
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met

- [x] Session 03 completed (offline resilience)
- [x] Understanding of combat_history schema (available in types.ts)
- [x] Understanding of combat end flow in combat-store.ts

### Dependencies

- **Builds on**: Session 03 (offline resilience patterns)
- **Enables**: Session 05 (user settings), Session 06 (therapeutic data)

### Project Progression

Session 04 is the clear next step in the dependency chain. Sessions 05 and 06 both require combat_history to be active:

- Session 05 needs combat_history for preferredActions analytics
- Session 06 needs combat_history to link combat reflections

This session activates the **unused `combat_history` table** - a table that was designed for therapeutic tracking but never implemented. Completing this unlocks significant therapeutic value by enabling players to review their combat journey over time.

---

## Session Overview

### Objective

Activate the unused `combat_history` table by implementing post-combat persistence, enabling therapeutic analytics and combat review features.

### Key Deliverables

1. **saveCombatHistory()** - New function in combat-store.ts to persist combat records
2. **Combat end hook** - Automatic persistence on victory/defeat
3. **Resource tracking** - Capture resources_start and resources_end JSONB
4. **Action counting** - Track actionCounts for preferred action analytics
5. **Integration tests** - Verify combat history records are created

### Scope Summary

- **In Scope (MVP)**:
  - Implement saveCombatHistory() function
  - Track resourcesAtStart on combat start
  - Track actionCounts during combat
  - Call saveCombatHistory on combat end
  - Write integration tests

- **Out of Scope**:
  - Mid-combat state recovery (deferred)
  - Combat history UI/review screen (future feature)
  - Combat log retention policy (decide later)

---

## Technical Considerations

### Technologies/Patterns

- Zustand store actions for state tracking
- Supabase insert for combat_history table
- JSONB fields for resources and actions
- Async save with error handling

### Potential Challenges

1. **Combat store complexity** - Many interdependent fields; need careful state capture
2. **Timing of save** - Must capture final state before combat state resets
3. **Cross-store access** - Need scene_index from game-store while in combat-store

### Relevant Considerations

- **Supabase RLS policies** - Must verify combat_history insert permissions
- **Auto-save pattern** - Follow existing debounced save patterns for consistency
- **React 19.2 testing** - Remember stricter testing requirements for async operations

---

## Alternative Sessions

If this session is blocked:

1. **None available** - Sessions 05 and 06 both depend on Session 04
2. **Phase 01 prep** - Could start planning next phase if Phase 00 is blocked

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
