-- Migration: Add Combat History Table
-- Date: 2025-12-02
-- Purpose: Create combat_history table for battle replay and therapeutic review
-- Priority: P1 - Feature enhancement for therapeutic analytics

-- Create combat_history table
CREATE TABLE IF NOT EXISTS public.combat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_entry_id TEXT REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  enemy_id TEXT NOT NULL,
  enemy_name TEXT NOT NULL,
  victory BOOLEAN NOT NULL,
  turns_taken INTEGER NOT NULL CHECK (turns_taken > 0),
  final_player_hp INTEGER NOT NULL CHECK (final_player_hp >= 0),
  final_enemy_hp INTEGER NOT NULL CHECK (final_enemy_hp >= 0),
  resources_start JSONB NOT NULL,
  resources_end JSONB NOT NULL,
  actions_used JSONB NOT NULL,
  combat_log JSONB,
  player_level INTEGER NOT NULL,
  scene_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add documentation comments
COMMENT ON TABLE public.combat_history IS 'Historical record of all combat encounters for therapeutic review and analytics';
COMMENT ON COLUMN public.combat_history.enemy_id IS 'Shadow manifestation type identifier';
COMMENT ON COLUMN public.combat_history.resources_start IS 'LP/SP at combat start: { "lp": number, "sp": number }';
COMMENT ON COLUMN public.combat_history.resources_end IS 'LP/SP at combat end: { "lp": number, "sp": number }';
COMMENT ON COLUMN public.combat_history.actions_used IS 'Count of each action type: { "ILLUMINATE": n, "REFLECT": n, "ENDURE": n, "EMBRACE": n }';
COMMENT ON COLUMN public.combat_history.combat_log IS 'Full turn-by-turn combat log for replay feature';

-- Enable Row Level Security
ALTER TABLE public.combat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own combat history" ON public.combat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own combat history" ON public.combat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: No UPDATE or DELETE policies - combat history is append-only for data integrity

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_combat_history_user_id ON public.combat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_combat_history_created_at ON public.combat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_combat_history_journal_entry ON public.combat_history(journal_entry_id)
  WHERE journal_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_combat_history_victory ON public.combat_history(user_id, victory);

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_combat_history_actions_used
ON public.combat_history USING GIN (actions_used);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON public.combat_history TO authenticated;

-- Verification
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_name = 'combat_history' AND table_schema = 'public') = 1;

  RAISE NOTICE 'Migration 20251202000002_add_combat_history completed successfully';
  RAISE NOTICE 'Created table: combat_history with RLS policies and indexes';
END $$;
