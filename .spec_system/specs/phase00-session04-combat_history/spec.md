# Session Specification

**Session ID**: `phase00-session04-combat_history`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-26

---

## 1. Session Overview

This session activates the unused `combat_history` database table by implementing post-combat persistence. The table was designed for therapeutic tracking but never implemented - after this session, every combat encounter will be recorded, capturing resources, actions, and outcomes.

Combat history is foundational to the therapeutic value of Luminari's Quest. By persisting every combat, players can review their growth over time, identify patterns in their coping strategies (preferred actions), and see tangible evidence of their resilience development. The data powers future analytics dashboards and therapeutic review features.

This session builds on Session 03's offline resilience patterns and unblocks Sessions 05 and 06, which depend on combat_history being active for preferredActions analytics and combat reflection linking.

---

## 2. Objectives

1. Implement `saveCombatHistory()` function that persists combat records to Supabase after each combat ends
2. Track `resourcesAtStart` and `actionCounts` during combat to capture resource changes and action preferences
3. Call `saveCombatHistory()` automatically on combat end (victory or defeat)
4. Write integration tests verifying combat history records are created with all required fields

---

## 3. Prerequisites

### Required Sessions

- [x] `phase00-session01-schema_and_types` - Schema and types foundation
- [x] `phase00-session02-critical_persistence` - Database persistence patterns
- [x] `phase00-session03-offline_resilience` - Offline resilience patterns

### Required Tools/Knowledge

- Understanding of combat_history schema (see Section 5)
- Understanding of combat-store.ts flow (startCombat -> executeAction -> endCombat)
- Supabase client usage patterns from `@/integrations/supabase/client`

### Environment Requirements

- Supabase project with RLS policies for combat_history table
- Development server running (`npm run dev`)
- Test environment configured (`npm test`)

---

## 4. Scope

### In Scope (MVP)

- Add `resourcesAtStart` state field to combat-store.ts (captured on startCombat)
- Add `actionCounts` state field to combat-store.ts (updated on each action)
- Implement `saveCombatHistory()` async function with proper error handling
- Call saveCombatHistory from `endCombat()` action
- Store `lastCombatHistoryId` for future journal linking (Session 06)
- Write integration tests for combat history persistence

### Out of Scope (Deferred)

- Mid-combat state recovery - _Reason: Complexity; focus on post-combat first_
- Combat history UI/review screen - _Reason: Future feature; foundation first_
- Combat log retention policy - _Reason: Keep all for now; GDPR compliance later_
- preferredActions persistence to player_statistics - _Reason: Session 05 scope_
- Journal entry linking - _Reason: Session 06 scope (prepare field only)_

---

## 5. Technical Approach

### Architecture

The combat history persistence follows a "capture-then-save" pattern:

1. **Capture Phase** (startCombat): Snapshot `resourcesAtStart` when combat begins
2. **Track Phase** (executeAction): Increment `actionCounts` for each action taken
3. **Save Phase** (endCombat): Persist all data to combat_history table

```
startCombat() --> executeAction() x N --> endCombat()
     |                  |                     |
     v                  v                     v
resourcesAtStart   actionCounts++      saveCombatHistory()
```

### combat_history Schema

```typescript
interface CombatHistoryInsert {
  user_id: string; // From auth
  enemy_id: string; // From combat state
  enemy_name: string; // From combat state
  victory: boolean; // From combatEndStatus
  turns_taken: number; // From turn counter
  final_player_hp: number; // From playerHealth
  final_enemy_hp: number; // From enemy.currentHP
  resources_start: Json; // { lp, sp, energy, health }
  resources_end: Json; // { lp, sp, energy, health }
  actions_used: Json; // { ILLUMINATE: N, REFLECT: N, ... }
  combat_log: Json | null; // Last 50 log entries
  player_level: number; // From playerLevel
  scene_index: number; // From game-store
}
```

### Design Patterns

- **Async save with non-blocking UI**: Save operation happens after UI updates
- **Error logging without user blocking**: Log errors but don't disrupt flow
- **Cross-store coordination**: Access game-store for scene_index via useGameStore.getState()

### Technology Stack

- Zustand 5.x - State management
- Supabase PostgreSQL - Database persistence
- Vitest 4.0 - Integration testing
- TypeScript 5.x - Type safety

---

## 6. Deliverables

### Files to Create

| File                                             | Purpose                              | Est. Lines |
| ------------------------------------------------ | ------------------------------------ | ---------- |
| `src/features/combat/store/combat-store.test.ts` | Integration tests for combat history | ~150       |

