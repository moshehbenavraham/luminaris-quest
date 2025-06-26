# Luminari's Quest - Task List


## CRITICAL: Combat System Issues - In Combat Overlay

**these are issues directly writtten/reported by User**

### ✅ the combat overlay is dark and some of the text is too dark making it impossible to see, the text must be lighter - specific text include "Resources" and "Choose Your Response" - COMPLETED 2025-06-26
### [SKIP THIS FOR NOW, FAILED TOO MANY FIX ATTEMPTS HORRIFIC TIME DRAIN] visual strip appearing at the top of combat overlay -- the combat overlay (combat mode) turns the background blurry and that blur doesn't seem to fill the full screen, i think that is what is causing the strip - FIXES ATTEMPTED AND FAILED 2025-06-26
### combat overlay does not deal with resizing well at all (seems to not have been developed with "mobile-first" approach despite that being a rule), only looks decent in full desktop mode
### there is no signs at all the opponent is getting a turn at all UNLESS i hit the 'end turn' button (end turn button is meant to just be used if you are stuck or want to skip your own turn)
### ✅ 'end turn' button is supposed to be next to the 'surrender' button in the combat overlay (right now its in the "Choose Your Response" section) - COMPLETED 2025-06-26

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