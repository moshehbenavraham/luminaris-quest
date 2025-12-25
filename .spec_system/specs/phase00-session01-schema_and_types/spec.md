# Session Specification

**Session ID**: `phase00-session01-schema_and_types`
**Phase**: 00 - DB Audit and Improvements
**Status**: Not Started
**Created**: 2025-12-25

---

## 1. Session Overview

This session addresses a critical data persistence bug identified in the State Persistence Audit: the `max_player_health` column is missing from the `game_states` database table. Currently, only 5 of 6 player resource variables persist to the database correctly. The missing `maxPlayerHealth` field causes players to lose their max health upgrades when logging in from a different device or clearing browser storage.

This is the foundational session for Phase 00. All subsequent sessions depend on the schema being correct and TypeScript types being regenerated. Without this session, any code changes to save/load logic would require `as any` type casts that violate project conventions. The migration must be reversible and backwards-compatible with existing user data.

The session establishes the database infrastructure needed for complete cross-device state synchronization. After completion, Session 02 can update the actual save/load logic with full type safety.

---

## 2. Objectives

1. Add `max_player_health` INTEGER column to `game_states` table with DEFAULT 100 for backwards compatibility
2. Regenerate Supabase TypeScript types to include the new column
3. Verify RLS policies cover the new column (inherits from table-level policies)
4. Validate all existing tests pass and build compiles without errors

---

## 3. Prerequisites

### Required Sessions

- None - this is the first session in Phase 00

### Required Tools/Knowledge

- Supabase CLI installed and authenticated (`supabase --version`)
- Database migration permissions for the project
- Understanding of PostgreSQL ALTER TABLE syntax

### Environment Requirements

- Access to Supabase project (local or remote)
- Node.js environment with npm
- All existing tests passing (`npm test`)
- TypeScript compiling without errors (`npm run build`)

---

## 4. Scope

### In Scope (MVP)

- Create reversible database migration file
- Apply migration to Supabase database
- Regenerate `src/integrations/supabase/types.ts`
- Verify existing tests pass after schema change
- Verify RLS policies apply to new column
- Document `as any` casts that can be removed in Session 02

### Out of Scope (Deferred)

- Modifying `saveToSupabase()` logic - _Reason: Session 02 scope_
- Modifying `loadFromSupabase()` logic - _Reason: Session 02 scope_
- Offline resilience improvements - _Reason: Session 03 scope_
- UI changes - _Reason: Not part of Phase 00_
- Combat system modifications - _Reason: Not part of Phase 00_

---

## 5. Technical Approach

### Architecture

The migration adds a single INTEGER column to the existing `game_states` table. The column uses DEFAULT 100 to ensure:

1. Existing user records automatically receive a valid value
2. New user records get the standard starting max health
3. No NULL handling complexity in application code

```
game_states table (before):
- player_health INTEGER
- max_player_energy INTEGER
- player_energy INTEGER
- ... other columns

game_states table (after):
- player_health INTEGER
- max_player_health INTEGER DEFAULT 100  <-- NEW
- max_player_energy INTEGER
- player_energy INTEGER
- ... other columns
```

### Design Patterns

- **Reversible Migration**: Include both up (ADD COLUMN) and down (DROP COLUMN) logic
- **Backwards Compatibility**: DEFAULT value ensures no breaking changes
- **Verification Block**: PL/pgSQL assertion to confirm migration success
- **Type Regeneration**: Supabase CLI generates types from live schema

### Technology Stack

- PostgreSQL 15+ (Supabase)
- Supabase CLI 2.x for type generation
- TypeScript 5.x for generated types
- Vitest 4.0 for test verification

---

## 6. Deliverables

### Files to Create

| File                                                           | Purpose                                         | Est. Lines |
| -------------------------------------------------------------- | ----------------------------------------------- | ---------- |
| `supabase/migrations/20251225000000_add_max_player_health.sql` | Add column to game_states                       | ~35        |
| `docs/type-audit-session01.md`                                 | Document `as any` casts to remove in Session 02 | ~30        |

### Files to Modify

| File                                 | Changes                                          | Est. Lines Changed |
| ------------------------------------ | ------------------------------------------------ | ------------------ |
| `src/integrations/supabase/types.ts` | Regenerated from schema (adds max_player_health) | ~15                |

### Files to Verify (No Changes Expected)

| File                                   | Verification                                                   |
| -------------------------------------- | -------------------------------------------------------------- |
| `src/store/game-store.ts`              | Should still compile; `as any` casts documented for Session 02 |
| `src/store/slices/player-resources.ts` | No changes needed                                              |
| All `*.test.ts` files                  | Must pass without modification                                 |

