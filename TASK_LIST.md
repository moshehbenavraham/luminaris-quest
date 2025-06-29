# Luminari's Quest - Task List

## 🚨 CRITICAL WARNING: TWO COMBAT SYSTEMS EXIST

**⚠️ NEW System**: `/src/features/combat/` - ✅ ACTIVE DEVELOPMENT
**⚠️ OLD System**: `/src/components/combat/` - ❌ DEPRECATED

See `COMBAT_MIGRATION_GUIDE.md` for full details before working on combat!

## CRITICAL - Combat Overlay Complete Rebuild Plan - In Progress

### Architecture Principles
1. **Mobile-First Design** - Build for mobile, enhance for desktop
2. **Component Separation** - Single responsibility, max 500 LOC per file
3. **Tailwind-Only Styling** - Extend theme for combat palette, no CSS modules
4. **Zustand State Management** - With persistence and hydration safety
5. **Accessibility First** - WCAG AA compliance with comprehensive ARIA support

### New Component Structure

#### 1. Core Layout Components
```
src/features/combat/
├── store/
│   └── combat-store.ts         # Zustand store with persist middleware
├── components/
│   ├── CombatOverlay.tsx      # Main orchestrator (<500 LOC)
│   ├── CombatBackdrop.tsx     # Fullscreen backdrop component
│   └── CombatContainer.tsx    # Responsive layout container
├── hooks/
│   ├── useCombatStore.ts      # Store selectors
│   ├── useCombatKeyboard.ts   # Centralized keyboard handling
│   └── useCombatEffects.ts    # Sound/animation effects
└── index.ts                    # Export barrel
```

#### 2. Display Components (Atoms/Molecules)
```
src/features/combat/components/display/
├── atoms/
│   ├── HealthBar.tsx          # Reusable HP bar
│   ├── ResourceMeter.tsx      # LP/SP display atom
│   ├── StatusBadge.tsx        # Status effect badge
│   └── TurnBadge.tsx          # Turn indicator atom
├── molecules/
│   ├── EnemyInfo.tsx          # Enemy name, type, description
│   ├── EnemyHealthPanel.tsx   # HP bar + status
│   ├── ResourceGrid.tsx       # Player resources layout
│   └── StatusEffectList.tsx   # Active effects display
└── organisms/
    ├── EnemyCard.tsx          # Complete enemy display (<300 LOC)
    └── ResourcePanel.tsx      # Complete resource panel (<300 LOC)
```

#### 3. Action Components
```
src/features/combat/components/actions/
├── ActionButton.tsx           # Individual action with tooltip
├── ActionGrid.tsx             # Responsive 2x2 mobile, 4x1 desktop
├── ControlPanel.tsx           # End Turn + Surrender buttons
└── ActionTooltip.tsx          # shadcn/ui Tooltip wrapper
```

#### 4. Feedback Components
```
src/features/combat/components/feedback/
├── DamageIndicator.tsx        # Floating damage numbers (lazy loaded)
├── StatusNotification.tsx     # Toast-style status updates
├── TherapeuticInsight.tsx     # Guardian message display
└── CombatAnimation.tsx        # Attack animations (lazy loaded)
```

#### 5. Post-Combat Components
```
src/features/combat/components/resolution/
├── CombatEndModal.tsx         # shadcn/ui Dialog wrapper
├── VictoryContent.tsx         # Victory display content
├── DefeatContent.tsx          # Learning moment content
└── ReflectionForm.tsx         # Journal entry form
```

### Combat System Details @COMBAT_SYSTEM.md -- note User cannot vouch on quality of the document, it is supposed to be accurate according to AI

## 🔴 IMMEDIATE FIXES REQUIRED FOR BASIC PLAYABILITY

### **USER TESTING REQUIRED AFTER FIXING!**
**Each item below MUST be manually tested by a real user after implementing the fix:**

