-- Luminari's Quest Production Database Migration
-- ARCHIVED: This file has been moved to docs/migrations/ for historical reference
-- STATUS: This migration has been executed (or is ready for execution)
-- 
-- ORIGINAL PURPOSE: Run this entire SQL script in your production Supabase SQL editor
-- This creates all required tables, policies, and indexes
--
-- NOTE: After successful production migration, this file serves as:
-- - Historical documentation of the initial schema
-- - Disaster recovery reference
-- - Schema backup for new environment setup

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
CREATE POLICY "Users can read own game state" ON public.game_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state" ON public.game_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state" ON public.game_states
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own game state" ON public.game_states
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for journal_entries
CREATE POLICY "Users can read own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON public.journal_entries(type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_type ON public.journal_entries(user_id, type);
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON public.game_states(updated_at DESC);

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

-- Verify tables were created (run these queries to confirm)
-- SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('game_states', 'journal_entries');
-- Should return: 2

-- Verify policies were created (run this query to confirm)
-- SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('game_states', 'journal_entries');
-- Should return: 8

-- Verify indexes were created (run this query to confirm)
-- SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('game_states', 'journal_entries');
-- Should return: 7 (including primary key indexes)