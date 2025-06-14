# Contributing to Luminari's Quest

Welcome to Luminari's Quest! This therapeutic RPG was built primarily using Bolt.new and follows specific architectural patterns and development standards.

## 🏗️ Project Architecture

### Recent Architecture Updates (December 2024)

The project has undergone significant refactoring to improve maintainability and code organization:

**Component Structure**
- **Page Components**: Extracted from `App.tsx` into dedicated files in `src/pages/`
  - `Home.tsx` - Landing page with authentication
  - `Adventure.tsx` - Main gameplay interface  
  - `Progress.tsx` - Progress tracking and journal display
  - `Profile.tsx` - User profile management
  - `Legal.tsx` - Legal information and compliance

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

## 🛠️ Development Standards

### Code Quality Requirements

- **TypeScript**: Strict typing required for all components
- **Component Size**: Keep all files under 500 lines; split into subcomponents if necessary
- **Prop Interfaces**: Define prop interfaces or types for each component
- **Error Handling**: Implement graceful error handling and fallbacks

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

1. **Check Current Status**: Review `docs/COMPONENT_MAP.md` for completed features
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

- **Documentation**: Check `docs/` directory for detailed guides
- **Component Map**: Review `docs/COMPONENT_MAP.md` for architecture overview
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

*Built with [Bolt.new](https://bolt.new/)*