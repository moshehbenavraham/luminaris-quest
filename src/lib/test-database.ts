import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/environment';

const logger = createLogger('DatabaseTest');

/**
 * Test database connection using a simple RPC call
 * This is useful for verifying that the database is accessible
 * and that the Supabase client is configured correctly
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    logger.debug('Testing database connection via RPC');
    
    // Call the test_database_connection function
    const { data, error } = await supabase.rpc('test_database_connection');
    
    if (error) {
      logger.error('Database RPC test failed', error);
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        error
      };
    }
    
    logger.info('Database RPC test successful', data);
    return {
      success: true,
      message: 'Database connection successful',
      data
    };
  } catch (error: any) {
    logger.error('Database test threw exception', error);
    return {
      success: false,
      message: `Exception during database test: ${error.message}`,
      error
    };
  }
}

/**
 * Test table access by attempting to query the game_states table
 * This verifies that the tables exist and are accessible
 */
export async function testTableAccess(): Promise<{
  success: boolean;
  message: string;
  tables: {
    game_states: boolean;
    journal_entries: boolean;
  };
  error?: any;
}> {
  try {
    logger.debug('Testing table access');
    
    // Test game_states table
    const { error: gameStatesError } = await supabase
      .from('game_states')
      .select('user_id', { count: 'exact', head: true });
    
    // Test journal_entries table
    const { error: journalEntriesError } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true });
    
    const gameStatesExists = !gameStatesError || gameStatesError.code === 'PGRST116';
    const journalEntriesExists = !journalEntriesError || journalEntriesError.code === 'PGRST116';
    
    const allTablesExist = gameStatesExists && journalEntriesExists;
    
    if (allTablesExist) {
      logger.info('All tables exist and are accessible');
      return {
        success: true,
        message: 'All required tables exist and are accessible',
        tables: {
          game_states: gameStatesExists,
          journal_entries: journalEntriesExists
        }
      };
    } else {
      logger.warn('Some tables are missing or inaccessible', {
        game_states: gameStatesExists,
        journal_entries: journalEntriesExists,
        gameStatesError,
        journalEntriesError
      });
      
      return {
        success: false,
        message: 'Some required tables are missing or inaccessible',
        tables: {
          game_states: gameStatesExists,
          journal_entries: journalEntriesExists
        },
        error: {
          game_states: gameStatesError,
          journal_entries: journalEntriesError
        }
      };
    }
  } catch (error: any) {
    logger.error('Table access test threw exception', error);
    return {
      success: false,
      message: `Exception during table access test: ${error.message}`,
      tables: {
        game_states: false,
        journal_entries: false
      },
      error
    };
  }
}

/**
 * Run a comprehensive database test
 * This performs multiple tests to verify database connectivity and table access
 */
export async function runDatabaseTests(): Promise<{
  overallSuccess: boolean;
  connectionTest: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  };
  tableTest: {
    success: boolean;
    message: string;
    tables: {
      game_states: boolean;
      journal_entries: boolean;
    };
    error?: any;
  };
}> {
  const connectionTest = await testDatabaseConnection();
  const tableTest = await testTableAccess();
  
  return {
    overallSuccess: connectionTest.success && tableTest.success,
    connectionTest,
    tableTest
  };
}