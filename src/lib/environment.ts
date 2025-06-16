/**
 * Shared environment detection and configuration utilities
 * Used across the application for consistent environment handling
 */

export type Environment = 'local' | 'dev' | 'staging' | 'prod';

export interface EnvironmentConfig {
  name: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  enableDebugLogging: boolean;
  enableVerboseLogging: boolean;
  enableErrorReporting: boolean;
  healthCheckInterval: number;
  retryAttempts: number;
  timeoutMs: number;
}

/**
 * Detect current environment based on hostname and URL
 */
export const detectEnvironment = (): Environment => {
  // Server-side rendering defaults to production
  if (typeof window === 'undefined') return 'prod';
  
  const hostname = window.location.hostname;
  const url = window.location.href;
  
  // Check for local development
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')) {
    return 'local';
  }
  
  // Check for development environments
  if (hostname.includes('dev') || 
      url.includes('dev') ||
      hostname.includes('development')) {
    return 'dev';
  }
  
  // Check for staging environments
  if (hostname.includes('staging') || 
      url.includes('staging') ||
      hostname.includes('stage')) {
    return 'staging';
  }
  
  // Default to production
  return 'prod';
};

/**
 * Get environment configuration based on current environment
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const environment = detectEnvironment();
  
  const baseConfig: EnvironmentConfig = {
    name: environment,
    isDevelopment: environment !== 'prod',
    isProduction: environment === 'prod',
    enableDebugLogging: environment !== 'prod',
    enableVerboseLogging: environment === 'local' || environment === 'dev',
    enableErrorReporting: true,
    healthCheckInterval: 45000, // 45 seconds
    retryAttempts: 3,
    timeoutMs: 30000 // 30 seconds
  };

  // Environment-specific overrides
  switch (environment) {
    case 'local':
      return {
        ...baseConfig,
        healthCheckInterval: 30000, // 30 seconds - more frequent for local dev
        retryAttempts: 2, // Fewer retries for local development
        timeoutMs: 15000, // Shorter timeout for local development
        enableDebugLogging: true,
        enableVerboseLogging: true
      };

    case 'dev':
      return {
        ...baseConfig,
        healthCheckInterval: 45000, // 45 seconds
        retryAttempts: 3,
        timeoutMs: 20000, // 20 seconds
        enableDebugLogging: true,
        enableVerboseLogging: true
      };

    case 'staging':
      return {
        ...baseConfig,
        healthCheckInterval: 60000, // 60 seconds
        retryAttempts: 3,
        timeoutMs: 30000, // 30 seconds
        enableDebugLogging: false,
        enableVerboseLogging: false
      };

    case 'prod':
    default:
      return {
        ...baseConfig,
        healthCheckInterval: 90000, // 90 seconds - less frequent for production
        retryAttempts: 5, // More retries for production
        timeoutMs: 45000, // 45 seconds - longer timeout for production
        enableDebugLogging: false,
        enableVerboseLogging: false
      };
  }
};

/**
 * Enhanced logging utility with environment awareness
 */
