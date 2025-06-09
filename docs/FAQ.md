# Frequently Asked Questions (FAQ)

## 🌟 About Luminari's Quest

### What is Luminari's Quest?
**Luminari's Quest** is a therapeutic, AI-powered interactive RPG adventure designed to help young adults process trauma from losing parents and experiencing homelessness during their teenage years. The game combines fantasy storytelling with evidence-based therapeutic techniques to create a safe space for healing and growth.

### Why was this project created?
This project was built for the World's Largest AI Hackathon to demonstrate how AI can be used for therapeutic purposes. It addresses the real need for accessible mental health resources for young adults who have experienced significant trauma.

### How was this built?
The project was built primarily using [Bolt.new](https://bolt.new/), an AI-powered development environment. This allowed for rapid prototyping, iterative development, and seamless integration of complex AI services.  Other tools used include OpenAI's "Project" feature (for keeping track and taking notes for the project), Cursor (for local debugging), and Windsurf (was interested in testing platform, very limited usage).

---

## 🛠️ Technical Setup

### How do I get started with development?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_ORG/luminari-quest.git
   cd luminari-quest
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
- OpenAI (for narrative generation)
- Leonardo.AI (for image generation)
- ElevenLabs (for voice synthesis)
- Supabase (for backend and authentication)

### Why can't I see my environment variables?
Make sure you:
1. Copied `.env.example` to `.env`
2. Added your actual API keys to `.env`
3. Restarted your development server after editing `.env`
4. Used the `VITE_` prefix for frontend environment variables

---

## 🏗️ Development

### What's the project structure?
- `src/components/` - React components organized by feature
- `src/pages/` - Route components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and providers
- `src/store/` - State management (Zustand)
- `src/integrations/` - External service integrations
- `docs/` - Documentation files
- `.bolt/` - Bolt.new configuration and prompts

### What coding standards should I follow?
- **TypeScript:** Strict mode enabled (see `tsconfig.*.json`)
- **Styling:** Tailwind CSS only (no separate CSS files)
- **Components:** Keep under 250 lines, follow atomic design principles
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
- **OpenAI:** Narrative generation and story progression
- **Leonardo.AI:** Dynamic visual art generation
- **ElevenLabs:** Voice synthesis for narration
- **Suno:** Music generation (manually curated)

### How do the AI features work?
The game uses AI to:
1. Generate personalized story content based on user choices
2. Create fantasy artwork that matches story moments
3. Provide immersive voice narration
4. Adapt the therapeutic content to individual needs

### Can I test without API keys?
Yes! The app includes fallback content and stub responses for development. However, you'll need real API keys to test the full AI functionality.

---

## 🎮 Game Design

### What makes this therapeutic?
The game incorporates:
- Evidence-based therapeutic techniques
- Safe exploration of difficult emotions
- Resilience-building activities
- Choice-driven narrative that empowers users
- Fantasy metaphors for real-world challenges

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
We especially welcome contributions in:
- Accessibility improvements
- Performance optimization
- Documentation
- Testing
- Bug fixes

### What's not accepting contributions?
- Core game narrative/story changes
- Major architectural changes
- New AI service integrations
- Therapeutic content (requires expert review)

---

## 🆘 Troubleshooting

### The app won't start
1. Make sure you ran `npm install`
2. Check that your Node.js version is compatible (see `package.json` engines)
3. Verify your `.env` file exists and has the required variables
4. Try deleting `node_modules` and running `npm install` again

### Build errors
1. Run `npm run lint` to check for code issues
2. Ensure all TypeScript errors are resolved
3. Check that all imports are correct
4. Verify environment variables are properly prefixed with `VITE_`

### API integration issues
1. Verify your API keys are correct in `.env`
2. Check API rate limits and quotas
3. Look at browser console for specific error messages
4. Test with stub/fallback content first

### Performance issues
1. Check bundle size with `npm run build`
2. Use React DevTools to identify re-renders
3. Optimize images and assets
4. Consider code splitting for large components

---

## 🔗 Additional Resources

- **Project Repository:** [https://github.com/moshehbenavraham/luminaris-quest]
- **Community:** [Skool Community](https://www.skool.com/ai-with-apex/about)
- **Bolt.new:** [https://bolt.new/](https://bolt.new/)
- **Component Documentation:** [docs/COMPONENT_MAP.md](COMPONENT_MAP.md)
- **Contributing Guide:** [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📞 Getting Help

Still have questions? Here's how to get help:

1. **Check existing documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** on Skool for discussions
5. **Read the source code** - it's well-documented!

---

*Built with [Bolt.new](https://bolt.new/) 🚀*

*Last updated: June 2025* 