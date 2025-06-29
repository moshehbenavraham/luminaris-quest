// Built with Bolt.new
import { createContext, useContext } from 'react';
import { type User } from '@supabase/supabase-js';

export type SupabaseContextType = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};

export const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
