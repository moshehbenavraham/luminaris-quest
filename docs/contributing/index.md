# Contributing to Luminari's Quest

Welcome to Luminari's Quest! This therapeutic RPG was built primarily using AI and follows specific architectural patterns and development standards. We're excited to have you contribute to this meaningful project that helps young adults process trauma through interactive storytelling.

## 🌟 Mission & Values

### Our Mission
Luminari's Quest aims to make therapeutic support accessible through engaging, evidence-based interactive experiences. Every contribution should align with our core therapeutic principles:

- **Safety First**: All features must prioritize user emotional safety
- **Evidence-Based**: Incorporate proven therapeutic techniques
- **Inclusive Design**: Ensure accessibility for all users
- **Privacy-Focused**: Protect user data and therapeutic content
- **Growth-Oriented**: Support user progress and healing

### Therapeutic Considerations
When contributing, consider:
- **Trauma-Informed Design**: Avoid triggering content or mechanics
- **Progressive Disclosure**: Introduce challenging content gradually
- **User Agency**: Always give users control over their experience
- **Positive Reinforcement**: Focus on growth rather than failure

## 🏗️ Project Architecture

### Current Architecture (2025)

The project has evolved into a sophisticated therapeutic gaming platform with these key systems:

#### Core Systems
- **Light & Shadow Combat**: Therapeutic combat system with 4 actions and shadow manifestations
- **Guardian Trust System**: Relationship mechanic affecting gameplay and story progression  
- **Scene Engine**: 20 therapeutic scenarios across 4 complete cycles
- **Journal System**: Advanced therapeutic reflection with full CRUD operations
- **Audio System**: Therapeutic soundscapes and combat sound effects

#### Component Structure
- **Page Components**: Route-level components in `src/pages/`
  - `Home.tsx` - Landing page with authentication and hero content
  - `Adventure.tsx` - Main gameplay interface with combat integration
  - `Progress.tsx` - Progress tracking, analytics, and journal management
  - `Profile.tsx` - User profile management and settings
  - `Legal.tsx` - Legal information and compliance pages

**Enhanced Journal System**
- **JournalEntryCard Component**: Full CRUD functionality with:
  - Inline editing with save/cancel
  - Delete confirmation dialogs
  - Visual distinction between milestone and learning entries
  - Edit history tracking with timestamps

