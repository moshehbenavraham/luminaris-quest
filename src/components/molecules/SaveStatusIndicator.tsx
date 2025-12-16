import { useState, useEffect, useMemo } from 'react';
import { useGameStoreBase } from '@/store/game-store';
import { cn } from '@/lib/utils';
import { CheckCircle, Cloud, CloudOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Visual indicator component that displays the current save status
 * Shows saving progress, success, errors, and last save time
 */
export function SaveStatusIndicator() {
  const saveState = useGameStoreBase((state) => state.saveState);
  const saveToSupabase = useGameStoreBase((state) => state.saveToSupabase);
  const clearSaveError = useGameStoreBase((state) => state.clearSaveError);

  // Track current time in state and update via effect (React 19 purity compliance)
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // Update current time every 10 seconds for accurate "time ago" display
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Format time since last save - now uses state-based currentTime
  const timeSinceLastSave = useMemo(() => {
    if (!saveState.lastSaveTimestamp) return 'Never';

    const diff = currentTime - saveState.lastSaveTimestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }, [saveState.lastSaveTimestamp, currentTime]);

  // Get status icon and color based on save state
  const getStatusDisplay = () => {
    switch (saveState.status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          className: 'text-blue-500',
          bgClassName: 'bg-blue-500/10 border-blue-500/20',
        };

      case 'success':
        if (saveState.hasUnsavedChanges) {
          return {
            icon: <Cloud className="h-4 w-4" />,
            text: 'Unsaved changes',
            className: 'text-amber-500',
            bgClassName: 'bg-amber-500/10 border-amber-500/20',
          };
        }
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: `Saved ${timeSinceLastSave}`,
          className: 'text-green-500',
          bgClassName: 'bg-green-500/10 border-green-500/20',
        };

      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Save failed',
          className: 'text-red-500',
          bgClassName: 'bg-red-500/10 border-red-500/20',
        };

      default:
        if (saveState.hasUnsavedChanges) {
          return {
            icon: <CloudOff className="h-4 w-4" />,
            text: 'Not saved',
            className: 'text-gray-500',
            bgClassName: 'bg-gray-500/10 border-gray-500/20',
          };
        }
        return {
          icon: <Cloud className="h-4 w-4" />,
          text: 'All changes saved',
          className: 'text-gray-400',
          bgClassName: 'bg-gray-400/10 border-gray-400/20',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Handle manual save
  const handleManualSave = async () => {
    if (saveState.status === 'saving') return;
    await saveToSupabase();
  };

  // Handle retry after error
  const handleRetry = () => {
    clearSaveError();
    handleManualSave();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all duration-200',
            statusDisplay.bgClassName,
          )}
        >
          <span className={cn(statusDisplay.className)}>{statusDisplay.icon}</span>
          <span className={cn('font-medium', statusDisplay.className)}>{statusDisplay.text}</span>
        </div>

        {/* Manual save button */}
        {saveState.hasUnsavedChanges && saveState.status !== 'saving' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleManualSave} className="h-8">
                Save Now
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manually save your progress</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Retry button on error */}
        {saveState.status === 'error' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="h-8 text-red-600 hover:text-red-700"
              >
                Retry
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-semibold">Save failed</p>
                {saveState.lastError && (
                  <p className="mt-1 text-sm text-gray-300">{saveState.lastError}</p>
                )}
                {saveState.retryCount > 0 && (
                  <p className="mt-1 text-sm text-gray-400">Retried {saveState.retryCount} times</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
