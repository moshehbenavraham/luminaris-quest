# Session 03: Offline Resilience

**Session ID**: `phase00-session03-offline_resilience`
**Status**: Not Started
**Estimated Tasks**: ~22
**Estimated Duration**: 3-4 hours

---

## Objective

Add localStorage fallback for key state variables and fix the `pendingMilestoneJournals` serialization issue to ensure offline resilience when database loads fail.

---

## Scope

### In Scope (MVP)

- Add `experiencePoints`, `experienceToNext`, `playerStatistics` to game-store `partialize` function
- Convert `pendingMilestoneJournals` from Set to Array for serialization
- Update all code that uses `pendingMilestoneJournals` to work with Array
- Implement fallback logic in `loadFromSupabase()` to use localStorage values when DB fails
- Add tests for offline fallback scenarios

### Out of Scope

- Combat history persistence (Session 04)
- Mid-combat state recovery (deferred)
- Network failure retry logic (existing auto-save handles this)

---

## Prerequisites

- [ ] Session 02 completed (save/load for maxPlayerHealth working)
- [ ] Understanding of current partialize function (game-store.ts lines 1330-1348)
- [ ] Identified all usages of `pendingMilestoneJournals`

---

## Deliverables

1. **Updated partialize()**: Includes experiencePoints, experienceToNext, playerStatistics
2. **Array migration**: pendingMilestoneJournals converted from Set to Array
3. **Fallback logic**: loadFromSupabase() uses localStorage when DB unavailable
4. **Tests**: Verify offline resilience for all affected fields

---

## Technical Details

### Current partialize (game-store.ts ~line 1330)

```typescript
partialize: (state) => ({
  guardianTrust: state.guardianTrust,
  playerLevel: state.playerLevel,
  currentSceneIndex: state.currentSceneIndex,
  journalEntries: state.journalEntries,
  milestones: state.milestones,
  sceneHistory: state.sceneHistory,
  // Missing: experiencePoints, experienceToNext, playerStatistics
});
```

### Updated partialize

```typescript
partialize: (state) => ({
  guardianTrust: state.guardianTrust,
  playerLevel: state.playerLevel,
  currentSceneIndex: state.currentSceneIndex,
  journalEntries: state.journalEntries,
  milestones: state.milestones,
  sceneHistory: state.sceneHistory,
  // NEW: Add offline fallback fields
  experiencePoints: state.experiencePoints,
  experienceToNext: state.experienceToNext,
  playerStatistics: state.playerStatistics,
  pendingMilestoneJournals: state.pendingMilestoneJournals, // Now Array
});
```

### pendingMilestoneJournals Migration

```typescript
// OLD: Set<number>
pendingMilestoneJournals: new Set(),

// NEW: number[]
pendingMilestoneJournals: [],

// Helper functions to update
addPendingMilestoneJournal: (trust: number) => {
  set((state) => ({
    pendingMilestoneJournals: [...state.pendingMilestoneJournals, trust]
  }));
},

removePendingMilestoneJournal: (trust: number) => {
  set((state) => ({
    pendingMilestoneJournals: state.pendingMilestoneJournals.filter(t => t !== trust)
  }));
},

hasPendingMilestoneJournal: (trust: number) => {
  return get().pendingMilestoneJournals.includes(trust);
},
```

### Fallback Logic in loadFromSupabase()

```typescript
const loadFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('DB load failed, using localStorage fallback');
      // localStorage values already loaded by Zustand persist
      return;
    }

    // Merge DB values with localStorage fallbacks
    // ...existing load logic
  } catch (e) {
    console.error('Network error, using localStorage fallback');
  }
};
```

---

## Success Criteria

- [ ] experiencePoints persists to localStorage and survives DB failure
- [ ] experienceToNext persists to localStorage and survives DB failure
- [ ] playerStatistics persists to localStorage and survives DB failure
- [ ] pendingMilestoneJournals is Array type (serializable)
- [ ] All code using pendingMilestoneJournals updated for Array API
- [ ] Fallback logic works when DB load fails
- [ ] Tests verify offline resilience scenarios

---

## Files to Modify

1. `src/store/game-store.ts` - partialize(), pendingMilestoneJournals type, loadFromSupabase()
2. Any components using `pendingMilestoneJournals` Set methods

---

## Notes

This session improves resilience for network failures. After completion, players experiencing connectivity issues will have a better experience - their progress is preserved even if the database is temporarily unreachable.
