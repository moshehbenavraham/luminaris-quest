# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-25
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 0

---

## Recommended Next Session

**Session ID**: `phase00-session01-schema_and_types`
**Session Name**: Schema and Types
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met

- [x] No prerequisites - this is the foundational session
- [x] Supabase CLI assumed available (verify during session)
- [x] Database migration permissions available

### Dependencies

- **Builds on**: Nothing (first session in phase)
- **Enables**: Session 02 (Critical Persistence), and transitively all subsequent sessions

### Project Progression

This is the foundational database session. The `max_player_health` column must exist and TypeScript types must be regenerated before any persistence code can be updated. Session 02 explicitly requires these types - attempting to update save/load logic without correct types would require `as any` casts that violate project standards.

**Critical path**: Session 01 → Session 02 → Session 03 → (Sessions 04, 05, 06 can parallelize)

---

## Session Overview

### Objective

Add the missing `max_player_health` column to the database schema and regenerate Supabase TypeScript types to ensure type safety across the application.

### Key Deliverables

1. **Migration file**: `supabase/migrations/YYYYMMDDHHMMSS_add_max_player_health.sql`
2. **Updated types**: `src/integrations/supabase/types.ts` regenerated from schema
3. **Type audit**: Document `as any` casts that can be removed in Session 02
4. **Test verification**: All existing tests pass post-migration

### Scope Summary

- **In Scope (MVP)**: Database migration, type regeneration, RLS audit, test verification
- **Out of Scope**: Modifying save/load logic (Session 02), offline resilience (Session 03), UI changes

---

## Technical Considerations

### Technologies/Patterns

- PostgreSQL ALTER TABLE with DEFAULT value for backwards compatibility
- Supabase CLI for type generation (`supabase gen types typescript`)
- Reversible migration pattern (include rollback SQL)

### Potential Challenges

- **Supabase CLI access**: May need to verify CLI is installed and authenticated
- **Type caching**: IDE may cache old types - may need full clean build
- **RLS policies**: New column should inherit existing policies but needs verification

### Relevant Considerations

- **[P00] RLS policies must be audited**: Directly applies - verify new column is covered
- **[P00] Avoiding `any` types**: This session enables type cleanup in Session 02
- **[P00] Zustand persistence middleware**: No changes to store in this session

---

## Alternative Sessions

If this session is blocked:

1. **None viable** - Session 01 is the dependency root; all other sessions require it
2. **Workaround option**: If Supabase CLI unavailable, could manually update types.ts (not recommended)

---

## Verification Checklist

Before marking Session 01 complete:

- [ ] Migration applied to database successfully
- [ ] `max_player_health` column exists with DEFAULT 100
- [ ] `src/integrations/supabase/types.ts` includes `max_player_health: number | null`
- [ ] `npm run build` passes with zero errors
- [ ] `npm test` passes with all existing tests
- [ ] RLS policies verified for new column

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