**Code Quality Improvements**
- All TypeScript compilation errors resolved
- ESLint configuration updated with browser globals
- Consistent Prettier formatting applied across codebase
- Proper component prop interfaces and type safety

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **Package Manager**: npm (included with Node.js) or yarn
- **Git**: For version control ([Download](https://git-scm.com/))
- **Supabase Account**: For database and authentication ([Sign up](https://supabase.com/))
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Quick Start

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Required - Get from your Supabase project settings
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Required for AI features (when implemented)
   VITE_OPENAI_API_KEY=your-openai-api-key
   
   # Development settings
   VITE_APP_URL=http://localhost:5173
   VITE_DEBUG_MODE=true
   ```

4. **Set up the database:**
   ```bash
   # Option 1: Using Supabase CLI (recommended)
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-id
   supabase db push
   
   # Option 2: Manual setup
   # Copy SQL from docs/migrations/PRODUCTION_MIGRATION_EXECUTED_2025-06-17.sql
   # Paste into Supabase SQL Editor and run
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Development Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start development server | Daily development |
| `npm run build` | Build for production | Before committing |
| `npm run preview` | Preview production build | Testing production build |
| `npm run lint` | Run ESLint | Code quality checks |
| `npm run lint --fix` | Fix ESLint issues | Auto-fix linting problems |
| `npm run format` | Format code with Prettier | Code formatting |
| `npm test` | Run tests | Testing changes |
| `npm run test:coverage` | Run tests with coverage | Coverage analysis |

### Development Workflow

#### Daily Development
```bash
# Start your day
git pull origin main                    # Get latest changes
npm install                            # Update dependencies if needed
npm run dev                           # Start development server

# During development
npm run lint                          # Check code quality regularly
npm test                             # Run tests for changed components
```

#### Before Committing
```bash
# Quality checks
npm run lint --fix                    # Fix linting issues
npm run format                       # Format code
npm test                             # Ensure all tests pass
npm run build                        # Verify production build works

# Commit changes
git add .
git commit -m "feat: your descriptive commit message"
```

## 📋 Development Standards

### Code Quality Requirements

- **TypeScript**: Strict typing required for all components
- **Component Size**: Keep all files under 250 lines; split into subcomponents if necessary
- **Prop Interfaces**: Define prop interfaces or types for each component
- **Error Handling**: Implement graceful error handling and fallbacks
- **Zero Warnings**: All ESLint warnings must be resolved before committing

### Component Guidelines

- **Atomic Design**: Follow atoms → molecules → organisms pattern
- **Single Responsibility**: Each component should have one clear purpose
- **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation
- **Responsive Design**: Ensure functionality across mobile, tablet, and desktop

### File Organization

```
src/
├── components/
│   ├── ui/           # Shadcn/UI base components
│   ├── layout/       # Layout components (Navbar, Sidebar, Footer)
│   ├── auth/         # Authentication components
│   └── *.tsx         # Feature-specific components
├── pages/            # Page components (extracted from App.tsx)
├── store/            # Zustand state management
├── engine/           # Game logic and scene engine
├── lib/              # Utilities and providers
└── integrations/     # External service integrations
```

## 🎯 Development Workflow

### Before Starting Work

1. **Check Current Status**: Review `../architecture/components.md` for completed features
2. **TypeScript Check**: Ensure `npm run build` passes without errors
3. **Code Quality**: Run `npm run lint` and `npm run format`

### Making Changes

1. **Component Development**:
   - Use existing Shadcn/UI components where possible
   - Follow TypeScript strict typing
   - Implement proper error boundaries
   - Add appropriate ARIA labels for accessibility

2. **State Management**:
   - Use Zustand store for game state
   - Maintain hydration safety for SSR compatibility
   - Implement proper persistence patterns

3. **Testing**:
   - Test across different screen sizes
   - Verify keyboard navigation works
   - Check error states and edge cases

### Code Style

- **Formatting**: Use Prettier (configured in `.prettierrc`)
- **Linting**: Follow ESLint rules (see `eslint.config.js`)
- **Icons**: Use Lucide icons consistently
- **Styling**: Tailwind CSS utility classes only

## 🔧 Technical Guidelines

### State Management

The project uses Zustand with persistence:

```typescript
// Example store pattern
interface GameState {
  // State properties
  guardianTrust: number;
  journalEntries: JournalEntry[];
  
  // Actions
  setGuardianTrust: (trust: number) => void;
  addJournalEntry: (entry: JournalEntry) => void;
}
```

### Component Patterns

```typescript
// Component interface pattern
interface ComponentProps {
  // Required props
  data: DataType;
  onAction: (value: string) => void;
  
  // Optional props
  className?: string;
  disabled?: boolean;
}

export function Component({ data, onAction, className, disabled = false }: ComponentProps) {
  // Component implementation
}
```

### Error Handling

```typescript
// Error boundary pattern
try {
  // Risky operation
} catch (error) {
  console.error('Descriptive error message:', error);
  // Graceful fallback
}
```

## 🚀 Deployment Standards

### Pre-Deployment Checklist

- [ ] TypeScript compilation passes (`npm run build`)
- [ ] All tests pass (`npm run test`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Environment variables are properly configured
- [ ] All new components are documented

### Performance Considerations

- **Bundle Size**: Keep main chunk under 1MB when possible
- **Code Splitting**: Use dynamic imports for large features
- **Image Optimization**: Optimize images and use appropriate formats
- **Lazy Loading**: Implement for non-critical components

## 🎮 Game Development Guidelines

### Therapeutic Content

- **Sensitivity**: All content should be appropriate for trauma recovery
- **Positive Messaging**: Focus on growth, healing, and resilience
- **Choice Consequences**: Ensure choices lead to meaningful outcomes
- **Progress Tracking**: Maintain clear progress indicators

### RPG Mechanics

- **OGL Compliance**: Use only Open Gaming License content
- **Dice System**: Follow d20 system conventions
- **Character Progression**: Implement meaningful advancement
- **Narrative Flow**: Maintain engaging story progression

## 📝 Documentation

### Required Documentation

- **Component Documentation**: JSDoc comments for complex components
- **API Documentation**: Document all external integrations
- **State Documentation**: Document store patterns and data flow
- **Setup Instructions**: Keep README.md current

### Commit Standards

- **Conventional Commits**: Use conventional commit format
- **Descriptive Messages**: Clearly describe what changed and why
- **Atomic Commits**: One logical change per commit
- **Testing**: Ensure commits don't break the build

## 🤝 Getting Help

- **Documentation**: Check `../` directory for detailed guides
- **Component Map**: Review `../architecture/components.md` for architecture overview
- **Code Standards**: Reference `eslint.config.js` and `tsconfig.*.json`
- **Legal Compliance**: See `LICENSE` and `licenses/` directory

## 🎯 Current Priorities

Based on the recent refactoring work, current development priorities include:

1. **Supabase Integration**: Complete journal entry persistence
2. **AI Features**: Implement OpenAI narrative generation
3. **Enhanced UX**: Improve journal search and filtering
4. **Performance**: Optimize bundle size and loading times
5. **Testing**: Expand test coverage for new components

---

Thank you for contributing to Luminari's Quest! Your work helps create a meaningful therapeutic experience for users on their healing journey.

