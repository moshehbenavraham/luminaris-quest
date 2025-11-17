# Common Errors and Solutions

**Quick Reference for Troubleshooting Issues**

---

## Build Errors

### TypeScript Compilation Errors

**Error:** `Cannot find module '@/components/...'`
```
TS2307: Cannot find module '@/components/Example' or its corresponding type declarations.
```

**Cause:** Path alias not recognized

**Solution:**
```bash
# Verify tsconfig.json paths configuration
cat tsconfig.json | grep -A5 paths

# Should show:
"paths": {
  "@/*": ["./src/*"]
}

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

**Error:** `Type 'X' is not assignable to type 'Y'`

**Cause:** Type mismatch in props or state

**Solution:**
```typescript
// Check interface definitions
// Ensure type compatibility
// Use type assertions if necessary (sparingly)
const value = unknownValue as KnownType;
```

---

### Vite Build Errors

**Error:** `Failed to resolve import`

**Cause:** Missing dependency or incorrect import path

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

---

**Error:** `JavaScript heap out of memory`

**Cause:** Large build size exceeding Node.js memory

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Runtime Errors

### Database Connection Errors

**Error:** Browser console shows `Failed to fetch from Supabase`

**Causes:**
1. Invalid Supabase credentials
2. Network issues
3. RLS policies blocking access
4. Expired JWT token

**Solutions:**

```bash
# 1. Verify environment variables
cat .env | grep VITE_SUPABASE

# Should show:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 2. Test connection
curl https://your-project.supabase.co/rest/v1/

# 3. Check browser console for detailed error
# Look for specific error codes:
# - 401: Authentication required
# - 403: Permission denied (RLS)
# - 404: Table not found
# - 500: Server error

# 4. Re-authenticate
# Logout and login again to refresh JWT token
```

---

### Hydration Errors

**Error:** `Warning: Text content did not match. Server: "50" Client: "67"`

**Cause:** Server-rendered HTML doesn't match client-rendered HTML

**Solution:**
```typescript
// Use hydration-safe hook
const trust = useGameStore(state => state.guardianTrust);

// Or add client-only check
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

### State Management Errors

**Error:** State updates not persisting

**Causes:**
1. Auto-save not triggered
2. Database write failure
3. RLS policy blocking save
4. Not authenticated

**Solutions:**
```typescript
// Check save state
const saveState = useGameStore(state => state.saveState);
console.log('Save status:', saveState.status);
console.log('Has unsaved changes:', saveState.hasUnsavedChanges);
console.log('Last error:', saveState.lastError);

// Manual save attempt
const { saveNow } = useAutoSave();
await saveNow();

// Check authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

---

### Combat System Errors

**Error:** Combat action not executing

**Causes:**
1. Insufficient resources
2. Action blocked by status effect
3. Not player's turn

**Solutions:**
```typescript
// Check if action is allowed
const combat = useCombat();
const canUse = combat.canUseAction('ILLUMINATE');
console.log('Can use ILLUMINATE:', canUse);

// Check resources
console.log('LP:', combat.resources.lp);
console.log('SP:', combat.resources.sp);

// Check status effects
console.log('Healing blocked:', combat.statusEffects.healingBlocked);
console.log('LP generation blocked:', combat.statusEffects.lpGenerationBlocked);
```

---

## Development Errors

### Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Option 1: Kill process on port
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173    # Windows (find PID)
taskkill /PID <PID> /F          # Windows (kill)

# Option 2: Use different port
npm run dev -- --port 3000
```

---

### ESLint Errors

**Error:** `'React' must be in scope when using JSX`

**Cause:** Missing React import (old React versions)

**Solution:**
```typescript
// React 18+ doesn't need explicit import for JSX
// But if error persists:
import React from 'react';
```

---

**Error:** `Fast refresh only works when a file only exports components`

**Cause:** Mixing component exports with non-component exports

**Solution:**
```typescript
// ❌ BAD: Mixed exports
export const MyComponent = () => <div />;
export const someConstant = 42;

// ✅ GOOD: Separate files
// MyComponent.tsx
export const MyComponent = () => <div />;

// constants.ts
export const someConstant = 42;
```

---

