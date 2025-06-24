import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file includes VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create a simple supabase client specifically for diagnostic RPC calls
// This bypasses the strict typing that prevents RPC calls in the enhanced client
export const supabaseDiagnostics = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
