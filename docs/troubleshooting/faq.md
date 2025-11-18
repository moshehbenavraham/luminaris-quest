# Frequently Asked Questions & Troubleshooting

## 🌟 About Luminaris Quest

### What is Luminari's Quest?
**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure designed to help young adults process trauma from losing parents and experiencing homelessness during their teenage years. The game combines fantasy storytelling with evidence-based therapeutic techniques to create a safe space for healing and growth.

### Why was this project created?
This project was built for the World's Largest AI Hackathon to demonstrate how AI can be used for therapeutic purposes. It addresses the real need for accessible mental health resources for young adults who have experienced significant trauma.

### How was this built?
The project was built primarily using AI. This allowed for rapid prototyping, iterative development, and seamless integration of complex AI services. Other tools used include OpenAI's "Project" feature (for keeping track and taking notes for the project), Cursor (for local debugging), Bolt.new (initial deployment), and Windsurf (was interested in testing platform, very limited usage).

---

## 🛠️ Technical Setup

### How do I get started with development?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moshehbenavraham/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then fill in your API keys in the `.env` file.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### What environment variables do I need?
Check the `.env.example` file for the complete list. You'll need API keys for:
- Supabase (for backend and authentication)
- OpenAI (for narrative generation) - *Planned*
- Leonardo.AI (for image generation) - *Planned*
- ElevenLabs (for voice synthesis) - *Planned*

### Why can't I see my environment variables?
Make sure you:
1. Copied `.env.example` to `.env`
2. Added your actual API keys to `.env`
3. Restarted your development server after editing `.env`
4. Used the `VITE_` prefix for frontend environment variables

### How do I fix the Rollup build error?
If you encounter `Cannot find module @rollup/rollup-linux-x64-gnu` error:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Or install the specific dependency: `npm install @rollup/rollup-linux-x64-gnu --save-optional`

---

## 🏗️ Development

### What's the current project structure?
```
src/
├── components/       # React components organized by feature
│   ├── ui/          # Shadcn/UI base components
│   ├── layout/      # Layout components (Navbar, Sidebar, Footer)
│   ├── auth/        # Authentication components
│   └── *.tsx        # Feature-specific components
├── pages/           # Route components (extracted from App.tsx)
│   ├── Home.tsx     # Landing page with authentication
│   ├── Adventure.tsx # Main gameplay interface
│   ├── Progress.tsx  # Progress tracking and journal display
│   ├── Profile.tsx   # User profile management
│   └── Legal.tsx     # Legal information and compliance
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and providers
├── store/           # State management (Zustand)
├── engine/          # Game logic and scene engine
└── integrations/    # External service integrations
```

### What coding standards should I follow?
- **TypeScript:** Strict mode enabled (see `tsconfig.*.json`)
- **Styling:** Tailwind CSS only (no separate CSS files)
- **Components:** Keep under 500 lines, follow atomic design principles
- **Code Quality:** Use ESLint and Prettier (see `eslint.config.js`, `.prettierrc`)
- **Testing:** Write tests for new features
- **Documentation:** Add JSDoc comments for complex functions

### How do I add a new component?
1. Create the component in the appropriate `src/components/` subdirectory
2. Follow the atomic design pattern (atoms, molecules, organisms)
3. Use TypeScript with proper prop interfaces
4. Style with Tailwind CSS classes
5. Add to the component map in `../architecture/components.md` if it's a major feature