- [x] **LEVEL ADVANCEMENT BUG**: Player shows 186/140 XP but should have advanced to Level 3 at 140 XP (46 XP ago!) ✅ **FIXED**
  - **Problem**: calculateLevelProgression function returns total XP requirement for current level instead of remaining XP needed for next level
  - **Root Cause**: Line 338 returns getXPRequiredForLevel(level) instead of calculating remaining XP
  - **Expected**: At 186 XP total, should show Level 2 with 54/140 XP remaining to Level 3
  - **Impact**: Confuses players about progression, prevents understanding of advancement
  - **SOLUTION IMPLEMENTED**: 
    - ✅ Modified calculateLevelProgression to return actual remaining XP (xpNeededForNextLevel - currentLevelXP)
    - ✅ Updated getExperienceProgress to show current level progress instead of total XP
    - ✅ Updated tests to verify correct display values (22/22 tests passing)
    - ✅ Fixed resetGame to include missing experiencePoints and experienceToNext reset
    - ✅ All level advancement triggers still work properly
  - **Files**: src/store/game-store.ts (calculateLevelProgression, getExperienceProgress, resetGame), src/__tests__/experience-points-system.test.ts
  - **BUILD STATUS**: ✅ All tests passing, no TypeScript errors, no breaking changes
  - **USER TESTING REQUIRED**: User needs to verify XP display now shows progress within current level correctly

- [x] **AUTO-SAVE SYSTEM IMPLEMENTATION** ✅ **COMPLETE**
  - **Problem**: No automatic saving - users could lose progress if they forgot to save manually or experienced connection issues
  - **SOLUTION IMPLEMENTED**: 
    - ✅ Created comprehensive auto-save hook (`use-auto-save.ts`) with debounced saving, retry logic, and error handling
    - ✅ Added SaveStatusIndicator component with real-time visual feedback and manual save controls
    - ✅ Integrated auto-save into all authenticated routes via AuthenticatedApp wrapper component
    - ✅ Added save triggers on critical events (journal entries, scene completion, milestone achievements)
    - ✅ Enhanced Profile page with save management interface showing status, history, and manual controls
    - ✅ Comprehensive test coverage for auto-save functionality and status indicator
    - ✅ Error handling with retry logic, exponential backoff, and user-friendly error messages
    - ✅ Offline support with beforeunload handler to attempt saves when leaving page
  - **Features**:
    - Auto-save every 30 seconds when changes detected (debounced)
    - Immediate saves on critical events (journal entries, scene completion)
    - Visual status indicator showing save progress and time since last save
    - Manual save controls with retry functionality
    - Error recovery with automatic retries and user controls
    - Respects user authentication and app focus state
  - **Files**: 
    - `src/hooks/use-auto-save.ts` (main auto-save logic)
    - `src/components/SaveStatusIndicator.tsx` (visual status component)
    - `src/components/auth/AuthenticatedApp.tsx` (integration wrapper)
    - `src/components/auth/ProtectedRoute.tsx` & `AdminProtectedRoute.tsx` (integration points)
    - `src/pages/Adventure.tsx` (event triggers)
    - `src/pages/Profile.tsx` (management interface)
    - `src/__tests__/hooks/use-auto-save.test.ts` (hook tests)
    - `src/__tests__/components/SaveStatusIndicator.test.tsx` (component tests)
  - **BUILD STATUS**: ✅ Core functionality complete, TypeScript warnings due to store hydration wrapper (non-breaking)
  - **USER TESTING REQUIRED**: User needs to verify auto-save works properly and all game progress persists correctly

- [x] **REFLECT ability not healing player** ✅ FIXED - REFLECT now costs 3 SP (up from 2) and heals 1d(playerLevel) health in addition to converting SP to LP. Updated both old and new combat systems. All tests passing, build successful. **USER TESTING REQUIRED** - User needs to verify REFLECT now properly heals health during combat.

