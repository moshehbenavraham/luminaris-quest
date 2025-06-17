# Manual Testing Guide - Phase 7.1: Database Operations

## Prerequisites
- ✅ Local Supabase instance running (`supabase status` shows running)
- ✅ Development server running (`npm run dev` on http://localhost:8081/)
- ✅ Database operations tests passed (all programmatic tests successful)

## Test Results Summary (Automated Tests)
All automated database tests **PASSED** successfully:
- ✅ Basic database connection and operations
- ✅ Game state saving and loading 
- ✅ Journal entry creation, updating, and deletion
- ✅ Data persistence across sessions
- ✅ Error handling and RLS policies
- ✅ Complete application workflow simulation
- ✅ Milestone achievements and journal triggers

## Manual Browser Testing Checklist

### 1. Game State Saving Tests
**URL**: http://localhost:8081/adventure

#### Test Steps:
1. **Initial Setup**
   - [ ] Navigate to http://localhost:8081/
   - [ ] Click "Start Adventure" or navigate to `/adventure`
   - [ ] Note initial Guardian Trust level (should be 50)

2. **Make Choices to Trigger State Changes**
   - [ ] Interact with choice buttons in the game
   - [ ] Observe Guardian Trust level changes
   - [ ] Progress through at least 3-4 scenes
   - [ ] Note current scene index increases

3. **Verify Persistence**
   - [ ] Refresh the browser page (F5)
   - [ ] Verify Guardian Trust level is maintained
   - [ ] Verify current scene position is maintained
   - [ ] Verify game continues from where you left off

**Expected Results**: 
- Game state persists across browser refreshes
- Trust levels and scene progress are maintained
- No data loss occurs

### 2. Journal Entry Creation Tests

#### Test Steps:
1. **Milestone Journal Entries**
   - [ ] Progress until Guardian Trust reaches 25, 50, or 75
   - [ ] Verify a journal modal appears automatically
   - [ ] Fill out the journal entry form
   - [ ] Save the journal entry
   - [ ] Verify the entry is saved and modal closes

2. **Learning Journal Entries**  
   - [ ] Make a choice that results in failure/setback
   - [ ] Verify a learning journal modal appears
   - [ ] Fill out the journal entry form
   - [ ] Save the journal entry
   - [ ] Verify the entry is saved

3. **Manual Journal Creation**
   - [ ] Look for a "Create Journal Entry" button or similar
   - [ ] Create a journal entry manually
   - [ ] Save and verify it persists

4. **Journal Persistence**
   - [ ] Navigate to `/progress` or journal view page
   - [ ] Verify all created journal entries are displayed
   - [ ] Refresh the page and verify entries persist

**Expected Results**:
- Journal entries are created successfully
- Modal closes after saving
- Entries persist across page refreshes
- Entries are visible in progress/journal view

### 3. Journal Entry Editing Tests

#### Test Steps:
1. **Edit Existing Entry**
   - [ ] Navigate to progress/journal view
   - [ ] Find an existing journal entry
   - [ ] Click edit button or similar
   - [ ] Modify the content
   - [ ] Save changes
   - [ ] Verify changes are reflected immediately

2. **Edit Persistence**
   - [ ] Refresh the page after editing
   - [ ] Verify edited content is maintained
   - [ ] Check if "edited" indicator is shown

**Expected Results**:
- Editing works smoothly
- Changes persist across refreshes
- Edit metadata is tracked correctly

### 4. Error Scenario Testing

#### Test Steps:
1. **Network Issues Simulation**
   - [ ] Open browser developer tools (F12)
   - [ ] Go to Network tab
   - [ ] Throttle network to "Slow 3G" or "Offline"
   - [ ] Try to save game state or journal entry
   - [ ] Verify graceful error handling (no crashes)
   - [ ] Restore network and verify sync works

2. **Invalid Data Testing**
   - [ ] Try to create journal entries with empty content
   - [ ] Try extreme values for trust levels (if input available)
   - [ ] Verify validation and error messages

**Expected Results**:
- Application handles errors gracefully
- No crashes or white screens
- Appropriate error messages shown
- Recovery works when network restored

### 5. React Error #185 Monitoring

#### Test Steps:
1. **Console Monitoring**
   - [ ] Open browser developer tools (F12)
   - [ ] Go to Console tab
   - [ ] Clear console
   - [ ] Perform various actions (making choices, creating journals, navigating)
   - [ ] Monitor for React errors, especially error #185

2. **Rapid Interaction Testing**
   - [ ] Rapidly click buttons and navigate between pages
   - [ ] Quickly open and close journal modals
   - [ ] Fast navigation between /adventure and /progress
   - [ ] Monitor console for errors

3. **State Change Testing**
   - [ ] Make multiple rapid choices
   - [ ] Trigger multiple journal modals in succession
   - [ ] Monitor for state-related React errors

**Expected Results**:
- No React error #185 appears in console
- No other React errors or warnings
- UI remains stable during rapid interactions

### 6. Cross-Browser Testing (Optional)

#### Test Steps:
- [ ] Test in Chrome
- [ ] Test in Firefox  
- [ ] Test in Edge
- [ ] Verify consistent behavior across browsers

## Database Verification (Optional)

If you want to verify database contents directly:

```bash
# Connect to local Supabase database
supabase db psql

# Check game states
SELECT * FROM game_states;

# Check journal entries
SELECT * FROM journal_entries ORDER BY created_at DESC;

# Exit psql
\q
```

## Troubleshooting

### Common Issues:
1. **Supabase not running**: Run `supabase start`
2. **Dev server not running**: Run `npm run dev`
3. **Auth issues**: Check if authentication is working properly
4. **Console errors**: Check browser console for specific error messages

### Success Criteria:
- ✅ Game state saves and persists correctly
- ✅ Journal entries create, update, and persist correctly
- ✅ No data loss on page refresh
- ✅ Error handling works gracefully
- ✅ No React error #185 in console
- ✅ UI remains stable during all interactions

## Notes
- All programmatic database tests have already passed
- This manual testing focuses on UI interaction and browser-specific behavior
- Pay special attention to console errors and React warnings
- Test both normal usage patterns and edge cases