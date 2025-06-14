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
- `updated_at` - TIMESTAMP, last update time

**Constraints:**
- Unique constraint on user_id (one save per user)
- Upsert conflicts resolved on user_id

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

- Primary source: `src/store/game-store.ts` lines 194-327
- JournalEntry interface: `src/components/JournalModal.tsx` lines 7-17
- Related interfaces: `src/store/game-store.ts` lines 8-25 