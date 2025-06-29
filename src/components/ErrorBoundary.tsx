// Built with Bolt.new
import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Database, Wifi, WifiOff } from 'lucide-react';

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType: 'network' | 'database' | 'authentication' | 'unknown';
  retryCount: number;
}

interface DatabaseErrorBoundaryProps extends PropsWithChildren {
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

/**
 * Enhanced Error Boundary with database-specific error handling
 * Provides user-friendly error messages and proper error categorization
 */
export class ErrorBoundary extends Component<DatabaseErrorBoundaryProps, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    errorType: 'unknown',
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorType: ErrorBoundary.classifyError(error)
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Enhanced logging with environment awareness
    const environment = this.detectEnvironment();
    const errorData = {
      message: error.message,
      stack: environment !== 'prod' ? error.stack : undefined,
      componentStack: environment !== 'prod' ? errorInfo.componentStack : undefined,
      errorBoundary: 'DatabaseErrorBoundary',
      timestamp: new Date().toISOString(),
      environment,
      errorType: this.state.errorType,
      retryCount: this.state.retryCount
    };

    // Log to console with appropriate level
    const logLevel = environment === 'prod' ? 'error' : 'debug';
    console[logLevel]('[ErrorBoundary] Uncaught error:', errorData);

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        console.error('[ErrorBoundary] Error in custom error handler:', handlerError);
      }
    }

    this.setState({ errorInfo });
  }

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Classify error type based on error message and properties
   */
  private static classifyError(error: Error): State['errorType'] {
    if (!error) return 'unknown';
    
    const message = error.message.toLowerCase();
    const name = error.name?.toLowerCase() || '';
    
    // Network-related errors
    if (message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('fetch') ||
        name.includes('network')) {
      return 'network';
    }
    
    // Database-related errors
    if (message.includes('database') ||
        message.includes('supabase') ||
        message.includes('postgrest') ||
        message.includes('pgrst') ||
        message.includes('relation') ||
        message.includes('column')) {
      return 'database';
    }
    
    // Authentication errors
    if (message.includes('auth') ||
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('session') ||
        message.includes('token')) {
      return 'authentication';
    }
    
    return 'unknown';
  }

  /**
   * Detect current environment for logging purposes
   */
  private detectEnvironment(): 'local' | 'dev' | 'prod' {
    if (typeof window === 'undefined') return 'prod';
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
    if (hostname.includes('dev') || hostname.includes('staging')) return 'dev';
    return 'prod';
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getUserFriendlyMessage(): { title: string; description: string; icon: React.ReactNode } {
    const { error, errorType } = this.state;
    
    switch (errorType) {
      case 'network':
        return {
          title: 'Connection Problem',
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
          icon: <WifiOff className="h-5 w-5" />
        };
        
      case 'database':
        return {
          title: 'Database Error',
          description: 'There was a problem accessing your game data. Your progress is safe, but some features may be temporarily unavailable.',
          icon: <Database className="h-5 w-5" />
        };
        
      case 'authentication':
        return {
          title: 'Authentication Issue',
          description: 'There was a problem with your login session. Please try signing in again.',
          icon: <Wifi className="h-5 w-5" />
        };
        
      default:
        return {
          title: 'Something went wrong',
          description: error?.message || 'An unexpected error occurred. Please try refreshing the page.',
          icon: <AlertTriangle className="h-5 w-5" />
        };
    }
  }

  /**
   * Handle retry with exponential backoff
   */
  private handleRetry = () => {
    const { enableRetry = true, maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    
    if (!enableRetry || retryCount >= maxRetries) {
      // Force page reload as last resort
      window.location.reload();
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    
    this.setState({ retryCount: retryCount + 1 });
    
    // Clear existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    
    // Set retry timeout
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    }, delay);
  };

  /**
   * Reset error state and retry immediately
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  public render() {
    const { fallbackComponent: FallbackComponent, children } = this.props;
    const { hasError, error, retryCount } = this.state;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} retry={this.handleRetry} />;
      }

      const { title, description, icon } = this.getUserFriendlyMessage();
      const isRetrying = retryCount > 0;

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                {icon}
                <AlertTitle>{title}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {description}
              </AlertDescription>
            </Alert>

            {/* Additional error details for development */}
            {this.detectEnvironment() !== 'prod' && error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Technical Details</AlertTitle>
                <AlertDescription className="mt-2 font-mono text-xs">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={this.handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? `Retrying... (${retryCount})` : 'Try Again'}
              </Button>
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="w-full"
              >
                Reset
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>

            {retryCount > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Retry attempt {retryCount} of {this.props.maxRetries || 3}
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Database-specific Error Boundary for wrapping database operations
 */
export const DatabaseErrorBoundary: React.FC<PropsWithChildren<{
  onError?: (error: Error) => void;
}>> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      enableRetry={true}
      maxRetries={2}
      onError={(_error, /* errorInfo */) => {
        // TEMPORARILY COMMENTED OUT FOR BUILD: errorInfo parameter temporarily commented to fix TS6133 build error
        // errorInfo
        // Log database-specific errors
        console.error('[DatabaseErrorBoundary] Database operation failed:', {
          error: _error.message,
          timestamp: new Date().toISOString()
        });

        if (onError) {
          onError(_error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
