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
| **Local** | Development & testing | Local machine | Supabase Cloud | localhost:5173 |
| **Development** | Team integration | Netlify/Vercel | Supabase Cloud | dev.luminarisquest.org |
| **Staging** | Pre-production testing | Netlify/Vercel | Supabase Cloud | staging.luminarisquest.org |
| **Production** | Live application | Netlify/Vercel | Supabase Cloud | luminarisquest.org |

### Deployment Flow

```
Local Development → Development → Staging → Production
      ↓                ↓           ↓          ↓
   localhost      dev.domain   staging.domain  domain.com
```

## Prerequisites

### Required Accounts & Services

- **GitHub Account**: For code repository and CI/CD
- **Supabase Account**: For database and authentication
- **Netlify/Vercel Account**: For hosting and deployment
- **Domain Provider**: For custom domain (optional)

### Required Tools

- **Node.js**: Version 18.0 or higher
- **npm/yarn**: Package manager
- **Git**: Version control
- **Supabase CLI**: For database management (optional but recommended)

### API Keys & Credentials

Gather these before starting deployment:

- Supabase project URL and anon key
- OpenAI API key (for AI features)
- Leonardo.AI API key (optional)
- ElevenLabs API key (optional)

## Local Development

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

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   # Local Development Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=your-openai-key
   VITE_APP_URL=http://localhost:5173
   VITE_DEBUG_MODE=true
   ```

4. **Database Setup**
   ```bash
   # Option 1: Using Supabase CLI (recommended)
   supabase login
   supabase link --project-ref your-project-id
   supabase db push
   
   # Option 2: Manual setup via Supabase Dashboard
   # Copy SQL from docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql
   # Paste into Supabase SQL Editor and run
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Workflow

```bash
# Daily development workflow
git pull origin main                    # Get latest changes
npm install                            # Update dependencies
npm run lint                           # Check code quality
npm test                              # Run tests
npm run dev                           # Start development

# Before committing
npm run lint --fix                     # Fix linting issues
npm run format                        # Format code
npm test                              # Ensure tests pass
npm run build                         # Verify build works
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
   # netlify.toml (staging)
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
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
   VITE_APP_URL=https://staging.luminarisquest.org
   VITE_DEBUG_MODE=false
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
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Production Deployment

### Pre-Production Checklist

- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Performance audit completed
- [ ] Security review completed
- [ ] Backup strategy in place

### Production Database Setup

1. **Create Production Supabase Project**
   - Go to Supabase Dashboard
   - Create new project for production
   - Note the project URL and anon key

2. **Run Production Migration**
   ```sql
   -- Copy entire contents of:
   -- docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql
   -- Run in Supabase SQL Editor
   ```

3. **Verify Database Setup**
   - Check tables: `game_states`, `journal_entries`
   - Verify RLS policies are active
   - Test authentication flow

### Netlify Production Deployment

1. **Production Environment Variables**
   ```
   VITE_SUPABASE_URL=https://prod-project.supabase.co
   VITE_SUPABASE_ANON_KEY=prod-anon-key
   VITE_OPENAI_API_KEY=your-openai-key
   VITE_APP_URL=https://luminarisquest.org
   VITE_DEBUG_MODE=false
   ```

2. **Custom Domain Setup**
   - Add custom domain in Netlify
   - Configure DNS records
   - Enable HTTPS (automatic with Netlify)

3. **Deploy to Production**
   ```bash
   git checkout main
   git pull origin main
   git tag v1.0.0
   git push origin v1.0.0
   # Netlify deploys automatically
   ```

### Performance Optimization

1. **Build Optimization**
   ```bash
   # Analyze bundle size
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Image Optimization**
   ```bash
   # Optimize images before deployment
   npm run optimize-images
   ```

3. **Lighthouse Audit**
   ```bash
   # Run performance audit
   npx lighthouse https://your-domain.com --view
   ```

## Platform-Specific Guides

### Bolt.new Deployment

1. **Environment Setup in Bolt.new**
   - Open project in Bolt.new
   - Go to Settings → Environment Variables
   - Add all required variables

2. **Build Configuration**
   ```json
   {
     "scripts": {
       "build:bolt": "npm ci --include=optional && tsc -b && vite build"
     }
   }
   ```

