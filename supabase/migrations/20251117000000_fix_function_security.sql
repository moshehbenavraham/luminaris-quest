/*
  # Fix Function Security Warnings

  This migration fixes Supabase linter warnings about mutable search_path in functions.

  ## Changes
  1. Update `update_updated_at_column()` to set search_path
  2. Update `test_database_connection()` to set search_path

  ## Security
  - Setting search_path prevents search_path injection attacks
  - SECURITY DEFINER functions run with creator's privileges, so search_path must be locked down

  Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
*/

-- Fix update_updated_at_column function
-- Add SET search_path to prevent search_path injection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column on row updates';

-- Fix test_database_connection function
-- Add SET search_path to prevent search_path injection
CREATE OR REPLACE FUNCTION public.test_database_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'connected',
    'timestamp', now(),
    'message', 'Database connection successful'
  );
END;
$$;

COMMENT ON FUNCTION public.test_database_connection() IS 'Simple function to test database connectivity';

-- Ensure permissions are maintained
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO anon;
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO service_role;
