# 🛠️ Supabase Database Schema & Integration Plan

## 🎯 Main Objective: Fix Supabase Database Schema & Integration

## CURRENT ENVIRONMENT:  Local Cursor IDE, WSL 2 PC Windows 10/11

---

### Phase 1: Database Schema Analysis & Planning

- [x] **1.1 Analyze existing code references to identify all expected tables**
  - [x] Review `src/store/game-store.ts` for `game_states` table structure
  - [x] Review journal-related components for `journal_entries` table structure
  - [x] Document all expected columns, data types, and relationships (docs/DATABASE_SCHEMA.md)

- [x] **1.2 Create/Edit database schema design document**
  - [x] Define `game_states` table schema
  - [x] Define `journal_entries` table schema
  - [x] Define any foreign key relationships
  - [x] Define indexes for performance
  - [x] Define RLS (Row Level Security) policies

- [x] **1.3 Document environment architecture**
  - [x] Map out all environments (local, dev, staging, prod)
  - [x] Document Supabase project IDs for each environment
  - [x] Define environment-specific configuration requirements

- [x] **1.4 Create environment-specific deployment strategy**
  - [x] Define migration deployment order (local → dev → staging → prod)
  - [x] Document rollback procedures for each environment
  - [x] Plan testing strategy per environment

---

### Phase 2: Database Migration Setup

- [x] **2.1 Initialize Supabase migrations structure**
  - [x] Create `supabase/migrations` directory
  - [x] Verify Supabase CLI is installed locally
  - [x] Create environment-specific configuration files

- [ ] **2.2 Set up environment connections**
  - [ ] Test Supabase CLI connection to local project
  - [ ] Test Supabase CLI connection to dev project
  - [ ] Test Supabase CLI connection to staging project
  - [ ] Test Supabase CLI connection to production project
  - [ ] Document connection procedures for each environment

- [ ] **2.3 Create initial migration file**
  - [ ] Generate timestamp-based migration filename
  - [ ] Add migration file header comments
  - [ ] Add environment compatibility notes

---

### Phase 3: Create Database Tables

- [ ] **3.1 Create `game_states` table migration**
  - [ ] Define primary key (id)
  - [ ] Add `user_id` column (UUID, foreign key to `auth.users`)
  - [ ] Add game state columns (`guardianTrust`, `currentSceneIndex`, etc.)
  - [ ] Add timestamps (`created_at`, `updated_at`)
  - [ ] Add unique constraint on `user_id` for single save per user

- [ ] **3.2 Create `journal_entries` table migration**
  - [ ] Define primary key (id)
  - [ ] Add `user_id` column (UUID, foreign key to `auth.users`)
  - [ ] Add journal entry columns (`content`, `type`, `emotionalState`, etc.)
  - [ ] Add `sceneId` column for scene association
  - [ ] Add timestamps (`created_at`, `updated_at`)

- [ ] **3.3 Add Row Level Security (RLS) policies**
  - [ ] Enable RLS on both tables
  - [ ] Create policy for users to read own data
  - [ ] Create policy for users to insert own data
  - [ ] Create policy for users to update own data
  - [ ] Create policy for users to delete own data

---

### Phase 4: Execute Database Migrations (Environment-Specific)

- [ ] **4.1 Deploy to Local Environment**
  - [ ] Run migrations on local Supabase instance
  - [ ] Verify table creation locally
  - [ ] Test RLS policies locally
  - [ ] Create test data for validation

- [ ] **4.2 Deploy to Development Environment**
  - [ ] Backup current dev database state (if any data exists)
  - [ ] Run migrations on dev environment
  - [ ] Verify tables created in dev Supabase dashboard
  - [ ] Test with dev application deployment

- [ ] **4.3 Deploy to Staging Environment**
  - [ ] Backup current staging database state
  - [ ] Run migrations on staging environment
  - [ ] Verify tables created in staging Supabase dashboard
  - [ ] Run full application test suite against staging

- [ ] **4.4 Deploy to Production Environment**
  - [ ] Schedule maintenance window (if needed)
  - [ ] Backup current production database state
  - [ ] Run migrations on production environment
  - [ ] Verify tables created in production Supabase dashboard
  - [ ] Monitor for issues post-deployment

---

### Phase 5: Update TypeScript Types (Environment-Aware)

- [ ] **5.1 Generate new Supabase types per environment**
  - [ ] Run `supabase gen types typescript` for local environment
  - [ ] Run `supabase gen types typescript` for dev environment
  - [ ] Compare type outputs across environments for consistency
  - [ ] Replace content in `src/integrations/supabase/types.ts`
  - [ ] Verify types match expected schema

