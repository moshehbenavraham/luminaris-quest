/*
  # Initial Game Database Schema

  1. New Tables
    - `game_states` - Stores player progress with one record per user
      - `user_id` - UUID, PRIMARY KEY, FOREIGN KEY to auth.users(id)
      - `guardian_trust` - INTEGER, player's trust level (0-100)
      - `player_level` - INTEGER, player's current level
      - `current_scene_index` - INTEGER, current scene in progression
      - `milestones` - JSONB, array of milestone objects
      - `scene_history` - JSONB, array of completed scene objects
      - `updated_at` - TIMESTAMP, last update time
    
    - `journal_entries` - Stores player's therapeutic journal entries
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

  2. Security
    - Enable RLS on both tables
    - Create policies for SELECT/INSERT/UPDATE/DELETE operations
    - Users can only access their own data (WHERE user_id = auth.uid())

  3. Performance
    - Add indexes for common query patterns
    - Optimize for user-specific data access
*/

-- Create game_states table
CREATE TABLE IF NOT EXISTS public.game_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_trust INTEGER NOT NULL DEFAULT 50 CHECK (guardian_trust >= 0 AND guardian_trust <= 100),
  player_level INTEGER NOT NULL DEFAULT 1 CHECK (player_level >= 1),
  current_scene_index INTEGER NOT NULL DEFAULT 0 CHECK (current_scene_index >= 0),
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  scene_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('milestone', 'learning')),
  trust_level INTEGER NOT NULL CHECK (trust_level >= 0 AND trust_level <= 100),
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  scene_id TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game_states
CREATE POLICY "Users can view own game state" ON public.game_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state" ON public.game_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state" ON public.game_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game state" ON public.game_states
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON public.game_states(updated_at);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON public.journal_entries(type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_scene_id ON public.journal_entries(scene_id) WHERE scene_id IS NOT NULL;

-- Create updated_at trigger for game_states
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON public.game_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();