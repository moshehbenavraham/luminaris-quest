# Journal System Documentation

**Therapeutic Reflection and Processing Through Journaling**

---

## Overview

The Journal System is a core therapeutic feature of Luminari's Quest that provides players with structured opportunities for self-reflection, emotional processing, and growth tracking. The system automatically prompts journaling at key moments and stores all entries securely in the cloud.

---

## System Architecture

### Database Schema

**Table:** `journal_entries`

```sql
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('milestone', 'learning')),
  trust_level INTEGER NOT NULL CHECK (trust_level >= 0 AND trust_level <= 100),
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  scene_id TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE
);
```

### TypeScript Interface

```typescript
// Source: src/components/JournalModal.tsx
export interface JournalEntry {
  id: string;                    // UUID format: "entry-{timestamp}-{random}"
  type: 'milestone' | 'learning'; // Entry category
  trustLevel: number;             // Guardian Trust when created (0-100)
  content: string;                // Journal content (max 5000 chars)
  title: string;                  // Entry title (max 50 chars)
  timestamp: Date;                // Creation timestamp
  sceneId?: string;               // Optional: linked scene ID
  tags?: string[];                // Optional: categorization tags
  isEdited?: boolean;             // Has entry been modified?
  editedAt?: Date;                // Last edit timestamp
}
```

### State Management

**Zustand Store Location:** `src/store/game-store.ts`

```typescript
// Journal entries stored in game state
journalEntries: JournalEntry[];

// Actions available
addJournalEntry: (entry: JournalEntry) => void;
updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
deleteJournalEntry: (id: string) => void;
```

---

## Journal Types

### 1. Milestone Journals

**Trigger Conditions:**
- Guardian Trust reaches 25, 50, or 75
- Automatically prompted via modal
- One-time per milestone (no duplicates)

**Characteristics:**
- `type: 'milestone'`
- Pre-defined titles based on trust level:
  - **25**: "Inner Strength"
  - **50**: "Finding Balance"
  - **75**: "Deep Connection"
- Celebrate achievements and growth
- Awards +50 XP bonus
- Cannot be skipped (required for progression)

**Prompt Template:**
```
You've reached [MILESTONE_NAME] (Trust Level [25/50/75])

Reflect on your growth:
- What have you learned about yourself?
- How has your relationship with your guardian changed?
- What strengths have you discovered?

Take a moment to acknowledge how far you've come.
```

**Code Reference:**
```typescript
// Source: src/store/game-store.ts lines 507-564
updateMilestone: (trustLevel: number) => {
  // Check which milestones need to be achieved
  const milestonesToAchieve = state.milestones.filter(
    (milestone) => trustLevel >= milestone.level && !milestone.achieved
  );
  
  // Add to pending journals
  const newPendingJournals = new Set(state.pendingMilestoneJournals);
  milestonesToAchieve.forEach(m => newPendingJournals.add(m.level));
  
  // Update state with new pending journals
  return {
    milestones: updatedMilestones,
    pendingMilestoneJournals: newPendingJournals
  };
}
```

### 2. Learning Journals

**Trigger Conditions:**
- Scene failure (optional prompt)
- Combat defeat (optional prompt)
- Level-up achievement (auto-generated)
- Manual journal button (player-initiated)

**Characteristics:**
- `type: 'learning'`
- Player-defined titles (or default suggestions)
- Process setbacks and extract wisdom
- Awards +10 XP
- Optional (can be skipped)

**Prompt Template:**
```
This moment offers valuable lessons.

Consider:
- What made this challenging?
- What did you learn from the experience?
- How might you approach similar situations differently?

Remember: Growth often comes from our struggles.
```

**Code Reference:**
```typescript
// Source: src/pages/Adventure.tsx lines 98-101
const handleLearningMoment = useCallback(() => {
  setJournalTrigger('learning');
  setShowJournalModal(true);
}, []);
```

---

## CRUD Operations

### Create (Add Journal Entry)

**Function:** `addJournalEntry(entry: JournalEntry)`

**Process:**
1. Validate entry has required fields (id, content, type, title)
2. Check for duplicate milestone entries (prevent multiple entries for same milestone)
3. Add entry to state array
4. Mark state as having unsaved changes
5. Auto-save triggered after addition

**Code:**
```typescript
// Source: src/store/game-store.ts lines 448-469
addJournalEntry: (entry: JournalEntry) => {
  set((state) => {
    // Check for duplicate milestone entries
    if (entry.type === 'milestone') {
      const existingMilestone = state.journalEntries.find(
        (e) => e.type === 'milestone' && e.trustLevel === entry.trustLevel,
      );
      if (existingMilestone) {
        return state; // No change if duplicate
      }
    }

    const newEntries = [...state.journalEntries, entry];
    return {
      journalEntries: newEntries,
      saveState: { ...state.saveState, hasUnsavedChanges: true }
    };
  });
},
```