### What UI library does this use?
We use [Shadcn/UI](https://ui.shadcn.com/) components built on top of Radix UI primitives, styled with Tailwind CSS. Check `components.json` for configuration.

---

## 🤖 AI Integrations

### Which AI services are integrated?
Currently planned integrations:
- **OpenAI:** Narrative generation and story progression (*Planned*)
- **Leonardo.AI:** Dynamic visual art generation (*Planned*)
- **ElevenLabs:** Voice synthesis for narration (*Planned*)
- **Suno:** Music generation (manually curated) (*Planned*)

### How do the AI features work?
The game will use AI to:
1. Generate personalized story content based on user choices
2. Create fantasy artwork that matches story moments
3. Provide immersive voice narration
4. Adapt the therapeutic content to individual needs

### Can I test without API keys?
Yes! The app includes fallback content and stub responses for development. The core gameplay mechanics, journal system, and progress tracking work without AI integrations.

---

## 🎮 Game Design

### What makes this therapeutic?
The game incorporates:
- Evidence-based therapeutic techniques
- Safe exploration of difficult emotions through journaling
- Resilience-building activities
- Choice-driven narrative that empowers users
- Fantasy metaphors for real-world challenges
- Milestone-based progress tracking

### What's the journal system?
The enhanced journal system features:
- **Full CRUD operations**: Create, read, update, and delete journal entries
- **Inline editing**: Edit entries without leaving the page
- **Visual distinction**: Different styles for milestone vs. learning entries
- **Edit history**: Track when entries were modified
- **Confirmation dialogs**: Prevent accidental deletions
- **Automatic prompts**: Journal entries triggered by milestones and learning moments

### Is this a replacement for therapy?
No. Luminari's Quest is designed as a supplemental tool to support healing and growth. It's not a replacement for professional mental health care.

### What age group is this for?
The game is designed for young adults (18-25) who have experienced parental loss and homelessness during their teenage years.

---

## 🚀 Deployment & Production

### How do I build for production?
```bash
npm run build
```

### How do I test the production build locally?
```bash
npm run preview
```

### Where is this deployed?
The project is configured for deployment on Netlify. Check `netlify.toml` for deployment configuration.

### What about environment variables in production?
Never commit your `.env` file! Set environment variables in your deployment platform (Netlify, Vercel, etc.). Keep `.env.example` updated with all required variables.

---

## 📜 Legal & Licensing

### What license does this use?
- **Code:** MIT License
- **Game Content:** Open Game License (OGL) and Open RPG Creative (ORC)
- See the `LICENSE` file and `licenses/` directory for details

### Can I use this commercially?
Check the specific license terms in the `LICENSE` file. The MIT license is generally permissive, but game content may have different restrictions.

### What about third-party content?
All third-party licenses are documented in `licenses/third-party.md`. We only use OGL/ORC compliant content to avoid Product Identity issues.

---

## 🤝 Contributing

### How can I contribute?
1. Read `../contributing/index.md` for detailed guidelines
2. Check our [Code of Conduct](../contributing/code-of-conduct.md)
3. Look for issues labeled "good first issue"
4. Fork the repo and create a feature branch
5. Submit a pull request

### What areas need help?
Based on recent development priorities:
- **Supabase Integration**: Complete journal entry persistence
- **AI Features**: Implement OpenAI narrative generation
- **Enhanced UX**: Improve journal search and filtering
- **Performance**: Optimize bundle size and loading times
- **Testing**: Expand test coverage for new components
- **Accessibility**: Improve screen reader support

### What's not accepting contributions?
- Core game narrative/story changes
- Major architectural changes without discussion
- New AI service integrations without approval
- Therapeutic content (requires expert review)

---

## 🆘 General Troubleshooting

### The app won't start
1. Make sure you ran `npm install`
2. Check that your Node.js version is compatible (see `package.json` engines)
3. Verify your `.env` file exists and has the required variables
4. Try deleting `node_modules` and running `npm install` again

### TypeScript/Build errors
1. Run `npm run build` to check for TypeScript errors
2. Ensure all imports are correct and files exist
3. Check that all component props have proper interfaces
4. Verify no circular imports exist
5. Make sure all variables are properly destructured from stores

### API integration issues
1. Verify your API keys are correct in `.env`
2. Check API rate limits and quotas
3. Look at browser console for specific error messages
4. Test with stub/fallback content first

### Journal system issues
1. Check browser console for state management errors
2. Verify Zustand store is properly hydrated
3. Clear local storage if experiencing persistence issues
4. Check that journal entries have unique IDs

### Performance issues
1. Check bundle size with `npm run build`
2. Use React DevTools to identify re-renders
3. Optimize images and assets
4. Consider code splitting for large components

---

## 🗄️ Supabase Database Troubleshooting

### 404 Errors for Database Tables

If you're seeing 404 errors in your browser console when the application tries to access Supabase tables, follow these steps:

#### 1. Verify Database Tables Exist

The most common cause of 404 errors is that the database tables don't exist in your Supabase instance:

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

### Advanced Database Troubleshooting

#### Database Schema Verification

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

#### RLS Policy Verification

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

#### Testing Database Connection

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

### Common Error Messages and Solutions

#### "Error: relation "public.game_states" does not exist"

**Solution**: The database tables haven't been created. Run the migration SQL script in Supabase SQL Editor.

#### "FetchError: Failed to fetch"

**Solution**: Network connectivity issue or incorrect Supabase URL. Check your internet connection and verify the VITE_SUPABASE_URL environment variable.

#### "PostgrestError: JWT token is invalid"

**Solution**: Authentication issue. Try logging out and back in, or check if your Supabase anon key is correct.

#### "PostgrestError: new row violates row-level security policy"

**Solution**: RLS policy is preventing the operation. Verify that your RLS policies are correctly configured and that the user has the necessary permissions.

### Next Steps After Fixing Database Issues

1. Verify data persistence by performing actions that should save data
2. Check that data loads correctly when refreshing the page
3. Test the full user journey from authentication to game progression
4. Implement additional error handling and user feedback for database operations
5. Consider adding a database status indicator in the UI

---

## 🔗 Additional Resources

- **Project Repository:** [https://github.com/moshehbenavraham/luminaris-quest](https://github.com/moshehbenavraham/luminaris-quest)
- **Community:** [Skool Community](https://www.skool.com/ai-with-apex/about)
- **Component Documentation:** [../architecture/components.md](../architecture/components.md)
- **Contributing Guide:** [../contributing/index.md](../contributing/index.md)
- **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase JavaScript Client:** [https://supabase.com/docs/reference/javascript/introduction](https://supabase.com/docs/reference/javascript/introduction)
- **Row Level Security Guide:** [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📞 Getting Help

Still have questions? Here's how to get help:

1. **Check existing documentation** in the `../` folder
2. **Review the changelog** for recent updates
3. **Search existing issues** on GitHub
4. **Create a new issue** with detailed information
5. **Join our community** on Skool for discussions
6. **Read the source code** - it's well-documented!

---

*Last updated: December 2024*