### Files to Modify

| File                                        | Changes                                                                      | Est. Lines Changed |
| ------------------------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| `src/features/combat/store/combat-store.ts` | Add resourcesAtStart, actionCounts, saveCombatHistory(), lastCombatHistoryId | ~80                |

---

## 7. Success Criteria

### Functional Requirements

- [ ] combat_history table receives records after each combat ends
- [ ] Victory combats recorded with `victory: true`
- [ ] Defeat combats recorded with `victory: false`
- [ ] `resources_start` captures LP, SP, energy, health at combat start
- [ ] `resources_end` captures LP, SP, energy, health at combat end
- [ ] `actions_used` tracks action frequency (e.g., `{ ILLUMINATE: 3, REFLECT: 2 }`)
- [ ] `combat_log` stores last 50 log entries
- [ ] `scene_index` correctly populated from game-store
- [ ] `lastCombatHistoryId` stored for future journal linking

### Testing Requirements

- [ ] Integration test: Victory combat creates history record
- [ ] Integration test: Defeat combat creates history record
- [ ] Integration test: resources_start matches values at combat start
- [ ] Integration test: resources_end matches values at combat end
- [ ] Integration test: actions_used counts are accurate
- [ ] Unit test coverage >= 80% for new code

### Quality Gates

- [ ] All files ASCII-encoded (no unicode characters)
- [ ] Unix LF line endings
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings
- [ ] No `any` types without justification
- [ ] Combat store stays under 500 lines

---

## 8. Implementation Notes

### Key Considerations

1. **Timing of Save**: The save must happen AFTER combat state is finalized but BEFORE the state resets. Call `saveCombatHistory()` at the start of `endCombat()`, capturing state before any resets.

2. **Cross-Store Access**: To get `scene_index`, use `useGameStore.getState().currentSceneIndex`. This is synchronous and safe.

3. **No Auth Guard**: If no user is authenticated, log a warning and skip the save. Don't block combat flow.

4. **Error Handling**: Log errors to console but don't throw. Combat UX must not break due to save failures.

### Potential Challenges

- **Race Condition**: Enemy turn uses setTimeout; ensure state is stable before capture
  - _Mitigation_: Capture state synchronously at start of endCombat before any async operations

- **Large Combat Logs**: Very long combats could have huge logs
  - _Mitigation_: Limit to last 50 entries with `.slice(-50)`

- **Type Safety**: Json type from Supabase is loose
  - _Mitigation_: Define typed interfaces for resourcesAtStart and resourcesEnd

### Relevant Considerations

- **[P00] RLS Policies**: Verify combat_history INSERT policy allows authenticated users to insert their own records
- **[P00] Zustand Persistence**: Don't add resourcesAtStart/actionCounts to localStorage partialize - they're ephemeral per-combat
- **[P00] React 19 Testing**: Wrap async operations in act() for integration tests

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or unicode symbols.

---

## 9. Testing Strategy

### Unit Tests

- `saveCombatHistory()` formats data correctly for Supabase insert
- `resourcesAtStart` is set on startCombat with correct values
- `actionCounts` increments correctly for each action type

### Integration Tests

- Complete combat flow (start -> actions -> victory) creates history record
- Complete combat flow (start -> actions -> defeat) creates history record
- resources_start values match initial state
- resources_end values match final state
- actions_used reflects actual actions taken
- scene_index is populated correctly

### Manual Testing

1. Start dev server and Supabase dashboard
2. Log in and trigger a combat
3. Win the combat
4. Check combat_history table for new record
5. Verify all fields are populated correctly
6. Repeat with a defeat scenario

### Edge Cases

- Combat with no actions taken (immediate surrender)
- Combat with only one action type used
- Very long combat (50+ turns)
- No authenticated user (should skip save gracefully)

---

## 10. Dependencies

### External Libraries

- `@supabase/supabase-js`: ^2.x (existing)
- `zustand`: ^5.x (existing)
- `vitest`: ^4.0 (existing)

### Other Sessions

- **Depends on**:
  - `phase00-session01-schema_and_types` (types.ts with combat_history)
  - `phase00-session02-critical_persistence` (Supabase patterns)
  - `phase00-session03-offline_resilience` (state partialize patterns)
- **Depended by**:
  - `phase00-session05-user_settings` (preferredActions analytics)
  - `phase00-session06-therapeutic_data` (combat reflection linking)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
