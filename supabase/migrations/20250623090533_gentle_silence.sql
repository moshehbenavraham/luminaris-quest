/*
  # Database Diagnostic Functions
  
  1. New Functions
    - `diagnose_database_connection`: Comprehensive connection diagnostics
    - `diagnose_journal_save`: Tests journal save operation with detailed error reporting
    - `diagnose_auth_status`: Checks authentication status and permissions
  
  2. Security
    - All functions are SECURITY DEFINER to ensure proper execution
    - Appropriate GRANT EXECUTE permissions for authenticated users
  
  3. Purpose
    - Provides detailed diagnostics for database connection issues
    - Helps identify specific problems with journal persistence
    - Validates authentication and permission settings
*/

-- Function to diagnose database connection issues
CREATE OR REPLACE FUNCTION public.diagnose_database_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  current_user_id uuid;
  auth_role text;
  db_version text;
  table_info jsonb;
  policy_info jsonb;
BEGIN
  -- Get current user and role information
  current_user_id := auth.uid();
  SELECT current_role INTO auth_role;
  
  -- Get database version
  SELECT version() INTO db_version;
  
  -- Get table information
  SELECT jsonb_build_object(
    'game_states_exists', (SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'game_states'
    )),
    'journal_entries_exists', (SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'journal_entries'
    )),
    'game_states_columns', (
      SELECT jsonb_agg(jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      ))
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'game_states'
    ),
    'journal_entries_columns', (
      SELECT jsonb_agg(jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      ))
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'journal_entries'
    )
  ) INTO table_info;
  
  -- Get policy information
  SELECT jsonb_build_object(
    'game_states_policies', (
      SELECT jsonb_agg(jsonb_build_object(
        'policyname', policyname,
        'permissive', permissive,
        'roles', roles,
        'cmd', cmd
      ))
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'game_states'
    ),
    'journal_entries_policies', (
      SELECT jsonb_agg(jsonb_build_object(
        'policyname', policyname,
        'permissive', permissive,
        'roles', roles,
        'cmd', cmd
      ))
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'journal_entries'
    )
  ) INTO policy_info;
  
  -- Build comprehensive result
  result := jsonb_build_object(
    'timestamp', now(),
    'auth', jsonb_build_object(
      'user_id', current_user_id,
      'role', auth_role,
      'is_authenticated', current_user_id IS NOT NULL
    ),
    'database', jsonb_build_object(
      'version', db_version,
      'connection', 'successful'
    ),
    'tables', table_info,
    'policies', policy_info
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error during database diagnosis: ' || SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', now()
  );
END;
$$;

-- Function to diagnose journal save issues
CREATE OR REPLACE FUNCTION public.diagnose_journal_save(
  test_id TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  test_entry_id text;
  result jsonb;
  can_insert boolean;
  can_select boolean;
  can_update boolean;
  can_delete boolean;
  insert_error text;
  select_error text;
  update_error text;
  delete_error text;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Verify user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Authentication required',
      'timestamp', now()
    );
  END IF;
  
  -- Generate a unique ID for test entry if not provided
  test_entry_id := COALESCE(test_id, 'diag-' || gen_random_uuid()::text);
  
  -- Test INSERT permission
  BEGIN
    INSERT INTO public.journal_entries (
      id,
      user_id,
      type,
      trust_level,
      content,
      title,
      tags,
      created_at
    ) VALUES (
      test_entry_id,
      current_user_id,
      'learning',
      50,
      'Diagnostic test entry',
      'Diagnostic Test',
      '["diagnostic", "test"]'::jsonb,
      now()
    );
    can_insert := true;
  EXCEPTION WHEN OTHERS THEN
    can_insert := false;
    insert_error := SQLERRM;
  END;
  
  -- Test SELECT permission
  BEGIN
    PERFORM 1 FROM public.journal_entries WHERE id = test_entry_id;
    can_select := true;
  EXCEPTION WHEN OTHERS THEN
    can_select := false;
    select_error := SQLERRM;
  END;
  
  -- Test UPDATE permission (only if insert succeeded)
  IF can_insert THEN
    BEGIN
      UPDATE public.journal_entries
      SET 
        content = 'Updated diagnostic test entry',
        is_edited = true,
        edited_at = now()
      WHERE id = test_entry_id;
      can_update := true;
    EXCEPTION WHEN OTHERS THEN
      can_update := false;
      update_error := SQLERRM;
    END;
  ELSE
    can_update := false;
    update_error := 'Insert failed, cannot test update';
  END IF;
  
  -- Test DELETE permission (only if insert succeeded)
  IF can_insert THEN
    BEGIN
      DELETE FROM public.journal_entries
      WHERE id = test_entry_id;
      can_delete := true;
    EXCEPTION WHEN OTHERS THEN
      can_delete := false;
      delete_error := SQLERRM;
    END;
  ELSE
    can_delete := false;
    delete_error := 'Insert failed, cannot test delete';
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', now(),
    'user_id', current_user_id,
    'test_entry_id', test_entry_id,
    'permissions', jsonb_build_object(
      'can_insert', can_insert,
      'can_select', can_select,
      'can_update', can_update,
      'can_delete', can_delete
    ),
    'errors', jsonb_build_object(
      'insert_error', insert_error,
      'select_error', select_error,
      'update_error', update_error,
      'delete_error', delete_error
    ),
    'success', can_insert AND can_select AND can_update AND can_delete
  );
  
  RETURN result;
END;
$$;

-- Function to diagnose authentication status
CREATE OR REPLACE FUNCTION public.diagnose_auth_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  auth_role text;
  result jsonb;
BEGIN
  -- Get current user and role information
  current_user_id := auth.uid();
  SELECT current_role INTO auth_role;
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', now(),
    'auth', jsonb_build_object(
      'user_id', current_user_id,
      'role', auth_role,
      'is_authenticated', current_user_id IS NOT NULL
    )
  );
  
  -- Check if user exists in auth.users
  IF current_user_id IS NOT NULL THEN
    result := result || jsonb_build_object(
      'user_exists_in_auth', (
        SELECT EXISTS (
          SELECT 1 FROM auth.users WHERE id = current_user_id
        )
      )
    );
  END IF;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error during auth diagnosis: ' || SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', now()
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.diagnose_database_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.diagnose_journal_save(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.diagnose_auth_status() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.diagnose_database_connection IS 'Comprehensive database connection diagnostics';
COMMENT ON FUNCTION public.diagnose_journal_save IS 'Tests journal save operation with detailed error reporting';
COMMENT ON FUNCTION public.diagnose_auth_status IS 'Checks authentication status and permissions';