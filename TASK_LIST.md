# Luminari's Quest - Task List


## CRITICAL: Combat System Complete Rebuild - In Progress

**Note: Due to multiple failed fix attempts on the current combat overlay system, we are rebuilding from scratch with proper architecture**

### Previous Issues (All to be addressed in rebuild):
- ✅ ~~the combat overlay is dark and some of the text is too dark~~ - ATTEMPTED FIX 2025-06-26
- ⚠️ visual strip appearing at the top of combat overlay - MULTIPLE FAILED ATTEMPTS
- ⚠️ combat overlay does not deal with resizing well at all - NOT MOBILE-FIRST
- ⚠️ there is no signs at all the opponent is getting a turn
- ✅ ~~'end turn' button placement~~ - ATTEMPTED FIX 2025-06-26

### 🔴 COMBAT OVERLAY COMPLETE REBUILD PLAN

# Combat Overlay Complete Rebuild Plan (Revised)

## Architecture Principles
1. **Mobile-First Design** - Build for mobile, enhance for desktop
2. **Component Separation** - Single responsibility, max 500 LOC per file
3. **Tailwind-Only Styling** - Extend theme for combat palette, no CSS modules
4. **Zustand State Management** - With persistence and hydration safety
5. **Accessibility First** - WCAG AA compliance with comprehensive ARIA support

## New Component Structure

### 1. Core Layout Components
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

### 2. Display Components (Atoms/Molecules)
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

### 3. Action Components
```
src/features/combat/components/actions/
├── ActionButton.tsx           # Individual action with tooltip
├── ActionGrid.tsx             # Responsive 2x2 mobile, 4x1 desktop
├── ControlPanel.tsx           # End Turn + Surrender buttons
└── ActionTooltip.tsx          # shadcn/ui Tooltip wrapper
```

### 4. Feedback Components
```
src/features/combat/components/feedback/
├── DamageIndicator.tsx        # Floating damage numbers (lazy loaded)
├── StatusNotification.tsx     # Toast-style status updates
├── TherapeuticInsight.tsx     # Guardian message display
└── CombatAnimation.tsx        # Attack animations (lazy loaded)
```

### 5. Post-Combat Components
```
src/features/combat/components/resolution/
├── CombatEndModal.tsx         # shadcn/ui Dialog wrapper
├── VictoryContent.tsx         # Victory display content
├── DefeatContent.tsx          # Learning moment content
└── ReflectionForm.tsx         # Journal entry form
```

## Implementation Timeline (Realistic)

### Phase 1: Foundation (4-5 hours) - COMPLETED ✅
- [x] Set up feature folder structure with MIT headers
- [x] Create Zustand combat store with persistence
- [x] Extend Tailwind theme for combat palette
- [x] Build CombatBackdrop and CombatContainer
- [x] Implement feature flag and kill-switch

### Phase 2: Core Components (4-5 hours) - IN PROGRESS 🔄
- [ ] Build atomic components (HealthBar, ResourceMeter, etc.)
- [ ] Compose molecules (EnemyInfo, ResourceGrid)
- [ ] Create organisms (EnemyCard, ResourcePanel)
- [ ] Implement ActionGrid with touch support
- [ ] Add ControlPanel with proper spacing

### Phase 3: Interactions & Feedback (3-4 hours)
- [ ] Implement action execution flow
- [ ] Add centralized keyboard shortcuts
- [ ] Lazy load animation components
- [ ] Create status notifications
- [ ] Build combat log with virtualization

### Phase 4: Post-Combat Flow (2-3 hours)
- [ ] Create CombatEndModal with shadcn/ui Dialog
- [ ] Build VictoryContent and DefeatContent
- [ ] Implement ReflectionForm
- [ ] Add transition animations

### Phase 5: Testing & Polish (3-4 hours)
- [ ] Write unit tests with jest-axe
- [ ] Create Storybook stories
- [ ] Implement Cypress component tests
- [ ] Run Lighthouse CI audit
- [ ] Fix accessibility issues
- [ ] Device testing (iOS, Android, Desktop)

### Phase 6: Migration (2-3 hours)
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