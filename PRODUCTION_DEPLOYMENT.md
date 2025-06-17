# Production Deployment Guide for Bolt.new

This guide walks through deploying Luminari's Quest to production on bolt.new.

## Prerequisites

- Production Supabase project created
- Access to bolt.new deployment settings
- Production API keys ready

## Step 1: Database Migration

Run this SQL in your production Supabase SQL editor:

```sql
-- Copy the entire contents of:
-- supabase/migrations/20250615182947_initial_game_database_schema.sql
```

Or if you have Supabase CLI access:
```bash
supabase db push --db-url "your-production-database-url"
```

### Verify Migration Success

After running the migration, verify in Supabase dashboard:

1. **Tables Created** (2 tables):
   - `game_states` - Stores player progress
   - `journal_entries` - Stores therapeutic journal entries

2. **RLS Policies** (8 policies - 4 per table):
   - Users can only read their own data
   - Users can only insert their own data
   - Users can only update their own data
   - Users can only delete their own data

3. **Indexes** (7 total):
   - Primary keys on both tables
   - Performance indexes for common queries

## Step 2: Environment Variables

Create a `.env` file in bolt.new with these variables:

### Required Variables
```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API (REQUIRED - for narrative generation)
VITE_OPENAI_API_KEY=your-openai-api-key
```

### Optional Variables
```env
# Leonardo.AI (OPTIONAL - for image generation)
VITE_LEONARDO_API_KEY=your-leonardo-api-key

# ElevenLabs (OPTIONAL - for voice narration)
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
VITE_ELEVENLABS_VOICE_ID=your-voice-id

# Application URLs
VITE_APP_URL=https://your-app-domain.com
```

## Step 3: Deploy on Bolt.new

1. **Push latest code** to your bolt.new project
2. **Configure environment variables** in bolt.new settings
3. **Run build commands**:
   ```bash
   npm install
   npm run build
   ```
4. **Deploy** using bolt.new's deployment process

## Step 4: Post-Deployment Verification

Test these core features after deployment:

### 1. Authentication
- [ ] Sign up with email
- [ ] Sign in
- [ ] Sign out
- [ ] Password reset email

### 2. Game Functionality
- [ ] Start new game
- [ ] Make choices in adventure
- [ ] Guardian trust updates correctly
- [ ] Scene progression works

### 3. Milestone Journals
- [ ] Reaching trust level 25 shows journal modal
- [ ] Reaching trust level 50 shows journal modal
- [ ] Reaching trust level 75 shows journal modal
- [ ] Journal entries save without infinite loops

### 4. Progress Persistence
- [ ] Game state saves to database
- [ ] Progress persists after refresh
- [ ] Journal entries are retained

### 5. Database Health
- [ ] Check health indicator in navbar
- [ ] Verify no 404 errors in console
- [ ] Confirm database operations work

## Troubleshooting

### Issue: 404 errors for game_states table
**Solution**: The database migration didn't run. Re-run the migration SQL.

### Issue: Authentication not working
**Solution**: Check Supabase project settings:
- Email auth is enabled
- Site URL is configured correctly
- Redirect URLs include your production domain

### Issue: Infinite loop on milestone journals
**Solution**: This should be fixed, but if it occurs:
- Clear browser cache
- Check browser console for errors
- Ensure latest code is deployed

### Issue: API features not working
**Solution**: Verify API keys in environment variables:
- OpenAI key is valid and has credits
- Optional API keys are correct if used

## Production Checklist

Before going live:

- [ ] Database migration completed successfully
- [ ] All environment variables configured
- [ ] Build completes without errors
- [ ] Core features tested and working
- [ ] No console errors in production
- [ ] SSL certificate active (handled by bolt.new/Netlify)
- [ ] Custom domain configured (if applicable)

## Monitoring

After deployment:

1. **Check Supabase Dashboard**:
   - Monitor active users
   - Check database size
   - Review auth logs

2. **Application Logs**:
   - Watch for any client-side errors
   - Monitor API usage (especially OpenAI)

3. **User Feedback**:
   - Test signup/signin flow
   - Verify game saves properly
   - Ensure journals work correctly

## Support

For issues specific to:
- **Bolt.new deployment**: Check bolt.new documentation
- **Supabase**: support.supabase.com
- **Application bugs**: Create issue in project repository