---

## 7. Success Criteria

### Functional Requirements

- [ ] Migration applied successfully to database
- [ ] `max_player_health` column exists in `game_states` table
- [ ] Column has DEFAULT 100 (verified via SQL query)
- [ ] Existing user records have `max_player_health = 100`
- [ ] New inserts without `max_player_health` get DEFAULT value

### Type Safety Requirements

- [ ] `src/integrations/supabase/types.ts` regenerated
- [ ] Types include `max_player_health: number | null` in Row type
- [ ] Types include `max_player_health?: number | null` in Insert type
- [ ] Types include `max_player_health?: number | null` in Update type
- [ ] `npm run build` passes with zero errors

### Testing Requirements

- [ ] All existing tests pass (`npm test`)
- [ ] No test file modifications required

### Quality Gates

- [ ] All files ASCII-encoded (UTF-8 compatible, no special characters)
- [ ] Unix LF line endings
- [ ] Migration follows project naming convention: `YYYYMMDD_HHMMSS_description.sql`
- [ ] Code follows CONVENTIONS.md patterns

---

## 8. Implementation Notes

### Key Considerations

- The column type is INTEGER (not BIGINT) to match `player_health`
- DEFAULT 100 matches the hardcoded value in `player-resources.ts:71`
- RLS policies are table-level, so the new column inherits existing policies
- No index needed - column is rarely queried in isolation

### Potential Challenges

- **Supabase CLI Authentication**: May need to run `supabase login` if not authenticated
  - _Mitigation_: Document CLI setup steps in task list
- **Type Caching**: IDE may cache old types causing phantom errors
  - _Mitigation_: Full clean build after regeneration (`rm -rf node_modules/.vite && npm run build`)
- **Migration Already Applied**: If running against a DB where column exists
  - _Mitigation_: Use `IF NOT EXISTS` pattern in migration

### Relevant Considerations

From CONSIDERATIONS.md:

- **[P00] RLS policies must be audited**: The new column inherits table-level RLS policies. Verify that `game_states` policies allow users to read/write only their own rows.
- **[P00] Avoiding `any` types**: This session enables type cleanup. Document all `as any` casts in game-store.ts for removal in Session 02.

From CONVENTIONS.md:

- Column names use `snake_case` (hence `max_player_health`, not `maxPlayerHealth`)
- Migrations must be reversible
- Use DEFAULT values for backwards compatibility

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No curly quotes, em dashes, or special Unicode characters in SQL comments or TypeScript.

---

## 9. Testing Strategy

### Unit Tests

- No new unit tests required for schema changes
- Verify existing tests pass unchanged

### Integration Tests

- No new integration tests in this session
- Session 02 will add cross-device restoration tests

### Manual Testing

1. **Verify column exists**:

   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'game_states' AND column_name = 'max_player_health';
   ```

2. **Verify existing data populated**:

   ```sql
   SELECT user_id, max_player_health FROM game_states LIMIT 5;
   ```

3. **Verify RLS policy**:
   - Log in as test user
   - Query game_states - should only see own row
   - Verify max_player_health is readable

### Edge Cases

- **No existing users**: Migration works on empty table
- **User with NULL in other columns**: New column independent
- **Concurrent reads during migration**: ALTER TABLE is quick; minimal lock

---

## 10. Dependencies

### External Libraries

- `@supabase/supabase-js`: ^2.x (existing)
- Supabase CLI: ^2.x (for type generation)

### Other Sessions

- **Depends on**: None (first session)
- **Depended by**:
  - Session 02 (Critical Persistence) - requires column and types
  - Session 03 (Offline Resilience) - transitively depends on Session 02
  - Sessions 04, 05, 06 - transitively depend on Session 03

---

## 11. Rollback Plan

If issues are discovered after migration:

```sql
-- Rollback migration
ALTER TABLE public.game_states
DROP COLUMN IF EXISTS max_player_health;
```

After rollback:

1. Regenerate types: `supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts`
2. Verify build: `npm run build`
3. Verify tests: `npm test`

---

## 12. Type Audit Preview

Known `as any` casts to document (based on STATE_PERSISTENCE_AUDIT.md):

```typescript
// game-store.ts - loadFromSupabase() area
// Current: (gameState as any).max_player_health
// After Session 01: gameState.max_player_health (type-safe)
```

The full audit will be created during implementation.

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