export const createLogger = (component: string) => {
  const config = getEnvironmentConfig();
  
  return {
    debug: (message: string, data?: any) => {
      if (config.enableDebugLogging) {
        console.debug(`[${component} Debug] ${message}`, data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableVerboseLogging || config.isProduction) {
        console.info(`[${component}] ${message}`, data);
      }
    },
    warn: (message: string, data?: any) => {
      console.warn(`[${component} Warning] ${message}`, data);
    },
    error: (message: string, error?: any, context?: any) => {
      const errorData = {
        message,
        error: config.isProduction ? error?.message || 'Unknown error' : error,
        context: config.isProduction ? undefined : context,
        timestamp: new Date().toISOString(),
        environment: config.name,
        component
      };
      
      console.error(`[${component} Error] ${message}`, errorData);
      
      // In production, you might want to send to error reporting service
      if (config.enableErrorReporting && config.isProduction) {
        // TODO: Integrate with error reporting service (e.g., Sentry)
        // errorReportingService.captureException(error, { extra: errorData });
      }
    }
  };
};

/**
 * Utility functions for environment checks
 */
export const environment = {
  /**
   * Get current environment name
   */
  current: () => detectEnvironment(),
  
  /**
   * Check if running in local development
   */
  isLocal: () => detectEnvironment() === 'local',
  
  /**
   * Check if running in development (local or dev)
   */
  isDevelopment: () => {
    const env = detectEnvironment();
    return env === 'local' || env === 'dev';
  },
  
  /**
   * Check if running in staging
   */
  isStaging: () => detectEnvironment() === 'staging',
  
  /**
   * Check if running in production
   */
  isProduction: () => detectEnvironment() === 'prod',
  
  /**
   * Check if debug mode should be enabled
   */
  isDebugMode: () => {
    const env = detectEnvironment();
    return env === 'local' || env === 'dev';
  },
  
  /**
   * Get environment configuration
   */
  config: getEnvironmentConfig
};

/**
 * Performance monitoring utility
 */
export const performanceMonitor = {
  /**
   * Measure execution time of a function
   */
  measure: async <T>(
    operation: string,
    fn: () => Promise<T> | T,
    logger?: ReturnType<typeof createLogger>
  ): Promise<T> => {
    const startTime = Date.now();
    const config = getEnvironmentConfig();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      if (config.enableVerboseLogging && logger) {
        logger.debug(`${operation} completed`, { duration: `${duration}ms` });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (logger) {
        logger.error(`${operation} failed`, error, { duration: `${duration}ms` });
      }
      
      throw error;
    }
  },
  
  /**
   * Create a timer for manual measurement
   */
  createTimer: (operation: string) => {
    const startTime = Date.now();
    
    return {
      end: (logger?: ReturnType<typeof createLogger>) => {
        const duration = Date.now() - startTime;
        const config = getEnvironmentConfig();
        
        if (config.enableVerboseLogging && logger) {
          logger.debug(`${operation} duration`, { duration: `${duration}ms` });
        }
        
        return duration;
      }
    };
  }
};

/**
 * Feature flags based on environment
 */
export const featureFlags = {
  /**
   * Check if health monitoring should be enabled
   */
  enableHealthMonitoring: () => {
    const config = getEnvironmentConfig();
    return config.isDevelopment || config.name === 'staging';
  },
  
  /**
   * Check if detailed error reporting should be enabled
   */
  enableDetailedErrorReporting: () => {
    const config = getEnvironmentConfig();
    return config.isDevelopment;
  },
  
  /**
   * Check if performance monitoring should be enabled
   */
  enablePerformanceMonitoring: () => {
    const config = getEnvironmentConfig();
    return config.enableVerboseLogging;
  },
  
  /**
   * Check if auto-save should be enabled
   */
  enableAutoSave: () => true, // Always enabled for now
  
  /**
   * Check if real-time features should be enabled
   */
  enableRealtime: () => {
    const config = getEnvironmentConfig();
    return config.isDevelopment || config.name === 'staging';
  }
};

/**
 * Export current environment info for debugging
 */
export const getEnvironmentInfo = () => {
  const config = getEnvironmentConfig();
  
  return {
    environment: config.name,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    timestamp: new Date().toISOString(),
    config: {
      healthCheckInterval: config.healthCheckInterval,
      retryAttempts: config.retryAttempts,
      timeoutMs: config.timeoutMs,
      enableDebugLogging: config.enableDebugLogging,
      enableVerboseLogging: config.enableVerboseLogging
    },
    featureFlags: {
      healthMonitoring: featureFlags.enableHealthMonitoring(),
      detailedErrorReporting: featureFlags.enableDetailedErrorReporting(),
      performanceMonitoring: featureFlags.enablePerformanceMonitoring(),
      autoSave: featureFlags.enableAutoSave(),
      realtime: featureFlags.enableRealtime()
    }
  };
};