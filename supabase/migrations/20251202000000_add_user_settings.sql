-- Migration: Add User Settings Table
-- Date: 2025-12-02
-- Purpose: Create user_settings table for cross-device settings persistence
-- Priority: P0 - Critical for cross-device UX

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_settings JSONB NOT NULL DEFAULT '{
    "masterVolume": 0.7,
    "musicMuted": false,
    "sfxMuted": false
  }'::jsonb,
  accessibility JSONB NOT NULL DEFAULT '{
    "textSize": "medium",
    "reducedMotion": false,
    "highContrast": false
  }'::jsonb,
  ui_preferences JSONB NOT NULL DEFAULT '{
    "combatUI": "new",
    "tooltipVerbosity": "normal"
  }'::jsonb,
  tutorial_state JSONB NOT NULL DEFAULT '{
    "hasSeenWelcome": false,
    "hasSeenCombatIntro": false,
    "dismissedTooltips": []
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add documentation comments
COMMENT ON TABLE public.user_settings IS 'User preferences and settings for cross-device persistence';
COMMENT ON COLUMN public.user_settings.audio_settings IS 'Audio configuration (volume, mute states)';
COMMENT ON COLUMN public.user_settings.accessibility IS 'Accessibility preferences (text size, motion, contrast)';
COMMENT ON COLUMN public.user_settings.ui_preferences IS 'UI customization (combat UI style, tooltip verbosity)';
COMMENT ON COLUMN public.user_settings.tutorial_state IS 'Tutorial and onboarding progress tracking';

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;

-- Verification
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_name = 'user_settings' AND table_schema = 'public') = 1;

  RAISE NOTICE 'Migration 20251202000000_add_user_settings completed successfully';
  RAISE NOTICE 'Created table: user_settings with RLS policies';
END $$;
