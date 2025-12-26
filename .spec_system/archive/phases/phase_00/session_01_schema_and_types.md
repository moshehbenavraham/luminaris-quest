# Session 01: Schema and Types

**Session ID**: `phase00-session01-schema_and_types`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Add the missing `max_player_health` column to the database schema and regenerate Supabase TypeScript types to ensure type safety across the application.

---

## Scope

### In Scope (MVP)

- Create reversible database migration for `max_player_health` column
- Apply migration to Supabase database
- Regenerate Supabase TypeScript types
- Update type definitions to use generated types (remove `as any` casts)
- Verify existing tests still pass after schema change
- Audit RLS policies for the new column

### Out of Scope

- Modifying save/load logic (Session 02)
- Offline resilience improvements (Session 03)
- UI changes
- Combat system modifications

---

## Prerequisites

- [ ] Supabase CLI installed and configured
- [ ] Database migration permissions
- [ ] All existing tests passing (`npm test`)
- [ ] TypeScript compiling without errors (`npm run build`)

---

## Deliverables

1. **Migration file**: `supabase/migrations/YYYYMMDDHHMMSS_add_max_player_health.sql`
2. **Updated types**: `src/integrations/supabase/types.ts` regenerated
3. **Type audit**: Document any `as any` casts that can now be removed
4. **Test verification**: All existing tests pass

---

## Technical Details

### Migration SQL

```sql
-- Add max_player_health column with sensible default
ALTER TABLE game_states
ADD COLUMN max_player_health INTEGER DEFAULT 100;

-- Add comment for documentation
COMMENT ON COLUMN game_states.max_player_health IS 'Maximum player health (base 100, increases with level/items)';
```

### Rollback SQL

```sql
ALTER TABLE game_states
DROP COLUMN max_player_health;
```

### Type Generation Command

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
# OR for remote
supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```

---

## Success Criteria

- [ ] Migration applied successfully to database
- [ ] `max_player_health` column exists in `game_states` table
- [ ] Column has DEFAULT 100 (backwards compatible)
- [ ] Supabase types regenerated and include `max_player_health`
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] RLS policies verified for new column

---

## Risks

- **Data migration**: Existing rows need the column populated
  - _Mitigation_: DEFAULT 100 ensures all existing users get valid value
- **Type sync**: Old types cached somewhere causing type errors
  - _Mitigation_: Full clean build after regeneration

---

## Notes

This is a foundational session - subsequent sessions depend on these types being correct. Take time to verify the schema change is complete before proceeding.
