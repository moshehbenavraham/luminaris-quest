# Debugging Guide

**Tools and Techniques for Debugging Luminaris Quest**

---

## Browser DevTools

### Console Debugging

**Enable Debug Mode:**
```env
# .env
VITE_DEBUG_MODE=true
```

**Common Log Patterns:**
```typescript
// Game state changes
console.log('[GameStore] Guardian trust updated:', newTrust);

// Combat actions
console.log('[Combat] Executing action:', action, 'Resources:', resources);

// Database operations
console.log('[Supabase] Saving game state:', gameState);

// Auto-save events
console.log('[AutoSave] Triggered, unsaved changes:', hasChanges);
```

**Filtering Logs:**
```javascript
// In browser console
// Filter by component/feature
localStorage.setItem('debug', 'GameStore,Combat,AutoSave');

// Clear filter
localStorage.removeItem('debug');
```

---

### Network Tab

**Monitoring Database Requests:**

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `supabase.co`

**Key Endpoints:**
```
POST /rest/v1/game_states          # Saving game state
GET  /rest/v1/game_states          # Loading game state
POST /rest/v1/journal_entries      # Saving journal
GET  /rest/v1/journal_entries      # Loading journal
POST /auth/v1/token?grant_type=... # Authentication
```

**Inspecting Requests:**
- **Headers:** Check `Authorization` header (JWT token)
- **Payload:** View data being sent
- **Response:** Check for errors (401, 403, 500)
- **Timing:** Identify slow queries

---

### React DevTools

**Installation:**
```bash
# Chrome Web Store
# Search: "React Developer Tools"
# Install extension
```

**Usage:**

**Components Tab:**
- Inspect component tree
- View props and state
- Find which component renders what

**Profiler Tab:**
- Record performance
- Identify slow renders
- Find unnecessary re-renders

**Common Checks:**
```javascript
// Find component by name
// Components tab → Search: "Adventure"

// Check props
// Select component → Props panel

// Check hooks
// Select component → Hooks panel
// See useState, useEffect, custom hooks

// Force re-render
// Right-click component → "Force Update"
```

---

### Application Tab (Storage)

**localStorage Inspection:**
```javascript
// View game state
const gameState = localStorage.getItem('luminari-game-state');
console.log(JSON.parse(gameState));

// Clear state (reset game)
localStorage.removeItem('luminari-game-state');

// View all keys
Object.keys(localStorage);
```

**Common Keys:**
- `luminari-game-state` - Zustand persisted state
- `sb-*-auth-token` - Supabase authentication

---

## Zustand DevTools

**Installation:**
```bash
npm install -D @redux-devtools/extension
```

**Configuration:**
```typescript
// src/store/game-store.ts
import { devtools } from 'zustand/middleware';

export const useGameStore = create(
  devtools(
    persist(
      (set, get) => ({ /* state */ }),
      { name: 'luminari-game-state' }
    ),
    { name: 'GameStore' }
  )
);
```

**Usage:**
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. Select "GameStore"
4. View actions, state changes, time-travel debug

---

## Debugging Techniques

### State Debugging

**Log All State Changes:**
```typescript
// Temporary debugging
const originalSet = useGameStore.setState;
useGameStore.setState = (newState) => {
  console.log('[State Change]', newState);
  originalSet(newState);
};
```

**Snapshot State:**
```typescript
// Take snapshot of current state
const snapshot = useGameStore.getState();
console.log('State snapshot:', snapshot);

// Compare with later state
const newSnapshot = useGameStore.getState();
console.log('Differences:', 
  Object.keys(newSnapshot).filter(
    key => newSnapshot[key] !== snapshot[key]
  )
);
```

---

### Combat Debugging

**Enable Combat Logging:**
```typescript
// src/engine/combat-engine.ts already has detailed logs
// Check console for:
// - "Shadow Health Damage Calculation"
// - "Player action executed"
// - "Shadow action executed"
```

**Debug Combat State:**
```typescript
const combat = useCombat();
console.log('Combat active:', combat.isActive);
console.log('Enemy:', combat.enemy);
console.log('Resources:', combat.resources);
console.log('Status effects:', combat.statusEffects);
console.log('Combat log:', combat.log);
```

**Simulate Combat Scenario:**
```typescript
// Force start combat
const { startCombat } = useGameStore();
startCombat('shadowOfDoubt', 12);

// Give resources
const { modifyLightPoints, modifyShadowPoints } = useGameStore();
modifyLightPoints(20);
modifyShadowPoints(10);
```

---

### Database Debugging

**Test Connection:**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Manual health check
const testConnection = async () => {
  const { data, error } = await supabase
    .from('game_states')
    .select('count')
    .limit(1);
    
  console.log('Connection test:', { data, error });
};
```

**Inspect RLS Policies:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'game_states';
SELECT * FROM pg_policies WHERE tablename = 'journal_entries';
```