3. **Deploy**
   - Use Bolt.new's built-in deployment
   - Monitor build logs for errors
   - Test deployed application

### GitHub Pages Deployment

1. **GitHub Actions Workflow**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configure Repository**
   - Enable GitHub Pages in repository settings
   - Set source to GitHub Actions
   - Add secrets for environment variables

## Database Migrations

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
   # Backup production database first
   supabase db dump --db-url "production-url" > backup.sql
   
   # Apply migration
   supabase link --project-ref production-project-id
   supabase db push
   ```

### Migration Files

Current migration files:
- `docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql` - Complete schema
- `supabase/migrations/` - Individual migration files

### Rollback Procedure

```bash
# If migration fails, restore from backup
supabase db reset --db-url "production-url"
psql "production-url" < backup.sql
```

## Environment Variables

### Required Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `VITE_SUPABASE_URL` | ✅ | ✅ | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Supabase anonymous key |
| `VITE_OPENAI_API_KEY` | ✅ | ✅ | ✅ | OpenAI API key |
| `VITE_APP_URL` | ✅ | ✅ | ✅ | Application URL |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LEONARDO_API_KEY` | Leonardo.AI for images | - |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs for voice | - |
| `VITE_DEBUG_MODE` | Enable debug logging | false |
| `VITE_MOCK_API_RESPONSES` | Mock API for development | false |

### Security Best Practices

- **Never commit API keys** to version control
- **Use different keys** for each environment
- **Rotate keys regularly** (quarterly recommended)
- **Monitor API usage** for unusual activity
- **Use environment-specific Supabase projects**

## Monitoring & Health Checks

### Application Health Checks

The application includes built-in health monitoring:

```typescript
// Health check endpoint
const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: packageJson.version,
  environment: process.env.NODE_ENV,
  database: 'connected',
  services: {
    supabase: 'operational',
    openai: 'operational'
  }
};
```

### Monitoring Setup

1. **Supabase Monitoring**
   - Monitor database performance
   - Track authentication metrics
   - Set up alerts for errors

2. **Application Monitoring**
   - Use Netlify Analytics
   - Monitor Core Web Vitals
   - Track user engagement

3. **Error Tracking**
   - Implement error boundary
   - Log errors to external service
   - Monitor console errors

### Performance Metrics

Track these key metrics:

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

## Troubleshooting

### Common Deployment Issues

#### Build Failures

**Symptom**: Build fails with TypeScript errors
```bash
# Solution
npm run lint --fix
npm run build
# Fix any remaining TypeScript errors
```

**Symptom**: Out of memory during build
```bash
# Solution: Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Database Connection Issues

**Symptom**: Cannot connect to Supabase
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are configured

**Symptom**: Migration fails
- Check SQL syntax in migration files
- Verify database permissions
- Ensure no conflicting table names

#### Authentication Issues

**Symptom**: Users cannot sign in
- Check Supabase auth configuration
- Verify redirect URLs are correct
- Ensure email templates are configured

### Debug Mode

Enable debug mode for troubleshooting:

```env
VITE_DEBUG_MODE=true
```

This enables:
- Detailed console logging
- Performance metrics
- Database query logging
- Error stack traces

### Log Analysis

Check these logs for issues:

1. **Browser Console**: Client-side errors
2. **Netlify Deploy Logs**: Build and deployment issues
3. **Supabase Logs**: Database and auth issues
4. **Network Tab**: API request failures

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

# Or reset to specific commit
git reset --hard [commit-hash]
git push --force origin main
```

### Database Rollback

#### Backup Strategy
```bash
# Create backup before deployment
supabase db dump --db-url "production-url" > backup-$(date +%Y%m%d).sql
```

#### Restore from Backup
```bash
# Restore database from backup
psql "production-url" < backup-20250617.sql
```

### Emergency Procedures

#### Complete System Rollback
1. **Revert application** to previous version
2. **Restore database** from backup
3. **Update DNS** if necessary
4. **Notify users** of temporary issues
5. **Investigate** root cause
6. **Plan** proper fix and redeployment

#### Communication Plan
- **Internal**: Notify development team immediately
- **External**: Update status page if available
- **Users**: Send notification if extended downtime

---

*For platform-specific deployment instructions, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md). For database-specific information, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).*