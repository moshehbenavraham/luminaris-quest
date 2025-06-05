All core app logic and UI were built primarily in Bolt.new

# Luminari's Quest · Component Map (MVP slices, top priority first)

| Slice (smallest increment) | "Done" means |
|---------------------------|--------------|
| **Project Scaffold** – React + TS via Vite, Tailwind, Shadcn/UI, `.bolt/prompt`, `.env.example`, MIT+OGL licenses | Code compiles & runs; repo pushed |
| **Core Layout Shell** – `<Navbar />`, `<Main />`, `<Footer />` placeholders wired in `App.tsx` | DOM shows three sections with Tailwind spacing |
| **Auth Module (stub)** – `/login` & `/signup` routes with empty forms | Navigation works; no backend yet |
| **Supabase Client Setup** – singleton service in `src/services/supabase.ts` | `npm run dev` still green |
| **Game State Store (Context)** – create `useGameStore` with Zustand | Can set/get a dummy `playerName` |
| **Character Creation Screen** – fields: name, pronouns, trauma toggle | Form validates locally |
| **Narrative Engine Hook** – `useStoryNode(openaiPrompt)` returns stub text | Returns hard-coded string |
| **Leonardo Image Fetch** – utility to request & display placeholder art | Shows demo image in story view |
| **ElevenLabs Voice Button** – click to fetch TTS for current paragraph | Plays dummy audio URL |
| **Choice UI Component** – renders buttons from story node options | Logs choice to console |
| **Persist Progress** – save/load `gameState` to Supabase | Refresh keeps progress |
| **Music Player Slot** – audio tag ready for Suno manual uploads | Can load local MP3 |
| **Netlify Prod Deploy** – env vars, build flags, preview URL | Green check in Netlify dashboard |


---

_Last updated: {{YYYY-MM-DD}}_