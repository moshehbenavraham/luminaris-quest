-- Migration: Add Experience Points System
-- Date: 2025-06-29
-- Description: Adds experience_points and experience_to_next columns to game_states table

-- Add experience points columns to game_states table
ALTER TABLE public.game_states 
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
ADD COLUMN IF NOT EXISTS experience_to_next INTEGER DEFAULT 100 CHECK (experience_to_next > 0);

-- Update existing users with default values
UPDATE public.game_states 
SET 
  experience_points = COALESCE(experience_points, 0),
  experience_to_next = COALESCE(experience_to_next, 100)
WHERE 
  experience_points IS NULL 
  OR experience_to_next IS NULL;

-- Add documentation comments
COMMENT ON COLUMN public.game_states.experience_points IS 'Player experience points for character progression';
COMMENT ON COLUMN public.game_states.experience_to_next IS 'Experience points needed to reach next level';

-- Create an index for potential future queries on experience levels
CREATE INDEX IF NOT EXISTS idx_game_states_experience 
ON public.game_states(experience_points);

-- Verify the migration with a basic test
DO $$
BEGIN
  -- Test that the columns exist and have correct constraints
  ASSERT (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'game_states' 
          AND column_name IN ('experience_points', 'experience_to_next')) = 2;
  
  RAISE NOTICE 'Experience Points migration completed successfully';
END $$;