**Database Save:**
```typescript
// Source: src/store/game-store.ts lines 1250-1302
// Journal entries formatted for Supabase
const journalEntries = currentState.journalEntries.map((entry) => ({
  id: entry.id,
  user_id: user.id,
  type: entry.type,
  trust_level: entry.trustLevel,
  content: entry.content,
  title: entry.title,
  scene_id: entry.sceneId || null,
  tags: Array.isArray(entry.tags) ? entry.tags : [],
  is_edited: entry.isEdited || false,
  created_at: entry.timestamp.toISOString(),
  edited_at: entry.editedAt?.toISOString() || null,
}));

// Upsert to database (insert or update on conflict)
await supabase.from('journal_entries')
  .upsert(journalEntries, { onConflict: 'id' })
  .select();
```

### Read (Load Journal Entries)

**Function:** `loadFromSupabase()`

**Process:**
1. Authenticate user session
2. Query `journal_entries` table filtered by `user_id`
3. Order by `created_at DESC` (newest first)
4. Transform database format to app format
5. Update state with loaded entries

**Code:**
```typescript
// Source: src/store/game-store.ts lines 1413-1427
const { data: journalEntries, error: journalError } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// Transform to app format
journalEntries: journalEntries?.map((entry) => ({
  id: entry.id,
  type: entry.type as 'milestone' | 'learning',
  trustLevel: entry.trust_level,
  content: entry.content,
  title: entry.title,
  timestamp: entry.created_at ? new Date(entry.created_at) : new Date(),
  sceneId: entry.scene_id || undefined,
  tags: Array.isArray(entry.tags) ? entry.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  isEdited: entry.is_edited || false,
  editedAt: entry.edited_at ? new Date(entry.edited_at) : undefined,
} as JournalEntry)) || []
```

### Update (Edit Journal Entry)

**Function:** `updateJournalEntry(id: string, updates: Partial<JournalEntry>)`

**Process:**
1. Find entry by ID in state array
2. Apply partial updates to entry
3. Set `isEdited: true` and `editedAt: new Date()`
4. Mark state as having unsaved changes
5. Auto-save triggered after update

**Code:**
```typescript
// Source: src/store/game-store.ts lines 471-482
updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => {
  set((state) => ({
    journalEntries: state.journalEntries.map((entry) =>
      entry.id === id
        ? { ...entry, ...updates, isEdited: true, editedAt: new Date() }
        : entry,
    ),
    saveState: { ...state.saveState, hasUnsavedChanges: true }
  }));
  
  // Auto-save handled by use-auto-save hook
},
```

**Editable Fields:**
- `title` - Can be changed
- `content` - Can be changed
- `tags` - Can be added/removed
- `isEdited` - Automatically set to true
- `editedAt` - Automatically updated

**Non-Editable Fields:**
- `id` - Immutable primary key
- `type` - Cannot change category
- `trustLevel` - Historical record
- `timestamp` - Original creation time
- `sceneId` - Original scene link

### Delete (Remove Journal Entry)

**Function:** `deleteJournalEntry(id: string)`

