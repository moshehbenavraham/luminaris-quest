/*
  # Add Energy Fields to Game States
  
  1. Changes
    - Add player_energy column to game_states table (default 100)
    - Add max_player_energy column to game_states table (default 100)
    
  2. Purpose
    - Persist player energy state between sessions
    - Support energy system gameplay mechanics
    
  3. Notes
    - Default values ensure backward compatibility
    - Values are clamped between 0 and max
*/

-- Add energy columns to game_states table
ALTER TABLE public.game_states 
ADD COLUMN IF NOT EXISTS player_energy INTEGER DEFAULT 100 CHECK (player_energy >= 0),
ADD COLUMN IF NOT EXISTS max_player_energy INTEGER DEFAULT 100 CHECK (max_player_energy > 0);

-- Add check constraint to ensure player_energy doesn't exceed max
ALTER TABLE public.game_states
ADD CONSTRAINT check_energy_bounds 
CHECK (player_energy <= max_player_energy);

-- Add comments for documentation
COMMENT ON COLUMN public.game_states.player_energy IS 'Current player energy (0 to max_player_energy)';
COMMENT ON COLUMN public.game_states.max_player_energy IS 'Maximum player energy capacity'; 