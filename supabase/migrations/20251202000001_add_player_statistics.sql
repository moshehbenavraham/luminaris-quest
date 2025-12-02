-- Migration: Add Player Statistics Column
-- Date: 2025-12-02
-- Purpose: Add player_statistics JSONB column to game_states for combat analytics
-- Priority: P1 - Critical for therapeutic analytics

-- Add player_statistics column to game_states table
ALTER TABLE public.game_states
ADD COLUMN IF NOT EXISTS player_statistics JSONB DEFAULT '{
  "combatActions": {
    "ILLUMINATE": 0,
    "REFLECT": 0,
    "ENDURE": 0,
    "EMBRACE": 0
  },
  "totalCombatsWon": 0,
  "totalCombatsLost": 0,
  "totalTurnsPlayed": 0,
  "averageCombatLength": 0
}'::jsonb;

-- Add documentation comment
COMMENT ON COLUMN public.game_states.player_statistics IS 'Aggregated player statistics for therapeutic analytics (combat actions, win/loss, turns played)';

-- Create GIN index for efficient JSONB queries on combat actions
CREATE INDEX IF NOT EXISTS idx_game_states_player_statistics
ON public.game_states USING GIN (player_statistics);

-- Backfill existing records with default values
UPDATE public.game_states
SET player_statistics = COALESCE(player_statistics, '{
  "combatActions": {
    "ILLUMINATE": 0,
    "REFLECT": 0,
    "ENDURE": 0,
    "EMBRACE": 0
  },
  "totalCombatsWon": 0,
  "totalCombatsLost": 0,
  "totalTurnsPlayed": 0,
  "averageCombatLength": 0
}'::jsonb)
WHERE player_statistics IS NULL;

-- Verification
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.columns
          WHERE table_name = 'game_states'
          AND column_name = 'player_statistics') = 1;

  RAISE NOTICE 'Migration 20251202000001_add_player_statistics completed successfully';
  RAISE NOTICE 'Added column: player_statistics JSONB to game_states';
END $$;
