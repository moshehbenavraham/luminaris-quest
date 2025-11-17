# Combat System Migration Guide

## ⚠️ CRITICAL: Two Combat Systems Exist

This project contains **TWO SEPARATE COMBAT SYSTEMS**. Understanding the distinction between them is crucial to avoid wasted development time.

---

## 🚨 System Overview

### 1. **DEPRECATED Combat System** (Old)
- **Location**: `/src/components/combat/`
- **Store**: Uses main `game-store.ts` combat slice
- **Status**: DEPRECATED - DO NOT MODIFY
- **Activation**: URL parameter `?legacyCombat=1`
- **Components**:
  ```
  src/components/combat/
  ├── ActionSelector.tsx      # Old action selection UI
  ├── CombatLog.tsx          # Old combat log display
  ├── CombatOverlay.tsx      # Old main combat UI
  ├── CombatReflectionModal.tsx # Old post-combat modal
  ├── DamageIndicator.tsx    # Old damage display
  └── ResourceDisplay.tsx    # Old resource UI
  ```

### 2. **NEW Combat System** (Current)
- **Location**: `/src/features/combat/`
- **Store**: Uses dedicated `combat-store.ts` (Zustand)
- **Status**: ACTIVE - All new development here
- **Activation**: Default (no URL parameter needed)
- **Architecture**: Mobile-first, component-based, fully tested
- **Components**:
  ```
  src/features/combat/
  ├── store/
  │   └── combat-store.ts    # NEW dedicated combat store
  ├── components/
  │   ├── CombatOverlay.tsx  # NEW main orchestrator
  │   ├── CombatBackdrop.tsx # NEW backdrop system
  │   └── [40+ components]   # NEW modular architecture
  └── hooks/
      ├── useCombatStore.ts  # NEW store hooks
      └── [other hooks]      # NEW utility hooks
  ```

---

## 🔴 CRITICAL DIFFERENCES

### Store Management
| Aspect | OLD System | NEW System |
|--------|------------|------------|
| Store Location | `game-store.ts` | `combat-store.ts` |
| Store Type | Part of main store | Dedicated Zustand store |
| State Path | `gameStore.combat.*` | `useCombatStore().*` |
| Start Combat | `gameStore.startCombat()` | `useCombatStore().startCombat()` |
| End Combat | `gameStore.endCombat()` | `useCombatStore().endCombat()` |

### Component Architecture
| Aspect | OLD System | NEW System |
|--------|------------|------------|
| File Count | 6 monolithic files | 40+ modular components |
| Component Size | 500+ LOC per file | <300 LOC per file |
| Organization | Flat structure | Atomic design (atoms/molecules/organisms) |
| Styling | Mixed approaches | Tailwind-only |
| Responsiveness | Desktop-first | Mobile-first |

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
  startCombat(shadowManifestation, {
    lp: gameStore.lightPoints,
    sp: gameStore.shadowPoints
  }, gameStore.playerHealth, gameStore.playerLevel);
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