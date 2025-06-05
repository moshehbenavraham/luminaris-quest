# Bolt.new Project Rules

## 1. Scope & File Changes
- Only modify files that are explicitly mentioned in the prompt or current task
- Never create, rename, or delete files or directories unless specifically instructed
- Never modify configuration files (vite.config.ts, tsconfig.*.json, etc.) unless prompted
- Never modify environment files (.env, .env.*) or documentation unless explicitly requested

## 2. Design & Code Structure
- Follow atomic design principles for all components:
  - Atoms: Basic UI elements (Button, Input, Card)
  - Molecules: Composite components (AuthForm, NavItem)
  - Organisms: Complex components (Layout, Sidebar)
- All components must:
  - Use TypeScript with strict mode
  - Be under 250 lines (split into subcomponents if needed)
  - Use Tailwind CSS for styling
  - Use Shadcn/UI components as base
  - Use Lucide icons for navigation/actions
  - Include proper accessibility attributes
- File naming:
  - React components: PascalCase (e.g., AuthForm.tsx)
  - Utilities/hooks: camelCase (e.g., useAuth.ts)
  - Test files: *.test.tsx
  - Style files: *.module.css (if needed)

## 3. Project Roadmap & Task Tracking
- Follow component priority in docs/COMPONENT_MAP.md:
  1. Project Scaffold
  2. Core Layout Shell
  3. Auth Module
  4. Supabase Client
  5. Game State Store
  6. Character Creation
  7. Narrative Engine
  8. AI Integrations
- Never build features out of order unless explicitly approved
- Track current focus through:
  - GitHub Issues/PRs for specific tasks
  - docs/COMPONENT_MAP.md for component status
  - .bolt/prompt for build scope
- Reference .bolt/prompt for current build rules and limitations

## 4. API & Environment Variables
- Required environment variables (in .env.example):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_OPENAI_API_KEY
  - VITE_LEONARDO_API_KEY
  - VITE_ELEVENLABS_API_KEY
- Never hardcode API keys or secrets
- Add new required variables to .env.example (never to .env)
- Use proper error handling for missing env vars

## 5. Compliance & Legal
- Game content must follow OGL/ORC licensing
- Never use third-party RPG IP or "Product Identity"
- Update licenses/third-party.md when adding new dependencies
- Include proper attribution for all third-party content
- Maintain "Built with Bolt.new" attribution in Footer

## 6. Documentation & Onboarding
- Keep core documentation files unchanged:
  - README.md
  - CONTRIBUTING.md
  - licenses/third-party.md
  - docs/COMPONENT_MAP.md
- Add JSDoc comments for all components and functions
- Update documentation when adding features
- Maintain clear component documentation

## 7. Quality & Testing
- Write tests for new features using Vitest
- Maintain existing test coverage
- Test accessibility:
  - Screen reader compatibility
  - Keyboard navigation
  - ARIA attributes
  - Color contrast
- Run linting (eslint) before commits
- Format code with Prettier

## 8. Review & Commit Discipline
- Stage only files related to current task
- Write conventional commit messages:
  - feat: new feature
  - fix: bug fix
  - docs: documentation
  - style: formatting
  - refactor: code restructuring
  - test: testing
  - chore: maintenance
- Include issue numbers in commit messages
- Keep commits atomic and focused

## 9. Error Handling & Production
- Use ErrorBoundary for React errors
- Implement proper loading states
- Handle API errors gracefully
- Validate environment variables
- Test in production mode before deploying
- Monitor for blank screens and layout issues

---

**Follow these rules at all times unless explicitly overridden in the current prompt or .bolt/prompt.**