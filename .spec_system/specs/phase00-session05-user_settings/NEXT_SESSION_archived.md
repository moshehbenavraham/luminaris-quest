# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-26
**Project State**: Phase 00 - DB Audit and Improvements
**Completed Sessions**: 4 of 6

---

## Recommended Next Session

**Session ID**: `phase00-session05-user_settings`
**Session Name**: User Settings
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~18

---

## Why This Session Next?

### Prerequisites Met

- [x] Session 04 completed (combat history working)
- [x] Understanding of settings-store.ts structure
- [x] Understanding of AudioPlayer.tsx current state

### Dependencies

- **Builds on**: Session 04 (combat_history) - uses similar persistence patterns
- **Enables**: Session 06 (therapeutic_data) - which explicitly requires Session 05

### Project Progression

Session 05 is the natural next step because:

1. It follows the linear dependency chain (Sessions 01-04 complete)
2. Session 06 has an explicit prerequisite on Session 05 completion
3. The patterns established in previous sessions (settings-store persistence, JSONB field updates) directly apply here
4. Completing audio persistence improves UX before the final therapeutic data session

---

## Session Overview

### Objective

Persist audio player track index and preferredActions to user settings, ensuring consistent user experience across sessions and devices.

### Key Deliverables

1. **Updated settings-store.ts**: Add audioTrackIndex field with database sync
2. **Updated AudioPlayer.tsx**: Use persisted track index from settings store
3. **preferredActions persistence**: Save to player_statistics JSONB after combat
4. **Tests**: Verify settings persist across sessions

### Scope Summary

- **In Scope (MVP)**: Audio track index persistence, preferredActions in player_statistics, AudioPlayer refactor
- **Out of Scope**: Audio playing state persistence (start paused for safety), mid-combat recovery, growthInsights (Session 06)

---

## Technical Considerations

### Technologies/Patterns

- Zustand settings-store with Supabase sync
- JSONB fields for player_statistics
- Component state → store state migration pattern
- Debounced save operations

### Potential Challenges

- Migrating AudioPlayer from local state to store state requires careful hydration handling
- Cross-store communication (combat-store → game-store for preferredActions)
- Ensuring audioTrackIndex defaults correctly for existing users

### Relevant Considerations

- **[Architecture]** Zustand store with persistence middleware - follow established patterns
- **[What Worked]** Selective Zustand subscriptions for performance - apply to AudioPlayer
- **[What to Avoid]** Direct store usage without hydration check - ensure AudioPlayer uses hydration pattern
- **[Tool Note]** React 19.2 requires stricter testing patterns - wrap timer advances in act()

---

## Alternative Sessions

If this session is blocked:

1. **phase00-session06-therapeutic_data** - Cannot proceed (depends on Session 05)

**Note**: Session 05 is required before Session 06 can begin. There are no alternative paths.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
