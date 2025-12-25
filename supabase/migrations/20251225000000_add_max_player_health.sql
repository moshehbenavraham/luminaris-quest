-- Migration: Add max_player_health column to game_states
-- Session: phase00-session01-schema_and_types
-- Date: 2025-12-25
-- Description: Adds the missing max_player_health column to enable complete
--              cross-device state synchronization. This fixes a data persistence
--              bug where players lose max health upgrades when switching devices.

-- T005: Add column only if it does not exist (idempotent)
-- T006: IF NOT EXISTS guard for safe re-runs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'game_states'
    AND column_name = 'max_player_health'
  ) THEN
    ALTER TABLE public.game_states
    ADD COLUMN max_player_health INTEGER DEFAULT 100;

    RAISE NOTICE 'Column max_player_health added successfully';
  ELSE
    RAISE NOTICE 'Column max_player_health already exists, skipping';
  END IF;
END $$;

-- T008: Verification block - confirm column was created correctly
DO $$
DECLARE
  col_exists BOOLEAN;
  col_default TEXT;
BEGIN
  -- Check column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'game_states'
    AND column_name = 'max_player_health'
    AND data_type = 'integer'
  ) INTO col_exists;

  IF NOT col_exists THEN
    RAISE EXCEPTION 'MIGRATION VERIFICATION FAILED: max_player_health column not found or wrong type';
  END IF;

  -- Check default value
  SELECT column_default FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'game_states'
  AND column_name = 'max_player_health'
  INTO col_default;

  IF col_default IS NULL OR col_default NOT LIKE '%100%' THEN
    RAISE WARNING 'Column default may not be 100 as expected: %', col_default;
  END IF;

  RAISE NOTICE 'MIGRATION VERIFICATION PASSED: max_player_health column exists with correct type';
END $$;

-- T007: Rollback instructions (do not execute - for reference only)
-- To rollback this migration:
-- ALTER TABLE public.game_states DROP COLUMN IF EXISTS max_player_health;
