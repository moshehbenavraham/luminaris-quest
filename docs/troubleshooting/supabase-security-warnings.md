# Supabase Security Warnings Fix Guide

This document explains how to fix the security warnings reported by Supabase's database linter.

## Warnings Fixed by Migration

### ✅ Function Search Path Mutable (FIXED)

**Warning**: Functions `update_updated_at_column` and `test_database_connection` had role mutable search_path.

**Status**: ✅ FIXED by migration `20251117000000_fix_function_security.sql`

**What was done**:
- Added `SET search_path = public` to both functions
- This prevents search_path injection attacks in SECURITY DEFINER functions

**To apply the fix**:
```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in Supabase Dashboard > SQL Editor
```

---

## Warnings Requiring Dashboard Configuration

### ⚠️ 1. Leaked Password Protection Disabled

**Warning**: Leaked password protection is currently disabled.

**Impact**: Users can register with passwords that have been compromised in data breaches.

**Fix Steps** (Supabase Dashboard):

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the **Password Protection** section
4. Enable **"Leaked password protection"**
5. This will check passwords against HaveIBeenPwned.org database

**Alternative via CLI** (if supported):
```bash
# Update auth configuration
supabase auth update --leaked-password-protection=true
```

**Reference**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

**Recommended**: ✅ Enable this feature for production deployments

---

### ⚠️ 2. Vulnerable PostgreSQL Version

**Warning**: Current Postgres version (supabase-postgres-15.8.1.094) has security patches available.

**Impact**: Missing important security patches and bug fixes.

**Fix Steps** (Supabase Dashboard):

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Infrastructure**
3. Look for **PostgreSQL Version**
4. Click **"Upgrade"** or **"Check for updates"**
5. Follow the upgrade wizard

⚠️ **IMPORTANT BEFORE UPGRADING**:

1. **Backup Your Database**:
   ```bash
   # Using Supabase CLI
   supabase db dump -f backup_$(date +%Y%m%d).sql
   ```

2. **Test in Staging First**:
   - If you have a staging environment, upgrade there first
   - Test all critical functionality
   - Verify migrations still work

3. **Schedule Maintenance Window**:
   - Plan for ~5-15 minutes of downtime
   - Notify users if running in production
   - Schedule during low-traffic period

4. **Read Release Notes**:
   - Check Supabase release notes for breaking changes
   - Review PostgreSQL changelog

**Upgrade Process**:
```bash
# Option 1: Via Supabase Dashboard (Recommended)
# Settings → Infrastructure → PostgreSQL Version → Upgrade

# Option 2: Via CLI (if available)
supabase db upgrade
```

**Post-Upgrade Verification**:
1. Check database connectivity: `npm run dev` and test login
2. Verify RLS policies are still active
3. Test critical user flows (save game, journal entries)
4. Monitor error logs for 24 hours

**Reference**: https://supabase.com/docs/guides/platform/upgrading

---

## Summary of Actions

| Warning | Status | Action Required |
|---------|--------|----------------|
| Function Search Path Mutable | ✅ Fixed | Apply migration `20251117000000_fix_function_security.sql` |
| Leaked Password Protection | ⚠️ Manual | Enable in Dashboard → Auth → Policies |
| Vulnerable Postgres Version | ⚠️ Manual | Upgrade in Dashboard → Settings → Infrastructure |

---

## Applying All Fixes

### Step 1: Apply Migration (Fixes Function Security)

```bash
# If using Supabase CLI
cd /path/to/luminaris-quest
supabase db push

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/20251117000000_fix_function_security.sql
# 3. Run the SQL
```

### Step 2: Enable Leaked Password Protection (Dashboard)

1. Supabase Dashboard → Authentication → Policies
2. Enable "Leaked password protection"
3. Save changes

### Step 3: Upgrade PostgreSQL (Dashboard - Schedule This)

1. **Create database backup first**
2. Supabase Dashboard → Settings → Infrastructure
3. Click "Upgrade" on PostgreSQL Version
4. Follow the wizard
5. **Test thoroughly after upgrade**

---

## Verification

After applying all fixes, verify in Supabase Dashboard:

1. Go to **Database** → **Linter** (or **Database** → **Advisors**)
2. Run the linter again
3. Confirm all warnings are resolved

You can also check via SQL:
```sql
-- Verify function security settings
SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as configuration
FROM pg_proc
WHERE proname IN ('update_updated_at_column', 'test_database_connection')
AND pronamespace = 'public'::regnamespace;

-- Expected: Both functions should have proconfig showing search_path=public
```

---

## Questions or Issues?

If you encounter any issues:

1. Check Supabase status page: https://status.supabase.com/
2. Review Supabase docs: https://supabase.com/docs
3. Check project logs in Supabase Dashboard → Logs
4. Restore from backup if upgrade causes issues

---

**Last Updated**: 2025-11-17
**Migration Version**: 20251117000000