**Process:**
1. Filter out entry with matching ID from state array
2. Mark state as having unsaved changes
3. Auto-save triggered after deletion
4. Database delete via upsert (omitted entry won't be re-saved)

**Code:**
```typescript
// Source: src/store/game-store.ts lines 484-491
deleteJournalEntry: (id: string) => {
  set((state) => ({
    journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
    saveState: { ...state.saveState, hasUnsavedChanges: true }
  }));
  
  // Auto-save handled by use-auto-save hook
},
```

**⚠️ Warning:** Deletion is permanent. Deleted entries are not recoverable.

---

## UI Components

### JournalModal Component

**Location:** `src/components/JournalModal.tsx`

**Props Interface:**
```typescript
interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustLevel: number;
  triggerType: 'milestone' | 'learning';
  onSaveEntry: (entry: JournalEntry) => void;
  'data-testid'?: string;
}
```

**Features:**
- Modal overlay with backdrop
- Form validation (minimum 10 characters)
- Character counters (title: 50, content: 5000)
- Tag suggestions based on type
- Accessible keyboard navigation (Tab, Enter, Esc)
- Auto-focus on content field
- Close prevention if unsaved changes

**Validation Rules:**
```typescript
// Minimum content length
const MIN_CONTENT_LENGTH = 10;

// Maximum lengths
const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 5000;
const MAX_TAG_LENGTH = 20;
const MAX_TAGS = 5;

// Validation errors
- "Content must be at least 10 characters"
- "Title cannot exceed 50 characters"
- "Content cannot exceed 5000 characters"
- "Maximum 5 tags allowed"
```

---

## Data Flow Diagram

```
User Interaction
      ↓
  Modal Opens (JournalModal)
      ↓
  User Writes Entry
      ↓
  Validation Check
      ↓
  Entry Created (ID generated)
      ↓
  addJournalEntry() → Zustand Store
      ↓
  State Updated (journalEntries array)
      ↓
  hasUnsavedChanges = true
      ↓
  Auto-Save Hook Triggers (30s or immediate)
      ↓
  saveToSupabase() → Database
      ↓
  Upsert to journal_entries table
      ↓
  Success Confirmation
```

---

## Auto-Save System

**Hook:** `useAutoSave()` from `src/hooks/use-auto-save.ts`

**Configuration:**
```typescript
// Auto-save triggers
- Every 30 seconds (if unsaved changes)
- After journal entry creation
- After journal entry edit
- After journal entry deletion
- On page visibility change (tab switch)
- On page unload (browser close)

// Manual save available
const { saveNow } = useAutoSave();
```

**Code Reference:**
```typescript
// Source: src/pages/Adventure.tsx lines 60-78
const handleSaveJournalEntry = useCallback(
  (entry: JournalEntry) => {
    try {
      if (entry && entry.id && entry.content) {
        // Add scene ID if we're on a scene
        const enhancedEntry = {
          ...entry,
          sceneId: currentSceneIndex > 0 ? `scene-${currentSceneIndex}` : undefined,
        };
        addJournalEntry(enhancedEntry);

        // Mark milestone as shown if applicable
        if (entry.type === 'milestone' && currentMilestoneLevel !== null) {
          markMilestoneJournalShown(currentMilestoneLevel);
          setCurrentMilestoneLevel(null);
        }

        // Trigger immediate save after journal entry creation
        saveNow();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  },
  [addJournalEntry, currentSceneIndex, currentMilestoneLevel, markMilestoneJournalShown, saveNow]
);
```

---

## Security & Privacy

### Row Level Security (RLS)

**Policies Applied:**

```sql
-- Users can only view their own entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create entries for themselves
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own entries
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own entries
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

**Enforcement:**
- Database-level security (cannot be bypassed from client)
- User ID automatically set from authenticated session
- No cross-user data access possible
- Entries deleted when user account deleted (CASCADE)

### Data Encryption

- **In Transit:** HTTPS/TLS encryption
- **At Rest:** Supabase PostgreSQL encryption
- **API Keys:** Environment variables (not in code)
- **Authentication:** JWT tokens (short-lived)

---

## Performance Optimization

### Efficient Queries

**Load Optimization:**
```typescript
// Only load user's entries (RLS enforced)
// Ordered by most recent first
// Single query with all fields

.from('journal_entries')
.select('*')
.eq('user_id', user.id)
.order('created_at', { ascending: false })
```

**Upsert Strategy:**
```typescript
// Insert new or update existing in single operation
// Conflict resolution on 'id' column
// No separate INSERT/UPDATE queries needed

.upsert(journalEntries, { onConflict: 'id' })
```

### State Management

**Immutability:**
```typescript
// Never mutate state directly
// Always create new arrays/objects
journalEntries: state.journalEntries.map((entry) =>
  entry.id === id ? { ...entry, ...updates } : entry
)
```

**Selective Updates:**
```typescript
// Only re-render components that use journal data
// Zustand provides automatic optimization
const journalEntries = useGameStore(state => state.journalEntries);
```

---

## Testing

### Unit Tests

**Location:** `src/__tests__/components/JournalModal.test.tsx`

**Coverage:**
- Modal open/close behavior
- Form validation
- Character counting
- Tag management
- Save/cancel actions
- Accessibility compliance

### Integration Tests

**Location:** `src/__tests__/store/game-store.test.ts`

**Coverage:**
- Add journal entry
- Update journal entry
- Delete journal entry
- Milestone duplicate prevention
- Auto-save triggering

### Manual Testing

**Test Procedure:**
```bash
# Start test environment
npm run dev

# Navigate to /journal-test page
# Components: Full CRUD interface for manual testing

# Test cases:
1. Create milestone entry (Trust 25)
2. Create learning entry
3. Edit entry (verify isEdited flag)
4. Delete entry (verify removal)
5. Close browser and reopen (verify persistence)
6. Try duplicate milestone (verify prevention)
```

---

## Common Use Cases

### Use Case 1: Milestone Achievement

**Scenario:** Player reaches Trust level 50

```typescript
// Automatic flow
1. Guardian Trust updates to 50 via setGuardianTrust(50)
2. updateMilestone(50) checks for achieved milestones
3. Milestone "Finding Balance" marked as achieved
4. Level 50 added to pendingMilestoneJournals Set
5. useEffect in Adventure.tsx detects pending journal
6. JournalModal opens with milestone prompt
7. Player writes reflection
8. Entry saved with type: 'milestone', trustLevel: 50
9. markMilestoneJournalShown(50) removes from pending
10. Modal closes, game continues
```

### Use Case 2: Learning from Failure

**Scenario:** Player fails a combat encounter

```typescript
// Optional flow
1. Combat ends with victory: false
2. handleLearningMoment() called
3. JournalModal opens with learning prompt
4. Player can write reflection OR skip
5. If written: Entry saved with type: 'learning'
6. XP awarded (+10 for reflection)
7. Modal closes, player can retry combat
```

### Use Case 3: Reviewing Past Entries

**Scenario:** Player wants to see growth over time

```typescript
// Progress page flow
1. Navigate to /progress page
2. Scroll to "Journal Entries" section
3. Entries displayed newest first
4. Each entry shows:
   - Type badge (milestone/learning)
   - Title
   - Date (relative or absolute)
   - Trust level when written
5. Click entry to expand full content
6. See tags, scene link (if applicable)
7. Edit/delete options available
```

---

## API Reference

### Functions

#### `addJournalEntry(entry: JournalEntry): void`
Adds a new journal entry to the store.

**Parameters:**
- `entry` - Complete JournalEntry object

**Returns:** `void`

**Side Effects:**
- Updates `journalEntries` array
- Sets `hasUnsavedChanges` to `true`
- Triggers auto-save

---

#### `updateJournalEntry(id: string, updates: Partial<JournalEntry>): void`
Updates an existing journal entry.

**Parameters:**
- `id` - Entry ID to update
- `updates` - Partial entry object with fields to update

**Returns:** `void`

**Side Effects:**
- Updates matching entry in array
- Sets `isEdited` to `true`
- Sets `editedAt` to current timestamp
- Sets `hasUnsavedChanges` to `true`
- Triggers auto-save

---

#### `deleteJournalEntry(id: string): void`
Permanently deletes a journal entry.

**Parameters:**
- `id` - Entry ID to delete

**Returns:** `void`

**Side Effects:**
- Removes entry from array
- Sets `hasUnsavedChanges` to `true`
- Triggers auto-save

**⚠️ Warning:** This operation is irreversible.

---

## Troubleshooting

### Issue: Journal entry not saving

**Symptoms:**
- Entry created but disappears on page reload
- Console shows Supabase error

**Causes:**
1. Not authenticated
2. Database connection failed
3. RLS policy blocking save
4. Invalid entry format

**Solutions:**
```typescript
// Check authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Verify save state
const saveState = useGameStore(state => state.saveState);
console.log('Save status:', saveState.status);
console.log('Last error:', saveState.lastError);

// Check browser console for errors
// Look for: "Failed to save journal entries"

// Manual save attempt
const { saveNow } = useAutoSave();
saveNow();
```

### Issue: Duplicate milestone journals

**Symptoms:**
- Multiple entries for same milestone level
- Modal keeps re-opening for same milestone

**Cause:** Race condition in milestone detection

**Solution:**
```typescript
// Already prevented in code (lines 453-458)
// Duplicate check before adding entry

if (entry.type === 'milestone') {
  const existingMilestone = state.journalEntries.find(
    (e) => e.type === 'milestone' && e.trustLevel === entry.trustLevel,
  );
  if (existingMilestone) {
    return state; // Prevent duplicate
  }
}
```

### Issue: Journal modal not opening

**Symptoms:**
- Trust level reached 25/50/75 but no prompt
- Learning moment triggered but no modal

**Causes:**
1. Hydration not complete (`_hasHydrated: false`)
2. Modal already open (`showJournalModal: true`)
3. Milestone already completed

**Solutions:**
```typescript
// Check hydration status
const { _hasHydrated } = useGameStore();
console.log('Hydrated:', _hasHydrated);

// Check pending milestones
const pending = useGameStore(state => state.pendingMilestoneJournals);
console.log('Pending milestones:', Array.from(pending));

// Manually trigger (development only)
setShowJournalModal(true);
setJournalTrigger('milestone');
```

---

## Future Enhancements

### Planned Features

1. **AI-Generated Prompts**
   - Context-aware reflection questions
   - Personalized based on play history
   - OpenAI GPT-4 integration

2. **Journal Search**
   - Full-text search across entries
   - Filter by type, tags, trust level
   - Date range selection

3. **Export Options**
   - PDF export with formatting
   - JSON export for backup
   - Share selected entries

4. **Rich Text Editor**
   - Bold, italic, lists
   - Inline images
   - Markdown support

5. **Journal Analytics**
   - Word cloud from entries
   - Emotional trend analysis
   - Growth visualization

---

## Related Documentation

- [Guardian Trust System](./guardian-trust.md)
- [User Guide - Journal Section](../guides/user-guide.md#journal-system)
- [Database Schema](../architecture/database.md)
- [API Documentation](../api/index.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: src/store/game-store.ts, src/components/JournalModal.tsx*

