/*
  # Database Test Function
  
  1. New Functions
    - `test_database_connection()` - Simple function to test database connectivity
    - Returns a JSON object with connection status and timestamp
  
  2. Purpose
    - Provides an easy way to verify database connectivity
    - Can be called without authentication for basic health checks
    - Useful for troubleshooting connection issues
*/

-- Create a simple function to test database connectivity
CREATE OR REPLACE FUNCTION public.test_database_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'connected',
    'timestamp', now(),
    'message', 'Database connection successful'
  );
END;
$$;

-- Allow public access to this function for health checks
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO anon;
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO service_role;

-- Comment on function
COMMENT ON FUNCTION public.test_database_connection() IS 'Simple function to test database connectivity';