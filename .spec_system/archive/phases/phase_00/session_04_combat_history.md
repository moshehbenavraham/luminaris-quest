# Session 04: Combat History

**Session ID**: `phase00-session04-combat_history`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 3-4 hours

---

## Objective

Activate the unused `combat_history` table by implementing post-combat persistence, enabling therapeutic analytics and combat review features.

---

## Scope

### In Scope (MVP)

- Implement `saveCombatHistory()` function in combat-store.ts
- Call saveCombatHistory after each combat ends (victory or defeat)
- Capture all required combat_history fields:
  - enemy_id, enemy_name, victory, turns_taken
  - final_player_hp, final_enemy_hp
  - resources_start, resources_end (JSONB)
  - actions_used (JSONB), combat_log (JSONB)
  - player_level, scene_index
- Add optional journal_entry_id linking for combat reflections
- Write integration tests for combat history persistence

### Out of Scope

- Mid-combat state recovery (deferred to future phase)
- Combat history UI/review screen (future feature)
- Combat log retention policy (decide later)
- preferredActions persistence (Session 05)

---

## Prerequisites

- [ ] Session 03 completed (offline resilience)
- [ ] Understanding of combat_history schema (src/integrations/supabase/types.ts)
- [ ] Understanding of combat end flow in combat-store.ts

---

## Deliverables

1. **saveCombatHistory()**: New function in combat-store.ts
2. **Combat end hook**: Calls saveCombatHistory on victory/defeat
3. **Type definitions**: Proper typing for combat_history insert
4. **Integration tests**: Verify combat history records created

---

## Technical Details

### combat_history Schema (from types.ts)

```typescript
combat_history: {
  Row: {
    id: string;
    user_id: string;
    journal_entry_id: string | null;
    enemy_id: string;
    enemy_name: string;
    victory: boolean;
    turns_taken: number;
    final_player_hp: number;
    final_enemy_hp: number;
    resources_start: Json;
    resources_end: Json;
    actions_used: Json;
    combat_log: Json | null;
    player_level: number;
    scene_index: number;
    created_at: string | null;
  }
}
```

### saveCombatHistory Implementation

```typescript
const saveCombatHistory = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    console.warn('Cannot save combat history: no user');
    return;
  }

  const state = get();
  const { data, error } = await supabase.from('combat_history').insert({
    user_id: user.id,
    enemy_id: state.enemy.id,
    enemy_name: state.enemy.name,
    victory: state.combatResult === 'victory',
    turns_taken: state.turn,
    final_player_hp: state.playerHealth,
    final_enemy_hp: state.enemy.currentHealth,
    resources_start: state.resourcesAtStart,
    resources_end: {
      lp: state.resources.lp,
      sp: state.resources.sp,
      energy: state.playerEnergy,
    },
    actions_used: state.actionCounts,
    combat_log: state.combatLog.slice(-50), // Last 50 entries
    player_level: state.playerLevel,
    scene_index: useGameStore.getState().currentSceneIndex,
  });

  if (error) {
    console.error('Failed to save combat history:', error);
  }
};
```

### Track Resources at Start

```typescript
// In startCombat():
set({
  // ...existing state
  resourcesAtStart: {
    lp: get().resources.lp,
    sp: get().resources.sp,
    energy: get().playerEnergy,
    health: get().playerHealth,
  },
  actionCounts: {},
});

// In performAction():
set((state) => ({
  actionCounts: {
    ...state.actionCounts,
    [actionType]: (state.actionCounts[actionType] || 0) + 1,
  },
}));
```

---

## Success Criteria

- [ ] combat_history table receives records after each combat
- [ ] All required fields populated correctly
- [ ] Victory and defeat both recorded
- [ ] resources_start and resources_end capture resource changes
- [ ] actions_used tracks action frequency
- [ ] Integration test verifies record creation
- [ ] No impact on combat performance

---

## Retention Policy Decision

**Options to consider:**

1. Keep all records indefinitely (therapeutic value)
2. Rolling window (last N combats per user)
3. User-deletable (privacy control)

**Recommendation**: Keep all records for therapeutic review. Add deletion capability in future if needed for GDPR compliance.

---

## Notes

This session activates a powerful therapeutic feature - combat history enables players to review their growth over time. The data can power future analytics dashboards showing combat patterns, preferred actions, and resilience development.
