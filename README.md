All core app logic and UI were built primarily in Bolt.new

# 🌟 Luminari's Quest — Built with Bolt.new

> **This project was built primarily with [Bolt.new](https://bolt.new/) as part of the World's Largest AI Hackathon. All major features, UI, and integrations were conceived and executed inside Bolt.new, showcasing its power as a next-gen AI development platform.**

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

- **Original Music Integration:**  
  Suno-generated tracks (manually curated) enhance emotional immersion.

---

## 🏗️ Stack & Architecture

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend & Auth:** Supabase, Netlify Functions
- **AI Services:**  
  - OpenAI (narrative generation)  
  - Leonardo.AI (image generation)  
  - ElevenLabs (voice)  
  - Suno (manual music)
- **DevOps:**  
  - Built, tested, and deployed via Bolt.new  
  - CI/CD

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