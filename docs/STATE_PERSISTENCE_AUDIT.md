# State Persistence Audit Report

**Date:** 2025-12-25
**Auditor:** Claude Code
**Purpose:** Identify all player/user variables that are NOT being properly saved to and loaded from the database

---

## Executive Summary

This audit identifies significant gaps in state persistence for Luminari's Quest. Several critical player variables are either:

1. Not saved to the database at all
2. Only persisted to localStorage (lost on different device/browser)
3. Defined in DB schema but never used

---

## Database Tables Overview

### Current Tables:

1. `game_states` - Main player progress
2. `journal_entries` - Therapeutic journal entries
3. `user_settings` - User preferences
4. `combat_history` - **EXISTS BUT UNUSED**

---

## Detailed Findings

### 0. RESOURCE PERSISTENCE VERIFICATION TABLE

| Variable          | DB Column           | In Schema? | Saved?         | Loaded?                  | Status     |
| ----------------- | ------------------- | ---------- | -------------- | ------------------------ | ---------- |
| `playerHealth`    | `player_health`     | YES        | YES (line 853) | YES (line 1097)          | **OK**     |
| `maxPlayerHealth` | `max_player_health` | **NO**     | **NO**         | **NO** (defaults to 100) | **BROKEN** |
| `playerEnergy`    | `player_energy`     | YES        | YES (line 849) | YES (line 1092)          | **OK**     |
| `maxPlayerEnergy` | `max_player_energy` | YES        | YES (line 850) | YES (line 1093-1094)     | **OK**     |
| `lightPoints`     | `light_points`      | YES        | YES (line 851) | YES (line 1095)          | **OK**     |
| `shadowPoints`    | `shadow_points`     | YES        | YES (line 852) | YES (line 1096)          | **OK**     |

**Summary:** 5 of 6 resource variables are properly persisted to DB. Only `maxPlayerHealth` is broken.

### 0.1 localStorage vs Database Persistence

| Variable          | localStorage   | Database | Cross-Device Sync? |
| ----------------- | -------------- | -------- | ------------------ |
| `playerHealth`    | YES (line 230) | YES      | **YES**            |
| `maxPlayerHealth` | YES (line 231) | **NO**   | **NO - BROKEN**    |
| `playerEnergy`    | YES (line 232) | YES      | **YES**            |
| `maxPlayerEnergy` | YES (line 233) | YES      | **YES**            |
| `lightPoints`     | YES (line 234) | YES      | **YES**            |
| `shadowPoints`    | YES (line 235) | YES      | **YES**            |

**Key Issue:** `maxPlayerHealth` persists in localStorage (`luminari-player-resources`) but NOT in the database, meaning it works on the same browser but is lost when:

- User logs in from a different device
- User clears browser data
- User uses a different browser

### 0.2 Game Store localStorage vs Database Persistence

The game-store `partialize` function (lines 1330-1348) only saves a subset to localStorage:

| Variable                   | localStorage | Database | Notes                  |
| -------------------------- | ------------ | -------- | ---------------------- |
| `guardianTrust`            | YES          | YES      | OK                     |
| `playerLevel`              | YES          | YES      | OK                     |
| `currentSceneIndex`        | YES          | YES      | OK                     |
| `journalEntries`           | YES          | YES      | OK                     |
| `milestones`               | YES          | YES      | OK                     |
| `sceneHistory`             | YES          | YES      | OK                     |
| `experiencePoints`         | **NO**       | YES      | Lost if DB fails       |
| `experienceToNext`         | **NO**       | YES      | Lost if DB fails       |
| `playerStatistics`         | **NO**       | YES      | Lost if DB fails       |
| `pendingMilestoneJournals` | **NO**       | **NO**   | Set not serializable   |
| `combat.*`                 | **NO**       | **NO**   | Not persisted anywhere |

**Issue:** If database load fails (network issue, offline), `experiencePoints`, `experienceToNext`, and `playerStatistics` will reset to defaults even though they're available in DB.

---

### 1. CRITICAL: Variables NOT Saved to Database

#### 1.1 maxPlayerHealth (HIGH PRIORITY)

- **Location:** `src/store/slices/player-resources.ts:22`
- **Default Value:** 100 (from `DEFAULT_RESOURCES` at line 71)
- **localStorage:** YES - saved via partialize (line 231)
- **Database:** NO - column missing, not saved, not loaded
- **Issue:** The database schema has `max_player_energy` but **NOT** `max_player_health`
- **Impact:** Max health bonuses are lost on different device/browser login (resets to 100)
- **Evidence - Schema Missing Column:**
  ```typescript
  // src/integrations/supabase/types.ts - game_states Row (lines 31-48)
  // Lists: player_health, player_energy, max_player_energy
  // MISSING: max_player_health
  ```
- **Evidence - Not Saved:**
  ```typescript
  // game-store.ts saveToSupabase() - LINE 848-853
  player_energy: resourceSnapshot.playerEnergy,
  max_player_energy: resourceSnapshot.maxPlayerEnergy,
  light_points: resourceSnapshot.lightPoints,
  shadow_points: resourceSnapshot.shadowPoints,
  player_health: resourceSnapshot.playerHealth,
  // max_player_health: resourceSnapshot.maxPlayerHealth  <-- MISSING!
  ```
