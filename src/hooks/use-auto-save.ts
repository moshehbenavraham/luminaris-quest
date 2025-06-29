// Built with Bolt.new
import { useEffect, useRef, useCallback } from 'react';
import { useGameStoreBase } from '@/store/game-store';
import { useSupabase } from '@/lib/providers/supabase-context';
import { createLogger } from '@/lib/environment';

const logger = createLogger('AutoSave');

// Configuration constants
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 5000; // 5 seconds after last change
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  debounceDelay?: number;
}

/**
 * Hook that automatically saves game state to Supabase when changes are detected
 * Includes debouncing, retry logic, and beforeunload handling
 */
export function useAutoSave(options: AutoSaveOptions = {}) {
  const {
    enabled = true,
    interval = AUTO_SAVE_INTERVAL,
    debounceDelay = DEBOUNCE_DELAY
  } = options;

  const { user } = useSupabase();
  const saveToSupabase = useGameStoreBase(state => state.saveToSupabase);
  const hasUnsavedChanges = useGameStoreBase(state => state.saveState.hasUnsavedChanges);
  const saveStatus = useGameStoreBase(state => state.saveState.status);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastSaveTimeRef = useRef(Date.now());

  /**
   * Perform save with retry logic
   */
  const performSave = useCallback(async () => {
    // Don't save if not enabled or no user
    if (!enabled || !user) {
      logger.debug('Auto-save skipped', { enabled, hasUser: !!user });
      return;
    }

    // Don't save if already saving
    if (saveStatus === 'saving') {
      logger.debug('Save already in progress, skipping auto-save');
      return;
    }

    // Don't save if no unsaved changes
    if (!hasUnsavedChanges) {
      logger.debug('No unsaved changes, skipping auto-save');
      return;
    }

    try {
      logger.info('Auto-save triggered', {
        retryCount: retryCountRef.current,
        timeSinceLastSave: Date.now() - lastSaveTimeRef.current
      });

      await saveToSupabase();
      
      // Reset retry count on success
      retryCountRef.current = 0;
      lastSaveTimeRef.current = Date.now();
      
      logger.info('Auto-save completed successfully');
    } catch (error) {
      logger.error('Auto-save failed', error);
      
      // Retry if under max attempts
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        
        logger.info(`Scheduling auto-save retry ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}`);
        
        // Schedule retry with exponential backoff
        const retryDelay = RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);
        setTimeout(() => {
          performSave();
        }, retryDelay);
      } else {
        logger.error('Auto-save max retries exceeded', {
          attempts: retryCountRef.current
        });
        // Reset retry count for next auto-save cycle
        retryCountRef.current = 0;
      }
    }
  }, [enabled, user, saveStatus, hasUnsavedChanges, saveToSupabase]);

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback(() => {
    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
    saveTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);
  }, [performSave, debounceDelay]);

  /**
   * Handle save on important events
   */
  const saveOnEvent = useCallback(() => {
    if (!enabled || !user || !hasUnsavedChanges) return;
    
    logger.debug('Event-triggered save requested');
    performSave();
  }, [enabled, user, hasUnsavedChanges, performSave]);

  /**
   * Handle beforeunload to save before leaving
   */
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges || !enabled || !user) return;

    // Try to save synchronously (best effort)
    logger.warn('Page unloading with unsaved changes, attempting save');
    
    // Show browser warning
    e.preventDefault();
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    
    // Attempt save (may not complete)
    performSave();
  }, [hasUnsavedChanges, enabled, user, performSave]);

  // Set up auto-save when changes are detected
  useEffect(() => {
    if (!enabled || !user) return;

    if (hasUnsavedChanges) {
      logger.debug('Unsaved changes detected, scheduling auto-save');
      debouncedSave();
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, debouncedSave, enabled, user]);

  // Set up periodic auto-save
  useEffect(() => {
    if (!enabled || !user) return;

    logger.info('Setting up periodic auto-save', { interval });

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges) {
        logger.debug('Periodic auto-save check - changes detected');
        performSave();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, user, interval, hasUnsavedChanges, performSave]);

  // Set up beforeunload handler
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, handleBeforeUnload]);

  // Expose manual save trigger for important events
  return {
    saveNow: saveOnEvent,
    saveStatus,
    hasUnsavedChanges
  };
}