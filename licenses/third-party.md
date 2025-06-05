All core app logic and UI were built primarily in Bolt.new

# Section C: Third-Party Notices & Attributions

This file records all external assets, libraries, and services used in **Luminari's Quest** that are **not** covered by the MIT core license or the OGL/ORC game-mechanics license.  
Update this list any time you add a new dependency, font, icon set, or media file.

| Item | Type | Source / License | Notes |
|------|------|------------------|-------|
| **React 18** | JavaScript library | MIT | Installed via Vite scaffold |
| **Vite** | Build tool | MIT | — |
| **TypeScript** | Programming language | Apache-2.0 | — |
| **Tailwind CSS** | CSS framework | MIT | JIT mode enabled |
| **Shadcn/UI** | React components | MIT | Fetched via CLI (`npx shadcn-ui@latest`) |
| **Supabase JS** | Client SDK | Apache-2.0 | Only frontend calls; no server keys committed |
| **@supabase/auth-helpers** (planned) | Auth helpers | MIT | — |
| **OpenAI Node/JS SDK** | API client | MIT | Used for narrative generation |
| **Leonardo.AI SDK / fetch** | API calls | Leonardo TOS | Image generation |
| **ElevenLabs TTS API** | API calls | ElevenLabs API TOS | Voice synthesis |
| **Heroicons** (planned) | SVG icons | MIT | Included via `@heroicons/react` |
| **Google Fonts – Inter** (planned) | Font | SIL OFL 1.1 | Hosted via `@fontsource/inter` |

## How to add a new entry

1. Identify the **exact package / asset name**.  
2. Record its **license** (check `npm info <pkg> license` or its repo).  
3. Provide the **URL to the source or TOS** if not obvious.  
4. Add any notes on usage constraints (e.g., "credit required in About page").

---

_Last updated: {{YYYY-MM-DD}}_