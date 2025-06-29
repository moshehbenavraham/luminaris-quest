// Built with Bolt.new
import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Environment detection utility
 */
export const detectEnvironment = (): 'local' | 'dev' | 'staging' | 'prod' => {
  if (typeof window === 'undefined') return 'prod';
  
  const hostname = window.location.hostname;
  const url = window.location.href;
  
  // Check for local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'local';
  }
  
  // Check for staging/dev environments
  if (hostname.includes('dev') || hostname.includes('staging') || url.includes('dev') || url.includes('staging')) {
    return 'dev';
  }
  
  // Check for staging specifically
  if (hostname.includes('staging')) {
    return 'staging';
  }
  
  // Default to production
  return 'prod';
};

/**
 * Environment-specific configuration
 */
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseKey: string;
  clientOptions: SupabaseClientOptions<'public'>;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const environment = detectEnvironment();
  
  // Get configuration from environment variables - fail fast if missing
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  // Base configuration using environment variables
  const baseConfig: EnvironmentConfig = {
    supabaseUrl,
    supabaseKey,
    clientOptions: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Optimize token refresh behavior for production
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      },
      global: {
        headers: {
          'X-Client-Info': `luminaris-quest-${environment}`
        }
      }
    }
  };

  // Environment-specific overrides
  switch (environment) {
    case 'local':
      return {
        ...baseConfig,
        // For local development, allow override to local Supabase instance
        supabaseUrl: import.meta.env.VITE_LOCAL_SUPABASE_URL || baseConfig.supabaseUrl,
        supabaseKey: import.meta.env.VITE_LOCAL_SUPABASE_ANON_KEY || baseConfig.supabaseKey,
        clientOptions: {
          ...baseConfig.clientOptions,
          auth: {
            ...baseConfig.clientOptions.auth,
            debug: true,
            // More aggressive refresh for local development
            autoRefreshToken: true
          },
          realtime: {
            params: {
              eventsPerSecond: 10 // Higher rate for local development
            }
          },
          global: {
            headers: {
              ...baseConfig.clientOptions.global?.headers,
              'X-Client-Info': 'luminaris-quest-local'
            }
          }
        }
      };

    case 'dev':
    case 'staging':
      return {
        ...baseConfig,
        clientOptions: {
          ...baseConfig.clientOptions,
          auth: {
            ...baseConfig.clientOptions.auth,
            debug: environment === 'dev',
            // Balanced refresh for dev/staging environments
            autoRefreshToken: true
          },
          realtime: {
            params: {
              eventsPerSecond: 5 // Moderate rate for staging
            }
          },
          global: {
            headers: {
              ...baseConfig.clientOptions.global?.headers,
              'X-Client-Info': `luminaris-quest-${environment}`
            }
          }
        }
      };

    case 'prod':
    default:
      return {
        ...baseConfig,
        clientOptions: {
          ...baseConfig.clientOptions,
          auth: {
            ...baseConfig.clientOptions.auth,
            debug: false,
            // Conservative refresh for production
            autoRefreshToken: true
          },
          realtime: {
            params: {
              eventsPerSecond: 2 // Conservative rate for production
            }
          },
          global: {
            headers: {
              ...baseConfig.clientOptions.global?.headers,
              'X-Client-Info': 'luminaris-quest-prod'
            }
          }
        }
      };
  }
};

/**
 * Enhanced logging utility for Supabase client
 */
const createSupabaseLogger = () => {
  const environment = detectEnvironment();
  
  return {
    info: (message: string, data?: any) => {
      if (environment !== 'prod') {
        console.info(`[Supabase] ${message}`, data);
      }
    },
    warn: (message: string, data?: any) => {
      console.warn(`[Supabase Warning] ${message}`, data);
    },
    error: (message: string, error?: any) => {
      const errorData = {
        message,
        error: environment === 'prod' ? error?.message || 'Unknown error' : error,
        timestamp: new Date().toISOString(),
        environment
      };
      console.error(`[Supabase Error] ${message}`, errorData);
    },
    debug: (message: string, data?: any) => {
      if (environment === 'local' || environment === 'dev') {
        console.debug(`[Supabase Debug] ${message}`, data);
      }
    }
  };
};

const logger = createSupabaseLogger();

/**
 * Initialize Supabase client with environment-specific configuration
 */
const initializeSupabaseClient = () => {
  const config = getEnvironmentConfig();
  const environment = detectEnvironment();
  
  logger.info('Initializing Supabase client', {
    environment,
    url: config.supabaseUrl,
    hasEnvVars: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  });

  try {
    const client = createClient<Database>(config.supabaseUrl, config.supabaseKey, config.clientOptions);
    
    // Add connection monitoring for non-production environments
    if (environment !== 'prod') {
      // Monitor auth state changes
      client.auth.onAuthStateChange((event, session) => {
        logger.debug('Auth state changed', { event, userId: session?.user?.id });
      });
    }

    // Add token refresh monitoring for all environments
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        logger.debug('Token refreshed successfully', {
          environment,
          userId: session?.user?.id,
          expiresAt: session?.expires_at
        });
      } else if (event === 'SIGNED_OUT') {
        logger.debug('User signed out', { environment });
      }
    });
    
    logger.info('Supabase client initialized successfully');
    return client;
  } catch (error: any) {
    logger.error('Failed to initialize Supabase client', error);
    throw new Error(`Supabase client initialization failed: ${error.message}`);
  }
};

/**
 * Enhanced Supabase client with error handling and environment awareness
 */
export const supabase = initializeSupabaseClient();

/**
 * Utility to get current environment
 */
export const getCurrentEnvironment = () => detectEnvironment();

/**
 * Utility to check if client is configured for local development
 */
export const isLocalEnvironment = () => detectEnvironment() === 'local';

/**
 * Utility to check if debug mode is enabled
 */
export const isDebugMode = () => {
  const env = detectEnvironment();
  return env === 'local' || env === 'dev';
};

/**
 * Test Supabase connection
 * Useful for health checks and debugging
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  responseTime: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    logger.debug('Testing Supabase connection');
    
    // Simple test query that doesn't require authentication
    const { error } = await supabase
      .from('game_states')
      .select('user_id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, which is fine for connection test
      throw new Error(error.message);
    }
    
    logger.debug('Supabase connection test successful', { responseTime });
    
    return {
      success: true,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Supabase connection test failed', error);
    
    return {
      success: false,
      responseTime,
      error: error.message || 'Connection test failed'
    };
  }
};

// Export configuration utilities for external use
export const supabaseConfig = {
  environment: detectEnvironment(),
  isLocal: isLocalEnvironment(),
  isDebug: isDebugMode(),
  testConnection: testSupabaseConnection
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
