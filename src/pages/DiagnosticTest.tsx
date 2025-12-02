/* eslint-disable @typescript-eslint/no-explicit-any -- Diagnostic test page requires flexible types for test results */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  BookOpen,
  Shield,
} from 'lucide-react';
import { runAllDiagnostics } from '@/lib/diagnose-database';
import { useGameStore } from '@/store/game-store';

export function DiagnosticTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('database');

  // Get store state for diagnostics
  const { guardianTrust, journalEntries, milestones, saveState } = useGameStore();

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await runAllDiagnostics();
      setTestResults(results);
    } catch (error: any) {
      console.error('Error running diagnostics:', error);
      setTestResults({
        overallSuccess: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Database Diagnostics</h1>
        <p className="text-muted-foreground text-xl">
          Comprehensive diagnostics for database connection, authentication, and journal
          persistence.
        </p>
      </div>

      <Tabs defaultValue="database" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        {/* Database Diagnostics */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Diagnostics
                {testResults && !isLoading && (
                  <Badge
                    variant={testResults.databaseDiagnostics?.success ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {testResults.databaseDiagnostics?.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Comprehensive diagnostics for database connection, tables, and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-8 w-8" />
                    <p className="text-muted-foreground">Running database diagnostics...</p>
                  </div>
                </div>
              ) : testResults?.databaseDiagnostics ? (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Connection Status</h3>
                    <div className="flex items-center gap-2">
                      {testResults.databaseDiagnostics.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.databaseDiagnostics.message}</span>
                    </div>
                  </div>

                  {/* Table Information */}
                  {testResults.databaseDiagnostics.data?.tables && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Table Information</h3>
                      <div className="bg-muted rounded-md p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.databaseDiagnostics.data.tables.game_states_exists ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">game_states table</span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {testResults.databaseDiagnostics.data.tables.game_states_exists
                                ? `${testResults.databaseDiagnostics.data.tables.game_states_columns?.length || 0} columns`
                                : 'Table does not exist'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.databaseDiagnostics.data.tables
                                .journal_entries_exists ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">journal_entries table</span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {testResults.databaseDiagnostics.data.tables.journal_entries_exists
                                ? `${testResults.databaseDiagnostics.data.tables.journal_entries_columns?.length || 0} columns`
                                : 'Table does not exist'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Policy Information */}
                  {testResults.databaseDiagnostics.data?.policies && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">RLS Policies</h3>
                      <div className="bg-muted rounded-md p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.databaseDiagnostics.data.policies.game_states_policies
                                ?.length > 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">game_states policies</span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {testResults.databaseDiagnostics.data.policies.game_states_policies
                                ?.length || 0}{' '}
                              policies defined
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.databaseDiagnostics.data.policies
                                .journal_entries_policies?.length > 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">journal_entries policies</span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {testResults.databaseDiagnostics.data.policies
                                .journal_entries_policies?.length || 0}{' '}
                              policies defined
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Data */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Raw Diagnostic Data</h3>
                    <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-3">
                      <pre className="text-xs">
                        {JSON.stringify(testResults.databaseDiagnostics.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Error Information */}
                  {testResults.databaseDiagnostics.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Diagnostic Error</AlertTitle>
                      <AlertDescription>
                        {typeof testResults.databaseDiagnostics.error === 'string'
                          ? testResults.databaseDiagnostics.error
                          : JSON.stringify(testResults.databaseDiagnostics.error, null, 2)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Diagnostic Results</AlertTitle>
                  <AlertDescription>
                    Click &quot;Run Diagnostics&quot; to run comprehensive database diagnostics.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={runDiagnostics} disabled={isLoading} className="min-h-[44px]">
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Diagnostics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Authentication Diagnostics */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Diagnostics
                {testResults && !isLoading && (
                  <Badge
                    variant={testResults.authStatusCheck?.success ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {testResults.authStatusCheck?.isAuthenticated
                      ? 'Authenticated'
                      : 'Not Authenticated'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Detailed authentication status and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-8 w-8" />
                    <p className="text-muted-foreground">Checking authentication status...</p>
                  </div>
                </div>
              ) : testResults?.authStatusCheck ? (
                <div className="space-y-6">
                  {/* Auth Status */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Authentication Status</h3>
                    <div className="flex items-center gap-2">
                      {testResults.authStatusCheck.isAuthenticated ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.authStatusCheck.message}</span>
                    </div>
                    {testResults.authStatusCheck.isAuthenticated && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">User ID:</span>{' '}
                            {testResults.authStatusCheck.userId}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Role:</span>{' '}
                            {testResults.authStatusCheck.role}
                          </p>
                          {testResults.authStatusCheck.data?.user_exists_in_auth !== undefined && (
                            <p className="text-sm">
                              <span className="font-medium">Exists in auth.users:</span>{' '}
                              {testResults.authStatusCheck.data.user_exists_in_auth ? 'Yes' : 'No'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Raw Data */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Raw Auth Data</h3>
                    <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-3">
                      <pre className="text-xs">
                        {JSON.stringify(testResults.authStatusCheck.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Error Information */}
                  {testResults.authStatusCheck.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Auth Error</AlertTitle>
                      <AlertDescription>
                        {typeof testResults.authStatusCheck.error === 'string'
                          ? testResults.authStatusCheck.error
                          : JSON.stringify(testResults.authStatusCheck.error, null, 2)}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Not Authenticated Warning */}
                  {!testResults.authStatusCheck.isAuthenticated && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Required</AlertTitle>
                      <AlertDescription>
                        <p>
                          You need to be logged in to access database tables due to Row Level
                          Security (RLS) policies.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => (window.location.href = '/')}
                          className="mt-2 min-h-[44px]"
                        >
                          Go to Login Page
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Auth Results</AlertTitle>
                  <AlertDescription>
                    Click &quot;Run Diagnostics&quot; to check authentication status.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={runDiagnostics} disabled={isLoading} className="min-h-[44px]">
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Diagnostics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Journal Diagnostics */}
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Journal Save Diagnostics
                {testResults && !isLoading && (
                  <Badge
                    variant={
                      testResults.journalSaveDiagnostics?.success ? 'default' : 'destructive'
                    }
                    className="ml-2"
                  >
                    {testResults.journalSaveDiagnostics?.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Detailed diagnostics for journal save operations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-8 w-8" />
                    <p className="text-muted-foreground">Running journal diagnostics...</p>
                  </div>
                </div>
              ) : testResults?.journalSaveDiagnostics ? (
                <div className="space-y-6">
                  {/* Journal Save Status */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Journal Save Status</h3>
                    <div className="flex items-center gap-2">
                      {testResults.journalSaveDiagnostics.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.journalSaveDiagnostics.message}</span>
                    </div>
                  </div>

                  {/* Permissions */}
                  {testResults.journalSaveDiagnostics.data?.permissions && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Permissions</h3>
                      <div className="bg-muted rounded-md p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.journalSaveDiagnostics.data.permissions.can_insert ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">INSERT permission</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.journalSaveDiagnostics.data.permissions.can_select ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">SELECT permission</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.journalSaveDiagnostics.data.permissions.can_update ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">UPDATE permission</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {testResults.journalSaveDiagnostics.data.permissions.can_delete ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">DELETE permission</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {testResults.journalSaveDiagnostics.data?.errors && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Error Details</h3>
                      <div className="bg-muted rounded-md p-3">
                        <div className="space-y-2">
                          {testResults.journalSaveDiagnostics.data.errors.insert_error && (
                            <div className="space-y-1">
                              <p className="font-medium text-red-600">INSERT Error:</p>
                              <p className="text-xs">
                                {testResults.journalSaveDiagnostics.data.errors.insert_error}
                              </p>
                            </div>
                          )}
                          {testResults.journalSaveDiagnostics.data.errors.select_error && (
                            <div className="space-y-1">
                              <p className="font-medium text-red-600">SELECT Error:</p>
                              <p className="text-xs">
                                {testResults.journalSaveDiagnostics.data.errors.select_error}
                              </p>
                            </div>
                          )}
                          {testResults.journalSaveDiagnostics.data.errors.update_error && (
                            <div className="space-y-1">
                              <p className="font-medium text-red-600">UPDATE Error:</p>
                              <p className="text-xs">
                                {testResults.journalSaveDiagnostics.data.errors.update_error}
                              </p>
                            </div>
                          )}
                          {testResults.journalSaveDiagnostics.data.errors.delete_error && (
                            <div className="space-y-1">
                              <p className="font-medium text-red-600">DELETE Error:</p>
                              <p className="text-xs">
                                {testResults.journalSaveDiagnostics.data.errors.delete_error}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Data */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Raw Journal Diagnostic Data</h3>
                    <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-3">
                      <pre className="text-xs">
                        {JSON.stringify(testResults.journalSaveDiagnostics.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Store State */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Current Store State</h3>
                    <div className="bg-muted rounded-md p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Guardian Trust:</p>
                          <p className="text-sm">{guardianTrust}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Journal Entries:</p>
                          <p className="text-sm">{journalEntries.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Milestones:</p>
                          <p className="text-sm">
                            {milestones.filter((m) => m.achieved).length} achieved
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Save State:</p>
                          <p className="text-sm">{saveState.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Information */}
                  {testResults.journalSaveDiagnostics.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Journal Diagnostic Error</AlertTitle>
                      <AlertDescription>
                        {typeof testResults.journalSaveDiagnostics.error === 'string'
                          ? testResults.journalSaveDiagnostics.error
                          : JSON.stringify(testResults.journalSaveDiagnostics.error, null, 2)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Journal Diagnostic Results</AlertTitle>
                  <AlertDescription>
                    Click &quot;Run Diagnostics&quot; to check journal save operations.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={runDiagnostics} disabled={isLoading} className="min-h-[44px]">
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Diagnostics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/database-test')}
          className="min-h-[44px]"
        >
          <Database className="mr-2 h-4 w-4" />
          Database Test
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/journal-test')}
          className="min-h-[44px]"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Journal Test
        </Button>
      </div>
    </div>
  );
}

export default DiagnosticTest;
