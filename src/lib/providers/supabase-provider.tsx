import { useEffect, useState, useRef, type PropsWithChildren } from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseContext } from './supabase-context';
import { useSettingsStoreBase } from '@/store/settings-store';

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  // Load user settings when user changes
  useEffect(() => {
    const currentUserId = user?.id ?? null;

    // Only load settings when user ID actually changes (login/logout)
    if (currentUserId !== previousUserIdRef.current) {
      previousUserIdRef.current = currentUserId;

      if (currentUserId) {
        // User logged in - load their settings from Supabase
        useSettingsStoreBase.getState().loadFromSupabase();
      }
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        setLoading(true);
        // Check initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_, session) => {
          if (mounted) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setLoading(false);
        }
      }
    }

    initializeAuth();
  }, []);

  return (
    <SupabaseContext.Provider value={{ user, loading, error }}>{children}</SupabaseContext.Provider>
  );
}
