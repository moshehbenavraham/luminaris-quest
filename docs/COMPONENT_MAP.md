# Luminari’s Quest · Component Map (MVP slices, top priority first)

| Step | Slice (smallest increment) | “Done” means |
|------|---------------------------|--------------|
| 1 ✅ | **Project Scaffold** – React + TS via Vite, Tailwind, Shadcn/UI, `.bolt/prompt`, `.env.example`, MIT+OGL licenses | Code compiles & runs; repo pushed |
| 2 ☐ | **Core Layout Shell** – `<Navbar />`, `<Main />`, `<Footer />` placeholders wired in `App.tsx` | DOM shows three sections with Tailwind spacing |
| 3 ☐ | **Auth Module (stub)** – `/login` & `/signup` routes with empty forms | Navigation works; no backend yet |
| 4 ☐ | **Supabase Client Setup** – singleton service in `src/services/supabase.ts` | `npm run dev` still green |
| 5 ☐ | **Game State Store (Context)** – create `useGameStore` with Zustand | Can set/get a dummy `playerName` |
| 6 ☐ | **Character Creation Screen** – fields: name, pronouns, trauma toggle | Form validates locally |
| 7 ☐ | **Narrative Engine Hook** – `useStoryNode(openaiPrompt)` returns stub text | Returns hard-coded string |
| 8 ☐ | **Leonardo Image Fetch** – utility to request & display placeholder art | Shows demo image in story view |
| 9 ☐ | **ElevenLabs Voice Button** – click to fetch TTS for current paragraph | Plays dummy audio URL |
| 10 ☐ | **Choice UI Component** – renders buttons from story node options | Logs choice to console |
| 11 ☐ | **Persist Progress** – save/load `gameState` to Supabase | Refresh keeps progress |
| 12 ☐ | **Music Player Slot** – audio tag ready for Suno manual uploads | Can load local MP3 |
| 13 ☐ | **Netlify Prod Deploy** – env vars, build flags, preview URL | Green check in Netlify dashboard |

> **Update rule:** Mark a step ✅ only after the merged PR proves the slice in staging.

---

_Last updated: {{YYYY-MM-DD}}_
