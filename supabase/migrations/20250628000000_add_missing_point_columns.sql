-- Migration: Add Missing Point Columns
-- Date: 2025-06-28
-- Purpose: Add core combat resource columns that are currently only stored in localStorage
-- Critical: Fixes data loss issue when users switch devices or clear browser data

-- Add missing columns to game_states table
ALTER TABLE public.game_states 
ADD COLUMN IF NOT EXISTS light_points INTEGER DEFAULT 0 CHECK (light_points >= 0),
ADD COLUMN IF NOT EXISTS shadow_points INTEGER DEFAULT 0 CHECK (shadow_points >= 0),
ADD COLUMN IF NOT EXISTS player_health INTEGER DEFAULT 100 CHECK (player_health >= 0 AND player_health <= 100);

-- Add comment documentation for new columns
COMMENT ON COLUMN public.game_states.light_points IS 'Positive emotional resources for combat actions (LP)';
COMMENT ON COLUMN public.game_states.shadow_points IS 'Challenge growth resources that can become opportunities (SP)';
COMMENT ON COLUMN public.game_states.player_health IS 'Player life force system (0-100)';

-- Create index for common queries involving these point values
CREATE INDEX IF NOT EXISTS idx_game_states_points ON public.game_states 
(user_id, light_points, shadow_points, player_health);

-- Update RLS policies to include new columns (inherit existing policies)
-- Note: RLS policies already cover all columns via (*) selector, so no changes needed

-- Backfill existing records with default values (safe operation since columns have defaults)
-- This ensures existing users get proper starting values
UPDATE public.game_states 
SET 
  light_points = COALESCE(light_points, 0),
  shadow_points = COALESCE(shadow_points, 0),
  player_health = COALESCE(player_health, 100)
WHERE 
  light_points IS NULL 
  OR shadow_points IS NULL 
  OR player_health IS NULL;

-- Add constraint to ensure data integrity across related fields
-- Note: We don't add cross-field constraints yet to avoid breaking existing data
-- This will be handled in Phase 2 with validation middleware

-- Grant necessary permissions (match existing patterns)
GRANT SELECT, INSERT, UPDATE ON public.game_states TO authenticated;

-- Success confirmation
DO $$ 
BEGIN 
  RAISE NOTICE 'Migration 20250628000000_add_missing_point_columns completed successfully';
  RAISE NOTICE 'Added columns: light_points, shadow_points, player_health';
  RAISE NOTICE 'All columns have appropriate CHECK constraints and default values';
END $$;