# Combat System Migration Guide

## ✅ MIGRATION COMPLETE (2025-12-02)

The legacy combat system has been fully removed. This document is preserved for historical context.

**What was removed:**

- `/src/components/combat/` - 7 components (~1,700 lines)
- `/src/hooks/useCombat.ts` - Legacy combat hook (~213 lines)
- Legacy combat integration tests (~20 test files)
- ~200 lines of legacy combat code from `game-store.ts`

**Current Combat System:**

- **Location**: `/src/features/combat/`
- **Store**: Uses dedicated `combat-store.ts` (Zustand)
- **Architecture**: Mobile-first, component-based, fully tested

---

## Historical Context (Pre-Migration)

### Previous Architecture (Now Deleted)

The old combat system was located at `/src/components/combat/` and used the main `game-store.ts` combat slice. It was only accessible via `?legacyCombat=1` URL parameter.

### Current Combat System

- **Location**: `/src/features/combat/`
- **Store**: Uses dedicated `combat-store.ts` (Zustand)
- **Status**: ACTIVE - All development here
- **Activation**: Default (no URL parameter needed)
- **Architecture**: Mobile-first, component-based, fully tested
- **Components**:
  ```
  src/features/combat/
  ├── store/
  │   └── combat-store.ts    # Dedicated combat store
  ├── components/
  │   ├── CombatOverlay.tsx  # Main orchestrator
  │   ├── CombatBackdrop.tsx # Backdrop system
  │   └── [40+ components]   # Modular architecture
  └── hooks/
      ├── useCombatStore.ts  # Store hooks
      └── [other hooks]      # Utility hooks
  ```

---

## 🔴 CRITICAL DIFFERENCES

### Store Management

| Aspect         | OLD System                | NEW System                       |
| -------------- | ------------------------- | -------------------------------- |
| Store Location | `game-store.ts`           | `combat-store.ts`                |
| Store Type     | Part of main store        | Dedicated Zustand store          |
| State Path     | `gameStore.combat.*`      | `useCombatStore().*`             |
| Start Combat   | `gameStore.startCombat()` | `useCombatStore().startCombat()` |
| End Combat     | `gameStore.endCombat()`   | `useCombatStore().endCombat()`   |

### Component Architecture

| Aspect         | OLD System         | NEW System                                |
| -------------- | ------------------ | ----------------------------------------- |
| File Count     | 6 monolithic files | 40+ modular components                    |
| Component Size | 500+ LOC per file  | <300 LOC per file                         |
| Organization   | Flat structure     | Atomic design (atoms/molecules/organisms) |
| Styling        | Mixed approaches   | Tailwind-only                             |
| Responsiveness | Desktop-first      | Mobile-first                              |

### Feature Flags

```typescript
// How the system determines which to use:
const useNewCombatUI = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('legacyCombat') !== '1';
};
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. **Wrong Store Usage**

```typescript
// ❌ WRONG - Using old store with new system
import { useGameStore } from '@/store/game-store';
const { startCombat } = useGameStore();

// ✅ CORRECT - Using new store
import { useCombatStore } from '@/features/combat';
const { startCombat } = useCombatStore();
```

### 2. **Wrong Component Import**

```typescript
// ❌ WRONG - Importing old component
import { CombatOverlay } from '@/components/combat/CombatOverlay';

// ✅ CORRECT - Importing new component
import { CombatOverlay } from '@/features/combat';
```

### 3. **Modifying Deprecated Code**

```typescript
// ❌ NEVER modify files in /src/components/combat/
// These are DEPRECATED and only exist for backwards compatibility

// ✅ ALWAYS work in /src/features/combat/
// This is the ACTIVE system
```

---

## 📋 Migration Status

### What's Migrated

- ✅ Core combat functionality
- ✅ Combat UI components
- ✅ Resource management (HP/LP/SP)
- ✅ Turn system
- ✅ Action execution
- ✅ Enemy AI
- ✅ Combat animations
- ✅ Sound effects
- ✅ Keyboard shortcuts
- ✅ Post-combat flow

### What's NOT Migrated

- ❌ Old save game compatibility (different store structure)
- ❌ Some edge case behaviors may differ

---

## 🔧 How Combat Is Triggered

### In ChoiceList.tsx:

```typescript
// NEW System (Default)
if (useNewCombatUI()) {
  const { startCombat } = useCombatStore();
  startCombat(
    shadowManifestation,
    {
      lp: gameStore.lightPoints,
      sp: gameStore.shadowPoints,
    },
    gameStore.playerHealth,
    gameStore.playerLevel,
  );
}

// OLD System (Legacy)
else {
  gameStore.startCombat(shadowManifestation);
}
```

---

## 🚨 FAILED FIX WARNINGS

### Known Failed Attempts

1. **Combat Overlay Interaction Issue**
   - **Attempted**: Removing duplicate keyboard handling
   - **Result**: FAILED - Wrong root cause identified
   - **Actual Issue**: Still unknown, NOT keyboard-related

2. **Post-Combat Modal Issue**
   - **Attempted**: Modifying CombatEndModal.tsx
   - **Result**: FAILED - Modal was already working
   - **Actual Issue**: Integration problem elsewhere

---

## 📝 Developer Checklist

Before working on combat:

- [ ] **Identify which system** you need to work on
- [ ] **Verify store usage** - Are you using the correct store?
- [ ] **Check imports** - Are you importing from the correct location?
- [ ] **Test with feature flag** - Does it work with both `?legacyCombat=1` and without?
- [ ] **Document changes** - Update this guide if you discover new differences

---

## 🔮 Future Plans

1. **Complete removal of old system** (post-competition)
2. **Data migration tool** for old save games
3. **Performance optimizations**
4. **Additional combat features**

---

**Last Updated**: 2025-06-28
**Combat System Version**: NEW System v2.0 (Features-based Architecture)
