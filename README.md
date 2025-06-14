All core app logic and UI were built primarily in Bolt.new

# 🌟 Luminari's Quest — Built with Bolt.new

**Environment Setup**

1. Copy `.env.example` to `.env` in your project root:
```bash
cp .env.example .env
```
2. Fill in your real API keys and URLs (never commit your `.env` file!).
3. After editing `.env`, restart your dev server (`npm run dev`) to apply new variables.

> `.env.example` must be kept up to date and committed to git so every developer knows which environment variables are required.

If a new environment variable is added to the project, update `.env.example` and notify all contributors to update their `.env` files.

---

## 📚 Documentation & Platform Integration

While this project is primarily built using the 'Bolt.new' platform, it also integrates multiple other development platforms and tools. For documentation and comprehensive development guidelines:

- **Code Generation Rules:** See `.bolt/prompt` for Bolt.new guidance
- **IDE Integration:** .cursorignore for files that Cursor should not include in context.
  Reference `.cursor/` for Cursor IDE component and layout guidelines
    - *Note not a document, but part of Cursor config for background agents: environment.json
    - `.cursor/rules/`
      - layout-integration.mdc
      - project-context.mdc
      - sidebar-navigation.mdc
- **Claude Code - Agentic AI Coder:** See `CLAUDE.md` for Claude Code's guidance
  `.claude/settings.local.json` - Settings for Claude Code
- **Component Roadmap:** Check `docs/COMPONENT_MAP.md` for build priorities and component relationships
- **Change Log:** CHANGELOG.md - document all notable changes to Luminari's Quest
- **Contributing Guidelines:** See `CONTRIBUTING.md` for code quality, testing, and commit standards
- **Legal Compliance:** Reference `LICENSE` and `licenses/` directory for OGL/ORC licensing requirements
- **Configuration Standards:** Follow `eslint.config.js`, `.prettierrc`, and `tsconfig.*.json` for code quality
- **OTHER Documentation:**:
  - CODE_OF_CONDUCT.md
  - FAQ.md

---

## 🚀 Project Overview

**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure, designed to help young adults process the trauma of losing parents and experiencing homelessness during their teenage years.

Every step of this project—from scaffolding, atomic UI components, and backend integrations to AI-driven content and voice features—was built and orchestrated using Bolt.new's unique AI development environment.

---

## 🛠️ Why Bolt.new?

- **AI-Accelerated Development:**  
  All core logic, UI/UX flows, and backend connections were generated or composed directly within Bolt.new. This allowed rapid, incremental progress with strong architectural guardrails.

- **Instant MVP Prototyping:**  
  Bolt.new enabled us to break the app into the smallest functional increments (atomic design), test in real time, and refine UI/logic for accessibility, beauty, and performance.

- **Seamless Integration:**  
  Complex features—like real-time AI narration, voice synthesis, and dynamic visual generation—were made possible with Bolt.new's automation and API prompt engineering.

- **Transparent, Documented Workflow:**  
  The Bolt.new project history captures each component and decision. Judges and collaborators can see precisely how the app was built.

---

## ✨ Key Features

- **Interactive Scenario Selection:**  
  Users choose narrative paths that echo real-world emotional challenges.

- **AI-Generated Visuals (Leonardo.AI):**  
  Story moments come to life with fantasy art, generated on-demand via API.

- **Immersive AI Voice Narration (ElevenLabs):**  
  Dynamic, expressive storytelling using real-time voice synthesis.

- **Therapeutic Gameplay Mechanics:**  
  Mini-tasks and choices designed for resilience, healing, and growth.

- **Enhanced Journal System:**  
  Full CRUD operations for journal entries with inline editing, deletion confirmation, and edit history tracking.

- **Original Music Integration:**  
  Suno-generated tracks (manually curated) enhance emotional immersion.

---

## 🏗️ Stack & Architecture

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend & Auth:** Supabase, Netlify Functions
- **State Management:** Zustand with persistence and hydration safety
- **AI Services:**  
  - OpenAI (narrative generation)  
  - Leonardo.AI (image generation)  
  - ElevenLabs (voice)  
  - Suno (manual music)
