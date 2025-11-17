# Deployment Guide

## Overview

This guide covers deploying Luminari's Quest across different environments, from local development to production. The application supports multiple deployment platforms and configurations.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Platform-Specific Guides](#platform-specific-guides)
7. [Database Migrations](#database-migrations)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Health Checks](#monitoring--health-checks)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedures](#rollback-procedures)

## Environment Overview

### Environment Strategy

| Environment | Purpose | Platform | Database | Domain |
|-------------|---------|----------|----------|---------|
| **Local** | Development & testing | Local machine | Supabase Cloud | localhost:8080 |
| **Development** | Team integration | Netlify/Vercel | Supabase Cloud | dev.luminarisquest.org |
| **Staging** | Pre-production testing | Netlify/Vercel | Supabase Cloud | staging.luminarisquest.org |
| **Production** | Live application | Netlify/Vercel | Supabase Cloud | luminarisquest.org |

### Deployment Flow

```
Local Development → Development → Staging → Production
      ↓                ↓           ↓          ↓
   localhost:8080  dev.domain   staging.domain  domain.com
```

## Prerequisites

### Required Accounts & Services

- **GitHub Account**: For code repository and CI/CD
- **Supabase Account**: For database and authentication
- **Netlify/Vercel Account**: For hosting and deployment
- **Domain Provider**: For custom domain (optional)

### Required Tools

- **Node.js**: Version 18.0 or higher (Current: 20.11.19+)
- **npm**: Package manager (version 9+)
- **Git**: Version control
- **Supabase CLI**: For database management (optional but recommended)

### API Keys & Credentials

Gather these before starting deployment:

- Supabase project URL and anon key
- OpenAI API key (for AI features)
- Leonardo.AI API key (optional)
- ElevenLabs API key (optional)
- Sentry DSN (optional, for error tracking)

## Local Development

### Local Development Scenarios

There are **two different ways** to develop locally, depending on your needs:

#### Scenario 1: Local App → Production/Staging Database (Recommended)

**When to use:**
- Default development workflow
- Working on features that don't require schema changes
- Want to test with production-like data
- Multiple developers sharing the same database
- Testing authentication flows

**Setup:**
```bash
# .env.local - connects to cloud Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# DO NOT set VITE_LOCAL_SUPABASE_URL

# Optional (not currently used):
# VITE_OPENAI_API_KEY=your-openai-key
```

**Run:**
```bash
npm run dev  # Runs on localhost:8080, connected to cloud database
```

#### Scenario 2: Local App → Local Supabase Instance (Advanced)

**When to use:**
- Testing database migrations before deploying
- Working offline
- Developing schema changes
- Want complete isolation from production

**Prerequisites:**
- Supabase CLI installed: `npm install -g supabase`
- Docker Desktop running (required for local Supabase)

**Setup:**
```bash
# Start local Supabase instance
supabase start  # Runs on http://localhost:54321

# .env.local - connects to local Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co  # Fallback for non-local
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_LOCAL_SUPABASE_URL=http://localhost:54321
VITE_LOCAL_SUPABASE_ANON_KEY=your-local-anon-key  # From supabase start output

# Optional (not currently used):
# VITE_OPENAI_API_KEY=your-openai-key
```

**Run:**
```bash
npm run dev  # Runs on localhost:8080, connected to local database
```

**Stop local Supabase:**
```bash
supabase stop
```

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/moshehbenavraham/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration (Scenario 1: Production Database)**
   Create `.env.local` in the root directory:
   ```env
   # Local Development → Production Database (Recommended)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Optional: AI Features (planned, not currently used)
   # VITE_OPENAI_API_KEY=your-openai-key
   # VITE_LEONARDO_API_KEY=your-leonardo-key
   # VITE_ELEVENLABS_API_KEY=your-elevenlabs-key
   # VITE_SENTRY_DSN=your-sentry-dsn

   # For Scenario 2 (Local Database), uncomment and add:
   # VITE_LOCAL_SUPABASE_URL=http://localhost:54321
   # VITE_LOCAL_SUPABASE_ANON_KEY=your-local-anon-key
   ```

4. **Database Setup**
   
   **Option 1: Using Supabase CLI (Recommended)**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login and link project
   supabase login
   supabase link --project-ref your-project-id
   
   # Apply migrations
   supabase db push
   ```
   
   **Option 2: Manual Setup via Supabase Dashboard**
   1. Go to your Supabase project dashboard
   2. Navigate to SQL Editor
   3. Run the latest migration files in order:
      - `supabase/migrations/20250622204304_hidden_morning.sql`
      - `supabase/migrations/20250622204705_cool_truth.sql`
      - `supabase/migrations/20250622204950_stark_flame.sql`
      - `supabase/migrations/20250623061517_fragrant_canyon.sql`
      - `supabase/migrations/20250623090533_gentle_silence.sql`
      - `supabase/migrations/20250624000000_add_energy_fields.sql`
      - `supabase/migrations/20250628000000_add_missing_point_columns.sql`
      - `supabase/migrations/20250629000000_add_experience_points.sql`

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:8080` (Note: Updated from port 5173)

### Development Workflow

```bash
# Daily development workflow
git pull origin main                    # Get latest changes
npm install                            # Update dependencies
npm run lint                           # Check code quality
npm test                              # Run tests (68+ tests)
npm run dev                           # Start development

# Before committing
npm run lint --fix                     # Fix linting issues
npm run format                        # Format code with Prettier
npm test                              # Ensure all tests pass
npm run build                         # Verify build works
```

### Available Scripts

```bash
# Development
npm run dev                           # Start dev server (port 8080)
npm run preview                       # Preview production build

# Building
npm run build                         # Standard build
npm run build:dev                     # Development mode build
npm run build:deploy                  # Deployment build with pre-install

# Code Quality
npm run lint                          # ESLint check
npm run format                        # Prettier formatting
npm test                             # Run all tests
npm run test:coverage                 # Run tests with coverage

# Performance & Optimization
npm run optimize-images               # Optimize PNG→WebP/AVIF
npm run lighthouse                    # Run Lighthouse audit
npm run lighthouse:collect            # Collect performance data
npm run lighthouse:assert             # Assert performance budgets
npm run lighthouse:full               # Full Lighthouse CI run
```

## Staging Deployment

### Netlify Staging Setup

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the staging branch

2. **Build Configuration**
   ```toml
   # netlify.toml (staging configuration)
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "20"
     NPM_VERSION = "9"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Environment Variables**
   In Netlify Dashboard → Site Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://staging-project.supabase.co
   VITE_SUPABASE_ANON_KEY=staging-anon-key
   VITE_OPENAI_API_KEY=your-openai-key
   VITE_LEONARDO_API_KEY=your-leonardo-key
   VITE_ELEVENLABS_API_KEY=your-elevenlabs-key
   VITE_SENTRY_DSN=your-sentry-dsn
   ```

4. **Deploy**
   ```bash
   git push origin staging
   # Netlify automatically builds and deploys
   ```

### Vercel Staging Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**
   ```bash
   vercel login
   vercel link
   ```

3. **Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_OPENAI_API_KEY
   vercel env add VITE_LEONARDO_API_KEY
   vercel env add VITE_ELEVENLABS_API_KEY
   vercel env add VITE_SENTRY_DSN
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Production Deployment

### Pre-Production Checklist

- [ ] All 68+ tests passing
- [ ] Zero ESLint warnings/errors
- [ ] Staging environment tested
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Performance audit completed (Lighthouse)
- [ ] Security review completed
- [ ] Backup strategy in place
- [ ] Image optimization completed

### Production Database Setup

1. **Create Production Supabase Project**
   - Go to Supabase Dashboard
   - Create new project for production
   - Note the project URL and anon key
   - Configure authentication settings

2. **Run Production Migrations**
   
   **Using Supabase CLI:**
   ```bash
   # Link to production project
   supabase link --project-ref your-production-project-id
   
   # Push all migrations
   supabase db push
   ```
   
   **Manual Method:**
   Execute these migration files in order in Supabase SQL Editor:
   1. `20250622204304_hidden_morning.sql`
   2. `20250622204705_cool_truth.sql`
   3. `20250622204950_stark_flame.sql`
   4. `20250623061517_fragrant_canyon.sql`
   5. `20250623090533_gentle_silence.sql`
   6. `20250624000000_add_energy_fields.sql`
   7. `20250628000000_add_missing_point_columns.sql`
   8. `20250629000000_add_experience_points.sql` (Latest)

3. **Verify Database Setup**
   - Check tables: `game_states`, `journal_entries`
   - Verify RLS policies are active (8 policies total)
   - Test authentication flow
   - Confirm indexes are created (7+ indexes)

### Production Environment Variables

```env
# Required Variables
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_OPENAI_API_KEY=your-openai-key

# Optional Variables
VITE_LEONARDO_API_KEY=your-leonardo-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key
VITE_SENTRY_DSN=your-sentry-dsn
```

### Netlify Production Deployment

1. **Build Configuration**
   Update your `netlify.toml`:
   ```toml
   [build]
     command = "npm run build:deploy"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "20"
     NPM_VERSION = "9"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Custom Domain Setup**
   - Add custom domain in Netlify
   - Configure DNS records
   - Enable HTTPS (automatic with Netlify)

3. **Deploy to Production**
   ```bash
   git checkout main
   git pull origin main
   git tag v1.0.1  # Update version as needed
   git push origin v1.0.1
   # Netlify deploys automatically
   ```

### Performance Optimization

1. **Build Optimization**
   ```bash
   # Analyze bundle size before deployment
   npm run build
   # Check dist/ folder size - should be under 5MB total
   ```

2. **Image Optimization**
   ```bash
   # Optimize images for better performance
   npm run optimize-images
   # This converts PNG images to WebP and AVIF formats
   # Target: <200KB per optimized image
   ```

3. **Performance Testing**
   ```bash
   # Run Lighthouse audit
   npm run lighthouse:full
   # Targets: LCP <2.5s, FID <100ms, CLS <0.1
   ```

## Platform-Specific Guides

### Bolt.new Deployment

1. **Environment Setup in Bolt.new**
   - Open project in Bolt.new
   - Go to Settings → Environment Variables
   - Add all required variables (see Environment Variables section)

2. **Build Configuration**
   Use the optimized build script:
   ```json
   {
     "scripts": {
       "build:bolt": "npm run build:deploy"
     }
   }
   ```

3. **Deploy**
   - Use Bolt.new's built-in deployment
   - Monitor build logs for errors
   - Test deployed application thoroughly

## Database Migrations

### Current Migration Files

The following migrations should be applied in order:

1. **20250622204304_hidden_morning.sql** - Initial schema setup
2. **20250622204705_cool_truth.sql** - Additional tables and policies
3. **20250622204950_stark_flame.sql** - Schema refinements
4. **20250623061517_fragrant_canyon.sql** - Extended functionality
5. **20250623090533_gentle_silence.sql** - Performance optimizations
6. **20250624000000_add_energy_fields.sql** - Energy system
7. **20250628000000_add_missing_point_columns.sql** - Point system enhancements
8. **20250629000000_add_experience_points.sql** - Experience system (Latest)

### Migration Strategy

1. **Development Migration**
   ```bash
   # Test migration locally first
   supabase db reset
   supabase db push
   ```

2. **Staging Migration**
   ```bash
   # Deploy to staging environment
   supabase link --project-ref staging-project-id
   supabase db push
   ```

3. **Production Migration**
   ```bash
   # ALWAYS backup production database first
   supabase db dump --db-url "production-url" --file backup-$(date +%Y%m%d).sql
   
   # Apply migration
   supabase link --project-ref production-project-id
   supabase db push
   ```

### Schema Verification

After migration, verify the following:

```sql
-- Check tables exist
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name IN ('game_states', 'journal_entries');
-- Should return: 2

-- Check policies exist
SELECT COUNT(*) FROM pg_policies 
WHERE tablename IN ('game_states', 'journal_entries');
-- Should return: 8

-- Check indexes exist
SELECT COUNT(*) FROM pg_indexes 
WHERE tablename IN ('game_states', 'journal_entries');
-- Should return: 7+

-- Verify latest columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'game_states' 
AND column_name IN ('experience_points', 'experience_to_next');
-- Should return both columns
```

## Environment Variables

### Required Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `VITE_SUPABASE_URL` | ✅ | ✅ | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Supabase anonymous key |

### Optional Variables

| Variable | Description | Default | Status |
|----------|-------------|---------|--------|
| `VITE_OPENAI_API_KEY` | OpenAI API for narrative | - | Planned, not used |
| `VITE_LEONARDO_API_KEY` | Leonardo.AI for images | - | Planned, not used |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs for voice | - | Planned, not used |
| `VITE_SENTRY_DSN` | Error tracking with Sentry | - | Optional |

### Environment-Specific Configuration

**Development (.env.local):**
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# Optional (not currently used):
# VITE_OPENAI_API_KEY=your-openai-key
```

**Staging:**
```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key

# Optional (not currently used):
# VITE_OPENAI_API_KEY=your-openai-key
```

**Production:**
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# Optional (not currently used):
# VITE_OPENAI_API_KEY=your-openai-key
```

### Security Best Practices

- **Never commit API keys** to version control
- **Use different keys** for each environment
- **Rotate keys regularly** (quarterly recommended)
- **Monitor API usage** for unusual activity
- **Use environment-specific Supabase projects**
- **Restrict API key permissions** where possible

## Monitoring & Health Checks

### Performance Monitoring

The application includes comprehensive performance monitoring via Lighthouse CI:

#### Current Performance Targets

| Metric | Target | Current Status |
|--------|--------|---------------|
| **Largest Contentful Paint (LCP)** | <2.5s | <2.0s ✅ |
| **First Input Delay (FID)** | <100ms | <100ms ✅ |
| **Cumulative Layout Shift (CLS)** | <0.1 | <0.05 ✅ |
| **First Contentful Paint (FCP)** | <1.8s | <1.5s ✅ |
| **Speed Index** | <3.0s | <2.5s ✅ |
| **Total Blocking Time (TBT)** | <300ms | <200ms ✅ |

#### Performance Budget Configuration

```javascript
// From lighthouserc.cjs
const performanceBudgets = {
  development: {
    'metrics:largest-contentful-paint': 3000,
    'metrics:cumulative-layout-shift': 0.15,
    'metrics:first-contentful-paint': 2000
  },
  staging: {
    'metrics:largest-contentful-paint': 2500,
    'metrics:cumulative-layout-shift': 0.1,
    'metrics:first-contentful-paint': 1800
  },
  production: {
    'metrics:largest-contentful-paint': 2000,
    'metrics:cumulative-layout-shift': 0.05,
    'metrics:first-contentful-paint': 1500
  }
};
```

### Application Health Monitoring

1. **Database Health Check**
   - Built-in health indicator in navbar
   - Automatic connection monitoring
   - RLS policy verification

2. **Error Tracking**
   - Optional Sentry integration
   - Console error monitoring
   - User interaction tracking

3. **Performance Monitoring**
   ```bash
   # Run performance audits
   npm run lighthouse:full
   
   # Continuous monitoring
   npm run lighthouse:collect
   npm run lighthouse:assert
   ```

### Monitoring Dashboard

Monitor these key areas:

1. **Supabase Dashboard**
   - Active users and sessions
   - Database query performance
   - Authentication success rates
   - Storage usage

2. **Application Metrics**
   - Core Web Vitals
   - User engagement
   - Error rates
   - API response times

3. **Performance Trends**
   - Bundle size over time
   - Load time improvements
   - User experience metrics

## Troubleshooting

### Common Deployment Issues

#### Build Failures

**Symptom**: TypeScript compilation errors
```bash
# Solution
npm run lint --fix                    # Fix linting issues
npm run build                        # Check specific errors
# Fix TypeScript strict mode errors - no 'any' types allowed
```

**Symptom**: Out of memory during build
```bash
# Solution: Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Symptom**: Vite build warnings
- Check `vite.config.ts` for chunk size warnings
- Review bundle analyzer output
- Optimize imports and code splitting

#### Database Connection Issues

**Symptom**: Cannot connect to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project status
- Ensure RLS policies are properly configured
- Verify project ID matches in environment

**Symptom**: Migration fails
- Check SQL syntax in migration files
- Verify database permissions
- Ensure migrations are run in correct order
- Check for conflicting table/column names

#### Performance Issues

**Symptom**: Slow load times
- Run `npm run optimize-images` to optimize images
- Check bundle size with build analyzer
- Verify lazy loading is implemented
- Review Lighthouse audit results

**Symptom**: Poor Core Web Vitals
- Optimize images (PNG → WebP/AVIF)
- Review code splitting strategy
- Check for layout shifts
- Minimize render-blocking resources

#### Authentication Issues

**Symptom**: Users cannot sign in
- Check Supabase auth configuration
- Verify site URL in Supabase project settings
- Ensure email templates are configured
- Check redirect URLs match deployment domain

### Debug Mode

For advanced troubleshooting, you can enable various debug modes:

```env
# Enable detailed logging (development only)
NODE_ENV=development
```

### Performance Debugging

```bash
# Analyze bundle composition
npm run build
# Check dist/ folder structure and sizes

# Run Lighthouse with detailed reporting
npm run lighthouse
# Review generated lighthouse-reports/

# Test different device configurations
# Lighthouse automatically tests mobile-first
```

### Log Analysis

Check these logs for issues:

1. **Browser Console**: Client-side errors and warnings
2. **Netlify Deploy Logs**: Build and deployment issues
3. **Supabase Logs**: Database and authentication issues
4. **Network Tab**: API request failures and slow responses

## Rollback Procedures

### Application Rollback

#### Netlify Rollback
1. Go to Netlify Dashboard
2. Select site → Deploys
3. Find previous working deploy
4. Click "Publish deploy"

#### Vercel Rollback
```bash
vercel rollback [deployment-url]
```

#### Git-based Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit (use with caution)
git reset --hard [commit-hash]
git push --force origin main
```

### Database Rollback

#### Backup Strategy
```bash
# Create backup before any production deployment
supabase db dump --db-url "production-url" --file backup-$(date +%Y%m%d-%H%M).sql

# For critical deployments, also backup specific tables
supabase db dump --db-url "production-url" --table game_states --file game_states_backup.sql
supabase db dump --db-url "production-url" --table journal_entries --file journal_entries_backup.sql
```

#### Restore from Backup
```bash
# Full database restore
psql "production-url" < backup-20250617-1200.sql

# Selective table restore
psql "production-url" -c "DROP TABLE IF EXISTS game_states CASCADE;"
psql "production-url" < game_states_backup.sql
```

### Emergency Procedures

#### Complete System Rollback
1. **Revert application** to previous working version
2. **Restore database** from latest backup
3. **Clear CDN cache** if using custom CDN
4. **Update DNS** if necessary
5. **Notify stakeholders** of temporary issues
6. **Investigate** root cause thoroughly
7. **Plan** proper fix and redeployment

#### Communication Plan
- **Internal**: Notify development team immediately
- **Users**: Update status page or in-app notification
- **Monitoring**: Ensure alerting systems are working

### Recovery Testing

Regularly test your rollback procedures:

```bash
# Test database backup/restore on staging
supabase db dump --db-url "staging-url" --file test-backup.sql
# Verify backup file integrity
psql "staging-url" < test-backup.sql

# Test application rollback
# Deploy a test version, then rollback to verify process
```

---

*This deployment guide is current as of 2025. For the most up-to-date information on specific deployment platforms, refer to their official documentation. For database-specific details, see [../architecture/database.md](../architecture/database.md).*