## Performance Issues

### Slow Page Load

**Symptoms:**
- First Contentful Paint > 2 seconds
- Time to Interactive > 3 seconds

**Solutions:**

```bash
# 1. Check bundle size
npm run build
# Inspect dist/assets/ file sizes

# 2. Analyze bundle
npm install -D vite-plugin-bundle-visualizer
# Add to vite.config.ts

# 3. Optimize images
npm run optimize-images

# 4. Enable compression
# Netlify automatically gzips/brotli compresses
```

---

### Excessive Re-renders

**Symptoms:**
- UI feels sluggish
- Browser DevTools shows many re-renders

**Solution:**
```typescript
// ❌ BAD: Full store subscription
const store = useGameStore();

// ✅ GOOD: Selective subscription
const trust = useGameStore(state => state.guardianTrust);

// ✅ GOOD: Memoize derived values
const percentage = useMemo(
  () => (trust / 100) * 100,
  [trust]
);
```

---

## Testing Errors

### Tests Failing After Code Change

**Error:** `Expected 3, received 15`

**Cause:** Test expectations outdated

**Solution:**
```bash
# Update snapshots if UI changed
npm test -- -u

# Run specific test file
npm test -- JournalModal.test.tsx

# Run in watch mode
npm test -- --watch
```

---

### Accessibility Test Failures

**Error:** `axe violations found: [...]`

**Cause:** Missing ARIA labels or improper HTML structure

**Solution:**
```typescript
// Add aria-label to interactive elements
<button aria-label="Save journal entry">Save</button>

// Use semantic HTML
<nav> instead of <div role="navigation">

// Add alt text to images
<img src="..." alt="Descriptive text" />

// Ensure keyboard navigation
<button tabIndex={0} onKeyDown={handleKeyDown}>
```

---

## Deployment Errors

### Build Succeeds Locally but Fails in CI/CD

**Causes:**
1. Environment variable mismatch
2. Different Node.js versions
3. Missing dependencies in `package.json`

**Solutions:**
```bash
# 1. Check CI environment variables
# Netlify: Site settings → Build & deploy → Environment variables

# 2. Match Node.js version
# Check .nvmrc or package.json "engines"

# 3. Ensure all deps in package.json
npm install --save <missing-package>

# 4. Test production build locally
npm run build
npm run preview
```

---

### Database Migration Errors

**Error:** `relation "journal_entries" does not exist`

**Cause:** Database tables not created

**Solution:**
```bash
# Run migrations
supabase db push

# Or manually in Supabase Dashboard
# SQL Editor → paste migration SQL → Run
```

---

## Error Reporting

### How to Report Bugs

**Include:**
1. Error message (full text)
2. Browser console logs
3. Network tab (if database-related)
4. Steps to reproduce
5. Expected vs actual behavior
6. Browser/OS version

**Example:**
```markdown
**Error:** State not saving to database

**Console logs:**
```
Failed to save game state: TypeError: Cannot read property 'id' of undefined
  at saveToSupabase (game-store.ts:1244)
```

**Steps:**
1. Complete a scene
2. Trust increases to 55
3. Wait 30 seconds
4. Reload page
5. Trust still at 50 (not saved)

**Expected:** Trust should be 55 after reload
**Actual:** Trust reverts to 50

**Environment:**
- Chrome 120.0.6099.109
- macOS 14.1.1
- Production: luminarisquest.org
```

---

## Quick Diagnostics

### Diagnostic Checklist

```bash
# 1. Check Node.js version
node --version  # Should be 18.0+

# 2. Check dependencies
npm list  # Look for missing/incompatible packages

# 3. Check environment variables
cat .env | grep VITE_

# 4. Check database connection
curl https://your-project.supabase.co/rest/v1/

# 5. Check TypeScript compilation
npx tsc --noEmit

# 6. Check linting
npm run lint

# 7. Check tests
npm test

# 8. Check build
npm run build
```

---

## Related Documentation

- [Debugging Guide](./debugging.md)
- [FAQ](./faq.md)
- [Getting Started](../guides/getting-started.md)
- [Architecture Overview](../architecture/overview.md)

---

*Last Updated: 2025-11-17*

