# Database Schema Documentation

## Expected Database Tables

Based on analysis of `src/store/game-store.ts` saveToSupabase() and loadFromSupabase() functions.

### `game_states` table

Stores player's game progress with one record per user.

**Columns:**
- `user_id` - UUID, PRIMARY KEY, FOREIGN KEY to auth.users(id)
- `guardian_trust` - INTEGER, player's trust level (0-100)
- `player_level` - INTEGER, player's current level
- `current_scene_index` - INTEGER, current scene in progression
- `milestones` - JSONB, array of milestone objects
- `scene_history` - JSONB, array of completed scene objects
- `player_energy` - INTEGER, current player energy (0-max_player_energy), default 100
- `max_player_energy` - INTEGER, maximum player energy capacity, default 100
- `light_points` - INTEGER, light combat resource points, default 0
- `shadow_points` - INTEGER, shadow combat resource points, default 0
- `player_health` - INTEGER, player's health (0-100), default 100
- `experience_points` - INTEGER, total experience points earned, default 0
- `experience_to_next` - INTEGER, XP needed for next level, default 100
- `updated_at` - TIMESTAMP, last update time

**Constraints:**
- Unique constraint on user_id (one save per user)
- Upsert conflicts resolved on user_id
- Check constraint: player_energy >= 0
- Check constraint: max_player_energy > 0
- Check constraint: player_energy <= max_player_energy
- Check constraint: light_points >= 0
- Check constraint: shadow_points >= 0
- Check constraint: player_health >= 0 AND player_health <= 100
- Check constraint: guardian_trust >= 0 AND guardian_trust <= 100
- Check constraint: experience_points >= 0
- Check constraint: experience_to_next > 0

### `journal_entries` table

Stores player's therapeutic journal entries.

**Columns:**
- `id` - TEXT, PRIMARY KEY, unique identifier for each entry
- `user_id` - UUID, FOREIGN KEY to auth.users(id)
- `type` - TEXT, entry type ('milestone' | 'learning')
- `trust_level` - INTEGER, trust level when entry was created
- `content` - TEXT, journal entry content
- `title` - TEXT, entry title
- `scene_id` - TEXT, NULLABLE, associated scene identifier
- `tags` - JSONB, array of tags (can be empty array)
- `is_edited` - BOOLEAN, whether entry has been edited
- `created_at` - TIMESTAMP, entry creation time
- `edited_at` - TIMESTAMP, NULLABLE, last edit time

**Constraints:**
- Upsert conflicts resolved on id

## Row Level Security (RLS)

Both tables require RLS policies to ensure users can only access their own data:

- Enable RLS on both tables
- Users can SELECT/INSERT/UPDATE/DELETE only their own records (WHERE user_id = auth.uid())

### Detailed RLS Policies

**For `game_states` table:**
```sql
-- Enable RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Users can view own game state" ON game_states
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for INSERT
CREATE POLICY "Users can insert own game state" ON game_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE
CREATE POLICY "Users can update own game state" ON game_states
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for DELETE
CREATE POLICY "Users can delete own game state" ON game_states
  FOR DELETE USING (auth.uid() = user_id);
```

**For `journal_entries` table:**
```sql
-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for INSERT
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for DELETE
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

## Performance Indexes

**For `game_states` table:**
```sql
-- Primary key index (automatic)
-- user_id is already unique/primary key, no additional index needed

-- Index for updated_at for potential cleanup queries
CREATE INDEX idx_game_states_updated_at ON game_states(updated_at);

-- Index for player level for analytics and leaderboards
CREATE INDEX idx_game_states_player_level ON game_states(player_level);

-- Index for experience points for progression analytics
CREATE INDEX idx_game_states_experience_points ON game_states(experience_points);
```

**For `journal_entries` table:**
```sql
-- Primary key index (automatic)
-- user_id index for efficient user queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Composite index for user + creation time ordering
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);

-- Index for entry type filtering
CREATE INDEX idx_journal_entries_type ON journal_entries(type);

-- Index for scene association
CREATE INDEX idx_journal_entries_scene_id ON journal_entries(scene_id) WHERE scene_id IS NOT NULL;
```

## Data Types Reference

### Game System Fields

**Light & Shadow Combat System:**
- `light_points`: Positive emotional resources used in combat
- `shadow_points`: Challenges that can be transformed into growth opportunities

**Health & Energy Systems:**
- `player_health`: Overall player wellbeing (0-100), restored after combat
- `player_energy`: Action energy that regenerates over time (0-max_player_energy)
- `max_player_energy`: Maximum energy capacity, increases with level

**Experience & Progression:**
- `experience_points`: Total XP accumulated across all activities
- `experience_to_next`: XP remaining to reach next level (calculated dynamically)

**Milestone Object Structure:**
```json
{
  "id": "string",
  "level": "number",
  "label": "string", 
  "achieved": "boolean",
  "achievedAt": "number (timestamp)"
}
```

**CompletedScene Object Structure:**
```json
{
  "id": "string",
  "sceneId": "string",
  "type": "string (social|skill|combat|journal|exploration)",
  "title": "string",
  "success": "boolean",
  "roll": "number",
  "dc": "number", 
  "trustChange": "number",
  "completedAt": "number (timestamp)"
}
```

## Source Code References

- **Primary source**: `src/store/game-store.ts` saveToSupabase() and loadFromSupabase() functions
- **Game state interface**: `src/store/game-store.ts` GameState interface (lines ~219-252)
- **Save state types**: `src/store/game-store.ts` SaveState and SaveStatus types (lines ~31-39)
- **JournalEntry interface**: `src/components/JournalModal.tsx` 
- **Milestone interface**: `src/store/game-store.ts` Milestone interface (lines ~133-139)
- **CompletedScene interface**: `src/store/game-store.ts` CompletedScene interface (lines ~141-151)

## Recent Schema Migrations Applied

- `20250624000000_add_energy_fields.sql` - Added player_energy and max_player_energy columns
- `20250628000000_add_missing_point_columns.sql` - Added light_points, shadow_points, player_health
- Migration files location: `supabase/migrations/`

## Notes

- All new columns have been added to production via Supabase migrations
- Auto-save system implemented ensures regular data persistence
- Schema supports therapeutic RPG mechanics with combat, progression, and journaling systems 