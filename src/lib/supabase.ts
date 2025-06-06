import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create default values for build time
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

// Use actual values if available, otherwise use defaults for build
const url = supabaseUrl || defaultUrl;
const key = supabaseAnonKey || defaultKey;

// Validate at runtime only (not during build)
const validateEnvironment = () => {
  if (!supabaseUrl) {
    console.error(
      'Missing VITE_SUPABASE_URL environment variable. Please check your .env file and ensure it contains your Supabase project URL.'
    );
    return false;
  }

  if (!supabaseAnonKey) {
    console.error(
      'Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file and ensure it contains your Supabase anonymous key.'
    );
    return false;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    console.error(
      'Invalid VITE_SUPABASE_URL format. Please ensure it is a valid URL (e.g., https://your-project.supabase.co)'
    );
    return false;
  }

  return true;
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export validation function for runtime checks
export const isSupabaseConfigured = validateEnvironment;

// Validate environment in development/production (not during build)
if (typeof window !== 'undefined') {
  validateEnvironment();
}