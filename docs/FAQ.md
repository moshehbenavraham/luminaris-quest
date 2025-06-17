# Frequently Asked Questions (FAQ)

## 🌟 About Luminari's Quest

### What is Luminari's Quest?
**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure designed to help young adults process trauma from losing parents and experiencing homelessness during their teenage years. The game combines fantasy storytelling with evidence-based therapeutic techniques to create a safe space for healing and growth.

### Why was this project created?
This project was built for the World's Largest AI Hackathon to demonstrate how AI can be used for therapeutic purposes. It addresses the real need for accessible mental health resources for young adults who have experienced significant trauma.

### How was this built?
The project was built primarily using [Bolt.new](https://bolt.new/), an AI-powered development environment. This allowed for rapid prototyping, iterative development, and seamless integration of complex AI services. Other tools used include OpenAI's "Project" feature (for keeping track and taking notes for the project), Cursor (for local debugging), and Windsurf (was interested in testing platform, very limited usage).

---

## 🛠️ Technical Setup

### How do I get started with development?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/moshehbenavraham/luminaris-quest.git
   cd luminaris-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then fill in your API keys in the `.env` file.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### What environment variables do I need?
Check the `.env.example` file for the complete list. You'll need API keys for:
- Supabase (for backend and authentication)
- OpenAI (for narrative generation) - *Planned*
- Leonardo.AI (for image generation) - *Planned*
- ElevenLabs (for voice synthesis) - *Planned*

### Why can't I see my environment variables?
Make sure you:
1. Copied `.env.example` to `.env`
2. Added your actual API keys to `.env`
3. Restarted your development server after editing `.env`
4. Used the `VITE_` prefix for frontend environment variables

### How do I fix the Rollup build error?
If you encounter `Cannot find module @rollup/rollup-linux-x64-gnu` error:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Or install the specific dependency: `npm install @rollup/rollup-linux-x64-gnu --save-optional`

---

## 🏗️ Development

### What's the current project structure?
```
src/
├── components/       # React components organized by feature
│   ├── ui/          # Shadcn/UI base components
│   ├── layout/      # Layout components (Navbar, Sidebar, Footer)
│   ├── auth/        # Authentication components
│   └── *.tsx        # Feature-specific components
├── pages/           # Route components (extracted from App.tsx)
│   ├── Home.tsx     # Landing page with authentication
│   ├── Adventure.tsx # Main gameplay interface
│   ├── Progress.tsx  # Progress tracking and journal display
│   ├── Profile.tsx   # User profile management
│   └── Legal.tsx     # Legal information and compliance
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and providers
├── store/           # State management (Zustand)
├── engine/          # Game logic and scene engine
└── integrations/    # External service integrations
```

### What coding standards should I follow?
- **TypeScript:** Strict mode enabled (see `tsconfig.*.json`)
- **Styling:** Tailwind CSS only (no separate CSS files)
- **Components:** Keep under 500 lines, follow atomic design principles
- **Code Quality:** Use ESLint and Prettier (see `eslint.config.js`, `.prettierrc`)
- **Testing:** Write tests for new features
- **Documentation:** Add JSDoc comments for complex functions

### How do I add a new component?
1. Create the component in the appropriate `src/components/` subdirectory
2. Follow the atomic design pattern (atoms, molecules, organisms)
3. Use TypeScript with proper prop interfaces
4. Style with Tailwind CSS classes
5. Add to the component map in `docs/COMPONENT_MAP.md` if it's a major feature

### What UI library does this use?
We use [Shadcn/UI](https://ui.shadcn.com/) components built on top of Radix UI primitives, styled with Tailwind CSS. Check `components.json` for configuration.

---

## 🤖 AI Integrations

### Which AI services are integrated?
Currently planned integrations:
- **OpenAI:** Narrative generation and story progression (*Planned*)
- **Leonardo.AI:** Dynamic visual art generation (*Planned*)
- **ElevenLabs:** Voice synthesis for narration (*Planned*)
- **Suno:** Music generation (manually curated) (*Planned*)

### How do the AI features work?
The game will use AI to:
1. Generate personalized story content based on user choices
2. Create fantasy artwork that matches story moments
3. Provide immersive voice narration
4. Adapt the therapeutic content to individual needs

### Can I test without API keys?
Yes! The app includes fallback content and stub responses for development. The core gameplay mechanics, journal system, and progress tracking work without AI integrations.

---

## 🎮 Game Design

### What makes this therapeutic?
The game incorporates:
- Evidence-based therapeutic techniques
- Safe exploration of difficult emotions through journaling
- Resilience-building activities
- Choice-driven narrative that empowers users
- Fantasy metaphors for real-world challenges
- Milestone-based progress tracking

### What's the journal system?
The enhanced journal system features:
- **Full CRUD operations**: Create, read, update, and delete journal entries
- **Inline editing**: Edit entries without leaving the page
- **Visual distinction**: Different styles for milestone vs. learning entries
- **Edit history**: Track when entries were modified
- **Confirmation dialogs**: Prevent accidental deletions
- **Automatic prompts**: Journal entries triggered by milestones and learning moments

### Is this a replacement for therapy?
No. Luminari's Quest is designed as a supplemental tool to support healing and growth. It's not a replacement for professional mental health care.

### What age group is this for?
The game is designed for young adults (18-25) who have experienced parental loss and homelessness during their teenage years.

---

## 🚀 Deployment & Production

### How do I build for production?
```bash
npm run build
```

### How do I test the production build locally?
```bash
npm run preview
```

### Where is this deployed?
The project is configured for deployment on Netlify. Check `netlify.toml` for deployment configuration.

### What about environment variables in production?
Never commit your `.env` file! Set environment variables in your deployment platform (Netlify, Vercel, etc.). Keep `.env.example` updated with all required variables.

---

## 📜 Legal & Licensing

### What license does this use?
- **Code:** MIT License
- **Game Content:** Open Game License (OGL) and Open RPG Creative (ORC)
- See the `LICENSE` file and `licenses/` directory for details

### Can I use this commercially?
Check the specific license terms in the `LICENSE` file. The MIT license is generally permissive, but game content may have different restrictions.

### What about third-party content?
All third-party licenses are documented in `licenses/third-party.md`. We only use OGL/ORC compliant content to avoid Product Identity issues.

---

## 🤝 Contributing

### How can I contribute?
1. Read `CONTRIBUTING.md` for detailed guidelines
2. Check our [Code of Conduct](../CODE_OF_CONDUCT.md)
3. Look for issues labeled "good first issue"
4. Fork the repo and create a feature branch
5. Submit a pull request

### What areas need help?
Based on recent development priorities:
- **Supabase Integration**: Complete journal entry persistence
- **AI Features**: Implement OpenAI narrative generation
- **Enhanced UX**: Improve journal search and filtering
- **Performance**: Optimize bundle size and loading times
- **Testing**: Expand test coverage for new components
- **Accessibility**: Improve screen reader support

### What's not accepting contributions?
- Core game narrative/story changes
- Major architectural changes without discussion
- New AI service integrations without approval
- Therapeutic content (requires expert review)

---

## 🆘 Troubleshooting

### The app won't start
1. Make sure you ran `npm install`
2. Check that your Node.js version is compatible (see `package.json` engines)
3. Verify your `.env` file exists and has the required variables
4. Try deleting `node_modules` and running `npm install` again

### TypeScript/Build errors
1. Run `npm run build` to check for TypeScript errors
2. Ensure all imports are correct and files exist
3. Check that all component props have proper interfaces
4. Verify no circular imports exist
5. Make sure all variables are properly destructured from stores

### API integration issues
1. Verify your API keys are correct in `.env`
2. Check API rate limits and quotas
3. Look at browser console for specific error messages
4. Test with stub/fallback content first

### Journal system issues
1. Check browser console for state management errors
2. Verify Zustand store is properly hydrated
3. Clear local storage if experiencing persistence issues
4. Check that journal entries have unique IDs

### Performance issues
1. Check bundle size with `npm run build`
2. Use React DevTools to identify re-renders
3. Optimize images and assets
4. Consider code splitting for large components

---

## 🔗 Additional Resources

- **Project Repository:** [https://github.com/moshehbenavraham/luminaris-quest](https://github.com/moshehbenavraham/luminaris-quest)
- **Community:** [Skool Community](https://www.skool.com/ai-with-apex/about)
- **Bolt.new:** [https://bolt.new/](https://bolt.new/)
- **Component Documentation:** [docs/COMPONENT_MAP.md](COMPONENT_MAP.md)
- **Contributing Guide:** [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md)

---

## 📞 Getting Help

Still have questions? Here's how to get help:

1. **Check existing documentation** in the `docs/` folder
2. **Review the changelog** for recent updates
3. **Search existing issues** on GitHub
4. **Create a new issue** with detailed information
5. **Join our community** on Skool for discussions
6. **Read the source code** - it's well-documented!

---

*Built with [Bolt.new](https://bolt.new/) 🚀*

*Last updated: December 2024* 