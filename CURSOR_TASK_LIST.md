# Luminari's Quest - Task List - for Cursor Coding Agent

# TASKS

### Upcoming: Energy & Experience Systems 🚧

**Energy System Implementation Plan**
1. ✅ DONE: Game-state support (playerEnergy / maxPlayerEnergy, actions to modify, regenerate, consume)
2. ✅ DONE: Passive regeneration timer (default 1 energy / 30 s, paused in combat)
3. ✅ DONE: Scene energy costs & rewards (type-based costs 5-15; recovery bonuses on success)
4. ✅ DONE: Combat energy costs & low-energy penalties (<20 %)
5. ✅ DONE: UI hookup (StatsBar, low-energy warnings, tool-tips)
6. ✅ DONE: Persistence, resetGame integration, unit tests & balance pass

**Experience System Implementation Plan**
1. Game-state XP field & actions (gainExperience, levelUp) with level-up formula XP = 50 × L × (L + 1)
2. XP sources (scene completion 15-30 XP, combat 30-50 XP, milestones, etc.)
3. Level benefits (+5 HP, +5 Energy, +1 LP per level; feature unlocks at L 3/5/7/10/15)
4. UI hookup (StatsBar XP bar, level badge, level-up celebration)
5. Persistence, tests, and balancing (target ≈1 level/hour of play)

Implementation order: Energy first (foundation) → Experience second (builds on energy).

## Finished Tasks

- ✅ DONE: Energy System Step 6 - Persistence, resetGame integration, unit tests & balance pass
  - Implemented complete energy state persistence to/from Supabase database
  - Created database migration adding player_energy and max_player_energy columns
  - Updated save/load functions to include energy fields with backwards compatibility
  - Energy changes properly track unsaved state for auto-save functionality
  - Created comprehensive test suite with 10 tests covering all scenarios
  - Build passes successfully, no breaking changes

- ✅ DONE: Energy System Step 5 - UI hookup (StatsBar, low-energy warnings, tooltips)
  - Enhanced StatsBar component with comprehensive energy UI features
  - Added visual low-energy warnings when energy < 20% (orange theme, pulsing alert icon)
  - Implemented tooltips for all stats explaining game mechanics
  - Connected energy display to actual game store values (playerEnergy/maxPlayerEnergy)
  - Added proper ARIA attributes for accessibility
  - Created comprehensive test suite with 17 new test cases
  - Build passes successfully, no breaking changes

- ✅ DONE: Energy System Step 4 - Combat energy costs & low-energy penalties
  - Implemented energy costs for all combat actions (ILLUMINATE: 3, REFLECT: 2, ENDURE: 1, EMBRACE: 5)
  - Added low-energy penalty system (50% damage reduction when energy < 20% of max)
  - Integrated energy validation preventing actions without sufficient energy
  - Enhanced combat store with playerEnergy and maxPlayerEnergy synchronization
  - Updated action cost selectors to include energy costs alongside LP/SP costs
  - Added energy cost logging to combat log entries for transparency
  - Created environment configuration for easy game balancing
  - Built comprehensive test suite (13 tests) covering all energy mechanics
  - Added contextual low-energy feedback messages for better UX
  - Strategic gameplay enhancement requiring energy management in combat
  - Build passes successfully, no breaking changes

- ✅ DONE: Energy System Step 3 - Scene energy costs & rewards
  - Implemented type-based energy costs for all scenes (5-15 energy range)
  - Added energy recovery bonuses on successful scene completion
  - Integrated insufficient energy protection with clear user feedback
  - Enhanced UI to display energy costs and rewards with Battery icons
  - Extended scene engine with energyChanges tracking in SceneOutcome
  - Added environment configuration for easy game balancing
  - Created comprehensive test suite (19 tests) covering all functionality
  - Strategic design encourages resource management gameplay
  - Build passes successfully, no breaking changes

- ✅ DONE: Energy System Step 2 - Passive regeneration timer
  - Implemented automatic energy regeneration (1 energy per 30 seconds)
  - Added combat detection to pause regeneration during battles
  - Added performance optimization for inactive app states
  - Created useEnergyRegeneration hook for lifecycle management
  - Integrated with App.tsx for global initialization
  - Build passes successfully
  - No breaking changes - enhances existing energy system

- ✅ DONE: Energy System Step 1 - Game-state support
  - Added playerEnergy and maxPlayerEnergy state fields (default 100)
  - Implemented modifyPlayerEnergy(delta) and setPlayerEnergy(energy) actions with bounds checking
  - Integrated energy into resetGame() function
  - Connected energy to Adventure page StatsBar for real-time display
  - Created comprehensive unit tests (9 test cases all passing)
  - Build and lint passing successfully
  - No breaking changes - purely additive feature

- ✅ DONE: 3 audio files starting with the word "dice" have been added, during the "dice rolling" system (\src\components\DiceRollOverlay.tsx) can you make sure a random choice between those 3 files gets played
  - Implemented random dice sound playback in DiceRollOverlay component
  - Integrated with existing sound manager system
  - Added useCallback optimization to prevent unnecessary re-renders
  - Created comprehensive unit tests with 9 test cases all passing
  - Build passes successfully
  - No breaking changes - purely additive enhancement

- ✅ DONE: in similar format to current scene list of 20, make another 20...  you can match the order of types and combat types, but otherwise make each and every single scene unique
  - Added 20 new unique scenes to scene-engine.ts (now 40 total)
  - Followed exact same type pattern: social, skill, combat, journal, exploration
  - Used same shadow manifestations in combat positions (3,8,13,18 and 23,28,33,38)
  - All scenes have completely unique content and therapeutic themes
  - Added comprehensive tests to verify all 40 scenes work correctly
  - Updated CHANGELOG.md with details


---

**Note**: All completed tasks have been moved to CHANGELOG.md for historical reference. See CHANGELOG.md for detailed completion history 

---

EoF