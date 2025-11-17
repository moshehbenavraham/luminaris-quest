# Features

**Navigation:** [← Back to Documentation Index](../INDEX.md)

Welcome to the Luminaris Quest feature documentation! These documents describe the game's core features, their implementation, and how they work together to create the therapeutic gaming experience.

---

## 🎮 Core Features

### Combat System

- **[Combat System](combat.md)** - Light & Shadow combat mechanics
  - Four combat actions: STRIKE, DEFEND, EMBRACE, REFLECT
  - Light and Shadow balance mechanics
  - Dice-based action resolution
  - Shadow manifestation types
  - Combat flow and state management
  - **Status:** ✅ Implemented (v2.0 - New system)
  - **Note:** See [combat-verification.md](combat-verification.md) for accuracy verification

### Scene System

- **[Scene System](scenes.md)** - Therapeutic scenario engine
  - 20+ therapeutic scenarios
  - Choice-based narrative system (Bold vs Cautious)
  - Guardian Trust integration
  - Outcome determination
  - Scene progression and state
  - **Status:** ✅ Implemented

### Journal System

- **[Journal System](journal.md)** - Personal reflection and tracking
  - Full CRUD operations (Create, Read, Update, Delete)
  - Secure entry storage with Row Level Security
  - Reflection prompts and mood tracking
  - Privacy-first design
  - Real-time synchronization
  - **Status:** ✅ Implemented

### Guardian Trust System

- **[Guardian Trust](guardian-trust.md)** - Player-companion relationship
  - Trust scale (0-100)
  - Trust milestone system (25, 50, 75, 100)
  - Dynamic trust modifications
  - Effects on combat and scenes
  - Visual feedback and progression
  - **Status:** ✅ Implemented

---

## 📊 Feature Status Dashboard

### Fully Implemented ✅

| Feature | Version | Documentation | Tests | Notes |
|---------|---------|---------------|-------|-------|
| Combat System (New) | v2.0 | ✅ Complete | ✅ 68+ tests | Feature-based architecture |
| Scene System | v1.0 | ✅ Complete | ✅ Tested | 20+ scenarios |
| Journal System | v1.0 | ✅ Complete | ✅ Tested | Full CRUD with RLS |
| Guardian Trust | v1.0 | ✅ Complete | ✅ Tested | Milestone system |
| Authentication | v1.0 | ⚠️ Partial | ✅ Tested | See API docs |
| User Profile | v1.0 | ⚠️ Partial | ✅ Tested | Basic implementation |

### In Development 🚧

| Feature | Status | Expected | Documentation | Notes |
|---------|--------|----------|---------------|-------|
| Combat Visual Effects | 70% | v2.1 | 🚧 Planned | Animation system |
| Scene Editor | 30% | v2.2 | 🚧 Planned | Dev tool for scenes |
| Achievement System | 20% | v2.3 | 🚧 Planned | Gamification layer |

### Planned 📋

| Feature | Priority | Target Version | Notes |
|---------|----------|----------------|-------|
| Multiplayer Support | Medium | v3.0 | Co-op therapeutic adventures |
| Custom Shadows | High | v2.4 | User-created shadow types |
| Advanced Analytics | Low | v3.1 | Progress tracking dashboard |
| Voice Narration | Medium | v2.5 | Accessibility enhancement |
| Mobile App | High | v3.0 | Native iOS/Android |

### Deprecated ⚠️

| Feature | Deprecated Version | Replacement | Notes |
|---------|-------------------|-------------|-------|
| Legacy Combat System | v2.0 | New Combat System | Still available but not maintained |
| Old Scene Format | v1.5 | New Scene Engine | Migrated automatically |

---

## 🔍 Feature Deep Dive

### Combat System Architecture

**Components:**
- Combat UI (`src/features/combat/components/`)
- Combat Logic (`src/features/combat/hooks/`)
- Combat Engine (`src/engine/combat-engine.ts`)
- Combat State (`src/store/` - combat slice)

**Key Concepts:**
- **Light:** Resource used for attacks and defense (0-100)
- **Shadow:** Enemy health representing inner struggles (varies by type)
- **Actions:** STRIKE, DEFEND, EMBRACE, REFLECT (each with unique mechanics)
- **Dice:** D20-based resolution with modifiers

**Integration Points:**
- Guardian Trust affects combat modifiers
- Scene outcomes can trigger combat encounters
- Journal entries can reflect on combat experiences

See **[Combat System](combat.md)** for complete documentation.

---

### Scene System Architecture

**Components:**
- Scene UI (`src/components/SceneDisplay.tsx`)
- Scene Logic (`src/hooks/useScene.ts`)
- Scene Engine (`src/engine/scene-engine.ts`)
- Scene Data (`src/data/scenes/`)

**Key Concepts:**
- **Scenes:** Therapeutic scenarios with narrative and choices
- **Choices:** Bold vs Cautious decision points
- **Outcomes:** Results determined by choices and Guardian Trust
- **Progression:** Linear or branching based on scene design

**Integration Points:**
- Guardian Trust influences outcome probabilities
- Combat encounters triggered by certain scene outcomes
- Journal prompts generated from scene experiences

See **[Scene System](scenes.md)** for complete documentation.

---

### Journal System Architecture

**Components:**
- Journal UI (`src/components/Journal.tsx`)
- Journal Logic (`src/hooks/useJournal.ts`)
- Database Schema (`journal_entries` table)
- API Integration (`src/integrations/supabase/`)

**Key Concepts:**
- **Entries:** User-written reflections with timestamps
- **Privacy:** Row Level Security ensures only user can access their entries
- **Sync:** Real-time updates across devices
- **CRUD:** Full create, read, update, delete operations

