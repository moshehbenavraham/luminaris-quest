# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**⚠️ CRITICAL WARNING**: Previous Claude Code assistance on this project has made deeply mistaken assumptions about system functionality twice, wasting significant development time on changes that did NOT address actual user issues. All AI-suggested fixes should be thoroughly verified against actual user testing before implementation.

**⚠️ RECENT FAILURE EXAMPLE**: Combat post-flow modal issue - Claude Code incorrectly modified CombatEndModal.tsx assuming the modal wasn't working, when the actual problem was elsewhere in the combat flow. Zero improvements achieved despite extensive effort.

## 🚨 CRITICAL: TWO SEPARATE COMBAT SYSTEMS EXIST

**This project contains TWO COMPLETELY DIFFERENT combat systems. NEVER confuse them:**

### 1. **NEW Combat System** ✅ (USE THIS)
- **Location**: `/src/features/combat/`
- **Store**: `src/features/combat/store/combat-store.ts`
- **Import**: `import { useCombatStore } from '@/features/combat'`
- **Status**: ACTIVE - All new development here
- **Activation**: Default (no URL parameter)

### 2. **OLD Combat System** ❌ (DEPRECATED - DO NOT USE)
- **Location**: `/src/components/combat/`
- **Store**: `src/store/game-store.ts` (combat slice)
- **Import**: `import { CombatOverlay } from '@/components/combat/CombatOverlay'`
- **Status**: DEPRECATED - Only for backwards compatibility
- **Activation**: URL parameter `?legacyCombat=1`

**⚠️ See `COMBAT_MIGRATION_GUIDE.md` for full details on the differences**

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run build:dev` - Build in development mode
- `npm run build:deploy` - Production build with npm ci for deployment
- `npm run lint` - Run ESLint with TypeScript support
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest
- `npm run test:coverage` - Run tests with coverage report
- `npm run preview` - Preview production build locally

## Project Document "Library"
- **README.md**
- **Code Generation Rules:** See `.bolt/prompt` for Bolt.new guidance
- **Cursor IDE Integration:** .cursorignore for files that Cursor should not include in context.
  Reference `.cursor/` for Cursor IDE component and layout guidelines
    - *Note not a document, but part of Cursor config for background agents: environment.json
    - `.cursor/rules/`
      - layout-integration.mdc
      - project-context.mdc
      - sidebar-navigation.mdc
- **Roo Code Orchestration Modes:** `.roomodes` defines per-project AI task orchestration settings for Roo Code and Cursor. It enables custom multi-agent workflows (e.g., Boomerang Mode) to be scoped and run only within this project.
- **Component Roadmap:** Check `docs/COMPONENT_MAP.md` for build priorities and component relationships
- **Change Log:** CHANGELOG.md - document all notable changes to Luminari's Quest
- **Contributing Guidelines:** See `CONTRIBUTING.md` for code quality, testing, and commit standards
- **Legal Compliance:** Reference `LICENSE` and `licenses/` directory for OGL/ORC licensing requirements
- **Configuration Standards:** Follow `eslint.config.js`, `.prettierrc`, and `tsconfig.*.json` for code quality
- **[Environment Architecture](docs/ENVIRONMENT_ARCHITECTURE.md)** - Multi-environment setup and deployment strategy
- **OTHER Documentation:**:
  - CODE_OF_CONDUCT.md
  - FAQ.md

## Project Architecture

**Luminari's Quest** is a therapeutic AI-powered RPG built with React, TypeScript, and Supabase. The application helps young adults process trauma through interactive storytelling and journaling.  The primary tool required for building this project is the "Bolt.new" platform.

### Core Architecture

- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI components
- **State Management**: Zustand with persistence for game state
- **Backend**: Supabase for authentication and data storage
- **AI Services**: OpenAI for narrative generation, Leonardo.AI for images, ElevenLabs for voice
- **Routing**: React Router with protected routes for authenticated content

### Key Application Structure

The app follows a single-page application pattern with these main routes:
- `/` - Home/landing page with authentication
- `/adventure` - Main gameplay interface (protected)
- `/progress` - Progress tracking and journal entries (protected)
- `/profile` - User account management (protected)
- `/legal` - Legal information and compliance

### Game State Management

Game state is managed through `src/store/game-store.ts` using Zustand with persistence:

- **Guardian Trust System**: Core mechanic tracking player's bond with their guardian spirit (0-100)
- **Journal Entries**: Therapeutic reflections triggered by milestones and learning moments
- **Milestones**: Achievement system based on trust levels (25, 50, 75)
- **Scene History**: Completed gameplay scenarios with outcomes
- **Hydration Safety**: Prevents SSR/client mismatches with `_hasHydrated` flag

### Scene Engine

The therapeutic gameplay is driven by `src/engine/scene-engine.ts`:

- **Scene Types**: social, skill, combat, journal, exploration
- **Dice Mechanics**: d20 system with difficulty classes (DC)
- **Choice System**: Bold vs cautious decision-making paths
- **Trust Modulation**: Outcomes affect guardian trust levels

### Component Architecture

- **Layout System**: Responsive layout with sidebar navigation (`src/components/layout/`)
- **Authentication**: Supabase-based auth with protected routes (`src/components/auth/`)
- **Game Components**: 
  - `ChoiceList` - Main gameplay interface
  - `GuardianText` - Dynamic guardian spirit messaging
  - `JournalModal` - Therapeutic reflection prompts
  - `StatsBar` - Progress visualization
- **UI Components**: Comprehensive Radix UI component library (`src/components/ui/`)

### Data Flow

1. **Authentication**: Supabase handles user auth and session management
2. **Game State**: Zustand store persists locally and syncs with Supabase (planned)
3. **Scene Progression**: Linear scene progression with persistent choice outcomes
4. **Trust System**: Player choices modify guardian trust, triggering milestones
5. **Journaling**: Milestone achievements and learning moments prompt reflective writing

### Environment Configuration

Required environment variables (see `.env.example`):
- Supabase configuration
- AI service API keys (OpenAI, Leonardo.AI, ElevenLabs)
- Application URLs and deployment settings

### Development Standards

- **Code Quality**: ESLint + Prettier configuration for consistent formatting
- **TypeScript**: Strict typing with separate tsconfig files for app and build tools
- **Testing**: Vitest with React Testing Library
- **Styling**: Tailwind CSS with custom component variants
- **Error Handling**: Error boundaries and graceful fallbacks throughout the application

### Legal Compliance

The project includes Open Gaming License (OGL) compliance for RPG mechanics and therapeutic content guidelines. See `licenses/` directory for full licensing details.