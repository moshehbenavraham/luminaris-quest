# CONVENTIONS.md

## Guiding Principles

- Optimize for readability over cleverness
- Code is written once, read many times
- Consistency beats personal preference
- If it can be automated, automate it

## Naming

- Be descriptive over concise: `getUserById` > `getUser` > `fetch`
- Booleans read as questions: `isActive`, `hasPermission`, `shouldRetry`
- Functions describe actions: `calculateTotal`, `validateInput`, `sendNotification`
- Avoid abbreviations unless universally understood (`id`, `url`, `config` are fine)
- Match domain language--use the same terms as product/design/stakeholders

## Files & Structure

- One concept per file where practical
- File names reflect their primary export or purpose
- Group by feature/domain, not by type (prefer `/orders/api.ts` over `/api/orders.ts`)
- Keep nesting shallow--if you're 4+ levels deep, reconsider

## TypeScript Standards

- Strict mode enabled
- Zero compilation errors required before build
- Proper interfaces for all props
- No `any` types without justification
- Use absolute imports with `@/` prefix

## Component Standards

- Maximum 250 lines per component (combat system allows 500)
- Single responsibility principle
- Props interface with TypeScript
- PascalCase for components, camelCase for functions

## Functions & Modules

- Functions do one thing
- If a function needs a comment explaining what it does, consider renaming it
- Keep functions short enough to read without scrolling
- Avoid side effects where possible; be explicit when they exist

## Comments

- Explain _why_, not _what_
- Delete commented-out code--that's what git is for
- TODOs include context: `// TODO(name): reason, ticket if applicable`
- Update or remove comments when code changes

## Error Handling

- Fail fast and loud in development
- Fail gracefully in production
- Errors should be actionable--include context for debugging
- Don't swallow errors silently
- Use SaveErrorType enum for save operation errors

## Testing

- Test behavior, not implementation
- A test's name should describe the scenario and expectation
- If it's hard to test, the design might need rethinking
- Flaky tests get fixed or deleted--never ignored
- Minimum 80% code coverage
- Co-locate tests with source files

## React 19 Testing Requirements

- Always wrap timer advances with `advanceTimersAndAct()`
- Use 2000ms timeout for Radix UI tooltips and dialogs
- Wrap Zustand store state changes in `act()`
- No impure functions in render (`Date.now()`, `Math.random()`)
- Test CSS custom properties directly (e.g., `--progress-value`) not computed styles
- Global browser API mocks live in `config/vitest.setup.ts`

## Git & Version Control

- Commit messages: imperative mood, concise (`Add user validation` not `Added some validation stuff`)
- One logical change per commit
- Branch names: `type/short-description` (e.g., `feat/user-auth`, `fix/cart-total`)
- Keep commits atomic enough to revert safely

## Pull Requests

- Small PRs get better reviews
- Description explains the _what_ and _why_--reviewers can see the _how_
- Link relevant tickets/context
- Review your own PR before requesting others

## Code Review

- Critique code, not people
- Ask questions rather than make demands
- Approve when it's good enough, not perfect
- Nitpicks are labeled as such

## Dependencies

- Fewer dependencies = less risk
- Justify additions; prefer well-maintained, focused libraries
- Pin versions; update intentionally

## Accessibility

- WCAG 2.1 AA compliance required
- Semantic HTML with proper ARIA labels
- Full keyboard navigation
- Screen reader compatible

## Performance

- Lighthouse performance score >90
- Bundle size monitoring with warnings at 1MB
- Lazy loading for combat animations
- Image optimization with WebP/AVIF

## Database & Supabase

- All queries go through `src/integrations/supabase/client.ts`
- Always check for errors: `const { data, error } = await supabase.from(...)`
- Use RLS policies for security - never bypass with service role in client code
- Regenerate types after schema changes: `supabase gen types typescript`
- Column names use snake_case; TypeScript uses camelCase
- JSONB fields for flexible data (milestones, statistics, preferences)
- Default values in schema for backwards compatibility

## State Persistence

- Database is source of truth; localStorage is fallback cache
- Every store field saved to DB must also load from DB (no orphaned saves)
- Use `partialize` in Zustand to control what goes to localStorage
- Sets must be converted to Arrays before serialization
- Test cross-device sync explicitly in integration tests

## Migrations

- One logical change per migration file
- Migrations must be reversible (include down migration logic)
- Use `DEFAULT` values for new columns to avoid breaking existing rows
- Test migrations against production-like data before deploying
- Naming: `YYYYMMDD_HHMMSS_description.sql`

## When In Doubt

- Ask
- Leave it better than you found it
- Ship, learn, iterate
