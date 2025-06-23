import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, BookOpen } from 'lucide-react';
import type { JournalEntry } from '@/components/JournalModal';
import {
  getJournalEntries,
  runJournalPersistenceTests
} from '@/lib/test-journal-persistence';
import { useGameStore } from '@/store/game-store';

export function JournalTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('database');
  const [testResults, setTestResults] = useState<any>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  
  // Get store actions for testing
  const { 
    addJournalEntry, 
    deleteJournalEntry, 
    journalEntries: storeEntries,
    saveToSupabase,
    loadFromSupabase
  } = useGameStore();

  // Run database-level tests
  const runDatabaseTests = async () => {
    setIsLoading(true);
    try {
      const results = await runJournalPersistenceTests();
      setTestResults(results);
      
      // If entries test was successful, update journal entries
      if (results.entriesTest.success && results.entriesTest.entries) {
        setJournalEntries(results.entriesTest.entries);
      }
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

  // Test store-level journal operations
  const testStoreOperations = async () => {
    setIsLoading(true);
    try {
      // Create a test journal entry
      const testEntry: JournalEntry = {
        id: `store-test-${Date.now()}`,
        type: 'learning',
        trustLevel: 50,
        content: 'Test journal entry from store',
        title: 'Store Test Entry',
        timestamp: new Date(),
        tags: ['test', 'store']
      };
      
      // Add the entry to the store
      addJournalEntry(testEntry);
      
      // Save to Supabase
      await saveToSupabase();
      
      // Load from Supabase to verify
      await loadFromSupabase();
      
      // Check if entry exists in store
      const entryExists = storeEntries.some(entry => entry.id === testEntry.id);
      
      // Clean up - delete the test entry
      if (entryExists) {
        deleteJournalEntry(testEntry.id);
        await saveToSupabase();
      }
      
      setTestResults({
        overallSuccess: entryExists,
        storeTest: {
          success: entryExists,
          message: entryExists 
            ? 'Store operations test successful' 
            : 'Failed to verify entry after save/load cycle',
          entry: testEntry
        }
      });
    } catch (error: any) {
      console.error('Error testing store operations:', error);
      setTestResults({
        overallSuccess: false,
        storeTest: {
          success: false,
          message: `Error testing store operations: ${error.message}`,
          error: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch journal entries
  const fetchJournalEntries = async () => {
    setIsLoading(true);
    try {
      const result = await getJournalEntries(20);
      if (result.success && result.entries) {
        setJournalEntries(result.entries);
      } else {
        console.error('Failed to fetch journal entries:', result.error);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Journal Persistence Test</h1>
        <p className="text-xl text-muted-foreground">
          This page tests journal entry persistence between the application and Supabase.
        </p>
      </div>

      <Tabs defaultValue="database" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="database">Database Tests</TabsTrigger>
          <TabsTrigger value="store">Store Tests</TabsTrigger>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
        </TabsList>

        {/* Database Tests */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database-Level Journal Tests
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
                Testing direct database operations for journal entries
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
                  {/* RPC Test */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Journal Persistence RPC Test</h3>
                    <div className="flex items-center gap-2">
                      {testResults.rpcTest?.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.rpcTest?.message}</span>
                    </div>
                    {testResults.rpcTest?.data && (
                      <div className="rounded-md bg-muted p-3">
                        <pre className="text-xs">
                          {JSON.stringify(testResults.rpcTest.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {testResults.rpcTest?.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>RPC Test Error</AlertTitle>
                        <AlertDescription>
                          {typeof testResults.rpcTest.error === 'string' 
                            ? testResults.rpcTest.error 
                            : JSON.stringify(testResults.rpcTest.error, null, 2)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Direct Test */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Direct Journal Creation Test</h3>
                    <div className="flex items-center gap-2">
                      {testResults.directTest?.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.directTest?.message}</span>
                    </div>
                    {testResults.directTest?.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Direct Test Error</AlertTitle>
                        <AlertDescription>
                          {typeof testResults.directTest.error === 'string' 
                            ? testResults.directTest.error 
                            : JSON.stringify(testResults.directTest.error, null, 2)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Entries Test */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Journal Entries Retrieval Test</h3>
                    <div className="flex items-center gap-2">
                      {testResults.entriesTest?.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>
                        {testResults.entriesTest?.success 
                          ? `Found ${testResults.entriesTest.count || 0} journal entries` 
                          : testResults.entriesTest?.message}
                      </span>
                    </div>
                    {testResults.entriesTest?.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Entries Test Error</AlertTitle>
                        <AlertDescription>
                          {typeof testResults.entriesTest.error === 'string' 
                            ? testResults.entriesTest.error 
                            : JSON.stringify(testResults.entriesTest.error, null, 2)}
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
                          <li>Verify that you're logged in</li>
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
                  <AlertTitle>No Test Results</AlertTitle>
                  <AlertDescription>
                    Click "Run Database Tests" to test journal persistence at the database level.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={runDatabaseTests} 
                disabled={isLoading}
                className="min-h-[44px]"
              >
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Database Tests
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Store Tests */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Store-Level Journal Tests
                {testResults && activeTab === 'store' && !isLoading && (
                  <Badge 
                    variant={testResults.overallSuccess ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {testResults.overallSuccess ? "Test Passed" : "Test Failed"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Testing journal persistence through the game store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-8 w-8" />
                    <p className="text-muted-foreground">Running store tests...</p>
                  </div>
                </div>
              ) : testResults && activeTab === 'store' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Store Operations Test</h3>
                    <div className="flex items-center gap-2">
                      {testResults.storeTest?.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{testResults.storeTest?.message}</span>
                    </div>
                    {testResults.storeTest?.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Store Test Error</AlertTitle>
                        <AlertDescription>
                          {testResults.storeTest.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Current Store State</h3>
                    <div className="rounded-md bg-muted p-3">
                      <p className="mb-2 text-sm font-medium">Journal Entries in Store: {storeEntries.length}</p>
                      {storeEntries.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                          <pre className="text-xs">
                            {JSON.stringify(storeEntries.map(entry => ({
                              id: entry.id,
                              type: entry.type,
                              title: entry.title,
                              timestamp: entry.timestamp.toISOString()
                            })), null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No journal entries in store</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Test Operations</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const testEntry: JournalEntry = {
                            id: `manual-test-${Date.now()}`,
                            type: 'learning',
                            trustLevel: 50,
                            content: 'Manual test journal entry',
                            title: 'Manual Test',
                            timestamp: new Date(),
                            tags: ['manual', 'test']
                          };
                          addJournalEntry(testEntry);
                        }}
                      >
                        Add Test Entry
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          await saveToSupabase();
                          alert('Save to Supabase called');
                        }}
                      >
                        Save to Supabase
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          await loadFromSupabase();
                          alert('Load from Supabase called');
                        }}
                      >
                        Load from Supabase
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Test Results</AlertTitle>
                  <AlertDescription>
                    Click "Run Store Tests" to test journal persistence through the game store.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testStoreOperations} 
                disabled={isLoading}
                className="min-h-[44px]"
              >
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Store Tests
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Journal Entries */}
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Journal Entries
              </CardTitle>
              <CardDescription>
                View journal entries stored in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-8 w-8" />
                    <p className="text-muted-foreground">Loading journal entries...</p>
                  </div>
                </div>
              ) : journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.map((entry, index) => (
                    <Card key={entry.id || index} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{entry.title}</CardTitle>
                          <Badge variant={entry.type === 'milestone' ? 'default' : 'secondary'}>
                            {entry.type}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          Created: {new Date(entry.created_at).toLocaleString()} • 
                          Trust Level: {entry.trust_level}
                          {entry.is_edited && entry.edited_at && (
                            <span className="ml-2">
                              • Edited: {new Date(entry.edited_at).toLocaleString()}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm">{entry.content}</p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No journal entries found in the database.</p>
                  <p className="mt-2 text-sm">
                    Create journal entries in the Adventure or Progress pages.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={fetchJournalEntries} 
                disabled={isLoading}
                className="min-h-[44px]"
              >
                {isLoading ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh Journal Entries
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/database-test'}
          className="min-h-[44px]"
        >
          <Database className="mr-2 h-4 w-4" />
          Database Connection Test
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="min-h-[44px]"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}

export default JournalTest;