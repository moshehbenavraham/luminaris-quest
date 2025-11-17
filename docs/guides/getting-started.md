# Getting Started with Luminari's Quest

**Quick Start Guide for New Contributors and Users**

---

## Overview

Luminari's Quest is a therapeutic AI-powered RPG built with React 18, TypeScript 5.3+, and Vite 6.3+. This guide will help you get the project running locally in under 10 minutes.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

| Tool | Version | Purpose | Download |
|------|---------|---------|----------|
| **Node.js** | 18.0+ | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | Included with Node.js | Package manager | Comes with Node.js |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Optional (for full features)

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Supabase Account** | Database and authentication | [supabase.com](https://supabase.com/) |
| **OpenAI API** | AI narration (planned feature) | [openai.com](https://openai.com/) |

### Verify Installation

```bash
# Check Node.js version (must be 18.0 or higher)
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

---

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/moshehbenavraham/luminaris-quest.git

# Navigate to project directory
cd luminaris-quest
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - React 18.2+ (UI framework)
# - TypeScript 5.3+ (type safety)
# - Vite 6.3+ (build tool)
# - Zustand 5.0+ (state management)
# - Supabase client (backend)
# - Tailwind CSS 3.4+ (styling)
# - shadcn/ui components
# - And 60+ other dependencies
```

**Expected output:**
```
added 450+ packages in ~30s
```

### 3. Environment Configuration

The project requires environment variables for backend services:

```bash
# Check if .env.example exists
ls -la .env.example
```

**Create your local environment file:**

```bash
# Copy the example file
cp .env.example .env
```

**Required Variables** (edit `.env` file):

```env
# REQUIRED: Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OPTIONAL: AI Features (for future features)
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_LEONARDO_API_KEY=your-leonardo-api-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key

# OPTIONAL: Development
VITE_DEBUG_MODE=true
```

#### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com/) and sign up/login
2. Create a new project
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** → `VITE_SUPABASE_URL`
5. Copy your **anon/public** key → `VITE_SUPABASE_ANON_KEY`

### 4. Database Setup

The application requires two database tables: `game_states` and `journal_entries`.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to your Supabase account
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push database migrations
supabase db push
```

#### Option B: Manual Setup via Dashboard

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file:
   ```bash
   cat docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql
   ```
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **Run**

#### Verify Database Setup

After setup, verify these tables exist in your Supabase project:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('game_states', 'journal_entries');
```

**Expected output:**
```
table_name
-----------------
game_states
journal_entries
```

### 5. Start Development Server

```bash
# Start the development server with hot reload
npm run dev
```

**Expected output:**
```
  VITE v6.3.5  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open your browser:**
- Navigate to `http://localhost:5173`
- You should see the Luminari's Quest landing page

---

## First Steps After Installation

### 1. Create a Test Account

1. Click **"Start Your Journey"** on the homepage
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. Click **Sign Up**

### 2. Verify Database Connection

Check the browser console (F12) for connection status:

```javascript
// Should see:
✓ Database health check successful
✓ Connected to Supabase
```

### 3. Try Your First Scene

1. After creating an account, you'll see the Adventure page
2. Click on the first scene: **"The Worried Merchant"**
3. Make a choice (Bold or Cautious)
4. Roll the dice (d20 check)
5. See the outcome and Guardian Trust change

### 4. Verify Game State Persistence

1. Make a few choices to change your Guardian Trust
2. Close the browser tab
3. Reopen `http://localhost:5173`
4. Login again
5. Verify your progress was saved (Guardian Trust value persists)

---

## Common First-Time Issues

### Issue: Node Version Too Old

**Error:**
```
error: This version of npm is not compatible with Node.js v16.x
```

**Solution:**
```bash
# Check your Node version
node --version

# If below 18.0, download latest from nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

### Issue: Port Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Option 1: Use a different port
npm run dev -- --port 3000

# Option 2: Kill the process using port 5173
# On macOS/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Database Connection Failed

**Error (in browser console):**
```
Failed to fetch from Supabase: Network error
```

**Solution:**
1. Verify your `.env` file has correct credentials
2. Check your Supabase project is active
3. Verify RLS policies are enabled
4. Test connection manually:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

### Issue: Build Errors After Install

**Error:**
```
Failed to resolve import "@/components/..."
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

### Issue: TypeScript Errors

**Error:**
```
Cannot find module '@/...' or its corresponding type declarations
```

**Solution:**
```bash
# Rebuild TypeScript paths
npx tsc --noEmit

# If persists, check tsconfig.json has correct paths
cat tsconfig.json | grep paths
```

---

## Development Workflow

### Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run build:dev        # Build with development optimizations
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint checks
npm run lint -- --fix    # Auto-fix linting issues
npm run format           # Format code with Prettier

# Testing
npm test                 # Run test suite (370+ tests)
npm run test:coverage    # Run tests with coverage report

# Performance
npm run lighthouse       # Run Lighthouse audit
npm run optimize-images  # Optimize image assets
```

### Hot Reload

The development server supports hot module replacement (HMR):

1. Edit any file in `src/`
2. Save the file
3. Browser updates automatically (no refresh needed)
4. State is preserved during updates

### Project Structure Quick Reference

```
src/
├── components/    # React components (UI building blocks)
├── pages/         # Route pages (Home, Adventure, Profile, Progress)
├── hooks/         # Custom React hooks (10 hooks)
├── store/         # Zustand state management (game-store.ts)
├── engine/        # Game logic (combat-engine, scene-engine)
├── data/          # Static game data (scenes, shadows, audio)
├── integrations/  # External services (Supabase)
└── lib/           # Utilities and helpers
```

---

## Next Steps

### For Players

1. **Complete the Tutorial**: Play through the first 5 scenes
2. **Explore Journal System**: Write your first reflection
3. **Try Combat**: Face a Shadow Manifestation
4. **Check Progress**: View your stats on the Progress page

### For Developers

1. **Read Architecture Docs**: [docs/architecture/overview.md](../architecture/overview.md)
2. **Review API Reference**: [docs/api/index.md](../api/index.md)
3. **Check Contributing Guide**: [docs/contributing/index.md](../contributing/index.md)
4. **Explore Test Suite**: Run `npm test` to see 370+ tests

### For Designers

1. **Review Component Library**: Check `src/components/ui/` for shadcn components
2. **Study Accessibility**: See WCAG 2.1 AA compliance in action
3. **Explore Theme System**: Check Tailwind configuration in `tailwind.config.ts`

---

## Getting Help

### Documentation

- **Architecture**: [docs/architecture/](../architecture/)
- **API Reference**: [docs/api/](../api/)
- **Features**: [docs/features/](../features/)
- **Troubleshooting**: [docs/troubleshooting/](../troubleshooting/)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/moshehbenavraham/luminaris-quest/issues)
- **Discussions**: [Ask questions](https://github.com/moshehbenavraham/luminaris-quest/discussions)
- **Skool Community**: [Join the community](https://www.skool.com/ai-with-apex/about)

### Emergency Troubleshooting

If all else fails:

```bash
# Nuclear option: Complete reset
rm -rf node_modules package-lock.json .vite
npm install
npm run dev -- --force
```

---

## Verification Checklist

Before moving forward, verify:

- [ ] Node.js 18.0+ installed
- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] `.env` file created with Supabase credentials
- [ ] Database tables created (`game_states`, `journal_entries`)
- [ ] Development server starts without errors
- [ ] Homepage loads at `http://localhost:5173`
- [ ] Can create a test account
- [ ] Can complete a scene and see state changes
- [ ] Browser console shows no critical errors

---

**Congratulations!** 🎉 You're now ready to explore Luminari's Quest or contribute to the project.

**Next Recommended Reading:**
- [User Guide](./user-guide.md) - Learn how to play the game
- [Architecture Overview](../architecture/overview.md) - Understand the system design
- [Contributing Guide](../contributing/index.md) - Start contributing

---

*Last Updated: 2025-11-17*  
*Verified Against: package.json v0.1.1, Node.js 18.0+, Vite 6.3+*