- [ ] **WEIRD COMBAT OVERLAY ISSUE**: when combat starts, and overlay appears, you can't interact with it unless you click over the area where the "Illuminate" button is at, after clicking, it then seems to let you use the combat overlay properly **⚠️ FAILED FIX ATTEMPT #1**: Added `pointer-events-none` to backdrop layer in CombatBackdrop.tsx thinking the backdrop was intercepting clicks, but user reports this DID NOT fix the issue. **⚠️ FAILED FIX ATTEMPT #2**: Added comprehensive focus management to CombatContainer.tsx with auto-focus, focus trap, and accessibility features, but user reports this also DID NOT fix the issue. The interaction blocking problem remains unsolved.

- [ ] **FOCUS MANAGEMENT INVESTIGATION**: ❌ FAILED - Focus management approach did not resolve the issue
  - Attempted: Auto-focus container on mount, focus trap, proper focus restoration
  - Result: User reports no improvement - still must click "Illuminate button area" first
  - Status: Root cause remains unknown, need alternative investigation approach

  **Will do this after critical issues fixed**
- [ ] **Mobile Usability**: Is combat actually usable on mobile devices? -- NOT TESTED YET


### Implementation Timeline (Realistic)

#### Phase 1: Foundation (4-5 hours) - CODE WRITTEN (UNVERIFIED) ⚠️
- [x] Set up feature folder structure with MIT headers - CODE EXISTS, USER TESTING UNKNOWN
- [x] Create Zustand combat store with persistence - CODE EXISTS, USER TESTING UNKNOWN
- [x] Extend Tailwind theme for combat palette - CODE EXISTS, USER TESTING UNKNOWN
- [x] Build CombatBackdrop and CombatContainer - CODE EXISTS, USER TESTING UNKNOWN
- [x] Implement feature flag and kill-switch - CODE EXISTS, USER TESTING UNKNOWN

#### Phase 2: Core Components (4-5 hours) - CODE WRITTEN (UNVERIFIED) ⚠️
- [x] Build atomic components (HealthBar, ResourceMeter, etc.) - CODE EXISTS, USER TESTING UNKNOWN
- [x] Compose molecules (EnemyInfo, EnemyHealthPanel, ResourceGrid, StatusEffectList) - CODE EXISTS, USER TESTING UNKNOWN
- [x] Create organisms (EnemyCard, ResourcePanel) - CODE EXISTS, USER TESTING UNKNOWN
- [x] Implement ActionGrid with touch support - CODE EXISTS, USER TESTING UNKNOWN
- [x] Add ControlPanel with proper spacing - CODE EXISTS, USER TESTING UNKNOWN

#### Phase 3: Interactions & Feedback (3-4 hours) - CODE WRITTEN (UNVERIFIED) ⚠️
- [x] Implement action execution flow - CODE EXISTS, USER TESTING UNKNOWN
- [x] Add centralized keyboard shortcuts - CODE EXISTS, USER TESTING UNKNOWN
- [x] Lazy load animation components - CODE EXISTS, USER TESTING UNKNOWN
- [x] Create status notifications - CODE EXISTS, USER TESTING UNKNOWN
- [x] Build combat log with virtualization - CODE EXISTS, USER TESTING UNKNOWN

#### Phase 4: Post-Combat Flow & Sound Integration (2-3 hours) - CODE WRITTEN (UNVERIFIED) ⚠️
- [x] **Complete useCombatEffects Hook** - CODE EXISTS, USER TESTING UNKNOWN
- [x] **Integrate Feedback Component Sounds** - CODE EXISTS, USER TESTING UNKNOWN
- [x] **Fix Shadow Attack Sound Gap** - CODE EXISTS, USER TESTING UNKNOWN
- [x] **Add Combat End Sound Integration** - CODE EXISTS, USER TESTING UNKNOWN
- [x] **Update Component Tests** - UNIT TESTS PASS, USER TESTING UNKNOWN
- [x] Create CombatEndModal with shadcn/ui Dialog - CODE EXISTS, USER TESTING UNKNOWN
- [x] Build VictoryContent and DefeatContent - CODE EXISTS, USER TESTING UNKNOWN
- [x] Implement ReflectionForm - CODE EXISTS, USER TESTING UNKNOWN
- [x] **Add transition animations** - CODE EXISTS, USER TESTING UNKNOWN

