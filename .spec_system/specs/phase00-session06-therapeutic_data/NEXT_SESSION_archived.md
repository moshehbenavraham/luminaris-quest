# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-26
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 5 of 6

---

## Recommended Next Session

**Session ID**: `phase00-session06-therapeutic_data`
**Session Name**: Therapeutic Data Persistence
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~15

---

## Why This Session Next?

### Prerequisites Met

- [x] Session 05 completed (user settings persistence)
- [x] Session 04 completed (combat_history table active)
- [x] Understanding of journal_entries schema

### Dependencies

- **Builds on**: Session 04 (combat_history) and Session 05 (user_settings)
- **Enables**: Phase 00 completion, future therapeutic analytics features

### Project Progression

This is the **final session of Phase 00**. It represents the capstone of the data persistence audit, completing the therapeutic mission: every reflection, insight, and moment of growth will be preserved for the player's healing journey.

Sessions 01-05 established the infrastructure:

1. Schema and types (database foundation)
2. Critical persistence (maxPlayerHealth, core resources)
3. Offline resilience (localStorage fallback)
4. Combat history (analytics table activation)
5. User settings (preferences persistence)

Session 06 ties it together by persisting the therapeutic content itself - the insights and reflections that give the game its healing value.

---

## Session Overview

### Objective

Persist therapeutic data (growthInsights and combatReflections) to enable long-term therapeutic value tracking and player review of their healing journey.

### Key Deliverables

1. **growthInsights persistence** - Save to playerStatistics JSONB field
2. **combatReflections as journal entries** - Create journal entries with combat context
3. **combat_history linking** - Connect reflections to combat records
4. **Integration tests** - Verify therapeutic data persistence and linking

### Scope Summary

- **In Scope (MVP)**: growthInsights in JSONB, combatReflections as journal entries, combat_history linking, tests
- **Out of Scope**: Therapeutic analytics dashboard, AI-generated summaries, export/share

---

## Technical Considerations

### Technologies/Patterns

- Zustand store with playerStatistics JSONB field
- Supabase journal_entries table (existing 'learning' type)
- combat_history foreign key linking
- Co-located integration tests

### Potential Challenges

- Linking journal entries to combat_history requires careful ID propagation
- combatReflections flow crosses combat-store and game-store boundaries
- Need to preserve therapeutic context (enemy name, outcome, turns) in journal metadata

### Relevant Considerations

- **Auto-save system**: Leverage existing 30-second debounce for growthInsights
- **Co-located tests**: Place tests next to modified store files
- **React 19.2 testing**: Wrap timer advances in act() for async tests

---

## Alternative Sessions

If this session is blocked:

1. **None available in Phase 00** - This is the final session
2. **Consider Phase 01 planning** - If blocked, use `/phasebuild` to define next phase

---

## Files to Modify

1. `src/store/game-store.ts` - growthInsights in playerStatistics
2. `src/features/combat/store/combat-store.ts` - submitCombatReflection action
3. `src/integrations/supabase/client.ts` - Helper functions for linking
4. Reflection UI components - Call new persistence functions
5. New test files - Co-located with modified stores

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task checklist.