- **Evidence - Not Loaded:**
  ```typescript
  // game-store.ts loadFromSupabase() - LINE 1091-1098
  usePlayerResources.getState().setAllResources({
    playerEnergy: (gameState as any).player_energy ?? currentResources.playerEnergy,
    maxPlayerEnergy: (gameState as any).max_player_energy ?? currentResources.maxPlayerEnergy,
    lightPoints: (gameState as any).light_points ?? currentResources.lightPoints,
    shadowPoints: (gameState as any).shadow_points ?? currentResources.shadowPoints,
    playerHealth: (gameState as any).player_health ?? currentResources.playerHealth,
    // maxPlayerHealth is NOT loaded - will use default 100 from player-resources.ts:71
  });
  ```

#### 1.2 Audio Player Track Index

- **Location:** `src/components/organisms/AudioPlayer.tsx:27`
- **Current State:** `const [currentIdx, setCurrentIdx] = useState(0);`
- **Issue:** Local component state only, not persisted anywhere
- **Impact:** Users lose their position in the 16-track playlist on every page refresh

#### 1.3 Audio Player Playing State

- **Location:** `src/components/organisms/AudioPlayer.tsx:28`
- **Current State:** `const [isPlaying, setIsPlaying] = useState(false);`
- **Issue:** Not persisted
- **Impact:** Music stops on navigation/refresh even if user was listening

#### 1.4 Pending Milestone Journals (Set)

- **Location:** `src/store/game-store.ts:162`
- **Type:** `Set<number>`
- **Issue:** Sets are not serialized to localStorage or DB
- **Impact:** Milestone journal prompts may re-appear or be lost after refresh
- **Evidence:**
  ```typescript
  pendingMilestoneJournals: new Set(),
  // In partialize() - this field is NOT included
  ```

---

### 2. Combat State - NOT Persisted to DB

#### 2.1 Legacy Combat State (game-store.ts:196-223)

The following combat state exists but is NOT saved to the database:

| Variable                     | Type                | Line | Persisted?                |
| ---------------------------- | ------------------- | ---- | ------------------------- |
| `combat.inCombat`            | boolean             | 197  | NO                        |
| `combat.currentEnemy`        | ShadowManifestation | 198  | NO                        |
| `combat.resources.lp`        | number              | 199  | NO (separate field saved) |
| `combat.resources.sp`        | number              | 199  | NO (separate field saved) |
| `combat.turn`                | number              | 200  | NO                        |
| `combat.log`                 | CombatLogEntry[]    | 201  | NO                        |
| `combat.sceneDC`             | number              | 204  | NO                        |
| `combat.damageMultiplier`    | number              | 207  | NO                        |
| `combat.damageReduction`     | number              | 208  | NO                        |
| `combat.healingBlocked`      | number              | 209  | NO                        |
| `combat.lpGenerationBlocked` | number              | 210  | NO                        |
| `combat.skipNextTurn`        | boolean             | 211  | NO                        |
| `combat.consecutiveEndures`  | number              | 212  | NO                        |
| `combat.preferredActions`    | Record              | 216  | NO                        |
| `combat.growthInsights`      | string[]            | 221  | NO                        |
| `combat.combatReflections`   | JournalEntry[]      | 222  | NO                        |

**Impact:** If a user refreshes during combat, all combat progress is lost.

#### 2.2 New Combat Store (combat-store.ts)

The following are saved to localStorage only (NOT database):

| Variable            | Type    | Line | localStorage | DB  |
| ------------------- | ------- | ---- | ------------ | --- |
| `resources.lp`      | number  | 431  | YES          | NO  |
| `resources.sp`      | number  | 431  | YES          | NO  |
| `playerHealth`      | number  | 432  | YES          | NO  |
| `playerLevel`       | number  | 433  | YES          | NO  |
| `playerEnergy`      | number  | 434  | YES          | NO  |
| `maxPlayerEnergy`   | number  | 435  | YES          | NO  |
| `preferredActions`  | Record  | 436  | YES          | NO  |
| `flags.newCombatUI` | boolean | 437  | YES          | NO  |

**Note:** These are combat session snapshots. The canonical resources are in `player-resources.ts`.

---

### 3. Unused Database Table: combat_history

**Location:** `src/integrations/supabase/types.ts:154-210`

