# Supabase Database Troubleshooting Guide

## Common Issues and Solutions

### 404 Errors for Database Tables

If you're seeing 404 errors in your browser console when the application tries to access Supabase tables, follow these steps to diagnose and fix the issue:

#### 1. Verify Database Tables Exist

The most common cause of 404 errors is that the database tables don't exist in your Supabase instance. To check:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (currently `lxjetnrmjyazegwnymkk`)
3. Go to the "Table Editor" section
4. Check if `game_states` and `journal_entries` tables exist

If the tables don't exist, you need to run the database migration:

```sql
-- Run this SQL in the Supabase SQL Editor
-- Copy the entire contents of:
-- supabase/migrations/initial_game_database_schema.sql
```

#### 2. Check Environment Variables

Ensure your environment variables are correctly set:

1. Verify `.env` file exists with the following variables:
   ```
   VITE_SUPABASE_URL=https://lxjetnrmjyazegwnymkk.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. If deploying to Netlify or another platform, check that these environment variables are configured in your deployment settings.

3. Restart your development server after updating environment variables.

#### 3. Verify Authentication

Database 404 errors can also occur if the user isn't properly authenticated:

1. Check if you're logged in by looking at the auth state in your browser's local storage
2. Try logging out and logging back in
3. Check browser console for authentication errors

#### 4. Inspect Network Requests

Use your browser's developer tools to inspect the network requests:

1. Open Developer Tools (F12 or right-click > Inspect)
2. Go to the Network tab
3. Filter for requests to your Supabase URL
4. Look for requests to `game_states` or `journal_entries`
5. Check the request headers, payload, and response

Common issues visible in network requests:
- Missing or invalid Authorization header
- Incorrect table names in the request URL
- RLS policy rejections (403 Forbidden instead of 404)

#### 5. Check Row Level Security (RLS) Policies

If tables exist but you're still getting 404 errors, RLS policies might be blocking access:

1. In Supabase Dashboard, go to "Authentication" > "Policies"
2. Verify that policies exist for both tables allowing SELECT, INSERT, UPDATE, and DELETE
3. Ensure policies use `auth.uid() = user_id` condition
4. Check if policies are enabled

#### 6. Test with Supabase Client

You can test direct database access with the Supabase client in your browser console:

```javascript
// Run this in your browser console
const { supabase } = await import('/src/lib/supabase.js');
const { data, error } = await supabase.from('game_states').select('*');
console.log('Data:', data, 'Error:', error);
```

This will help determine if the issue is with your application code or with Supabase access.

### Data Not Persisting to Supabase

If data changes in your application but isn't being saved to Supabase:

#### 1. Check Save Function Execution

Verify that the save function is being called:

1. Add console logs to the `saveToSupabase` function in `src/store/game-store.ts`
2. Check if the function is being called when you expect it to
3. Look for any errors in the console during the save operation

#### 2. Verify Data Format

Ensure the data being sent to Supabase matches the expected format:

1. Check the structure of objects being saved against the database schema
2. Verify that JSON data is properly serialized
3. Ensure date objects are properly converted to ISO strings

#### 3. Check for Silent Failures

The save function might be failing silently:

1. Add more detailed error logging in try/catch blocks
2. Check for network issues during save operations
3. Verify that the user has the necessary permissions

#### 4. Manual Trigger for Saving

Add a manual save button to test the save functionality:

```jsx
<button 
  onClick={() => useGameStore.getState().saveToSupabase()} 
  className="btn-primary"
>
  Save Game State
</button>
```

This can help isolate whether the issue is with automatic saving or with the save function itself.

## Advanced Troubleshooting

### Database Schema Verification

To verify that your database schema matches what the application expects:

```sql
-- Run in Supabase SQL Editor
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name IN ('game_states', 'journal_entries') 
ORDER BY 
  table_name, ordinal_position;
```

### RLS Policy Verification

To verify your RLS policies:

```sql
-- Run in Supabase SQL Editor
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM 
  pg_policies 
WHERE 
  schemaname = 'public' AND 
  tablename IN ('game_states', 'journal_entries');
```

### Testing Database Connection

Create a simple test page to verify database connection:

```jsx
// src/pages/DatabaseTest.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function DatabaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('game_states')
          .select('*')
          .limit(1);
        
        if (error) {
          setStatus('Error');
          setError(error.message);
        } else {
          setStatus('Connected');
          setData(data);
        }
      } catch (err: any) {
        setStatus('Exception');
        setError(err.message);
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      {data && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          <strong>Data:</strong>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

## Common Error Messages and Solutions

### "Error: relation "public.game_states" does not exist"

**Solution**: The database tables haven't been created. Run the migration SQL script in Supabase SQL Editor.

### "FetchError: Failed to fetch"

**Solution**: Network connectivity issue or incorrect Supabase URL. Check your internet connection and verify the VITE_SUPABASE_URL environment variable.

### "PostgrestError: JWT token is invalid"

**Solution**: Authentication issue. Try logging out and back in, or check if your Supabase anon key is correct.

### "PostgrestError: new row violates row-level security policy"

**Solution**: RLS policy is preventing the operation. Verify that your RLS policies are correctly configured and that the user has the necessary permissions.

## Next Steps After Fixing Database Issues

1. Verify data persistence by performing actions that should save data
2. Check that data loads correctly when refreshing the page
3. Test the full user journey from authentication to game progression
4. Implement additional error handling and user feedback for database operations
5. Consider adding a database status indicator in the UI

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Community Discord](https://discord.supabase.com/)