- **DevOps:**  
  - Built, tested, and deployed via Bolt.new  
  - CI/CD

### Recent Architecture Improvements

**Component Structure Refactoring (Latest)**
- Extracted page components from `App.tsx` into dedicated files:
  - `src/pages/Home.tsx` - Landing page with authentication
  - `src/pages/Adventure.tsx` - Main gameplay interface
  - `src/pages/Progress.tsx` - Progress tracking and journal display
  - `src/pages/Profile.tsx` - User profile management
- Enhanced journal system with `JournalEntryCard` component providing:
  - Inline editing with save/cancel functionality
  - Delete confirmation dialogs
  - Visual distinction between milestone and learning entries
  - Edit history tracking with timestamps

**Code Quality Enhancements**
- TypeScript compilation errors resolved
- ESLint configuration updated with browser globals
- Prettier formatting applied across all TypeScript/React files
- Proper component prop interfaces and type safety

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

---

## 🚀 **Luminari's Quest — Bolt.new Pre-Deployment Checklist**

### **1. Clean Build Test**

* [x] **Run:** `npm run build`
* [x] **Verify:** No errors; `dist/` folder created
* [x] **Status:** TypeScript compilation errors resolved

### **2. Local Preview Test**

* [ ] **Run:** `npm run preview`
* [ ] **Verify:** App loads at [http://localhost:4173](http://localhost:4173) (or configured port), *all main routes function*

### **3. Dependency Audit**

* [ ] **Run:** `npm audit --production`
* [ ] **Verify:** No high/critical vulnerabilities (fix before continuing)

### **4. Check Platform Dependencies**

* [ ] **Check:** `package.json` has both:

  * `@rollup/rollup-linux-x64-gnu` (for Linux deploy)
  * `@rollup/rollup-win32-x64-msvc` (for Windows dev)
* [ ] **Verify:** No platform-specific code/imports in your own files

### **5. File Cleanup Checklist**

* [ ] `node_modules/` (EXCLUDE)
* [ ] `dist/` (EXCLUDE)
* [ ] `.env` with secrets (EXCLUDE; use `.env.example` only)
* [ ] Local IDE/VSCODE files (EXCLUDE: `.vscode/`, etc)
* [ ] **INCLUDE:**

  * `package.json` (updated)
  * `package-lock.json` (latest, synced)
  * `src/`, `public/`, `vite.config.ts`, `tsconfig.json`, etc.

### **6. Configuration Verification**

* [x] **package.json:**

  * Scripts (`build`, `build:deploy` if needed)
  * Correct dependencies/optionalDependencies
* [x] **vite.config.ts:**

  * No hardcoded dev/prod paths
  * `optimizeDeps` set for React/ReactDOM
* [x] **ESLint Configuration:** Updated with browser globals and proper TypeScript support

### **7. Environment Variables Check**

* [ ] **`.env.example`** present (no values)
* [ ] No hardcoded API keys/secrets in code or config
* [ ] All variables use `VITE_` prefix for frontend use

### **8. Code Quality Status**

* [x] **TypeScript Compilation:** All errors resolved
* [x] **Component Structure:** Page components properly extracted and organized
* [x] **Journal System:** Enhanced with full CRUD functionality
* [x] **Code Formatting:** Prettier applied consistently across codebase

---

## 🚨 **Stop and Fix If:**

* Build or preview fails locally
* TypeScript errors or warnings
* Missing platform dependencies in `package.json`
* Bundle warnings: main >1MB, total >2MB
* Critical npm audit issues
* Local preview broken or console errors

---

## 📋 **Quick Pre-Upload Summary**

* [ ] Run full local build/test
* [ ] Confirm bundle and config health
* [ ] Exclude node\_modules, dist, secrets, local dev files
* [ ] Upload zipped folder or push to Bolt.new as required

---

### 💡 **Pro Tips**

* **Keep a deploy log:** Note what failed/fixed—next deploy will be faster.
* **Test in incognito/private browser:** Catches old cache issues.
* **Open browser console during preview:** Silent errors kill demos.
* **Manually test all routes/views.**
* **Test mobile/responsive before uploading.**

---