- [ ] **5.2 Update application type imports**
  - [ ] Check all files importing from `types.ts`
  - [ ] Update any type references if needed
  - [ ] Test type compilation across all environments

- [ ] **5.3 Set up environment-specific type validation**
  - [ ] Create type validation tests
  - [ ] Add CI/CD checks for type consistency

---

### Phase 6: Fix Application Integration (Environment-Aware)

- [ ] **6.1 Update `game-store.ts` save functionality**
  - [ ] Add proper error handling for save operations
  - [ ] Add retry logic for transient failures
  - [ ] Add success/failure state tracking
  - [ ] Add environment-specific error logging

- [ ] **6.2 Add database connection health check**
  - [ ] Create utility function to verify database connectivity
  - [ ] Add connection status to application state
  - [ ] Display connection status in UI (optional)
  - [ ] Add environment detection and display

- [ ] **6.3 Implement proper error boundaries**
  - [ ] Wrap database operations in try-catch blocks
  - [ ] Prevent cascading failures from affecting React
  - [ ] Add user-friendly error messages
  - [ ] Add environment-specific error reporting

- [ ] **6.4 Configure environment-specific settings**
  - [ ] Set up environment detection logic
  - [ ] Configure different behaviors per environment (logging levels, etc.)
  - [ ] Add environment-specific Supabase client configurations

---

### Phase 7: Testing & Verification (Per Environment)

- [ ] **7.1 Test on Local Environment**
  - [ ] Test game state saving locally
  - [ ] Test journal entry creation locally
  - [ ] Test error scenarios locally
  - [ ] Verify no React error #185 locally

- [ ] **7.2 Test on Development Environment**
  - [ ] Deploy application to dev environment
  - [ ] Test all database operations on dev
  - [ ] Test cross-user data isolation
  - [ ] Monitor performance metrics

- [ ] **7.3 Test on Staging Environment**
  - [ ] Deploy application to staging environment
  - [ ] Run full regression test suite
  - [ ] Test with production-like data volumes
  - [ ] Verify performance under load

- [ ] **7.4 Production Validation**
  - [ ] Monitor save operation speed in production
  - [ ] Check for any UI freezing in production
  - [ ] Verify no React error #185 in production
  - [ ] Set up production monitoring alerts

---

### Phase 8: Documentation & Cleanup

- [ ] **8.1 Update documentation**
  - [ ] Document database schema in project docs
  - [ ] Update setup instructions for new developers
  - [ ] Add troubleshooting guide
  - [ ] Document environment-specific procedures

- [ ] **8.2 Code cleanup**
  - [ ] Remove any temporary debugging code
  - [ ] Optimize database queries if needed
  - [ ] Add code comments for complex operations
  - [ ] Clean up environment-specific configurations

- [ ] **8.3 Create database backup strategy**
  - [ ] Document backup procedures for each environment
  - [ ] Set up automated backups for production
  - [ ] Test backup restoration procedures

---

### Phase 9: Monitoring & Maintenance (Environment-Specific)

- [ ] **9.1 Set up error tracking per environment**
  - [ ] Add logging for database operations in each environment
  - [ ] Set up alerts for critical failures in production
  - [ ] Configure different alert thresholds per environment

- [ ] **9.2 Create migration rollback plan**
  - [ ] Document rollback procedures for each environment
  - [ ] Test rollback process in dev/staging
  - [ ] Create emergency rollback procedures for production

- [ ] **9.3 Set up continuous monitoring**
  - [ ] Monitor database performance across environments
  - [ ] Set up uptime monitoring
  - [ ] Create dashboards for database health

---

## 🚀 Quick Start Priority Tasks

If you need to get unstuck immediately, focus on these critical tasks first:

1. **Document environment setup** (Phase 1.3)
2. **Create minimal `game_states` table** (Phase 3.1) 
3. **Deploy to local environment first** (Phase 4.1)
4. **Generate TypeScript types** (Phase 5.1)
5. **Add basic error handling** (Phase 6.3)

This should resolve the React error #185 and allow basic functionality while you complete the remaining tasks across all environments.

## 🌍 Environment Deployment Order

**Recommended deployment sequence:**
1. **Local** → Develop and test migrations
2. **Development** → Integration testing with team
3. **Staging** → Pre-production validation
4. **Production** → Final deployment with monitoring
