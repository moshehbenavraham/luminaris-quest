-- =====================================================================================
-- INITIAL GAME DATABASE SCHEMA MIGRATION
-- =====================================================================================
-- 
-- Migration ID: 20250615182947_initial_game_database_schema
-- Description: Creates the initial database schema for the Luminaris Quest game
-- Created: 2025-06-15 18:29:47 UTC+3 (Asia/Jerusalem)
-- Phase: 2.3 of 9-phase database schema migration project
-- 
-- WHAT THIS MIGRATION CREATES:
-- - game_states table: Stores player progress and game state data
-- - journal_entries table: Stores therapeutic journal entries
-- - Row Level Security (RLS) policies for both tables
-- - Performance indexes for efficient data retrieval
-- 
-- ENVIRONMENT COMPATIBILITY:
-- - Local development: ✓ Compatible
-- - Staging: ✓ Compatible  
-- - Production: ✓ Compatible
-- 
-- DEPENDENCIES:
-- - Requires Supabase Auth to be enabled (auth.users table must exist)
-- - Requires PostgreSQL JSONB support
-- 
-- ROLLBACK STRATEGY:
-- - Tables can be safely dropped if migration needs to be reversed
-- - No existing data will be affected (this is an initial schema creation)
-- 
-- SCHEMA OVERVIEW:
-- 
-- game_states table:
--   - Stores one record per user with complete game progress
--   - Includes guardian trust, player level, scene progression
--   - Uses JSONB for flexible milestone and scene history storage
--   - Implements upsert pattern for save/load operations
-- 
-- journal_entries table:
--   - Stores therapeutic journal entries with metadata
--   - Supports milestone and learning entry types
--   - Tracks trust levels and editing history
--   - Uses JSONB for flexible tag storage
-- 
-- Security:
--   - Full RLS implementation ensures users only access their own data
--   - Foreign key constraints maintain referential integrity
--   - Proper indexing for performance optimization
-- 
-- SOURCE REFERENCES:
-- - Schema specification: docs/DATABASE_SCHEMA.md
-- - Game store implementation: src/store/game-store.ts (lines 194-327)
-- - Journal interface: src/components/JournalModal.tsx (lines 7-17)
-- 
-- =====================================================================================

-- =====================================================================================
-- TABLE CREATION
-- =====================================================================================

-- Create game_states table
-- Stores player's game progress with one record per user
CREATE TABLE game_states (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_trust INTEGER NOT NULL DEFAULT 0,
    player_level INTEGER NOT NULL DEFAULT 1,
    current_scene_index INTEGER NOT NULL DEFAULT 0,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    scene_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
-- Stores player's therapeutic journal entries
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('milestone', 'learning')),
    trust_level INTEGER NOT NULL,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    scene_id TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on game_states table
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT on game_states
CREATE POLICY "Users can view own game state" ON game_states
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for INSERT on game_states
CREATE POLICY "Users can insert own game state" ON game_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE on game_states
CREATE POLICY "Users can update own game state" ON game_states
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for DELETE on game_states
CREATE POLICY "Users can delete own game state" ON game_states
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on journal_entries table
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT on journal_entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for INSERT on journal_entries
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE on journal_entries
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for DELETE on journal_entries
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- PERFORMANCE INDEXES
-- =====================================================================================

-- Indexes for game_states table
-- Primary key index (automatic)
-- user_id is already unique/primary key, no additional index needed

-- Index for updated_at for potential cleanup queries
CREATE INDEX idx_game_states_updated_at ON game_states(updated_at);

-- Indexes for journal_entries table
-- Primary key index (automatic)
-- user_id index for efficient user queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Composite index for user + creation time ordering
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);

-- Index for entry type filtering
CREATE INDEX idx_journal_entries_type ON journal_entries(type);

-- Index for scene association
CREATE INDEX idx_journal_entries_scene_id ON journal_entries(scene_id) WHERE scene_id IS NOT NULL;

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================
