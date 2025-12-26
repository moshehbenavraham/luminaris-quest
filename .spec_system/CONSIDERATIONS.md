# Considerations

> Institutional memory for AI assistants. Updated between phases via /carryforward.
> **Line budget**: 600 max | **Last updated**: Phase 00 (2025-12-26)

---

## Active Concerns

Items requiring attention in upcoming phases. Review before each session.

### Technical Debt

<!-- Max 5 items -->

- [P00] **Mid-combat state recovery**: Post-combat persistence works, but mid-combat state recovery is deferred. Players lose combat progress if browser crashes mid-fight. Complex to implement - consider future phase.

- [P00] **Energy regeneration tests skipped**: 10 tests in `energy-regeneration.test.ts` are skipped pending energy system stabilization. Revisit when energy mechanics are finalized.

### External Dependencies

<!-- Max 5 items -->

- [P00] **Supabase PostgreSQL with RLS**: Core data layer. Schema changes require migrations with DEFAULT values for backwards compatibility.

- [P00] **Supabase CLI for type generation**: Run `supabase gen types typescript` after any schema changes to keep TypeScript types in sync.

### Performance / Security

<!-- Max 5 items -->

- [P00] **RLS policies audit**: All database access uses RLS policies. Audit after schema changes to ensure new columns are properly secured.

- [P00] **combat_history retention**: Currently keeping all records indefinitely for therapeutic value. Consider GDPR deletion capability in future if expanding to EU users.

- [P00] **Auto-save debounce**: 30-second debounce prevents excessive writes. Critical events (journal, scene completion) trigger immediate save.

### Architecture

<!-- Max 5 items -->

- [P00] **Zustand store with persistence middleware**: game-store, combat-store, settings-store use persist middleware with localStorage.

- [P00] **Player resources single source of truth**: 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) managed in `player-resources.ts` slice. All stores sync through this.

- [P00] **Post-combat only persistence**: Combat history and reflections only persist after combat ends (victory/defeat). No mid-combat checkpointing.

---

## Lessons Learned

Proven patterns and anti-patterns. Reference during implementation.

### What Worked

<!-- Max 15 items -->

- [P00] **Set to Array conversion for serialization**: localStorage can't serialize Set<T>. Convert to Array for partialize() and use array methods (includes, filter, spread) throughout.

- [P00] **resourcesAtStart pattern**: Capture resource state (LP, SP, energy, health) at combat start. Compare to end state for meaningful analytics and combat_history records.

- [P00] **Graceful DB fallback**: In loadFromSupabase(), catch errors and log warning instead of failing. localStorage values (loaded by Zustand persist) serve as fallback.

- [P00] **Audio starts paused for therapeutic safety**: Unexpected audio can be triggering for trauma survivors. Persist track index but always start paused, letting users control playback.

- [P00] **DEFAULT values in migrations**: Schema additions (like max_player_health DEFAULT 100) ensure existing rows get valid values. No data migration needed.

- [P00] **Selective Zustand subscriptions**: Only subscribe to the specific state slices needed (e.g., `state => state.guardianTrust`) to minimize re-renders.

- [P00] **Hydration safety pattern**: Wrap Zustand store usage with `[isHydrated, setIsHydrated]` useState + useEffect to prevent SSR mismatches.

- [P00] **Co-located tests**: Tests next to source files (e.g., `useCombat.test.ts` alongside `useCombat.ts`) make maintenance easier.

- [P00] **Debounced saves with immediate critical events**: 30-second debounce for regular saves, but journal entries and scene completions trigger immediate saves.

- [P00] **Journal-combat linking**: Use lastCombatHistoryId to link journal entries to combat records. Enables therapeutic review of reflections in context.

### What to Avoid

<!-- Max 10 items -->

- [P00] **Set<T> for serializable state**: Sets don't serialize to localStorage. Use arrays with includes/filter instead. Example: `pendingMilestoneJournals: number[]` not `Set<number>`.

- [P00] **Relying on DB without fallbacks**: Network failures happen. Always have localStorage fallback for critical state. Use `error` branch in Supabase calls to fall back gracefully.

- [P00] **`as any` casts in persistence logic**: Type casts hide mismatches between store state and database schema. Fix the types at the source (regenerate Supabase types) instead of casting.

- [P00] **Components over 250 lines**: Keep components focused. Exception: combat system components allowed up to 500 lines due to complexity.

- [P00] **Direct store usage without hydration check**: Always check hydration before rendering Zustand-dependent UI to prevent SSR/client mismatches.

- [P00] **Using `any` types without justification**: Strict mode is enabled. Justify any `any` usage or find a proper type.

### Tool/Library Notes

<!-- Max 5 items -->

- [P00] **Supabase type generation**: `supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts`. Run after every schema change.

- [P00] **React 19.2 testing strictness**: Wrap timer advances with `advanceTimersAndAct()` from `@/test/utils`. Store updates need act() wrapping.

- [P00] **Radix UI test timeouts**: Tooltips and dialogs have 700ms animation delay. Use 2000ms timeout in tests.

- [P00] **Browser API mocks**: ResizeObserver, IntersectionObserver, HTMLMediaElement mocked in `config/vitest.setup.ts`.

- [P00] **CSS custom properties in tests**: Animation progress uses `--progress-value`. Test this directly, not computed `width`.

---

## Resolved

Recently closed items (buffer - rotates out after 2 phases).

| Phase | Item                                      | Resolution                                                                   |
| ----- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| P00   | maxPlayerHealth cross-device loss         | Added max_player_health column with DEFAULT 100, updated save/load functions |
| P00   | experiencePoints no localStorage fallback | Added to partialize() in game-store persist config                           |
| P00   | pendingMilestoneJournals serialization    | Converted from Set<number> to number[] array                                 |
| P00   | combat_history table unused               | Implemented saveCombatHistory() called after each combat                     |
| P00   | Audio track index not persisted           | Added to settings-store with Supabase sync                                   |
| P00   | preferredActions not saved                | Now persists to playerStatistics after each combat                           |
| P00   | growthInsights not saved                  | Added to PlayerStatistics interface and persistence                          |
| P00   | combatReflections not linked              | Journal entries now link to combat_history via journal_entry_id              |

---

_Auto-generated by /carryforward. Manual edits allowed but may be overwritten._
