/*
  # Journal Persistence Test Functions

  1. New Functions
    - `test_journal_persistence` - Tests journal entry CRUD operations
    - `get_journal_entries_for_user` - Helper function to retrieve user's journal entries
  
  2. Security
    - Functions are secured with RLS-compatible permissions
    - Only authenticated users can access their own data
    
  3. Purpose
    - Provides diagnostic tools to verify journal persistence
    - Helps isolate database vs. application issues
    - Enables direct testing of journal operations
*/

-- Function to test journal entry persistence
CREATE OR REPLACE FUNCTION public.test_journal_persistence(
  test_content TEXT DEFAULT 'Test journal entry',
  test_title TEXT DEFAULT 'Test Entry'
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
  start_time timestamptz;
  end_time timestamptz;
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
  
  -- Start timing
  start_time := clock_timestamp();
  
  -- Generate a unique ID for test entry
  test_entry_id := 'test-' || gen_random_uuid()::text;
  
  -- Insert test journal entry
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
    test_content,
    test_title,
    '["test", "diagnostic"]'::jsonb,
    now()
  );
  
  -- Verify entry was created
  IF NOT EXISTS (SELECT 1 FROM public.journal_entries WHERE id = test_entry_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Failed to create test journal entry',
      'timestamp', now()
    );
  END IF;
  
  -- Update the entry
  UPDATE public.journal_entries
  SET 
    content = test_content || ' (updated)',
    is_edited = true,
    edited_at = now()
  WHERE id = test_entry_id;
  
  -- Delete the test entry
  DELETE FROM public.journal_entries
  WHERE id = test_entry_id;
  
  -- End timing
  end_time := clock_timestamp();
  
  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'message', 'Journal persistence test completed successfully',
    'operations', jsonb_build_object(
      'create', true,
      'update', true,
      'delete', true
    ),
    'timing_ms', extract(millisecond from (end_time - start_time)),
    'timestamp', now(),
    'user_id', current_user_id,
    'test_entry_id', test_entry_id
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error during journal persistence test: ' || SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', now()
  );
END;
$$;

-- Function to get journal entries for the current user
CREATE OR REPLACE FUNCTION public.get_journal_entries_for_user(
  limit_count integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  entries jsonb;
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
  
  -- Get entries for user
  SELECT jsonb_agg(row_to_json(e))
  INTO entries
  FROM (
    SELECT 
      id,
      type,
      trust_level,
      content,
      title,
      scene_id,
      tags,
      is_edited,
      created_at,
      edited_at
    FROM public.journal_entries
    WHERE user_id = current_user_id
    ORDER BY created_at DESC
    LIMIT limit_count
  ) e;
  
  -- Handle case with no entries
  IF entries IS NULL THEN
    entries := '[]'::jsonb;
  END IF;
  
  -- Return entries
  RETURN jsonb_build_object(
    'success', true,
    'count', jsonb_array_length(entries),
    'entries', entries,
    'timestamp', now()
  );
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error retrieving journal entries: ' || SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', now()
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.test_journal_persistence(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_journal_entries_for_user(integer) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.test_journal_persistence IS 'Tests journal entry persistence with create, update, and delete operations';
COMMENT ON FUNCTION public.get_journal_entries_for_user IS 'Retrieves journal entries for the current authenticated user';