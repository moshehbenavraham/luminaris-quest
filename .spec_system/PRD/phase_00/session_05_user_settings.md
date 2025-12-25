# Session 05: User Settings

**Session ID**: `phase00-session05-user_settings`
**Status**: Not Started
**Estimated Tasks**: ~18
**Estimated Duration**: 2-3 hours

---

## Objective

Persist audio player track index and preferredActions to user settings, ensuring consistent user experience across sessions and devices.

---

## Scope

### In Scope (MVP)

- Add `audio_track_index` to user_settings persistence
- Move audio state from component-local to settings store
- Save `preferredActions` from combat store to `player_statistics` JSONB
- Update AudioPlayer.tsx to use persisted track index
- Add tests for settings persistence

### Out of Scope

- Audio playing state persistence (start paused for safety)
- Mid-combat state recovery
- growthInsights and combatReflections (Session 06)

---

## Prerequisites

- [ ] Session 04 completed (combat history working)
- [ ] Understanding of settings-store.ts structure
- [ ] Understanding of AudioPlayer.tsx current state

---

## Deliverables

1. **Updated settings-store.ts**: Add audio track index field
2. **Updated AudioPlayer.tsx**: Use persisted track index
3. **preferredActions persistence**: Save to player_statistics after combat
4. **Tests**: Verify settings persist across sessions

---

## Technical Details

### Current AudioPlayer State (component-local)

```typescript
// src/components/organisms/AudioPlayer.tsx:27-28
const [currentIdx, setCurrentIdx] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
```

### Add to settings-store.ts

```typescript
interface SettingsState {
  // ...existing fields
  audioTrackIndex: number;
  setAudioTrackIndex: (index: number) => void;
}

// In store creation:
audioTrackIndex: 0,
setAudioTrackIndex: (index) => {
  set({ audioTrackIndex: index });
  // Save to database
  debouncedSaveSettings();
},

// In saveSettings():
ui_preferences: {
  ...state.uiPreferences,
  audioTrackIndex: state.audioTrackIndex,
}
```

### Update AudioPlayer.tsx

```typescript
import { useSettingsStore } from '@/store/settings-store';

function AudioPlayer() {
  const audioTrackIndex = useSettingsStore((state) => state.audioTrackIndex);
  const setAudioTrackIndex = useSettingsStore((state) => state.setAudioTrackIndex);

  const [isPlaying, setIsPlaying] = useState(false); // Always start paused

  // Use audioTrackIndex instead of local currentIdx
  const handleNextTrack = () => {
    const nextIdx = (audioTrackIndex + 1) % playlist.length;
    setAudioTrackIndex(nextIdx);
  };

  // ...rest of component
}
```

### preferredActions Persistence

```typescript
// In combat-store.ts, after combat ends:
const savePreferredActions = async () => {
  const preferredActions = get().preferredActions;

  // Merge with existing player_statistics
  await useGameStore.getState().updatePlayerStatistics({
    preferredActions,
  });
};

// In game-store.ts:
updatePlayerStatistics: (updates: Partial<PlayerStatistics>) => {
  set((state) => ({
    playerStatistics: {
      ...state.playerStatistics,
      ...updates,
    },
  }));
  // Trigger save
  debouncedSaveToSupabase();
},
```

---

## Success Criteria

- [ ] Audio track index persists in user_settings
- [ ] AudioPlayer resumes at last track on page reload
- [ ] Audio always starts paused (safety for therapeutic context)
- [ ] preferredActions saved to player_statistics JSONB
- [ ] Settings sync to database correctly
- [ ] Tests verify persistence across sessions

---

## Audio State Decision

**Question**: Should audio playing state persist?

**Decision**: No - always start paused for safety.

**Rationale**:

- Unexpected audio can be triggering for trauma survivors
- Users maintain control over their audio experience
- Track position is preserved (main UX improvement)

---

## Files to Modify

1. `src/store/settings-store.ts` - Add audioTrackIndex
2. `src/components/organisms/AudioPlayer.tsx` - Use settings store
3. `src/store/game-store.ts` - Add updatePlayerStatistics action
4. `src/features/combat/store/combat-store.ts` - Save preferredActions on combat end

---

## Notes

This session improves user experience consistency. Players returning to the game will find their audio preferences preserved - the right track ready to play when they choose. The preferredActions data enables future features like action suggestions based on player patterns.