The `combat_history` table has a complete schema but is **NEVER USED**:

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
  // ... Insert and Update types defined
}
```

**Evidence:** `grep "from('combat_history" *.ts` returns NO results.

**Impact:** Combat analytics and history are completely lost. This table was designed for therapeutic tracking but never implemented.

---

### 4. Player Resources Slice - localStorage Only

**Location:** `src/store/slices/player-resources.ts`

The shared resource store persists to localStorage (`luminari-player-resources`) but these values are synced TO the database via `game-store.ts` on save.

**HOWEVER:** The load from DB does NOT include `maxPlayerHealth`:

```typescript
// game-store.ts loadFromSupabase() - LINE 1091-1098
usePlayerResources.getState().setAllResources({
  playerEnergy: (gameState as any).player_energy ?? currentResources.playerEnergy,
  maxPlayerEnergy: (gameState as any).max_player_energy ?? currentResources.maxPlayerEnergy,
  lightPoints: (gameState as any).light_points ?? currentResources.lightPoints,
  shadowPoints: (gameState as any).shadow_points ?? currentResources.shadowPoints,
  playerHealth: (gameState as any).player_health ?? currentResources.playerHealth,
  // maxPlayerHealth is NOT loaded - uses default 100
});
```

---

### 5. Settings Store - Properly Implemented

**Location:** `src/store/settings-store.ts`

The settings store correctly saves to both localStorage AND the `user_settings` table:

| Setting Category | Fields                                                | localStorage | DB  |
| ---------------- | ----------------------------------------------------- | ------------ | --- |
| audio            | masterVolume, musicMuted, sfxMuted                    | YES          | YES |
| accessibility    | textSize, reducedMotion, highContrast                 | YES          | YES |
| ui               | combatUI, tooltipVerbosity                            | YES          | YES |
| tutorial         | hasSeenWelcome, hasSeenCombatIntro, dismissedTooltips | YES          | YES |

---

## Summary: What IS Being Saved vs What ISN'T

### SAVED TO DATABASE (game_states):

- [x] guardian_trust
- [x] player_level
- [x] current_scene_index
- [x] milestones (JSONB)
- [x] scene_history (JSONB)
- [x] player_energy
- [x] max_player_energy
- [x] light_points
- [x] shadow_points
- [x] player_health
- [x] experience_points
- [x] experience_to_next
- [x] player_statistics (JSONB)

### SAVED TO DATABASE (journal_entries):

- [x] All journal entries with full metadata

### SAVED TO DATABASE (user_settings):

- [x] audio_settings
- [x] accessibility
- [x] ui_preferences
- [x] tutorial_state

### NOT SAVED TO DATABASE:

- [ ] **maxPlayerHealth** (CRITICAL - affects gameplay, lost on cross-device login)
- [ ] **Audio track index** (user experience)
- [ ] **Audio playing state** (user experience)
- [ ] **pendingMilestoneJournals** (Set not serializable - lost everywhere)
- [ ] **All combat session state** (if user refreshes mid-combat)
- [ ] **preferredActions** (therapeutic analytics)
- [ ] **growthInsights** (therapeutic analytics)
- [ ] **combatReflections** (therapeutic content)
- [ ] **combat_history records** (table exists but unused)

### NOT SAVED TO localStorage (will reset if DB load fails):

- [ ] **experiencePoints** (DB only - no offline fallback)
- [ ] **experienceToNext** (DB only - no offline fallback)
- [ ] **playerStatistics** (DB only - no offline fallback)

---

## Recommended Fixes

### Priority 1 (Critical - Data Loss Issues):

1. **Add `max_player_health` column to `game_states` table**
   ```sql
   ALTER TABLE game_states ADD COLUMN max_player_health INTEGER DEFAULT 100;
   ```
2. **Update `saveToSupabase()` to include `maxPlayerHealth`** (game-store.ts ~line 853)
   ```typescript
   max_player_health: resourceSnapshot.maxPlayerHealth,
   ```
3. **Update `loadFromSupabase()` to load `maxPlayerHealth`** (game-store.ts ~line 1097)
   ```typescript
   maxPlayerHealth: (gameState as any).max_player_health ?? currentResources.maxPlayerHealth,
   ```
4. **Regenerate Supabase types** after schema change
   ```bash
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

### Priority 2 (High - Offline Resilience):

1. Add `experiencePoints`, `experienceToNext`, `playerStatistics` to game-store `partialize` function
2. Convert `pendingMilestoneJournals` from Set to Array for serialization
3. Implement `combat_history` table writes after each combat

### Priority 3 (Medium - Feature Completeness):

1. Add audio state to `user_settings` (current track index, volume position)
2. Save `preferredActions` to `player_statistics` JSONB
3. Save `growthInsights` and `combatReflections` to journal entries

### Priority 4 (Low - Nice to Have):

1. Consider adding mid-combat state recovery
2. Add combat log persistence for therapeutic review

---

## Files Analyzed

1. `src/store/game-store.ts` - Main game state management
2. `src/features/combat/store/combat-store.ts` - New combat system
3. `src/store/slices/player-resources.ts` - Shared resource state
4. `src/store/settings-store.ts` - User settings
5. `src/integrations/supabase/types.ts` - Database schema
6. `src/hooks/use-auto-save.ts` - Auto-save implementation
7. `src/components/organisms/AudioPlayer.tsx` - Audio player component
8. `src/types/domain/game.ts` - Game state types
9. `src/types/domain/combat.ts` - Combat state types

---

## Database Schema Migration Required

```sql
-- Add max_player_health to game_states
ALTER TABLE game_states
ADD COLUMN max_player_health INTEGER DEFAULT 100;
```

---

_End of Audit Report_
