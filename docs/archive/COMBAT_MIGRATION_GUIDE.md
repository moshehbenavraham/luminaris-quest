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

## Current Combat System Usage

### Store Usage

```typescript
import { useCombatStore } from '@/features/combat';
const { startCombat } = useCombatStore();
```

### Component Import

```typescript
import { CombatOverlay } from '@/features/combat';
```

### How Combat Is Triggered

```typescript
// In ChoiceList.tsx or similar:
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
```

---

## 📝 Developer Checklist

Before working on combat:

- [ ] **Verify store usage** - Use `useCombatStore()` from `@/features/combat`
- [ ] **Check imports** - Import from `@/features/combat`, not game-store
- [ ] **Document changes** - Update this guide if architecture changes

---

## 🚨 Known Issues

### Combat Overlay Interaction Issue

- **Symptom**: Users must click the "Illuminate button area" before the combat overlay becomes fully interactive
- **Failed Attempts**:
  1. Removing duplicate keyboard handling - Wrong root cause identified
  2. Modifying CombatEndModal.tsx - Modal was already working
- **Status**: Investigation ongoing

---

## Historical Context (Pre-Migration)

<details>
<summary>Click to expand historical information</summary>

### Previous Architecture (Deleted 2025-12-02)

The old combat system was located at `/src/components/combat/` and used the main `game-store.ts` combat slice. It was only accessible via `?legacyCombat=1` URL parameter.

### Architecture Comparison

| Aspect         | OLD System (Deleted) | Current System                            |
| -------------- | -------------------- | ----------------------------------------- |
| Store Location | `game-store.ts`      | `combat-store.ts`                         |
| Store Type     | Part of main store   | Dedicated Zustand store                   |
| File Count     | 6 monolithic files   | 40+ modular components                    |
| Component Size | 500+ LOC per file    | <300 LOC per file                         |
| Organization   | Flat structure       | Atomic design (atoms/molecules/organisms) |
| Styling        | Mixed approaches     | Tailwind-only                             |
| Responsiveness | Desktop-first        | Mobile-first                              |

### Migration Checklist (Completed)

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

</details>

---

**Last Updated**: 2025-12-02
**Combat System Version**: v2.0 (Features-based Architecture)
