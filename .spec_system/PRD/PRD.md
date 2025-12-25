# Luminari's Quest - Product Requirements Document

## Overview

Luminari's Quest is a therapeutic AI-powered RPG adventure designed to help young adults (18-25) process trauma through interactive storytelling and journaling. The application targets users who have experienced parental loss and homelessness during their teenage years.

This PRD focuses on **Phase 00: Database Audit and Improvements** - addressing critical data persistence gaps identified in the State Persistence Audit. Reliable state persistence is foundational to the therapeutic value of the application; users must be able to trust that their progress, reflections, and growth are preserved across devices and sessions.

## Goals

1. Ensure all player progress persists reliably across devices and browsers
2. Eliminate data loss scenarios that undermine therapeutic trust
3. Utilize existing database infrastructure (combat_history table) for therapeutic analytics
4. Provide offline resilience for critical game state
5. Enable therapeutic review of combat encounters and growth insights

## Non-Goals

- Adding new gameplay features (combat, scenes, etc.)
- Modifying game balance or mechanics
- UI/UX redesign
- Performance optimization beyond database queries
- New user-facing features

## Users and Use Cases

### Primary Users

- **Player**: Young adult using the app for therapeutic processing
- **Returning Player**: User logging in from a different device or after clearing browser data

### Key Use Cases

1. Player logs in from a new device and expects all progress intact
2. Player refreshes browser mid-combat and wants to resume
3. Player reviews past combat encounters for therapeutic reflection
4. Player experiences network issues but continues playing (offline resilience)
5. Player's audio preferences persist across sessions

## Requirements

### MVP Requirements (Priority 1 - Critical Data Loss)

- Add `max_player_health` column to `game_states` database table
- Update `saveToSupabase()` to persist `maxPlayerHealth`
- Update `loadFromSupabase()` to restore `maxPlayerHealth`
- Regenerate Supabase TypeScript types after schema change
- Add integration tests verifying cross-device state restoration

### Priority 2 Requirements (Offline Resilience)

- Add `experiencePoints`, `experienceToNext`, `playerStatistics` to localStorage partialize
- Convert `pendingMilestoneJournals` from Set to Array for serialization
- Implement `combat_history` table writes after each combat ends
- Add fallback logic when database load fails (use localStorage values)

### Priority 3 Requirements (Feature Completeness)

- Persist audio player track index to `user_settings`
- Save `preferredActions` to `player_statistics` JSONB field
- Save `growthInsights` to journal entries or dedicated field
- Save `combatReflections` to journal entries with combat context

### Deferred Requirements (Priority 4 - Nice to Have)

- Mid-combat state recovery (save/restore combat in progress)
- Combat log persistence for therapeutic review
- Audio playing state persistence

## Non-Functional Requirements

- **Data Integrity**: Zero data loss for critical player state (health, XP, trust, milestones)
- **Performance**: Database saves complete within 2 seconds; no blocking UI during save
- **Reliability**: Auto-save with retry logic; graceful degradation to localStorage on network failure
- **Security**: All database access via RLS policies; no direct table access without user context

## Constraints and Dependencies

- Supabase PostgreSQL database with existing schema
- Must maintain backwards compatibility with existing save data
- Migrations must be reversible
- Cannot break existing auto-save system
- React 19.2 with Zustand state management

## Phases

This system delivers the product via phases. Each phase is implemented via multiple 2-4 hour sessions (15-30 tasks each).

| Phase | Name                      | Sessions | Status      |
| ----- | ------------------------- | -------- | ----------- |
| 00    | DB Audit and Improvements | 6        | Not Started |

## Phase 00: DB Audit and Improvements

### Objectives

1. Fix all critical data persistence bugs (maxPlayerHealth)
2. Implement offline resilience for key state variables
3. Activate unused combat_history table for therapeutic analytics
4. Ensure complete cross-device state synchronization

### Sessions (To Be Defined)

Sessions are defined via `/phasebuild` as `session_NN_name.md` stubs under `.spec_system/PRD/phase_00/`.

**Note**: Run `/phasebuild` to define sessions for this phase.

## Technical Stack

- **Frontend**: React 19.2, TypeScript, Vite 7.2 - modern SPA architecture
- **Styling**: Tailwind CSS 4.1, Radix UI - accessible component library
- **State Management**: Zustand with persistence middleware - cross-store coordination
- **Backend**: Supabase PostgreSQL with RLS - secure, typed database access
- **Testing**: Vitest 4.0, React Testing Library - co-located test files

## Current Database Architecture

### Tables

1. **game_states** - Main player progress (one record per user)
   - guardian_trust, player_level, current_scene_index
   - JSONB: milestones, scene_history, player_statistics
   - Resources: player_health, player_energy, max_player_energy, light_points, shadow_points
   - **MISSING**: max_player_health column

2. **journal_entries** - Therapeutic journal entries
   - Types: milestone, learning
   - Tracks trust level at time of writing

3. **user_settings** - User preferences
   - audio_settings, accessibility, ui_preferences, tutorial_state

4. **combat_history** - Combat analytics (EXISTS BUT UNUSED)
   - Designed for therapeutic tracking but never implemented

### State Stores

1. **game-store.ts** - Main Zustand store with Supabase persistence
2. **combat-store.ts** - Combat session state (localStorage only)
3. **player-resources.ts** - Shared resource slice (partial DB sync)
4. **settings-store.ts** - User preferences (properly synced)

## Success Criteria

- [ ] maxPlayerHealth persists to database and restores on cross-device login
- [ ] All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) sync to DB
- [ ] experiencePoints, experienceToNext, playerStatistics have localStorage fallback
- [ ] pendingMilestoneJournals serializes correctly (Array instead of Set)
- [ ] combat_history receives records after each combat
- [ ] Audio track index persists in user_settings
- [ ] Integration tests verify cross-device state restoration
- [ ] Supabase types regenerated and type-safe

## Risks

- **Migration Risk**: Schema changes could break existing user data - mitigate with reversible migrations and defaults
- **Type Safety**: Supabase types out of sync after schema change - mitigate by regenerating types as part of migration
- **Combat State Complexity**: Combat store has many interdependent fields - mitigate by focusing on post-combat persistence first

## Assumptions

- Existing auto-save system (30-second debounce) is reliable
- Users have stable internet for most sessions (offline is fallback, not primary)
- Supabase CLI is available for type generation
- All existing tests pass before starting work

## Open Questions

1. Should combat-in-progress state be persisted (complex) or only post-combat results (simpler)?
2. What retention policy for combat_history records (keep all, rolling window, user-deletable)?
3. Should audio playing state persist or always start paused for safety?
4. Are there additional JSONB fields we should add for future extensibility?
