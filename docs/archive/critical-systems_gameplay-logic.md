# 2. Critical Systems & Gameplay Logic Audit

**Date**: 2025-12-02
**Auditor**: Senior Dev Engineer (AI)

## Executive Summary

The audit confirms that the Dual Combat System is strictly isolated (to the point of the legacy system being unreachable). The Therapeutic Logic/Trust System is mathematically sound and implemented correctly.

**UPDATE (2025-12-02)**: The **critical gameplay design flaw** identified in the Scene Engine (player choices being purely cosmetic) has been **FIXED**. Bold and Cautious choices now have differentiated mechanics:

- **Bold**: DC +2, +2 LP/Trust bonus on success, +1 SP penalty on failure, +10% XP bonus
- **Cautious**: DC -2, standard rewards

All audit items are now resolved. Legacy combat code cleanup has also been verified as already complete.

---

## 1. Dual Combat System Isolation

**Status**: ✅ **PASSED (Strict Isolation)**

- **Isolation Verification**:
  - The New Combat System (`src/features/combat`) does not import or use any logic from the Old Combat System (`src/components/combat` or `game-store` combat slice).
  - The Old Combat System is marked as deprecated.
  - **Findings**: The integration in `ChoiceList.tsx` **exclusively** uses `startNewCombat` from the new store. There is no code path to trigger the old `gameStore.startCombat()`.
  - **Legacy Flag**: The `?legacyCombat=1` URL parameter currently **hides the New UI** (`NewCombatOverlay`) but does **not** enable the Old UI or logic. This effectively renders the game unplayable with this flag (combat starts in background, no UI appears). This confirms strict isolation (no leakage), effectively deprecating the old system entirely in the runtime.

## 2. Scene Engine Validation

**Status**: ✅ **PASSED (Fixed 2025-12-02)**

- **Dice Mechanics**: ✅ **PASSED**. `rollDice` correctly implements a d20 system (`Math.floor(Math.random() * 20) + 1`) with level modifiers.
- **Scenario Flow**: ✅ **PASSED**. Linear progression through the scene array works as intended.
- **Branching Logic**: ✅ **FIXED**.
  - **Previous Issue**: The `ChoiceList.tsx` component rendered two buttons ("Bold" and "Cautious") that both triggered the exact same `handleChoice` function without parameters.
  - **Resolution**: Implemented `ChoiceType` system with differentiated mechanics:
    - **Bold**: DC +2 (harder), but +2 LP bonus on success, +2 Trust bonus on success, +1 SP penalty on failure, +10% XP bonus on success
    - **Cautious**: DC -2 (easier), standard rewards
  - **Files Changed**: `src/engine/scene-engine.ts`, `src/components/ChoiceList.tsx`
  - **New Exports**: `ChoiceType`, `ChoiceModifiers`, `getChoiceModifiers()`

## 3. Therapeutic Logic

**Status**: ✅ **PASSED**

- **Guardian Trust**:
  - **Math**: Trust changes are correctly calculated: `Base Change (+/- 5) * Level Multiplier`.
  - **Bounds**: Trust is correctly clamped between 0 and 100.
- **Milestones**:
  - **Triggers**: Milestones (25, 50, 75) are correctly checked in `updateMilestone`.
  - **Persistence**: `pendingMilestoneJournals` correctly queues modal popups, ensuring users don't miss important therapeutic feedback even after page reloads.

---

## Recommendations

1.  ~~**Fix Scene Choice Logic**~~: ✅ **COMPLETED (2025-12-02)**
    - ~~Update `handleChoice` to accept a `choiceType` ('bold' | 'cautious').~~
    - ~~Implement mechanical differences (e.g., "Bold" = Higher DC but Higher Reward? or different stat dependencies?).~~
    - Implemented: Bold = DC +2, +2 LP/Trust bonus on success, +1 SP penalty on failure, +10% XP bonus
    - Implemented: Cautious = DC -2, standard rewards
    - UI now shows mechanical differences to players on each choice button

2.  ~~**Cleanup Legacy Code**~~: ✅ **ALREADY COMPLETED**
    - Verified 2025-12-02: Legacy combat code has already been removed:
      - `src/components/combat/` directory no longer exists
      - `gameStore.startCombat()` function removed
      - `legacyCombat=1` URL parameter removed
    - Remaining combat code in game-store is **shared infrastructure** used by the NEW combat system:
      - Combat statistics tracking (used for Progress page)
      - `endCombat()` called by CombatEndModal to persist results
      - Resource state (LP/SP) shared between game-store and combat-store
