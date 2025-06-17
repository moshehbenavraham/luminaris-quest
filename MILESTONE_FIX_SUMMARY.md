# Milestone Journal Infinite Loop Fix Summary

## The Problem
The milestone journal feature was stuck in an infinite loop, causing "Maximum update depth exceeded" errors and making the app crash.

## Root Cause
The JournalModal component had a useEffect that was missing dependencies. When the modal opened to show a milestone journal:

1. Modal opens → useEffect runs → saves journal entry
2. Saving triggers store update → component re-renders
3. useEffect sees isOpen is still true → saves again
4. This creates an infinite loop of saves

## The Fix
Added a `savedForThisOpen` state to track if we've already saved for this modal open:

```typescript
const [savedForThisOpen, setSavedForThisOpen] = useState(false);

useEffect(() => {
  if (isOpen && !savedForThisOpen) {
    // Save once per modal open
    setSavedForThisOpen(true);
    onSaveEntry(entry);
  } else if (!isOpen && savedForThisOpen) {
    // Reset for next open
    setSavedForThisOpen(false);
  }
}, [dependencies...]);
```

## Why This Happened
The original design tried to be "clever" by auto-saving when the modal opened, but didn't properly guard against re-execution. What should have been a simple "show modal → save entry → close" flow became complicated by React's re-render behavior.

## Lessons Learned
1. Always include all dependencies in useEffect
2. Use guards (like `savedForThisOpen`) when effects should only run once per state change
3. Keep it simple - complex state management for simple features is a red flag