import React from 'react';
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
  className = '',
}) => {
  const { healthStatus, performHealthCheck } = useGameStore();

  // Note: Health monitoring is started at the app level in App.tsx
  // This component only displays the status

  const indicator = getConnectionStatusIndicator(healthStatus);

  if (compact) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <div className={`flex items-center gap-2 ${className}`}>
              <div
                className={`h-2 w-2 rounded-full ${
                  indicator.color === 'green'
                    ? 'status-text-success bg-green-500'
                    : indicator.color === 'yellow'
                      ? 'status-text-warning bg-yellow-500'
                      : 'status-text-danger bg-red-500'
                }`}
              />
              <span className="status-text-contrast text-xs">
                {healthStatus.environment.toUpperCase()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-semibold">{indicator.label}</div>
              <div>{indicator.description}</div>
              {healthStatus.isConnected && (
                <div className="mt-1 text-xs">
                  Response: {formatResponseTime(healthStatus.responseTime)}
                </div>
              )}
              {healthStatus.error && (
                <div className="status-text-danger mt-1 text-xs">{healthStatus.error}</div>
              )}
              <div className="mt-1 text-xs opacity-70">Environment: {healthStatus.environment}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (showDetails) {
    return (
      <Card className={`${className}`} data-testid="health-status">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
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
              <span className="status-text-contrast">Status:</span>
              <span>{indicator.description}</span>
            </div>

            {healthStatus.isConnected && (
              <div className="flex justify-between">
                <span className="status-text-contrast">Response Time:</span>
                <span>{formatResponseTime(healthStatus.responseTime)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="status-text-contrast">Environment:</span>
              <span className="font-mono text-xs uppercase">{healthStatus.environment}</span>
            </div>

            {healthStatus.lastChecked > 0 && (
              <div className="flex justify-between">
                <span className="status-text-contrast">Last Check:</span>
                <span className="text-xs">
                  {new Date(healthStatus.lastChecked).toLocaleTimeString()}
                </span>
              </div>
            )}

            {healthStatus.error && (
              <div className="mt-3 rounded bg-red-50 p-2 text-xs dark:bg-red-900/20">
                <span className="status-text-danger">Error: {healthStatus.error}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => performHealthCheck()}
            className="mt-3 w-full rounded bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
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
        className={`h-3 w-3 rounded-full ${
          indicator.color === 'green'
            ? 'status-text-success bg-green-500'
            : indicator.color === 'yellow'
              ? 'status-text-warning bg-yellow-500'
              : 'status-text-danger bg-red-500'
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
      <span className="status-text-contrast text-xs">{healthStatus.environment.toUpperCase()}</span>
      {healthStatus.isConnected && (
        <span className="status-text-contrast text-xs">
          ({formatResponseTime(healthStatus.responseTime)})
        </span>
      )}
    </div>
  );
};

export default HealthStatus;
