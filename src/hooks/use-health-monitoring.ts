import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';

/**
 * Custom hook to initialize and manage database health monitoring
 * This hook should be used at the app level to ensure health monitoring
 * starts when the application initializes
 */
export const useHealthMonitoring = () => {
  const { startHealthMonitoring, stopHealthMonitoring, performHealthCheck } = useGameStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    
    initialized.current = true;
    
    // Start health monitoring when the app initializes
    startHealthMonitoring();
    
    // Cleanup function to stop monitoring when the app unmounts
    return () => {
      stopHealthMonitoring();
    };
  }, [startHealthMonitoring, stopHealthMonitoring]);

  // Return the health check function in case components need to trigger manual checks
  return {
    performHealthCheck
  };
};

/**
 * Hook that provides health status information and utilities
 * This is a convenience hook that components can use to access health data
 */
export const useHealthStatus = () => {
  const { healthStatus, performHealthCheck } = useGameStore();
  
  return {
    healthStatus,
    performHealthCheck,
    isConnected: healthStatus.isConnected,
    responseTime: healthStatus.responseTime,
    lastChecked: healthStatus.lastChecked,
    error: healthStatus.error,
    environment: healthStatus.environment
  };
};