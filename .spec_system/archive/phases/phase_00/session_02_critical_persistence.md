# Session 02: Critical Persistence

**Session ID**: `phase00-session02-critical_persistence`
**Status**: Not Started
**Estimated Tasks**: ~18
**Estimated Duration**: 2-3 hours

---

## Objective

Update the game store's save and load functions to persist `maxPlayerHealth` to the database, fixing the critical cross-device data loss bug.

---

## Scope

### In Scope (MVP)

- Update `saveToSupabase()` in game-store.ts to include `maxPlayerHealth`
- Update `loadFromSupabase()` in game-store.ts to restore `maxPlayerHealth`
- Remove `as any` type casts now that types are updated (from Session 01)
- Add integration tests verifying cross-device state restoration
- Verify all 6 resource variables sync correctly (health, maxHealth, energy, maxEnergy, LP, SP)

### Out of Scope

- localStorage fallback improvements (Session 03)
- Combat history persistence (Session 04)
- Audio settings (Session 05)
- Other state variables beyond resources

---

## Prerequisites

- [ ] Session 01 completed (schema updated, types regenerated)
- [ ] `max_player_health` column exists in database
- [ ] Updated Supabase types include `max_player_health`

---

## Deliverables

1. **Updated saveToSupabase()**: Includes `max_player_health` in upsert
2. **Updated loadFromSupabase()**: Restores `maxPlayerHealth` from database
3. **Integration tests**: Verify cross-device restoration of all 6 resources
4. **Type cleanup**: Remove unnecessary `as any` casts in persistence logic

---

## Technical Details

### saveToSupabase() Update (game-store.ts ~line 853)

```typescript
// Add after player_health:
max_player_health: resourceSnapshot.maxPlayerHealth,
```

### loadFromSupabase() Update (game-store.ts ~line 1097)

```typescript
usePlayerResources.getState().setAllResources({
  playerEnergy: gameState.player_energy ?? currentResources.playerEnergy,
  maxPlayerEnergy: gameState.max_player_energy ?? currentResources.maxPlayerEnergy,
  lightPoints: gameState.light_points ?? currentResources.lightPoints,
  shadowPoints: gameState.shadow_points ?? currentResources.shadowPoints,
  playerHealth: gameState.player_health ?? currentResources.playerHealth,
  maxPlayerHealth: gameState.max_player_health ?? currentResources.maxPlayerHealth, // NEW
});
```

### Integration Test

```typescript
it('restores maxPlayerHealth on cross-device login', async () => {
  // Set maxPlayerHealth to non-default value
  usePlayerResources.getState().setMaxPlayerHealth(150);

  // Save to database
  await useGameStore.getState().saveToSupabase();

  // Reset local state
  usePlayerResources.getState().reset();

  // Load from database
  await useGameStore.getState().loadFromSupabase();

  // Verify restoration
  expect(usePlayerResources.getState().maxPlayerHealth).toBe(150);
});
```

---

## Success Criteria

- [ ] `saveToSupabase()` includes `max_player_health` in database write
- [ ] `loadFromSupabase()` restores `maxPlayerHealth` from database
- [ ] All 6 resource variables verified to sync correctly
- [ ] Integration test passes for cross-device restoration
- [ ] No `as any` casts remain in save/load logic (types are clean)
- [ ] Existing save/load functionality unchanged for other fields

---

## Verification Steps

1. Run existing tests: `npm test`
2. Manual test: Set maxPlayerHealth to 150, save, clear localStorage, reload
3. Verify database: Check `max_player_health` column has correct value
4. Cross-device simulation: Load in incognito window, verify maxPlayerHealth restored

---

## Notes

This is the critical bug fix session. After completion, the primary data loss issue (maxPlayerHealth reset) is resolved. Users will have reliable cross-device state for all resources.
