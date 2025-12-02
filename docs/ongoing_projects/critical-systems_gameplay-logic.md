# 2. Critical Systems & Gameplay Logic Audit

**Date**: 2025-12-02
**Auditor**: Senior Dev Engineer (AI)

## Executive Summary

The audit confirms that the Dual Combat System is strictly isolated (to the point of the legacy system being unreachable). The Therapeutic Logic/Trust System is mathematically sound and implemented correctly. However, a **critical gameplay design flaw** was identified in the Scene Engine: player choices (Bold vs. Cautious) are purely cosmetic and share the exact same mechanical resolution path.

---

## 1. Dual Combat System Isolation

**Status**: ✅ **PASSED (Strict Isolation)**

- **Isolation Verification**:
  - The New Combat System (`src/features/combat`) does not import or use any logic from the Old Combat System (`src/components/combat` or `game-store` combat slice).
  - The Old Combat System is marked as deprecated.
  - **Findings**: The integration in `ChoiceList.tsx` **exclusively** uses `startNewCombat` from the new store. There is no code path to trigger the old `gameStore.startCombat()`.
  - **Legacy Flag**: The `?legacyCombat=1` URL parameter currently **hides the New UI** (`NewCombatOverlay`) but does **not** enable the Old UI or logic. This effectively renders the game unplayable with this flag (combat starts in background, no UI appears). This confirms strict isolation (no leakage), effectively deprecating the old system entirely in the runtime.

## 2. Scene Engine Validation

**Status**: ⚠️ **ISSUES FOUND (Illusion of Choice)**

- **Dice Mechanics**: ✅ **PASSED**. `rollDice` correctly implements a d20 system (`Math.floor(Math.random() * 20) + 1`) with level modifiers.
- **Scenario Flow**: ✅ **PASSED**. Linear progression through the scene array works as intended.
- **Branching Logic**: ❌ **FAILED**.
  - **Issue**: The `ChoiceList.tsx` component renders two buttons ("Bold" and "Cautious"), but **both buttons trigger the exact same `handleChoice` function** without passing any parameters.
  - **Impact**: The player's choice has **zero mechanical impact**. The difficulty check (DC), rewards, and consequences are identical regardless of which path is chosen. This creates a "false agency" problem where the narrative implies a choice, but the code executes the same logic.

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

1.  **Fix Scene Choice Logic**:
    - Update `handleChoice` to accept a `choiceType` ('bold' | 'cautious').
    - Implement mechanical differences (e.g., "Bold" = Higher DC but Higher Reward? or different stat dependencies?).
    - _Alternative_: If cosmetic only, explicitly acknowledge this in code comments or UI feedback (e.g., different flavor text in the result).

2.  **Cleanup Legacy Code**:
    - Since `legacyCombat=1` is effectively broken/disabled, consider fully removing the Old Combat System code (`src/components/combat` and `game-store` combat slice) to reduce technical debt, rather than maintaining "isolation".
