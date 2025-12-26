# Luminari's Quest - Product Requirements Document

## Overview

Luminari's Quest is a therapeutic AI-powered RPG adventure designed to help young adults (18-25) process trauma through interactive storytelling and journaling. The application targets users who have experienced parental loss and homelessness during their teenage years.

**Current Version**: 0.2.6

Reliable state persistence is foundational to the therapeutic value of the application; users must be able to trust that their progress, reflections, and growth are preserved across devices and sessions.

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

## Phases

This system delivers the product via phases. Each phase is implemented via multiple 2-4 hour sessions (15-30 tasks each).

| Phase | Name                      | Sessions | Status   | Completed  |
| ----- | ------------------------- | -------- | -------- | ---------- |
| 00    | DB Audit and Improvements | 6        | Complete | 2025-12-26 |

## Phase 00: DB Audit and Improvements (COMPLETE)

**Status**: Complete
**Duration**: 2025-12-25 to 2025-12-26
**Archived**: `.spec_system/archive/phases/phase_00/`

### Objectives (All Met)

1. Fix all critical data persistence bugs (maxPlayerHealth)
2. Implement offline resilience for key state variables
3. Activate unused combat_history table for therapeutic analytics
4. Ensure complete cross-device state synchronization

### Sessions Completed

| Session | Name                 | Tasks | Validated  |
| ------- | -------------------- | ----- | ---------- |
| 01      | Schema and Types     | 18    | 2025-12-25 |
| 02      | Critical Persistence | 18    | 2025-12-26 |
| 03      | Offline Resilience   | 23    | 2025-12-26 |
| 04      | Combat History       | 22    | 2025-12-26 |
| 05      | User Settings        | 22    | 2025-12-26 |
| 06      | Therapeutic Data     | 22    | 2025-12-26 |

### Key Deliverables

- Added `max_player_health` column to database schema
- All 6 resource variables sync to database
- Offline resilience via localStorage fallback
- combat_history table active with journal linking
- Audio track index persistence
- growthInsights persistence for therapeutic analytics
- ~80 new integration tests

## Success Criteria (All Met)

- [x] maxPlayerHealth persists to database and restores on cross-device login
- [x] All 6 resource variables (health, maxHealth, energy, maxEnergy, LP, SP) sync to DB
- [x] experiencePoints, experienceToNext, playerStatistics have localStorage fallback
- [x] pendingMilestoneJournals serializes correctly (Array instead of Set)
- [x] combat_history receives records after each combat
- [x] Audio track index persists in user_settings
- [x] Integration tests verify cross-device state restoration
- [x] Supabase types regenerated and type-safe

## Technical Stack

- **Frontend**: React 19.2, TypeScript, Vite 7.2 - modern SPA architecture
- **Styling**: Tailwind CSS 4.1, Radix UI - accessible component library
- **State Management**: Zustand with persistence middleware - cross-store coordination
- **Backend**: Supabase PostgreSQL with RLS - secure, typed database access
- **Testing**: Vitest 4.0, React Testing Library - co-located test files

## Database Architecture

### Tables

1. **game_states** - Main player progress (one record per user)
   - guardian_trust, player_level, current_scene_index
   - JSONB: milestones, scene_history, player_statistics
   - Resources: player_health, player_energy, max_player_energy, light_points, shadow_points, max_player_health

2. **journal_entries** - Therapeutic journal entries
   - Types: milestone, learning
   - Tracks trust level at time of writing
   - Links to combat_history via foreign key

3. **user_settings** - User preferences
   - audio_settings, accessibility, ui_preferences, tutorial_state

4. **combat_history** - Combat analytics
   - Tracks enemy, outcome, turns, resources
   - Links to journal_entries for therapeutic context

### State Stores

1. **game-store.ts** - Main Zustand store with Supabase persistence
2. **combat-store.ts** - Combat session state with combat_history writes
3. **player-resources.ts** - Shared resource slice (fully synced to DB)
4. **settings-store.ts** - User preferences (properly synced)

## Resolved Questions

1. **Combat-in-progress persistence**: Post-combat only (simpler, reliable)
2. **combat_history retention**: Keep all records for therapeutic review
3. **Audio playing state**: Persist track index, always start paused for safety
4. **JSONB extensibility**: growthInsights added to player_statistics

## Risks (Mitigated)

- **Migration Risk**: Used reversible migrations with sensible defaults
- **Type Safety**: Regenerated Supabase types after schema changes
- **Combat State Complexity**: Focused on post-combat persistence

## Next Phase

Phase 00 is complete. The data persistence layer is now reliable and comprehensive.

**Recommended next phase**: Therapeutic Analytics Dashboard - leveraging combat_history and growthInsights data for user-facing therapeutic review features.

Run `/audit` to assess codebase state before planning Phase 01.
