import { supabase } from '@/integrations/supabase/client';
import { createLogger, /* performanceMonitor, */ environment, type Environment } from '@/lib/environment';
// TEMPORARILY COMMENTED OUT FOR BUILD: performanceMonitor import temporarily commented to fix TS6133 build error

export interface DatabaseHealthStatus {
  isConnected: boolean;
  responseTime: number;
  lastChecked: number;
  error?: string;
  environment: Environment;
}

export interface DatabaseHealthCheckResult {
  success: boolean;
  responseTime: number;
  error?: string;
}

// Use shared environment detection
export const detectEnvironment = environment.current;

// Create logger for database health checks
const logger = createLogger('DatabaseHealth');

// Lightweight health check function with performance monitoring
export const performHealthCheck = async (timeoutMs?: number): Promise<DatabaseHealthCheckResult> => {
  const config = environment.config();
  const effectiveTimeout = timeoutMs || config.timeoutMs;
  const startTime = Date.now();
  
  try {
    logger.debug('Starting basic health check', { timeout: effectiveTimeout });
    
    // Use a simple, lightweight query that should work in all environments
    // Using count instead of select to avoid issues with empty tables
    const healthCheckQuery = supabase
      .from('game_states')
      .select('*', { count: 'exact', head: true });
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), effectiveTimeout);
    });
    
    // Race the query against the timeout
    const result = await Promise.race([
      healthCheckQuery,
      timeoutPromise
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Check if the query executed successfully (even if no data returned)
    if (result.error && result.error.code !== 'PGRST116') {
      // PGRST116 means "no rows returned" which is fine for health check
      throw new Error(`Database query failed: ${result.error.message}`);
    }
    
    logger.debug('Basic health check completed successfully', { responseTime });
    
    return {
      success: true,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.warn('Basic health check failed', { error: error.message, responseTime });
    
    return {
      success: false,
      responseTime,
      error: error.message || 'Unknown database error'
    };
  }
};

// Enhanced health check with connection validation
export const performEnhancedHealthCheck = async (): Promise<DatabaseHealthCheckResult> => {
  const config = environment.config();
  const startTime = Date.now();
  
  try {
    logger.debug('Starting enhanced health check');
    
    // First, check if we can get user session (auth health)
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw new Error(`Authentication check failed: ${authError.message}`);
    }
    
    logger.debug('Authentication check passed', {
      hasSession: !!session?.session,
      hasUser: !!session?.session?.user
    });
    
    // Perform the basic connectivity check with environment-aware timeout
    const basicCheck = await performHealthCheck(Math.min(config.timeoutMs, 8000));
    
    if (!basicCheck.success) {
      throw new Error(basicCheck.error || 'Basic connectivity check failed');
    }
    
    logger.debug('Basic connectivity check passed', {
      responseTime: basicCheck.responseTime
    });
    
    // If we have a user session, try a more comprehensive check
    if (session?.session?.user) {
      try {
        logger.debug('Performing user data access check');
        
        // Try to access user-specific data
        const { error: userDataError } = await supabase
          .from('game_states')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.session.user.id);
        
        if (userDataError && userDataError.code !== 'PGRST116') {
          throw new Error(`User data access failed: ${userDataError.message}`);
        }
        
        logger.debug('User data access check passed');
      } catch (userError: any) {
        // Don't fail the entire health check if user data check fails
        logger.warn('User data health check failed', { error: userError.message });
      }
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Enhanced health check completed successfully', {
      responseTime,
      hasAuthentication: !!session?.session
    });
    
    return {
      success: true,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Enhanced health check failed', error, { responseTime });
    
    return {
      success: false,
      responseTime,
      error: error.message || 'Enhanced health check failed'
    };
  }
};

// Get current database health status
export const getCurrentHealthStatus = (lastResult?: DatabaseHealthCheckResult): DatabaseHealthStatus => {
  const now = Date.now();
  
  return {
    isConnected: lastResult?.success ?? false,
    responseTime: lastResult?.responseTime ?? 0,
    lastChecked: now,
    error: lastResult?.error,
    environment: detectEnvironment()
  };
};

// Utility to format response time for display
export const formatResponseTime = (responseTime: number): string => {
  if (responseTime < 1000) {
    return `${responseTime}ms`;
  } else {
    return `${(responseTime / 1000).toFixed(1)}s`;
  }
};

// Utility to get connection status color/indicator
export const getConnectionStatusIndicator = (status: DatabaseHealthStatus): {
  color: 'green' | 'yellow' | 'red';
  label: string;
  description: string;
} => {
  if (!status.isConnected) {
    return {
      color: 'red',
      label: 'Disconnected',
      description: 'Database connection failed'
    };
  }
  
  if (status.responseTime > 5000) {
    return {
      color: 'yellow',
      label: 'Slow',
      description: 'Database connection is slow'
    };
  }
  
  if (status.responseTime > 2000) {
    return {
      color: 'yellow',
      label: 'Connected',
      description: 'Database connection is working but slow'
    };
  }
  
  return {
    color: 'green',
    label: 'Connected',
    description: 'Database connection is healthy'
  };
};