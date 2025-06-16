import { useState, useEffect, useCallback, useRef } from 'react';
import { performEnhancedHealthCheck, getCurrentHealthStatus, type DatabaseHealthStatus } from '@/lib/database-health';
import { createLogger, environment, featureFlags } from '@/lib/environment';

const logger = createLogger('DatabaseHealthHook');

export interface DatabaseHealthHookResult {
  healthStatus: DatabaseHealthStatus;
  isHealthy: boolean;
  isChecking: boolean;
  lastError: string | null;
  checkHealth: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  isMonitoring: boolean;
}

/**
 * Custom hook for monitoring database health
 * Provides real-time database connectivity status and health monitoring
 */
export const useDatabaseHealth = (options: {
  enableAutoMonitoring?: boolean;
  checkInterval?: number;
  onHealthChange?: (isHealthy: boolean, status: DatabaseHealthStatus) => void;
  onError?: (error: string) => void;
} = {}): DatabaseHealthHookResult => {
  const {
    enableAutoMonitoring = true,
    checkInterval,
    onHealthChange,
    onError
  } = options;

  const config = environment.config();
  const effectiveInterval = checkInterval || config.healthCheckInterval;

  // State management
  const [healthStatus, setHealthStatus] = useState<DatabaseHealthStatus>({
    isConnected: false,
    responseTime: 0,
    lastChecked: 0,
    environment: environment.current()
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs for cleanup and preventing stale closures
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Perform a health check
   */
  const checkHealth = useCallback(async () => {
    if (!mountedRef.current || isChecking) {
      logger.debug('Skipping health check - component unmounted or check in progress');
      return;
    }

    setIsChecking(true);
    setLastError(null);

    try {
      logger.debug('Performing database health check');
      
      const result = await performEnhancedHealthCheck();
      const newStatus = getCurrentHealthStatus(result);

      if (!mountedRef.current) return;

      // Update state
      setHealthStatus(newStatus);
      
      if (!result.success && result.error) {
        setLastError(result.error);
        
        if (onError) {
          onError(result.error);
        }
        
        logger.warn('Database health check failed', { error: result.error });
      } else {
        logger.debug('Database health check successful', { 
          responseTime: result.responseTime,
          isConnected: newStatus.isConnected 
        });
      }

      // Notify health change callback
      if (onHealthChange) {
        const previouslyHealthy = healthStatus.isConnected;
        const currentlyHealthy = newStatus.isConnected;
        
        if (previouslyHealthy !== currentlyHealthy) {
          onHealthChange(currentlyHealthy, newStatus);
        }
      }
      
    } catch (error: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = error.message || 'Health check failed';
      setLastError(errorMessage);
      
      // Update status to reflect error
      setHealthStatus(prev => ({
        ...prev,
        isConnected: false,
        error: errorMessage,
        lastChecked: Date.now()
      }));
      
      if (onError) {
        onError(errorMessage);
      }
      
      logger.error('Database health check threw exception', error);
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, [isChecking, healthStatus.isConnected, onHealthChange, onError]);

  /**
   * Start periodic health monitoring
   */
  const startMonitoring = useCallback(() => {
    if (!featureFlags.enableHealthMonitoring()) {
      logger.debug('Health monitoring disabled by feature flag');
      return;
    }

    if (intervalRef.current) {
      logger.debug('Health monitoring already active');
      return;
    }

    logger.info('Starting database health monitoring', { 
      interval: effectiveInterval,
      environment: config.name 
    });

    setIsMonitoring(true);

    // Perform initial check
    checkHealth();

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        // Only check if document is visible (tab is active)
        if (typeof document !== 'undefined' && document.hidden) {
          logger.debug('Skipping health check - document hidden');
          return;
        }
        
        checkHealth();
      }
    }, effectiveInterval);

  }, [checkHealth, effectiveInterval, config.name]);

  /**
   * Stop periodic health monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      logger.info('Stopping database health monitoring');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring on mount if enabled
  useEffect(() => {
    if (enableAutoMonitoring && featureFlags.enableHealthMonitoring()) {
      startMonitoring();
    }

    return () => {
      mountedRef.current = false;
      stopMonitoring();
    };
  }, [enableAutoMonitoring, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Derive computed values
  const isHealthy = healthStatus.isConnected && !lastError;

  return {
    healthStatus,
    isHealthy,
    isChecking,
    lastError,
    checkHealth,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
};

/**
 * Simplified hook for basic health status
 */
export const useDatabaseStatus = (): {
  isHealthy: boolean;
  isConnected: boolean;
  responseTime: number;
  error?: string;
} => {
  const { healthStatus, isHealthy } = useDatabaseHealth({
    enableAutoMonitoring: true
  });

  return {
    isHealthy,
    isConnected: healthStatus.isConnected,
    responseTime: healthStatus.responseTime,
    error: healthStatus.error
  };
};