**Check User Authentication:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current user:', user);
console.log('Auth error:', error);
```

---

### Performance Debugging

**React Profiler:**
```typescript
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id, phase, actualDuration, baseDuration, startTime, commitTime
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

**Identify Re-render Causes:**
```typescript
import { useEffect, useRef } from 'react';

function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  // ...
}
```

---

## Test-Driven Debugging

### Write a Failing Test

**Process:**
1. Reproduce bug in a test
2. Run test (should fail)
3. Fix code
4. Run test (should pass)

**Example:**
```typescript
// Bug: Trust not clamped to 100
describe('setGuardianTrust', () => {
  it('clamps trust to 100', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setGuardianTrust(150);
    });
    
    expect(result.current.guardianTrust).toBe(100); // Should pass after fix
  });
});
```

---

### Component Testing

**Isolate Component:**
```typescript
import { render, screen } from '@testing-library/react';
import { JournalModal } from '@/components/JournalModal';

describe('JournalModal', () => {
  it('validates minimum content length', () => {
    render(<JournalModal isOpen={true} onClose={() => {}} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'short' } });
    
    expect(screen.getByText(/at least 10 characters/)).toBeInTheDocument();
  });
});
```

---

## Common Debugging Scenarios

### Scenario 1: State Not Updating

**Check:**
1. Is action being called?
   ```typescript
   const { setGuardianTrust } = useGameStore();
   console.log('Calling setGuardianTrust(75)');
   setGuardianTrust(75);
   ```

2. Is state actually changing?
   ```typescript
   useEffect(() => {
     console.log('Trust changed to:', guardianTrust);
   }, [guardianTrust]);
   ```

3. Is component re-rendering?
   ```typescript
   console.log('Component rendered with trust:', guardianTrust);
   ```

---

### Scenario 2: Database Save Failing

**Check:**
1. Authentication status
2. RLS policies
3. Network requests
4. Error logs

**Debugging Code:**
```typescript
const debug Debugging Continued = async () => {
  // 1. Check auth
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user ? 'Authenticated' : 'Not authenticated');

  // 2. Test write permission
  const { error } = await supabase
    .from('game_states')
    .upsert({ user_id: user?.id, guardian_trust: 50 });
  console.log('Write test:', error ? `Failed: ${error.message}` : 'Success');

  // 3. Check save state
  const saveState = useGameStore(state => state.saveState);
  console.log('Save status:', saveState);
};
```

---

### Scenario 3: Combat Action Not Working

**Check:**
1. Resource availability
2. Action validation
3. Status effects
4. Turn state

**Debugging Code:**
```typescript
const debugCombat = () => {
  const combat = useCombat();
  
  console.log('Combat active:', combat.isActive);
  console.log('Resources:', combat.resources);
  console.log('Can use ILLUMINATE:', combat.canUseAction('ILLUMINATE'));
  console.log('Action cost:', combat.getActionCost('ILLUMINATE'));
  console.log('Status effects:', combat.statusEffects);
  console.log('Is player turn:', combat.isPlayerTurn);
};
```

---

## Debugging Tools Reference

### Browser Extensions

| Tool | Purpose | Link |
|------|---------|------|
| React DevTools | Component inspection | [Chrome](https://chrome.google.com/webstore) |
| Redux DevTools | State inspection | [Chrome](https://chrome.google.com/webstore) |
| Lighthouse | Performance audits | Built into Chrome |
| axe DevTools | Accessibility testing | [deque.com](https://www.deque.com) |

### VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| ESLint | Inline linting |
| Error Lens | Inline error display |
| TypeScript Error Translator | Better error messages |
| React Snippets | Code snippets |

### Command Line Tools

```bash
# TypeScript compiler
npx tsc --noEmit --pretty

# ESLint
npx eslint src/ --ext .ts,.tsx

# Vitest
npm test -- --reporter=verbose

# Bundle analysis
npm run build -- --mode=analyze
```

---

## Best Practices

### 1. Use Descriptive Logs

```typescript
// ❌ BAD
console.log(data);

// ✅ GOOD
console.log('[GameStore] Guardian trust updated:', {
  previous: oldTrust,
  new: newTrust,
  delta: newTrust - oldTrust,
  timestamp: new Date().toISOString()
});
```

### 2. Remove Debug Code Before Commit

```typescript
// Use conditional logging
const isDev = import.meta.env.DEV;
if (isDev) {
  console.log('[DEBUG]', data);
}
```

### 3. Write Reproducible Bug Reports

**Template:**
```markdown
**Bug:** [Brief description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Debug Info:**
- Browser: Chrome 120
- OS: macOS 14.1
- Logs: [Paste console logs]
- Network: [Paste failed request]

**Code Location:** src/components/Example.tsx:45
```

---

## Related Documentation

- [Common Errors](./common-errors.md)
- [FAQ](./faq.md)
- [Architecture Overview](../architecture/overview.md)
- [Testing Guide](../guides/testing.md)

---

*Last Updated: 2025-11-17*

