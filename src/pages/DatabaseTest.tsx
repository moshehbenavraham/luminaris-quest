import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { runDatabaseTests } from '@/lib/test-database';
import { supabaseDiagnostics as supabase } from '@/lib/supabase-diagnostics';

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    user?: any;
    error?: string;
  }>({
    isAuthenticated: false
  });

  const runTests = async () => {
    setIsLoading(true);
    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      setAuthStatus({
        isAuthenticated: !!user,
        user,
        error: authError?.message
      });
      
      // Run database tests
      const results = await runDatabaseTests();
      setTestResults(results);
    } catch (error: any) {
      console.error('Error running tests:', error);
      setTestResults({
        overallSuccess: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Database Connection Test</h1>
        <p className="text-xl text-muted-foreground">
          This page tests the connection to your Supabase database and verifies table access.
        </p>
      </div>

      {/* Authentication Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Status
            {authStatus.isAuthenticated ? (
              <Badge variant="default" className="ml-2">Authenticated</Badge>
            ) : (
              <Badge variant="destructive" className="ml-2">Not Authenticated</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Database operations require authentication for RLS policies to work correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authStatus.isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>User is authenticated</span>
              </div>
              <div className="text-sm text-muted-foreground">
                User ID: {authStatus.user?.id}
              </div>
              <div className="text-sm text-muted-foreground">
                Email: {authStatus.user?.email}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>User is not authenticated</span>
              </div>
              {authStatus.error && (
                <div className="text-sm text-red-600">
                  Error: {authStatus.error}
                </div>
              )}
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to be logged in to access database tables due to Row Level Security (RLS) policies.
                  Please log in on the home page first.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="min-h-[44px]"
          >
            Go to Login Page
          </Button>
        </CardFooter>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Database Test Results</span>
            {testResults && !isLoading && (
              <Badge 
                variant={testResults.overallSuccess ? "default" : "destructive"}
                className="ml-2"
              >
                {testResults.overallSuccess ? "All Tests Passed" : "Tests Failed"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Testing database connectivity and table access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <Spinner className="mx-auto mb-4 h-8 w-8" />
                <p className="text-muted-foreground">Running database tests...</p>
              </div>
            </div>
          ) : testResults ? (
            <div className="space-y-6">
              {/* Connection Test */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Connection Test</h3>
                <div className="flex items-center gap-2">
                  {testResults.connectionTest?.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>{testResults.connectionTest?.message}</span>
                </div>
                {testResults.connectionTest?.data && (
                  <div className="rounded-md bg-muted p-3">
                    <pre className="text-xs">
                      {JSON.stringify(testResults.connectionTest.data, null, 2)}
                    </pre>
                  </div>
                )}
                {testResults.connectionTest?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                      {typeof testResults.connectionTest.error === 'string' 
                        ? testResults.connectionTest.error 
                        : JSON.stringify(testResults.connectionTest.error, null, 2)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Table Access Test */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Table Access Test</h3>
                <div className="flex items-center gap-2">
                  {testResults.tableTest?.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>{testResults.tableTest?.message}</span>
                </div>
                
                {testResults.tableTest?.tables && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResults.tableTest.tables.game_states ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>game_states table</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResults.tableTest.tables.journal_entries ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>journal_entries table</span>
                    </div>
                  </div>
                )}
                
                {testResults.tableTest?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Table Access Error</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        {testResults.tableTest.error.game_states && (
                          <div>
                            <strong>game_states:</strong> {testResults.tableTest.error.game_states.message}
                          </div>
                        )}
                        {testResults.tableTest.error.journal_entries && (
                          <div>
                            <strong>journal_entries:</strong> {testResults.tableTest.error.journal_entries.message}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Troubleshooting Guidance */}
              {!testResults.overallSuccess && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Troubleshooting Steps</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal space-y-1 pl-5">
                      <li>Verify that you're logged in (authentication status above)</li>
                      <li>Check that the database migration has been run</li>
                      <li>Verify your environment variables are correct</li>
                      <li>Check network connectivity to Supabase</li>
                      <li>See <code>docs/SUPABASE_TROUBLESHOOTING.md</code> for more details</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Test Error</AlertTitle>
              <AlertDescription>
                An unexpected error occurred while running the tests. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="min-h-[44px]"
          >
            {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Run Tests Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="min-h-[44px]"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DatabaseTest;