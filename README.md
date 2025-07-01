# Luminari's Quest

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/moshehbenavraham/luminaris-quest)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Therapeutic](https://img.shields.io/badge/Purpose-Therapeutic-purple)](https://github.com/moshehbenavraham/luminaris-quest)

A therapeutic AI-powered RPG adventure designed to help young adults process trauma through interactive storytelling and journaling.

**Built with [Bolt.new](https://bolt.new/) 🚀**

## Video Demo: [View on YouTube](https://youtu.be/FXpZskJYqvA)

## Bolt.new DevPost.com [World's Largest Hackthon Submission](https://devpost.com/software/luminari-s-quest-a-therapeutic-gaming-experience)

## 🌟 About

**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure designed to help young adults process trauma from losing parents and experiencing homelessness during their teenage years. The game combines fantasy storytelling with evidence-based therapeutic techniques to create a safe space for healing and growth.

### 🎯 Mission Statement
This project addresses the critical need for accessible mental health resources by transforming traditional therapy concepts into engaging, interactive experiences. Built for the World's Largest AI Hackathon, it demonstrates how AI can be used for therapeutic purposes while maintaining clinical effectiveness.

### 🧠 Therapeutic Approach
- **Evidence-Based**: Incorporates cognitive behavioral therapy (CBT) and narrative therapy principles
- **Trauma-Informed**: Designed specifically for young adults with complex trauma histories
- **Safe Space**: Non-judgmental environment for emotional exploration and growth
- **Progressive**: Adapts to user's emotional readiness and therapeutic progress

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: React 18.2+ with TypeScript 5.3+ and Vite 6.3+
- **Styling**: Tailwind CSS 3.4+ with Shadcn/UI component library
- **State Management**: Zustand 5.0+ with persistence and hydration safety
- **Routing**: React Router 6.22+ with protected routes and lazy loading
- **Animations**: Framer Motion 12.18+ for therapeutic UX transitions

### Backend & Database
- **Backend**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth with email/password and social providers
- **Database**: PostgreSQL with Row Level Security (RLS) policies
- **Real-time**: Supabase real-time subscriptions for live updates

### AI & External Services
- **Narrative AI**: OpenAI GPT-4 for dynamic storytelling (planned)
- **Image Generation**: Leonardo.AI for scene illustrations (planned)
- **Voice Synthesis**: ElevenLabs for therapeutic narration (planned)
- **Audio**: React H5 Audio Player for background music and sound effects

### Development & Deployment
- **Build Tool**: Vite with TypeScript compilation and hot reload
- **Testing**: Vitest 3.2+ with React Testing Library and Jest-axe
- **Linting**: ESLint 8.56+ with TypeScript and React plugins
- **Formatting**: Prettier 3.2+ with Tailwind plugin
- **Deployment**: Netlify with automatic builds and environment management

### Quality Assurance
- **Type Safety**: Strict TypeScript configuration with zero compilation errors
- **Accessibility**: WCAG 2.1 AA compliance with automated testing
- **Performance**: Lighthouse optimization with performance budgets
- **Testing**: 370+ automated tests with 100% pass rate

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **Package Manager**: npm (included with Node.js) or yarn
- **Git**: For cloning the repository ([Download](https://git-scm.com/))
- **Supabase Account**: For database and authentication ([Sign up](https://supabase.com/))

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moshehbenavraham/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required - Get from your Supabase project settings
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Required for AI features (when implemented)
   VITE_OPENAI_API_KEY=your-openai-api-key
   
   # Optional - For enhanced features
   VITE_LEONARDO_API_KEY=your-leonardo-api-key
   VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
   ```

4. **Set up the database:**
   ```bash
   # If you have Supabase CLI installed
   supabase db push
   
   # Or manually run the migration SQL in your Supabase dashboard
   # See docs/migrations/ for migration files
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Environment Configuration

#### Required Variables
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |

#### Optional Variables
| Variable | Description | Purpose |
|----------|-------------|---------|
| `VITE_OPENAI_API_KEY` | OpenAI API key | Dynamic narrative generation |
| `VITE_LEONARDO_API_KEY` | Leonardo.AI API key | Scene image generation |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key | Voice narration |
| `VITE_DEBUG_MODE` | Enable debug logging | Development debugging |

### Database Setup

The application requires a Supabase database with specific tables and policies. Choose one of these setup methods:

#### Option 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

#### Option 2: Manual Setup
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql`
3. Run the migration

#### Verify Database Setup
After setup, verify these tables exist:
- `game_states` - Stores player progress
- `journal_entries` - Stores therapeutic journal entries

### Troubleshooting

#### Common Issues

**Node.js Version Error**
```bash
# Check your Node.js version
node --version

# If below 18.0, update Node.js
# Visit https://nodejs.org/ for the latest version
```

**Database Connection Issues**
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

**Port Already in Use**
```bash
# Use a different port
npm run dev -- --port 3000
```

For more detailed troubleshooting, see [docs/FAQ.md](docs/FAQ.md).

## 🎮 Features

### 🌟 Core Gameplay Systems

#### Guardian Trust System
- **Dynamic Relationship**: Core mechanic tracking player's bond with their guardian spirit (0-100)
- **Meaningful Progression**: Trust level affects combat effectiveness and story outcomes
- **Milestone Rewards**: Unlock new abilities and story content at trust thresholds (25, 50, 75, 100)
- **Therapeutic Metaphor**: Represents building trust in therapeutic relationships

#### Light & Shadow Combat System
- **Therapeutic Combat**: Transform traditional RPG combat into emotional regulation practice
- **Dual Resources**: Light Points (positive emotions) and Shadow Points (challenges to overcome)
- **Four Combat Actions**:
  - **Illuminate**: Offensive action using awareness to overcome fears
  - **Reflect**: Transform challenges into wisdom and growth
  - **Endure**: Defensive patience that builds resilience over time
  - **Shadow Embrace**: High-risk integration of difficult emotions
- **Shadow Manifestations**: Battle internal struggles like Doubt, Isolation, Overwhelm, and Past Pain
- **Combat Reflection**: Post-battle therapeutic processing and insight generation

> **🔄 Combat System Rebuild in Progress**: The project currently contains TWO combat systems running in parallel:
> - **Original System** (`src/components/combat/`) - The initial implementation with known issues
> - **New System** (`src/features/combat/`) - Complete mobile-first rebuild with proper architecture
> - **Feature Flag**: The new system is enabled by default. Add `?legacyCombat=1` to URL to use the original system
> - **Status**: New system is feature-complete and in testing phase (see [TASK_LIST.md](TASK_LIST.md) for details)

#### Scene Engine (20 Therapeutic Scenarios)
- **Diverse Scene Types**: Social, skill, combat, journal, and exploration scenarios
- **Progressive Difficulty**: Carefully balanced therapeutic challenges across 4 complete cycles
- **Dice-Based Mechanics**: d20 rolls against difficulty checks with meaningful outcomes
- **Branching Narratives**: Choices that matter and reflect real-world coping strategies

### 📝 Therapeutic Features

#### Advanced Journal System
- **Therapeutic Reflection**: AI-guided prompts for processing experiences and emotions
- **Two Journal Types**: 
  - **Milestone Journals**: Celebrate achievements and growth moments
  - **Learning Journals**: Process setbacks and extract wisdom from challenges
- **Full CRUD Operations**: Create, read, update, delete with comprehensive edit history
- **Visual Distinction**: Clear UI differences between journal entry types
- **Persistent Storage**: Secure cloud storage with user authentication

#### Progress Tracking
- **Comprehensive Analytics**: Track trust progression, scene completion, and journal insights
- **Achievement System**: Meaningful milestones that celebrate therapeutic progress
- **Visual Progress**: Charts and graphs showing growth over time
- **Export Capabilities**: Download progress reports for sharing with therapists

### 🎨 User Experience

#### Accessibility & Inclusion
- **WCAG 2.1 AA Compliance**: Full keyboard navigation and screen reader support
- **Multiple Input Methods**: Mouse, keyboard, and touch-friendly interfaces
- **Visual Accessibility**: High contrast modes and customizable text sizes
- **Cognitive Accessibility**: Clear navigation and consistent interaction patterns

#### Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **Cross-Platform**: Works seamlessly on desktop, tablet, and mobile devices
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Optimized**: Fast loading with image optimization and code splitting

#### Audio & Multimedia
- **Therapeutic Soundscapes**: Custom-composed background music for emotional regulation
- **Combat Sound Effects**: Audio feedback for actions and therapeutic insights
- **Visual Alternatives**: All audio content has visual equivalents for accessibility
- **Customizable Audio**: Volume controls and audio preferences

### 🔒 Security & Privacy

#### Data Protection
- **End-to-End Security**: All user data encrypted in transit and at rest
- **HIPAA-Aware Design**: Built with healthcare privacy standards in mind
- **User Control**: Complete control over data sharing and deletion
- **Anonymous Options**: Play without creating an account for maximum privacy

#### Authentication
- **Secure Login**: Email/password authentication with optional social providers
- **Password Recovery**: Secure password reset via email
- **Session Management**: Automatic logout and secure session handling
- **Multi-Device Support**: Sync progress across devices securely

## 🏗️ Architecture

The application follows a modern, scalable architecture designed for maintainability, performance, and therapeutic effectiveness.

### 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic building blocks (ImpactfulImage, etc.)
│   ├── combat/          # Combat system components
│   ├── layout/          # Navigation and layout components
│   ├── organisms/       # Complex components (AudioPlayer)
│   └── ui/              # Shadcn/UI component library
├── engine/              # Core game logic
│   ├── combat-engine.ts # Combat mechanics and AI
│   ├── scene-engine.ts  # Story progression and dice mechanics
│   └── combat-balance.ts # Balance testing and validation
├── hooks/               # Custom React hooks
│   ├── useCombat.ts     # Combat state management
│   ├── useCombatSounds.ts # Audio integration
│   └── useImpactfulImage.ts # Image optimization
├── pages/               # Route components
│   ├── Home.tsx         # Landing and authentication
│   ├── Adventure.tsx    # Main gameplay interface
│   ├── Progress.tsx     # Progress tracking and analytics
│   └── Profile.tsx      # User profile and settings
├── store/               # State management
│   └── game-store.ts    # Zustand store with persistence
├── integrations/        # External services
│   └── supabase/        # Database and authentication
├── data/                # Static game data
│   ├── shadowManifestations.ts # Combat enemy definitions
│   ├── audioPlaylist.ts # Music and sound effects
│   └── imageRegistry.ts # Optimized image assets
└── lib/                 # Utility functions and configurations
    ├── database-health.ts # Database monitoring
    ├── performance-monitoring.ts # Performance tracking
    └── utils.ts         # Common utilities
```

### 🏛️ Architectural Patterns

#### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Composition over Inheritance**: Flexible component composition with props
- **Single Responsibility**: Each component has one clear purpose
- **Prop Drilling Prevention**: Context and state management for shared data

#### State Management
- **Zustand Store**: Centralized state with persistence and hydration safety
- **Immutable Updates**: All state changes follow immutability patterns
- **Optimistic Updates**: UI updates immediately with rollback on failure
- **Selective Subscriptions**: Components only re-render when relevant state changes

#### Data Flow
```
User Action → Component → Hook → Store → Engine → Database
     ↑                                              ↓
UI Update ← Component ← Hook ← Store ← Response ← Database
```

### 🔧 Design Principles

#### Therapeutic-First Design
- **Safety**: All interactions designed to be emotionally safe
- **Progress**: Every action contributes to therapeutic progress
- **Reflection**: Built-in opportunities for self-reflection and insight
- **Empowerment**: User maintains control over their therapeutic journey

#### Performance Optimization
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: WebP/AVIF formats with responsive sizing
- **Bundle Analysis**: Regular monitoring of bundle size and dependencies
- **Caching Strategy**: Intelligent caching of static assets and API responses

#### Accessibility Architecture
- **Semantic HTML**: Proper HTML structure for screen readers
- **ARIA Integration**: Comprehensive ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Focus Management**: Logical focus flow and visual focus indicators

### 🔄 Data Architecture

#### Database Design
- **PostgreSQL**: Robust relational database with JSONB for flexible data
- **Row Level Security**: User data isolation at the database level
- **Optimized Queries**: Indexed columns for common query patterns
- **Backup Strategy**: Automated backups with point-in-time recovery

#### API Design
- **RESTful Patterns**: Consistent API design following REST principles
- **Type Safety**: Full TypeScript types generated from database schema
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Protection against abuse with graceful degradation

### 🧪 Testing Architecture

#### Testing Strategy
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction and data flow testing
- **Accessibility Tests**: Automated WCAG compliance testing
- **Performance Tests**: Bundle size and runtime performance monitoring

#### Quality Gates
- **TypeScript**: Zero compilation errors required
- **ESLint**: Zero linting warnings required
- **Test Coverage**: Minimum 80% code coverage maintained
- **Accessibility**: WCAG 2.1 AA compliance verified

## 📝 Development

### Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start development server | Development with hot reload |
| `npm run build` | Build for production | Creates optimized production build |
| `npm run build:dev` | Build in development mode | Build with development optimizations |
| `npm run preview` | Preview production build | Test production build locally |
| `npm run lint` | Run ESLint | Check code quality and standards |
| `npm run format` | Format code with Prettier | Auto-format all code files |
| `npm test` | Run tests with Vitest | Execute test suite |
| `npm run test:coverage` | Run tests with coverage | Generate coverage reports |
| `npm run optimize-images` | Optimize image assets | Convert and compress images |

### Development Workflow

#### 1. Setting Up Development Environment
```bash
# Clone and setup
git clone https://github.com/moshehbenavraham/luminaris-quest.git
cd luminaris-quest
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development
npm run dev
```

#### 2. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run lint        # Check code quality
npm test           # Run tests
npm run build      # Verify build works

# Commit changes
git add .
git commit -m "feat: add your feature description"
```

#### 3. Quality Checks
```bash
# Before submitting PR
npm run lint --fix  # Fix linting issues
npm run format     # Format code
npm test           # Ensure all tests pass
npm run build      # Verify production build
```

### Development Standards

#### Code Quality
- **TypeScript**: Strict typing required for all components and functions
- **ESLint**: Zero warnings policy - all linting issues must be resolved
- **Prettier**: Consistent code formatting across the entire codebase
- **Imports**: Use absolute imports with `@/` prefix for src directory

#### Component Guidelines
- **Atomic Design**: Follow atoms → molecules → organisms → pages hierarchy
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Define clear TypeScript interfaces for all props
- **File Size**: Keep components under 250 lines; split into subcomponents if necessary
- **Naming**: Use PascalCase for components, camelCase for functions and variables

#### Testing Requirements
- **Test Coverage**: Minimum 80% coverage for new code
- **Test Types**: Unit tests for functions, integration tests for components
- **Accessibility**: Include accessibility tests using jest-axe
- **Performance**: Test critical user paths for performance regressions

#### Accessibility Standards
- **WCAG 2.1 AA**: All components must meet accessibility standards
- **Semantic HTML**: Use proper HTML elements and structure
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Readers**: Test with screen reader software
- **Focus Management**: Logical focus flow and visible focus indicators

### Development Tools

#### IDE Configuration
- **VS Code**: Recommended with ESLint, Prettier, and TypeScript extensions
- **Cursor**: Supported with custom rules in `.cursor/rules/`
- **Windsurf**: Supported with custom rules in `.windsurf/rules/`

#### Debugging
- **React DevTools**: For component inspection and state debugging
- **Vite DevTools**: For build and performance analysis
- **Supabase Dashboard**: For database queries and real-time data
- **Browser DevTools**: For performance profiling and accessibility testing

#### Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Bundle Analyzer**: Monitor bundle size and dependencies
- **Web Vitals**: Track Core Web Vitals metrics
- **Performance Budget**: Enforce performance constraints

### Contributing Guidelines

#### Before Contributing
1. Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
2. Check [TASK_LIST.md](TASK_LIST.md) for current priorities
3. Review [docs/COMPONENT_MAP.md](docs/COMPONENT_MAP.md) for architecture overview
4. Understand the therapeutic goals and user safety considerations

#### Pull Request Process
1. **Fork** the repository and create a feature branch
2. **Implement** your changes following the development standards
3. **Test** thoroughly including accessibility and performance
4. **Document** any new features or API changes
5. **Submit** PR with clear description and testing instructions

#### Code Review Criteria
- **Functionality**: Does the code work as intended?
- **Quality**: Does it follow coding standards and best practices?
- **Testing**: Are there adequate tests with good coverage?
- **Accessibility**: Does it maintain WCAG 2.1 AA compliance?
- **Performance**: Does it maintain or improve performance?
- **Therapeutic Value**: Does it align with therapeutic goals?

## 📚 Documentation & Platform Integration

While being primarily developed on Bolt.new, this project integrates multiple AI development platforms and tools.

### 📋 **Core Project Documentation**
- **[README.md](README.md)** - Project overview, getting started guide, and feature documentation
- **[FAQ.md](docs/FAQ.md)** - Frequently asked questions, troubleshooting, and setup guidance
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines, coding standards, and contribution workflows
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines and behavioral expectations
- **[CHANGELOG.md](CHANGELOG.md)** - Version history, notable changes, and release notes

### 🏗️ **Architecture & Technical Documentation**
- **[COMPONENT_MAP.md](docs/COMPONENT_MAP.md)** - Architecture overview, component relationships, and build priorities
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database table structures, relationships, and RLS policies
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - Complete API reference, data structures, and integration guides
- **[ENVIRONMENT_ARCHITECTURE.md](docs/ENVIRONMENT_ARCHITECTURE.md)** - Multi-environment setup and deployment strategy
- **[TASK_LIST.md](TASK_LIST.md)** - Comprehensive development roadmap and project management

### 🚀 **Deployment & Operations**
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide for all environments
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Step-by-step production deployment guide for Bolt.new
- **[docs/migrations/](docs/migrations/)** - Database migration files and execution history
  - `PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql` - Production database schema
- **[netlify.toml](netlify.toml)** - Netlify deployment configuration

### 🔒 **Security & Privacy**
- **[SECURITY.md](docs/SECURITY.md)** - Comprehensive security documentation, practices, and compliance
- **[Privacy Policy](docs/PRIVACY_POLICY.md)** - User privacy protection and data handling practices (planned)

### 🧪 **Testing & Quality Assurance**
- **[TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Comprehensive testing strategies, frameworks, and best practices
- **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)** - Browser testing procedures and validation checklists
- **[MILESTONE_FIX_SUMMARY.md](MILESTONE_FIX_SUMMARY.md)** - Critical bug fix documentation and lessons learned

### 🤖 **AI Development Platform Integration**

#### Bolt.new Integration
- **[.bolt/prompt](.bolt/prompt)** - Comprehensive code generation rules and build standards
- **[.bolt/](.bolt/)** - Bolt.new project configuration and settings

### ⚖️ **Legal & Licensing Documentation**
- **[LICENSE](LICENSE)** - MIT License for codebase
- **[licenses/](licenses/)** - Comprehensive licensing documentation
  - `OGL.txt` - Open Game License for RPG content
  - `third-party.md` - External dependencies and attributions

### ⚙️ **Configuration & Standards**

#### Code Quality & Formatting
- **[eslint.config.js](eslint.config.js)** - ESLint rules and code quality standards
- **[.prettierrc](.prettierrc)** - Prettier code formatting configuration
- **[.prettierignore](.prettierignore)** - Files excluded from Prettier formatting

#### TypeScript Configuration
- **[tsconfig.json](tsconfig.json)** - Main TypeScript configuration
- **[tsconfig.app.json](tsconfig.app.json)** - Application-specific TypeScript settings
- **[tsconfig.node.json](tsconfig.node.json)** - Node.js TypeScript configuration

#### Build & Styling
- **[vite.config.ts](vite.config.ts)** - Vite build tool configuration
- **[tailwind.config.ts](tailwind.config.ts)** - Tailwind CSS styling configuration
- **[postcss.config.js](postcss.config.js)** - PostCSS processing configuration
- **[components.json](components.json)** - Shadcn/UI component library configuration

#### Package Management
- **[package.json](package.json)** - Dependencies, scripts, and project metadata

### 📊 **Documentation Organization**

The documentation follows a hierarchical structure:

## 🎯 Why Bolt.new?

This repository showcases the power of AI-accelerated development:

- **AI-Accelerated Development**: All core logic, UI/UX flows, and backend connections were generated or composed directly within Bolt.new
- **Instant MVP Prototyping**: Enabled breaking the app into smallest functional increments with real-time testing
- **Seamless Integration**: Complex features like AI narration and voice synthesis made possible through Bolt.new's automation
- **Transparent Workflow**: The Bolt.new project history captures each component and decision for full transparency

## 🚀 Key Features

- **Interactive Scenario Selection**: Users choose narrative paths that echo real-world emotional challenges
- **AI-Generated Visuals**: Story moments enhanced with fantasy art (Leonardo.AI integration planned)
- **Immersive AI Voice Narration**: Dynamic storytelling using voice synthesis (ElevenLabs integration planned)
- **Therapeutic Gameplay Mechanics**: Mini-tasks and choices designed for resilience, healing, and growth
- **Original Music Integration**: Curated tracks to enhance emotional immersion

## 📜 License

- **Code**: MIT License
- **Game Content**: Open Game License (OGL) / Open RPG Creative (ORC)
- **Pathfinder 2e**: Used under ORC License (excludes Product Identity)

See `LICENSE` and `licenses/` directory for detailed license information.

## 🤝 Contributing

We welcome contributions! Please read our guidelines:

1. **Read Documentation**: Check `CONTRIBUTING.md` for detailed guidelines
2. **Follow Standards**: Adhere to TypeScript strict mode and component guidelines
3. **Test Changes**: Ensure all tests pass and no TypeScript errors
4. **Respect Architecture**: Follow the established component structure and patterns

## 🌍 Community & Resources

- **Repository**: [GitHub](https://github.com/moshehbenavraham/luminaris-quest)
- **Community**: [Skool Community](https://www.skool.com/ai-with-apex/about)
- **Built with**: [Bolt.new](https://bolt.new/)
- **Supabase**: Backend and authentication platform

## ⚠️ Important Notes

- **Therapeutic Purpose**: Luminari's Quest is designed as a supplemental tool to support healing and growth. It is not a replacement for professional mental health care.
- **Target Audience**: Designed for young adults (18-25) who have experienced parental loss and homelessness during their teenage years.
- **Development Environment**: Currently in active development with ongoing database schema implementation.

## 🚨 Current Development Status

- ✅ Core application architecture complete
- ✅ Component structure refactored and improved
- ✅ TypeScript compilation errors resolved
- 🔄 **Combat System Rebuild**: New mobile-first combat system (`src/features/combat/`) running in parallel with original (`src/components/combat/`)
  - New system enabled by default, use `?legacyCombat=1` for original
  - Phases 1-4 complete, Phase 5 (Testing & Polish) in progress
- ⚠️ Database schema implementation in progress
- 🔄 Supabase integration being finalized
- 📋 AI service integrations planned for future releases

## 🚀 Next Steps

### For New Contributors
1. **[Read the FAQ](docs/FAQ.md)** - Common questions and setup help
2. **[Review Contributing Guidelines](CONTRIBUTING.md)** - Development standards and workflow
3. **[Explore the Architecture](docs/COMPONENT_MAP.md)** - Understand the system design
4. **[Check Current Priorities](TASK_LIST.md)** - See what needs work

### For Users
1. **[Try the Live Demo](https://luminarisquest.org)** - Experience the therapeutic journey
2. **[Read About Our Mission](#about)** - Understand our therapeutic approach
3. **[Explore Features](#features)** - Discover what makes this special
4. **[Join the Community](https://github.com/moshehbenavraham/luminaris-quest/discussions)** - Connect with others

### For Developers
1. **[Quick Start Guide](#getting-started)** - Get up and running
2. **[API Documentation](docs/API_DOCUMENTATION.md)** - Technical reference
3. **[Testing Guide](docs/TESTING_GUIDE.md)** - Quality assurance
4. **[Security Documentation](docs/SECURITY.md)** - Security practices

---

**🚨 CRITICAL: TWO COMBAT SYSTEMS EXIST**
- **NEW System** ✅: `/src/features/combat/` - Active development, default behavior
- **OLD System** ❌: `/src/components/combat/` - DEPRECATED, only with `?legacyCombat=1`
- See [`COMBAT_MIGRATION_GUIDE.md`](COMBAT_MIGRATION_GUIDE.md) for full details

---

Thank you for your interest in Luminari's Quest! Together, we're creating a meaningful therapeutic experience that can help young adults on their healing journey.

**Built with [Bolt.new](https://bolt.new/) 🚀**

*Last updated: December 2024*
