import React, { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { getConnectionStatusIndicator, formatResponseTime } from '@/lib/database-health';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthStatusProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ 
  compact = false, 
  showDetails = false,
  className = '' 
}) => {
  const { healthStatus, performHealthCheck, startHealthMonitoring } = useGameStore();
  
  // Auto-start health monitoring when component mounts
  useEffect(() => {
    startHealthMonitoring();
    
    // Cleanup on unmount
    return () => {
      // Note: We don't stop monitoring on unmount because other components might need it
      // The monitoring will be cleaned up when the store is destroyed
    };
  }, [startHealthMonitoring]);

  const indicator = getConnectionStatusIndicator(healthStatus);
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={`flex items-center gap-2 ${className}`}>
              <div 
                className={`w-2 h-2 rounded-full ${
                  indicator.color === 'green' 
                    ? 'bg-green-500' 
                    : indicator.color === 'yellow' 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {healthStatus.environment.toUpperCase()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-semibold">{indicator.label}</div>
              <div>{indicator.description}</div>
              {healthStatus.isConnected && (
                <div className="text-xs mt-1">
                  Response: {formatResponseTime(healthStatus.responseTime)}
                </div>
              )}
              {healthStatus.error && (
                <div className="text-xs mt-1 text-red-400">
                  {healthStatus.error}
                </div>
              )}
              <div className="text-xs mt-1 opacity-70">
                Environment: {healthStatus.environment}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (showDetails) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Database Connection</h3>
            <Badge 
              variant={
                indicator.color === 'green' 
                  ? 'default' 
                  : indicator.color === 'yellow' 
                  ? 'secondary' 
                  : 'destructive'
              }
            >
              {indicator.label}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span>{indicator.description}</span>
            </div>
            
            {healthStatus.isConnected && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                <span>{formatResponseTime(healthStatus.responseTime)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Environment:</span>
              <span className="uppercase font-mono text-xs">
                {healthStatus.environment}
              </span>
            </div>
            
            {healthStatus.lastChecked > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Check:</span>
                <span className="text-xs">
                  {new Date(healthStatus.lastChecked).toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {healthStatus.error && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                <span className="text-red-600 dark:text-red-400">
                  Error: {healthStatus.error}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => performHealthCheck()}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Check Now
          </button>
        </CardContent>
      </Card>
    );
  }

  // Default inline display
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full ${
          indicator.color === 'green' 
            ? 'bg-green-500' 
            : indicator.color === 'yellow' 
            ? 'bg-yellow-500' 
            : 'bg-red-500'
        }`}
      />
      <Badge 
        variant={
          indicator.color === 'green' 
            ? 'default' 
            : indicator.color === 'yellow' 
            ? 'secondary' 
            : 'destructive'
        }
        className="text-xs"
      >
        {indicator.label}
      </Badge>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {healthStatus.environment.toUpperCase()}
      </span>
      {healthStatus.isConnected && (
        <span className="text-xs text-gray-500">
          ({formatResponseTime(healthStatus.responseTime)})
        </span>
      )}
    </div>
  );
};

export default HealthStatus;