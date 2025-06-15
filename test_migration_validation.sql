-- =====================================================================================
-- MIGRATION VALIDATION SCRIPT
-- =====================================================================================
-- Tests for Phase 4.1 - Local Migration Deployment Validation

-- 1. VERIFY RLS POLICIES
-- =====================================================================================
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 2. VERIFY INDEXES
-- =====================================================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 3. VERIFY TABLE STRUCTURE
-- =====================================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 4. TEST BASIC DATABASE OPERATIONS
-- =====================================================================================
-- Note: These operations will be commented out since we need actual auth context
-- But this shows the structure for basic CRUD testing

/*
-- Test INSERT into game_states (requires auth context)
INSERT INTO game_states (user_id, guardian_trust, player_level) 
VALUES ('test-uuid', 5, 2);

-- Test SELECT from game_states
SELECT * FROM game_states WHERE user_id = 'test-uuid';

-- Test INSERT into journal_entries
INSERT INTO journal_entries (id, user_id, type, trust_level, content, title) 
VALUES ('test-entry', 'test-uuid', 'milestone', 5, 'Test content', 'Test Title');

-- Test SELECT from journal_entries
SELECT * FROM journal_entries WHERE user_id = 'test-uuid';
*/