**Integration Points:**
- Scene experiences prompt journal entries
- Combat outcomes can be reflected upon
- Guardian Trust milestones trigger reflection prompts

See **[Journal System](journal.md)** for complete documentation.

---

### Guardian Trust Architecture

**Components:**
- Trust UI (`src/components/GuardianTrust.tsx`)
- Trust Logic (integrated throughout features)
- Trust State (`src/store/` - guardianTrust field)
- Trust Calculations (`src/lib/trust-utils.ts`)

**Key Concepts:**
- **Trust Scale:** 0-100 representing player-guardian relationship
- **Milestones:** 25, 50, 75, 100 unlock rewards and story moments
- **Modifications:** Scenes, combat, journal usage affect trust
- **Effects:** Trust level modifies combat bonuses and scene outcomes

**Integration Points:**
- **Combat:** Higher trust = combat bonuses
- **Scenes:** Trust affects outcome probabilities
- **Journal:** Regular journaling increases trust
- **Progression:** Trust gates certain story content

See **[Guardian Trust](guardian-trust.md)** for complete documentation.

---

## 🔗 Related Documentation

**For Developers:**
- [Architecture Overview](../architecture/overview.md) - System design
- [API Reference](../api/) - Code-level documentation
- [Game Engine API](../api/game-engine.md) - Engine functions

**For Users:**
- [User Guide](../guides/user-guide.md) - How to use features
- [Getting Started](../guides/getting-started.md) - First-time setup
- [FAQ](../troubleshooting/faq.md) - Common questions

**For Contributors:**
- [Contributing Guide](../contributing/index.md) - Development guidelines
- [Testing Guide](../guides/testing.md) - Testing practices
- [Roadmap](../contributing/roadmap.md) - Future features

---

## 🎯 Feature Design Philosophy

All features in Luminaris Quest follow these design principles:

### 1. Therapeutic Value First

Every feature serves the therapeutic mission:
- Combat represents internal struggles, not violence
- Scenes provide safe exploration of difficult emotions
- Journal encourages reflection and self-awareness
- Guardian Trust builds connection and support

### 2. Player Agency

Players have meaningful choices:
- No "right" or "wrong" choices in scenes
- Multiple valid approaches to combat
- Personal reflection in journal (not prescriptive)
- Trust built through authentic engagement

### 3. Accessibility

Features are accessible to all:
- Clear UI with high contrast and readable text
- Keyboard navigation and screen reader support
- Mobile-friendly touch interfaces
- No time pressure or twitch mechanics

### 4. Privacy & Safety

Player data is protected:
- Row Level Security on all personal data
- Local-first with optional cloud sync
- No sharing of journal entries without consent
- Safe, supportive in-game messaging

### 5. Gradual Complexity

Features introduce complexity gradually:
- Tutorial system for each feature
- Optional advanced mechanics
- Difficulty adapts to player trust level
- Clear feedback and guidance

---

## 📝 Adding New Features

When proposing or implementing new features:

### Planning Phase

1. **Define Therapeutic Value:** What therapeutic goal does this feature serve?
2. **Design User Experience:** How will players interact with this feature?
3. **Plan Integration:** How does this feature connect to existing systems?
4. **Consider Accessibility:** How do we ensure this feature is accessible?
5. **Document Privacy:** What data does this feature collect and store?

### Implementation Phase

1. **Follow Architecture Patterns:** Use established patterns (Container/Presenter, etc.)
2. **Write Tests First:** TDD approach with comprehensive test coverage
3. **Implement Core Logic:** Pure functions in engine layer
4. **Build UI Components:** Reusable, accessible components
5. **Integrate with State:** Connect to Zustand store appropriately

### Documentation Phase

1. **Create Feature Documentation:** Add to `docs/features/`
2. **Update API Documentation:** Document any new APIs in `docs/api/`
3. **Update User Guide:** Add user-facing instructions to guides
4. **Update Status Dashboard:** Update this README with feature status
5. **Write Migration Guide:** If replacing existing functionality

See **[Contributing Guide](../contributing/index.md)** for detailed instructions.

---

## 🧪 Testing Features

Each feature has comprehensive tests:

**Unit Tests:** Core logic and pure functions  
**Integration Tests:** Feature interactions with other systems  
**Component Tests:** UI components and user interactions  
**E2E Tests:** Complete user workflows (planned)

See **[Testing Guide](../guides/testing.md)** for testing standards.

---

## 🎨 Feature Demo & Tutorials

**In-Game Tutorials:**
- Combat tutorial: First shadow encounter
- Scene tutorial: First therapeutic scenario
- Journal tutorial: First journal prompt
- Trust tutorial: First milestone achievement

**External Resources:**
- [Video Walkthrough](#) (planned)
- [Interactive Demo](#) (planned)
- [Feature Showcase](#) (planned)

---

## 📈 Feature Metrics

**Usage Statistics (Anonymized):**
- Track feature adoption rates
- Monitor feature engagement
- Identify pain points
- Guide future development

**Quality Metrics:**
- Code coverage per feature
- Bug reports per feature
- User satisfaction ratings
- Accessibility compliance scores

---

## 💡 Feature Requests

Have an idea for a new feature?

1. **Check Roadmap:** See if it's already planned in [Roadmap](../contributing/roadmap.md)
2. **Search Issues:** Look for existing feature requests
3. **Create Proposal:** Use the feature request template
4. **Discuss Design:** Engage with the community
5. **Contribute:** Implement it yourself! See [Contributing Guide](../contributing/index.md)

---

**Last Updated:** 2025-11-17
**Maintained By:** Luminaris Quest Feature Team
**Current Feature Version:** v2.0

