import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase project values instead of environment variables
const supabaseUrl = 'https://lxjetnrmjyazegwnymkk.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4amV0bnJtanlhemVnd255bWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzY5OTgsImV4cCI6MjA2NDY1Mjk5OH0.qR888X8VCTMLFk2udqZx0zxEsHY_BvSzOdfxJo2DA3g';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export validation function for runtime checks
export const isSupabaseConfigured = () => {
  return true; // Always configured since we have hardcoded values
};
