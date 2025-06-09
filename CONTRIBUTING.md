# Contributing to Luminari's Quest

Welcome! 🎉 We're excited you want to contribute to **Luminari's Quest**, a therapeutic, AI-powered RPG adventure **built primarily with Bolt.new** for the World's Largest AI Hackathon.

This guide will help you get started, set expectations for quality and collaboration, and ensure your contribution experience is positive and productive.

---

## 🛠 Project Setup

**Built With:**  
- [Bolt.new](https://bolt.new/) (main development, code generation, and UI composition)
- React, TypeScript, Tailwind CSS, Shadcn/UI
- Supabase, Netlify Functions
- OpenAI, Leonardo.AI, ElevenLabs, Suno (integrations)

**Quickstart:**
1. **Clone the repo:**  
   ```bash
   git clone https://github.com/YOUR_ORG/luminari-quest.git
   cd luminari-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in required API keys and configuration

4. **Start development server:**
   ```bash
   npm run dev
   ```

---

## 📝 Contributing Guidelines

1. **Fork & Branch:**
   - Fork the repository
   - Create a feature branch: `feature/your-feature-name`

2. **Code Style:**
   - Follow TypeScript strict mode (see `tsconfig.*.json`)
   - Use Tailwind classes (no separate CSS, see `tailwind.config.ts`)
   - Follow atomic design principles (detailed in `.bolt/prompt`)
   - Keep components small and focused (<250 lines)
   - Use ESLint/Prettier standards (see `eslint.config.js`, `.prettierrc`)
   - Reference `.cursor/rules/` for IDE-specific component guidelines

3. **Testing:**
   - Write tests for new features
   - Ensure existing tests pass
   - Test accessibility (a11y)

4. **Commit Messages:**
   - Use clear, descriptive messages
   - Reference issue numbers
   - Keep commits atomic and focused

5. **Documentation:**
   - Update README.md if needed
   - Add JSDoc comments
   - Document new features
   - Reference `docs/COMPONENT_MAP.md` for component relationships
   - Check `licenses/third-party.md` when adding dependencies

6. **Pull Requests:**
   - Create PR against `main`
   - Fill out PR template
   - Request review
   - Address feedback promptly

---

## 🎯 Focus Areas

We especially welcome contributions in these areas:

1. **Accessibility Improvements**
   - Screen reader support
   - Keyboard navigation
   - Color contrast
   - ARIA attributes

2. **Performance Optimization**
   - Bundle size reduction
   - Load time improvements
   - Memory usage optimization

3. **Documentation**
   - Code comments
   - Setup guides
   - Architecture docs

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance benchmarks

---

## 🚫 Out of Scope

Please note that some areas are currently not accepting contributions:

- Core game narrative/story changes
- Major architectural changes
- New AI service integrations
- Changes to therapeutic content (requires expert review)

---

## 📜 License & Legal

- Code is MIT Licensed
- Game mechanics use OGL/ORC
- See LICENSE file for details

---

## 🤝 Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md). We're committed to providing a welcoming, inclusive, and harassment-free experience for everyone.

---

## 🙋‍♀️ Getting Help

- Create an issue for bugs/features
- Join our Skool community: https://www.skool.com/ai-with-apex/about
- Check existing documentation
- Read our [FAQ](docs/FAQ.md)

---

Thank you for contributing to Luminari's Quest! Together, we're building something meaningful that can help people heal and grow. 💫

*Built with [Bolt.new](https://bolt.new/)*