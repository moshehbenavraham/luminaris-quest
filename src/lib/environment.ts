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
  energyRegenInterval: number; // Energy regeneration interval in milliseconds
  retryAttempts: number;
  timeoutMs: number;
  // Scene energy costs and rewards
  sceneCosts: {
    social: number;
    skill: number;
    combat: number;
    journal: number;
    exploration: number;
  };
  sceneRewards: {
    social: number;
    skill: number;
    combat: number;
    journal: number;
    exploration: number;
  };
  // Combat action energy costs and low-energy penalty threshold
  combatEnergyCosts: {
    illuminate: number;
    reflect: number;
    endure: number;
    embrace: number;
  };
  lowEnergyThreshold: number; // Percentage (0-100) below which penalties apply
  lowEnergyPenalty: number;   // Damage reduction multiplier when low on energy
}

/**
 * Detect current environment based on hostname and URL
 */
export const detectEnvironment = (): Environment => {
  // Server-side rendering defaults to production
  if (typeof window === 'undefined') return 'prod';

  const hostname = window.location?.hostname || '';
  const url = window.location?.href || '';

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
    healthCheckInterval: 120000, // 2 minutes - reduced from 45 seconds for better performance
    energyRegenInterval: 30000, // 30 seconds - default energy regeneration rate
    retryAttempts: 3,
    timeoutMs: 30000, // 30 seconds
    // Scene energy costs (5-15 range as specified)
    sceneCosts: {
      social: 8,      // Medium cost - interpersonal engagement
      skill: 12,      // High cost - mental effort and focus
      combat: 15,     // Highest cost - intense confrontation
      journal: 5,     // Low cost - reflective and gentle
      exploration: 10 // Medium-high cost - discovery and adventure
    },
    // Scene energy rewards on success (recovery bonuses)
    sceneRewards: {
      social: 3,      // Connection energizes
      skill: 5,       // Accomplishment restores energy
      combat: 8,      // Victory provides significant energy boost
      journal: 2,     // Gentle restoration from reflection
      exploration: 4  // Discovery provides moderate energy boost
    },
    // Combat action energy costs
    combatEnergyCosts: {
      illuminate: 3,  // Moderate cost for basic attack
      reflect: 2,     // Low cost for defensive action
      endure: 1,      // Minimal cost for endurance action
      embrace: 5      // High cost for powerful action
    },
    lowEnergyThreshold: 20,  // 20% energy threshold for penalties
    lowEnergyPenalty: 0.5    // 50% damage reduction when low on energy
  };

  // Environment-specific overrides
  switch (environment) {
    case 'local':
      return {
        ...baseConfig,
        healthCheckInterval: 90000, // 90 seconds - reduced from 30 seconds for better performance
        energyRegenInterval: 30000, // 30 seconds - default energy regeneration rate
        retryAttempts: 2, // Fewer retries for local development
        timeoutMs: 15000, // Shorter timeout for local development
        enableDebugLogging: true,
        enableVerboseLogging: true
      };

    case 'dev':
      return {
        ...baseConfig,
        healthCheckInterval: 120000, // 2 minutes - same as base config
        energyRegenInterval: 30000, // 30 seconds - default energy regeneration rate
        retryAttempts: 3,
        timeoutMs: 20000, // 20 seconds
        enableDebugLogging: true,
        enableVerboseLogging: true
      };

    case 'staging':
      return {
        ...baseConfig,
        healthCheckInterval: 180000, // 3 minutes - increased from 60 seconds
        energyRegenInterval: 30000, // 30 seconds - default energy regeneration rate
        retryAttempts: 3,
        timeoutMs: 30000, // 30 seconds
        enableDebugLogging: false,
        enableVerboseLogging: false
      };

    case 'prod':
    default:
      return {
        ...baseConfig,
        healthCheckInterval: 300000, // 5 minutes - increased from 90 seconds for production
        energyRegenInterval: 30000, // 30 seconds - default energy regeneration rate
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
      energyRegenInterval: config.energyRegenInterval,
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