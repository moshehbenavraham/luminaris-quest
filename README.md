# Luminari's Quest

A therapeutic AI-powered RPG adventure designed to help young adults process trauma through interactive storytelling and journaling.

**Built with [Bolt.new](https://bolt.new/) 🚀**

## 🌟 About

**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure designed to help young adults process trauma from losing parents and experiencing homelessness during their teenage years. The game combines fantasy storytelling with evidence-based therapeutic techniques to create a safe space for healing and growth.

This project was built for the World's Largest AI Hackathon to demonstrate how AI can be used for therapeutic purposes, addressing the real need for accessible mental health resources.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI components  
- **State Management**: Zustand with persistence
- **Backend**: Supabase (authentication & database)
- **AI Services**: OpenAI (planned), Leonardo.AI (planned), ElevenLabs (planned)
- **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moshehbenavraham/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then fill in your API keys in the `.env` file.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Environment Variables

Check `.env.example` for required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Additional AI service keys (planned for future features)

## 🎮 Features

- **Guardian Trust System**: Core mechanic tracking player's bond with their guardian spirit (0-100)
- **Therapeutic Journaling**: Reflections triggered by milestones and learning moments with full CRUD operations
- **Scene-based Gameplay**: Social, skill, combat, journal, and exploration scenarios
- **Milestone Achievements**: Progress tracking with meaningful rewards
- **Enhanced Journal System**: Inline editing, delete confirmation, and edit history tracking
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🏗️ Architecture

The app follows a component-based architecture with recent improvements:

### Component Structure
- **`src/pages/`** - Route entry points (Home, Adventure, Progress, Profile, Legal)
- **`src/components/`** - Reusable UI components including enhanced JournalEntryCard
- **`src/store/`** - Zustand state management with persistence and hydration safety
- **`src/engine/`** - Game logic and scene engine
- **`src/integrations/`** - External service integrations (Supabase)

### Recent Architecture Improvements
- **Page Component Extraction**: Moved from monolithic App.tsx to dedicated page files
- **Enhanced Journal System**: Full CRUD functionality with visual distinction between entry types
- **TypeScript Improvements**: All compilation errors resolved with proper type safety
- **Code Quality**: ESLint configuration updated, Prettier formatting applied consistently

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest

### Development Standards

- **TypeScript**: Strict typing required for all components
- **Component Guidelines**: Follow atomic design principles (atoms → molecules → organisms)
- **Accessibility**: WCAG compliance with semantic HTML and keyboard navigation
- **File Size**: Keep components under 500 lines; split into subcomponents if necessary
- **Testing**: Vitest for unit and integration tests

## 📚 Documentation & Platform Integration

While being primarily developed on Bolt.new, this project integrates multiple AI development platforms and tools. We maintain comprehensive documentation covering all aspects of development, architecture, and deployment.

### 📋 **Core Project Documentation**
- **[README.md](README.md)** - Project overview, getting started guide, and feature documentation
- **[FAQ.md](docs/FAQ.md)** - Frequently asked questions, troubleshooting, and setup guidance
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines, coding standards, and contribution workflows
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines and behavioral expectations
- **[CHANGELOG.md](CHANGELOG.md)** - Version history, notable changes, and release notes

### 🏗️ **Architecture & Technical Documentation**
- **[COMPONENT_MAP.md](docs/COMPONENT_MAP.md)** - Architecture overview, component relationships, and build priorities
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database table structures, relationships, and RLS policies
- **[ENVIRONMENT_ARCHITECTURE.md](docs/ENVIRONMENT_ARCHITECTURE.md)** - Multi-environment setup and deployment strategy
- **[TASK_LIST.md](TASK_LIST.md)** - Comprehensive development roadmap and project management

### 🚀 **Deployment & Operations**
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Step-by-step production deployment guide for Bolt.new
- **[docs/migrations/](docs/migrations/)** - Database migration files and execution history
  - `PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql` - Production database schema
- **[netlify.toml](netlify.toml)** - Netlify deployment configuration

### 🧪 **Testing & Quality Assurance**
- **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)** - Browser testing procedures and validation checklists
- **[MILESTONE_FIX_SUMMARY.md](MILESTONE_FIX_SUMMARY.md)** - Critical bug fix documentation and lessons learned

### 🤖 **AI Development Platform Integration**

#### Bolt.new Integration
- **[.bolt/prompt](.bolt/prompt)** - Comprehensive code generation rules and build standards
- **[.bolt/](.bolt/)** - Bolt.new project configuration and settings

#### Claude Code Integration  
- **[CLAUDE.md](CLAUDE.md)** - Claude Code development guidance and project context
- **[CLAUDE.local.md](CLAUDE.local.md)** - Local Claude Code notes and configurations
- **[.claude/settings.local.json](.claude/settings.local.json)** - Claude Code IDE settings and preferences

#### Cursor IDE Integration
- **[.cursor/rules/](.cursor/rules/)** - Cursor IDE component and layout guidelines
  - `layout-integration.mdc` - Layout integration standards and best practices
  - `project-context.mdc` - Project context rules and conventions
  - `sidebar-navigation.mdc` - Navigation component guidelines
- **[.cursorignore](.cursorignore)** - Files excluded from Cursor context
- **[.augmentignore](.augmentignore)** - Files excluded from Augment Code AI indexing

#### Augment Code Integration
- **[.augment-guidelines](.augment-guidelines)** - Project guidelines and standards for Augment Code extension
- **[.augmentignore](.augmentignore)** - Files excluded from Augment Code AI indexing

#### Windsurf IDE Integration
- **[.windsurf/rules/](.windsurf/rules/)** - Windsurf IDE component and layout guidelines
  - `layout-integration.md` - Layout integration standards (⚠️ **Not mapped** - should match Cursor equivalent)
  - `project-context.md` - Project context rules (⚠️ **Not mapped** - should match Cursor equivalent)
  - `sidebar-navigation.md` - Navigation component guidelines (⚠️ **Not mapped** - should match Cursor equivalent)
  - `.windsurfrules` - Windsurf-specific configuration file

#### IDE Configuration Maintenance
⚠️ **Important**: The `.windsurf` and `.cursor` folders contain similar configuration files that should be kept in sync to maintain consistent development standards across IDEs:

| Purpose | Cursor File | Windsurf File | Status |
|---------|-------------|---------------|---------|
| Layout Integration | `.cursor/rules/layout-integration.mdc` | `.windsurf/rules/layout-integration.md` | ⚠️ **Not Mapped** |
| Project Context | `.cursor/rules/project-context.mdc` | `.windsurf/rules/project-context.md` | ⚠️ **Not Mapped** |
| Sidebar Navigation | `.cursor/rules/sidebar-navigation.mdc` | `.windsurf/rules/sidebar-navigation.md` | ⚠️ **Not Mapped** |
| Guidelines | `.augment-guidelines` | `.windsurf/rules/.windsurfrules` | ⚠️ **Not Mapped** |

**Action Required**: Windsurf configuration files need to be updated to match their Cursor counterparts to ensure consistent development experience across different AI-powered IDEs.

#### Multi-Agent Orchestration
- **[.roomodes](.roomodes)** - Roo Code multi-agent workflow configurations and task orchestration

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
- ⚠️ Database schema implementation in progress
- 🔄 Supabase integration being finalized
- 📋 AI service integrations planned for future releases

---

**Built with [Bolt.new](https://bolt.new/) 🚀**

*Last updated: December 2024*
