/*
 * MIT License
 
 * Database diagnostic utilities for Luminari's Quest
 * 
 * Features:
 * - Comprehensive database connection diagnostics
 * - Journal save operation testing with detailed error reporting
 * - Authentication status and permissions checking
 */

import { supabaseDiagnostics as supabase } from '@/lib/supabase-diagnostics';
import { createLogger } from '@/lib/environment';

const logger = createLogger('DatabaseDiagnostics');

/**
 * Run comprehensive database diagnostics
 * This provides detailed information about database connection, tables, and policies
 */
export async function runDatabaseDiagnostics(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Running comprehensive database diagnostics');
    
    // Call the diagnose_database_connection function
    const { data, error } = await (supabase as any).rpc('diagnose_database_connection');
    
    if (error) {
      logger.error('Database diagnostics failed', error);
      return {
        success: false,
        message: `Database diagnostics failed: ${error.message}`,
        error
      };
    }
    
    logger.info('Database diagnostics successful', {
      isAuthenticated: data.auth?.is_authenticated,
      tablesExist: data.tables?.game_states_exists && data.tables?.journal_entries_exists
    });
    
    return {
      success: true,
      message: 'Database diagnostics successful',
      data
    };
  } catch (error: any) {
    logger.error('Database diagnostics threw exception', error);
    return {
      success: false,
      message: `Exception during database diagnostics: ${error.message}`,
      error
    };
  }
}

/**
 * Diagnose journal save issues
 * This tests the journal save operation with detailed error reporting
 */
export async function diagnoseJournalSave(testId?: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Diagnosing journal save issues');
    
    // Call the diagnose_journal_save function
    const { data, error } = await (supabase as any).rpc('diagnose_journal_save', {
      test_id: testId
    });
    
    if (error) {
      logger.error('Journal save diagnosis failed', error);
      return {
        success: false,
        message: `Journal save diagnosis failed: ${error.message}`,
        error
      };
    }
    
    const allPermissions = data.permissions?.can_insert && 
                          data.permissions?.can_select && 
                          data.permissions?.can_update && 
                          data.permissions?.can_delete;
    
    logger.info('Journal save diagnosis successful', {
      success: data.success,
      allPermissions,
      permissions: data.permissions
    });
    
    return {
      success: data.success,
      message: allPermissions 
        ? 'Journal save diagnosis successful - all permissions granted' 
        : 'Journal save diagnosis failed - missing permissions',
      data
    };
  } catch (error: any) {
    logger.error('Journal save diagnosis threw exception', error);
    return {
      success: false,
      message: `Exception during journal save diagnosis: ${error.message}`,
      error
    };
  }
}

/**
 * Check authentication status
 * This verifies the current user's authentication status and permissions
 */
export async function checkAuthStatus(): Promise<{
  success: boolean;
  message: string;
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Checking authentication status');
    
    // Call the diagnose_auth_status function
    const { data, error } = await (supabase as any).rpc('diagnose_auth_status');
    
    if (error) {
      logger.error('Auth status check failed', error);
      return {
        success: false,
        message: `Auth status check failed: ${error.message}`,
        isAuthenticated: false,
        error
      };
    }
    
    const isAuthenticated = data.auth?.is_authenticated || false;
    
    logger.info('Auth status check successful', {
      isAuthenticated,
      userId: data.auth?.user_id,
      role: data.auth?.role
    });
    
    return {
      success: true,
      message: isAuthenticated 
        ? 'User is authenticated' 
        : 'User is not authenticated',
      isAuthenticated,
      userId: data.auth?.user_id,
      role: data.auth?.role,
      data
    };
  } catch (error: any) {
    logger.error('Auth status check threw exception', error);
    return {
      success: false,
      message: `Exception during auth status check: ${error.message}`,
      isAuthenticated: false,
      error
    };
  }
}

/**
 * Run all diagnostic tests
 * This runs all diagnostic functions and returns a comprehensive result
 */
export async function runAllDiagnostics(): Promise<{
  overallSuccess: boolean;
  databaseDiagnostics: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  journalSaveDiagnostics: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  authStatusCheck: {
    success: boolean;
    message: string;
    isAuthenticated: boolean;
    userId?: string;
    role?: string;
    data?: any;
    error?: any;
  };
}> {
  const databaseDiagnostics = await runDatabaseDiagnostics();
  const journalSaveDiagnostics = await diagnoseJournalSave();
  const authStatusCheck = await checkAuthStatus();
  
  return {
    overallSuccess: databaseDiagnostics.success && journalSaveDiagnostics.success && authStatusCheck.success,
    databaseDiagnostics,
    journalSaveDiagnostics,
    authStatusCheck
  };
}