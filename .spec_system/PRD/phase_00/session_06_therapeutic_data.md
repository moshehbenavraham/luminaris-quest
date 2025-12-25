# Session 06: Therapeutic Data

**Session ID**: `phase00-session06-therapeutic_data`
**Status**: Not Started
**Estimated Tasks**: ~15
**Estimated Duration**: 2-3 hours

---

## Objective

Persist therapeutic data (growthInsights and combatReflections) to enable long-term therapeutic value tracking and player review of their healing journey.

---

## Scope

### In Scope (MVP)

- Save `growthInsights` to dedicated field in game_states or journal entries
- Save `combatReflections` to journal entries with combat context
- Link combat reflections to combat_history records when applicable
- Add ability to review past growth insights
- Write tests for therapeutic data persistence

### Out of Scope

- Therapeutic analytics dashboard (future feature)
- AI-generated insight summaries (future feature)
- Export/share functionality

---

## Prerequisites

- [ ] Session 05 completed (user settings persistence)
- [ ] Session 04 completed (combat_history table active)
- [ ] Understanding of journal_entries schema

---

## Deliverables

1. **growthInsights persistence**: Save to appropriate storage
2. **combatReflections as journal entries**: Create journal entries with combat context
3. **combat_history linking**: Connect reflections to combat records
4. **Tests**: Verify therapeutic data persistence

---

## Technical Details

### growthInsights Storage Options

**Option A: Add to player_statistics JSONB** (Recommended for MVP)

```typescript
// In game-store.ts
interface PlayerStatistics {
  // ...existing fields
  growthInsights: string[];
}

// Save insight
addGrowthInsight: (insight: string) => {
  set((state) => ({
    playerStatistics: {
      ...state.playerStatistics,
      growthInsights: [...(state.playerStatistics.growthInsights || []), insight],
    },
  }));
};
```

**Option B: Dedicated journal type**

```typescript
// Create journal entry with type 'insight'
const saveGrowthInsight = async (insight: string) => {
  await supabase.from('journal_entries').insert({
    user_id: userId,
    entry_type: 'insight', // New type
    content: insight,
    guardian_trust_at_creation: currentTrust,
  });
};
```

**Recommendation**: Option A for MVP (simpler), consider Option B for future expansion.

### combatReflections as Journal Entries

```typescript
// After combat with reflection prompt:
const saveCombatReflection = async (reflection: string, combatHistoryId: string) => {
  const { data: journalEntry } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      entry_type: 'learning', // Use existing type
      content: reflection,
      guardian_trust_at_creation: currentTrust,
      // Add metadata in a JSONB field or via combat_history link
    })
    .select()
    .single();

  // Link to combat_history
  if (journalEntry && combatHistoryId) {
    await supabase
      .from('combat_history')
      .update({ journal_entry_id: journalEntry.id })
      .eq('id', combatHistoryId);
  }
};
```

### Combat Reflection Flow

```typescript
// In combat-store.ts:
submitCombatReflection: async (reflection: string) => {
  const state = get();

  // Save to journal
  const journalEntry = await createJournalEntry({
    type: 'learning',
    content: reflection,
    metadata: {
      combatContext: {
        enemyName: state.enemy.name,
        victory: state.combatResult === 'victory',
        turnsCount: state.turn,
      },
    },
  });

  // Update combat_history link
  if (state.lastCombatHistoryId) {
    await updateCombatHistory(state.lastCombatHistoryId, {
      journal_entry_id: journalEntry.id,
    });
  }

  // Clear local reflection state
  set({ combatReflections: [] });
};
```

---

## Success Criteria

- [ ] growthInsights persist to player_statistics
- [ ] combatReflections saved as journal entries
- [ ] Journal entries linked to combat_history records
- [ ] Therapeutic context preserved (enemy, outcome, turns)
- [ ] Data retrievable for future review features
- [ ] Tests verify persistence and linking

---

## Therapeutic Value

This data enables powerful therapeutic features:

1. **Growth Timeline**: Players can review insights over time, seeing their healing journey
2. **Combat Reflection Review**: Connect specific reflections to combat experiences
3. **Pattern Recognition**: Identify recurring themes in reflections
4. **Progress Visualization**: Future dashboards can show growth over time

---

## Files to Modify

1. `src/store/game-store.ts` - growthInsights in playerStatistics
2. `src/features/combat/store/combat-store.ts` - submitCombatReflection action
3. `src/integrations/supabase/client.ts` - Helper functions for linking
4. Reflection UI components - Call new persistence functions

---

## Notes

This final session completes the Phase 00 objective of comprehensive data persistence. After completion, all critical therapeutic data is captured and persisted, enabling future features like therapeutic dashboards, growth timelines, and AI-assisted insight summaries.

The foundation laid in this phase directly supports the therapeutic mission - every reflection, every insight, every moment of growth is preserved for the player's healing journey.
