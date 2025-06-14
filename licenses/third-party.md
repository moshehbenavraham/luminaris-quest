All core app logic and UI were built primarily in Bolt.new

# Section C: Third-Party Notices & Attributions

This file records all external assets, libraries, and services used in **Luminari's Quest** that are **not** covered by the MIT core license or the OGL/ORC game-mechanics license.  
Update this list any time you add a new dependency, font, icon set, or media file.

> **Cross-References:** Main project license in `LICENSE`, OGL compliance in `licenses/OGL.txt`, dependency management in `package.json`, and legal requirements in `.bolt/prompt` and `.cursor/rules/project-context.mdc`.

## Core Dependencies

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **React 18** | JavaScript library | MIT | Core UI framework |
| **Vite** | Build tool | MIT | Development and build tooling |
| **TypeScript** | Programming language | Apache-2.0 | Type safety and development experience |
| **Tailwind CSS** | CSS framework | MIT | Utility-first CSS framework |
| **Shadcn/UI** | React components | MIT | Component library built on Radix UI |
| **Radix UI** | React primitives | MIT | Accessible component primitives |
| **Zustand** | State management | MIT | Lightweight state management solution |
| **React Router** | Routing library | MIT | Client-side routing |

## Backend & Authentication

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **Supabase JS** | Client SDK | Apache-2.0 | Backend, auth, and database |
| **@tanstack/react-query** | Data fetching | MIT | Server state management |

## UI Components & Styling

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **Lucide React** | Icon library | ISC | Icon set used throughout the app |
| **@fontsource/inter** | Font | SIL OFL 1.1 | Inter font family |
| **class-variance-authority** | Utility | Apache-2.0 | Component variant management |
| **clsx** | Utility | MIT | Class name construction |
| **tailwind-merge** | Utility | MIT | Tailwind class merging |
| **tailwindcss-animate** | Plugin | MIT | Animation utilities |

## Form & Input Handling

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **react-hook-form** | Form library | MIT | Form state management |
| **cmdk** | Command menu | MIT | Command palette component |
| **input-otp** | OTP input | MIT | One-time password input |

## Data Visualization

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **recharts** | Charts library | MIT | Data visualization (planned use) |

## Development Tools

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **ESLint** | Linter | MIT | Code quality |
| **Prettier** | Formatter | MIT | Code formatting |
| **Vitest** | Test runner | MIT | Unit testing framework |
| **@testing-library** | Testing utilities | MIT | React testing utilities |

## Build Dependencies

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **@rollup/rollup-*** | Build tool | MIT | Platform-specific build dependencies |
| **autoprefixer** | PostCSS plugin | MIT | CSS vendor prefixing |
| **postcss** | CSS processor | MIT | CSS transformation |

## Planned AI Integrations (Not Yet Implemented)

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **OpenAI SDK** | API client | MIT | For narrative generation (planned) |
| **Leonardo.AI** | API service | Leonardo TOS | For image generation (planned) |
| **ElevenLabs** | API service | ElevenLabs TOS | For voice synthesis (planned) |

## How to add a new entry

1. Identify the **exact package / asset name**.  
2. Record its **license** (check `npm info <pkg> license` or its repo).  
3. Provide the **URL to the source or TOS** if not obvious.  
4. Add any notes on usage constraints (e.g., "credit required in About page").

---

_Last updated: December 2024_