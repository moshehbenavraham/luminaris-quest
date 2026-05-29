# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

**Luminari's Quest** — a therapeutic, AI-powered RPG that helps young adults process trauma through interactive storytelling and journaling. SPA frontend, Supabase backend, deployed on Netlify. Live at https://luminariquest.org (note: no "s" — repo strings often misspell it as `luminarisquest.org`).

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.9 (strict) + Vite 7
- **Styling**: Tailwind CSS 4 + Shadcn/UI (Radix primitives) + Framer Motion
- **State**: Zustand 5 (persisted, hydration-safe)
- **Routing**: React Router 7
- **Backend**: Supabase (Postgres + Auth + RLS)
- **AI**: OpenAI SDK (narrative generation)
- **Testing**: Vitest 4 + React Testing Library + jest-axe (jsdom)

## Commands

```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # tsc typecheck (noEmit) + vite build
npm test          # vitest run (full suite)
npm run test:coverage
npm run lint      # eslint (CI gate: --max-warnings 250)
npm run format    # prettier --write src/**
```

Run a single test: `npx vitest run src/path/to/file.test.ts`

## Layout

```
src/
├── components/      # atoms → molecules → organisms → ui (Shadcn); also auth/, layout/
├── features/combat/ # NEW mobile-first combat system (store, hooks, components) — default
├── components/combat/ # LEGACY combat — kept in parallel, ?legacyCombat=1 to use
├── engine/          # combat-engine, scene-engine, balance logic
├── pages/           # route components (Home, Adventure, Progress, Profile, ...)
├── store/           # game-store.ts + settings-store.ts (Zustand), slices/
├── integrations/supabase/  # DB + auth client
├── data/            # static game data (shadow manifestations, audio, image registry)
├── hooks/  lib/  types/  utils/
```

## Conventions

- **Imports**: absolute via `@/` alias (maps to `src/`) — configured in tsconfig + vite + vitest.
- **TypeScript**: strict mode, no implicit any; define explicit prop interfaces.
- **Naming**: PascalCase components, camelCase functions/vars.
- **Components**: atomic-design hierarchy; single responsibility; keep under ~250 lines.
- **Tests**: colocated `*.test.ts(x)`; include jest-axe accessibility checks for UI; aim ≥80% coverage on new code.
- **Accessibility**: WCAG 2.1 AA — semantic HTML, full keyboard nav, visible focus.
- **Mobile-first**: design for phones/tablets first.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`).
- **Pre-commit**: Husky + lint-staged run eslint --fix (--max-warnings 0) and prettier on staged files.

## Before You Finish

Make sure these pass (the pre-commit hook and CI enforce them):

```bash
npm run lint && npm test && npm run build
```

## Notes

- Env vars are `VITE_`-prefixed (see `.env.example`). Supabase URL + anon key are required; OpenAI/Leonardo/ElevenLabs keys are optional/planned.
- DB tables: `game_states`, `journal_entries` (RLS-protected). Migrations under `docs/migrations/`.
- Combat is mid-rebuild: prefer `src/features/combat/` for new work; treat `src/components/combat/` as legacy.
- This project uses the Apex Spec system (`.spec_system/`) for session-driven development.
