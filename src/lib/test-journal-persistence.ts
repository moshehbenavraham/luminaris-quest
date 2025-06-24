/*
 * MIT License
 * Built with Bolt.new
 * Journal persistence testing utilities for Luminari's Quest
 * 
 * Features:
 * - Direct database testing of journal entry persistence
 * - Diagnostic functions for troubleshooting
 * - RPC function calls for testing without UI
 */

import { supabaseDiagnostics as supabase } from '@/lib/supabase-diagnostics';
import { createLogger } from '@/lib/environment';

const logger = createLogger('JournalPersistenceTest');

/**
 * Test journal entry persistence using database functions
 * This bypasses the application code to test database functionality directly
 */
export async function testJournalPersistence(
  testContent: string = 'Test journal entry from client',
  testTitle: string = 'Client Test Entry'
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Testing journal persistence via RPC');
    
    // Call the test_journal_persistence function
    const { data, error } = await (supabase as any).rpc('test_journal_persistence', {
      test_content: testContent,
      test_title: testTitle
    });
    
    if (error) {
      logger.error('Journal persistence test failed', error);
      return {
        success: false,
        message: `Journal persistence test failed: ${error.message}`,
        error
      };
    }
    
    logger.info('Journal persistence test successful', data);
    return {
      success: true,
      message: 'Journal persistence test successful',
      data
    };
  } catch (error: any) {
    logger.error('Journal persistence test threw exception', error);
    return {
      success: false,
      message: `Exception during journal persistence test: ${error.message}`,
      error
    };
  }
}

/**
 * Get journal entries for the current user
 * This is useful for verifying that entries are being saved correctly
 */
export async function getJournalEntries(
  limit: number = 10
): Promise<{
  success: boolean;
  message: string;
  entries?: any[];
  count?: number;
  error?: any;
}> {
  try {
    logger.debug('Getting journal entries via RPC');
    
    // Call the get_journal_entries_for_user function
    const { data, error } = await (supabase as any).rpc('get_journal_entries_for_user', {
      limit_count: limit
    });
    
    if (error) {
      logger.error('Failed to get journal entries', error);
      return {
        success: false,
        message: `Failed to get journal entries: ${error.message}`,
        error
      };
    }
    
    logger.info('Successfully retrieved journal entries', {
      count: data.count,
      success: data.success
    });
    
    return {
      success: true,
      message: 'Journal entries retrieved successfully',
      entries: data.entries || [],
      count: data.count || 0
    };
  } catch (error: any) {
    logger.error('Get journal entries threw exception', error);
    return {
      success: false,
      message: `Exception while getting journal entries: ${error.message}`,
      error
    };
  }
}

/**
 * Test direct journal entry creation using the Supabase client
 * This tests the application's data format against the database schema
 */
export async function testDirectJournalCreation(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Testing direct journal creation');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: 'Authentication required for journal creation test',
        error: userError
      };
    }
    
    // Create a test entry ID
    const testEntryId = `direct-test-${Date.now()}`;
    
    // Create a test journal entry
    const { data, error } = await supabase.from('journal_entries').insert({
      id: testEntryId,
      user_id: user.id,
      type: 'learning',
      trust_level: 50,
      content: 'Direct test journal entry',
      title: 'Direct Test',
      tags: ['direct', 'test'],
      created_at: new Date().toISOString()
    }).select();
    
    if (error) {
      logger.error('Direct journal creation failed', error);
      return {
        success: false,
        message: `Direct journal creation failed: ${error.message}`,
        error
      };
    }
    
    // Delete the test entry to clean up
    await supabase.from('journal_entries').delete().eq('id', testEntryId);
    
    logger.info('Direct journal creation test successful');
    return {
      success: true,
      message: 'Direct journal creation test successful',
      data
    };
  } catch (error: any) {
    logger.error('Direct journal creation test threw exception', error);
    return {
      success: false,
      message: `Exception during direct journal creation test: ${error.message}`,
      error
    };
  }
}

/**
 * Run all journal persistence tests
 */
export async function runJournalPersistenceTests(): Promise<{
  overallSuccess: boolean;
  rpcTest: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  entriesTest: {
    success: boolean;
    message: string;
    entries?: any[];
    count?: number;
    error?: any;
  };
  directTest: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
}> {
  const rpcTest = await testJournalPersistence();
  const entriesTest = await getJournalEntries();
  const directTest = await testDirectJournalCreation();
  
  return {
    overallSuccess: rpcTest.success && entriesTest.success && directTest.success,
    rpcTest,
    entriesTest,
    directTest
  };
}