# Data Integrity & State Management Audit

Goal: Guarantee user progress is never lost and data is secure.

## Audit Results - Dec 2, 2025

### 1. Zustand Store Hydration

**Status: ⚠️ Partial Issue Identified**

- **Game Store (`src/store/game-store.ts`)**: ✅ **Passed**.
  - Implements a robust hydration-safe wrapper hook `useGameStore` that checks `hasMounted` and `_hasHydrated`.
  - Correctly returns initial/safe values during hydration to prevent SSR mismatches.
- **Combat Store (`src/features/combat/store/combat-store.ts`)**: ⚠️ **Risk**.
  - The store supports hydration (`_hasHydrated`), but the exported hook `useCombatStore` (both in the store file and the hook wrapper `src/features/combat/hooks/useCombatStore.ts`) **does not** enforce the hydration check pattern.
  - `CombatOverlay.tsx` manually checks `hasHydrated` and returns `null`, which protects the main view, but this is an implementation detail of the consumer, not the store.
  - **Risk**: Any new component using `useCombatStore` directly might render before hydration, causing mismatched UI or errors.
  - **Action**: Refactor `src/features/combat/hooks/useCombatStore.ts` to implement the hydration-safe proxy pattern similar to `useGameStore`.

### 2. Save/Load Reliability

**Status: ⚠️ Critical Logic Flaw Detected**

- **Auto-Save Hook (`src/hooks/use-auto-save.ts`)**:
  - Triggers correctly on changes and intervals.
  - Has retry logic.
  - **Critical Flaw**: The hook assumes a save is successful because `saveToSupabase` in `game-store.ts` catches all errors and does not re-throw them (it returns `Promise<void>` effectively swallowing the error state).
  - **Consequence**: `use-auto-save` logs "Auto-save completed successfully" and resets its retry counter even when the save actually failed (e.g., network error). The UI might show "Saved" while data is unsaved.
  - **Action**:
    1.  Update `saveToSupabase` to return a `boolean` or `Result` type indicating success/failure.
    2.  Update `use-auto-save` to respect this return value and trigger retries/error handling appropriately.

### 3. Supabase Security (RLS)

**Status: ✅ Passed (Secure)**

- **Tables Audited**: `game_states`, `journal_entries`, `user_settings`, `combat_history`.
- **Policies**: All tables have strict RLS policies enabled.
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE` are all restricted using `auth.uid() = user_id`.
  - `combat_history` is effectively append-only (no UPDATE/DELETE policies), which is good for audit trails.
- **Functions**: `SECURITY DEFINER` functions have `SET search_path = public` applied (via migration `20251117000000_fix_function_security.sql`), mitigating privilege escalation risks.

### 4. Schema Validation

**Status: ✅ Passed (Valid)**

- **Comparison**: Validated TypeScript definitions (`src/integrations/supabase/types.ts`) against Database Schema (`supabase/migrations/*.sql`).
- **Match**:
  - `game_states`: All columns (including recent `player_statistics`, `light_points`, `player_energy`) match perfectly.
  - `journal_entries`: Matches.
  - `user_settings`: Matches.
  - `combat_history`: Matches.
- **Note**: Types are auto-generated and up-to-date.

## Recommended Next Steps (Immediate)

1.  **Fix Auto-Save False Positives**:
    - Modify `saveToSupabase` to return `Promise<boolean>`.
    - Update `useAutoSave` to check this result.

2.  **Harden Combat Store**:
    - Update `useCombatStore` hook in `src/features/combat/hooks/useCombatStore.ts` to block access until hydrated (or return safe defaults).

3.  **Testing**:
    - Verify the auto-save retry logic by simulating network failures (offline mode).