#### Phase 5: Testing & Polish (3-4 hours) - UNIT TESTS ONLY (NO USER TESTING) ⚠️
- [x] **Write unit tests with jest-axe** - UNIT TESTS WRITTEN AND PASSING
- [x] **Fix failing tests and ESLint issues** - UNIT TESTS FIXED
- [x] **Run Lighthouse CI audit** - AUTOMATED AUDIT COMPLETE
- [ ] **CRITICAL: ACTUAL USER TESTING** - IN PROGRESS
- [ ] **CRITICAL: MANUAL COMBAT WALKTHROUGH** - IN PROGRESS
- [ ] **CRITICAL: VERIFY BASIC PLAYABILITY** - IN PROGRESS
- [ ] Create Storybook stories
- [ ] Implement Cypress component tests
- [ ] Fix accessibility issues
- [ ] Device testing (iOS, Android, Desktop)

#### Phase 6: Migration (2-3 hours)
- [ ] Implement A/B testing logic
- [ ] Add analytics tracking
- [ ] Create migration documentation
- [ ] QA testing with kill-switch
- [ ] Monitor performance metrics

**Total: 18-24 hours** (realistic with testing and iterations)

---

## 🟠 MEDIUM PRIORITY TASKS (Post-Combat System)

### 🟠 Database Persistence Implementation
- **Status**: Deprioritized - Basic functionality exists
- **Priority**: Medium - Can wait until after competition
- **Note**: Current localStorage persistence is sufficient for demo
- **Subtasks**:
  - [ ] Debug Supabase data persistence issues
  - [ ] Add error handling for network/database failures
  - [ ] Implement automatic save on critical state changes
  - [ ] Add manual save/load UI controls in Profile page

### 🟠 Performance Optimization
- **Status**: Partially Complete
- **Priority**: Medium
- **Dependencies**: None
- **Subtasks**:
  - [ ] Add lazy loading for non-critical components
  - [ ] Implement code splitting for route-based chunks
  - [ ] Optimize bundle size with tree shaking

### 🟠 Enhanced User Profile
- **Status**: Not Started
- **Priority**: Medium
- **Dependencies**: None
- **Subtasks**:
  - [ ] Design profile customization options
  - [ ] Add avatar selection/upload
  - [ ] Implement preference settings

---

## 🟢 LOW PRIORITY TASKS (Post-Competition)

### 🟢 Overlay Text Visibility Design System Fix
- **Status**: Not Started
- **Priority**: Low - Fix recurring dark text on dark background issues
- **Root Cause**: Fundamental design system breakdown - no overlay-specific text standards, inconsistent theme architecture, missing component guidelines
- **Dependencies**: Design system documentation time
- **Subtasks**:
  - [ ] Document overlay text standards in CLAUDE.md
  - [ ] Create overlay component template with correct text colors
  - [ ] Add ESLint rule to catch `text-foreground` on overlay components  
  - [ ] Establish naming convention like `overlay-text-*` classes
  - [ ] Update Tailwind theme with overlay-specific text utilities

### 🟢 AI Narrative Generation
- **Status**: Not Started
- **Priority**: Low - Nice to have
- **Dependencies**: OpenAI API integration

### 🟢 Leonardo.AI Image Integration
- **Status**: Not Started
- **Priority**: Low
- **Dependencies**: Leonardo.AI API integration

### 🟢 ElevenLabs Voice Narration
- **Status**: Not Started
- **Priority**: Low
- **Dependencies**: ElevenLabs API integration

### 🟢 Advanced Journal Features
- **Status**: Not Started
- **Priority**: Low
- **Dependencies**: Basic journal system working

---

**Note**: All completed tasks have been moved to CHANGELOG.md for historical reference. See CHANGELOG.md for detailed completion history 

---

EoF