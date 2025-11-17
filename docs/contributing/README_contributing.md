# Contributing

**Navigation:** [← Back to Documentation Index](../INDEX.md)

Welcome to the Luminaris Quest contributing documentation! We're excited that you want to contribute to this therapeutic RPG project. This section contains everything you need to know about contributing to the project.

---

## 🚀 Quick Start for Contributors

### First Time Contributing?

1. **Read** [Contributing Guidelines](index.md) - Essential contribution rules and workflow
2. **Review** [Code of Conduct](code-of-conduct.md) - Community standards and expectations
3. **Check** [Roadmap](roadmap.md) - See what we're working on and what's planned
4. **Follow** [Security Guidelines](security.md) - Report vulnerabilities responsibly

### Ready to Code?

1. **Setup:** Follow [Getting Started Guide](../guides/getting-started.md)
2. **Pick a Task:** Browse [Roadmap](roadmap.md) or GitHub Issues
3. **Make Changes:** Follow our coding standards and patterns
4. **Test:** Run tests and ensure everything passes
5. **Submit:** Create a pull request following our PR template

---

## 📚 Contributing Documentation

### Core Documents

- **[Contributing Guidelines](index.md)** - Complete contribution guide
  - How to contribute code
  - Pull request process
  - Coding standards and conventions
  - Branch naming and commit messages
  - Review process
  - Getting help

- **[Code of Conduct](code-of-conduct.md)** - Community standards
  - Expected behavior
  - Unacceptable behavior
  - Enforcement and reporting
  - Scope and contact information

- **[Roadmap](roadmap.md)** - Development roadmap and task list
  - Current sprint tasks
  - Upcoming features
  - Long-term vision
  - Task priorities
  - Feature status

- **[Security Guidelines](security.md)** - Security practices
  - Reporting vulnerabilities
  - Security best practices
  - Secure coding guidelines
  - Security review process

---

## 💻 Types of Contributions

We welcome many types of contributions:

### Code Contributions

- **Bug Fixes:** Fix issues listed in GitHub Issues
- **New Features:** Implement features from the roadmap
- **Performance Improvements:** Optimize code for better performance
- **Refactoring:** Improve code quality and maintainability
- **Tests:** Add or improve test coverage

### Documentation Contributions

- **Fix Typos:** Correct spelling and grammar errors
- **Improve Clarity:** Make documentation easier to understand
- **Add Examples:** Provide code examples and tutorials
- **Update Outdated Info:** Keep documentation current with code
- **Translate:** Help translate documentation (future)

### Design Contributions

- **UI/UX Improvements:** Enhance user interface and experience
- **Accessibility:** Improve accessibility compliance
- **Visual Assets:** Create or improve graphics and animations
- **Design Systems:** Maintain and improve design consistency

### Community Contributions

- **Answer Questions:** Help others in Discussions or Issues
- **Write Tutorials:** Create guides and how-tos
- **Share Feedback:** Provide thoughtful feedback on proposals
- **Test Features:** Test pre-release features and report bugs
- **Spread the Word:** Share Luminaris Quest with others

---

## 🛠️ Development Workflow

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/luminaris-quest.git
cd luminaris-quest
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure Supabase credentials
# (See Getting Started Guide)

# Run development server
npm run dev
```

### 3. Create a Branch

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/what-you-are-documenting
```

### 4. Make Changes

- **Write Code:** Follow our coding standards
- **Write Tests:** Add tests for new functionality
- **Run Tests:** Ensure all tests pass (`npm test`)
- **Check Linting:** Fix any linting errors (`npm run lint`)
- **Test Manually:** Verify changes work as expected

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new combat action

- Implement PARRY action mechanics
- Add tests for PARRY action
- Update combat documentation"
```

### 6. Push & Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out the PR template completely
```

### 7. Code Review

- **Respond to Feedback:** Address reviewer comments promptly
- **Make Revisions:** Update code based on feedback
- **Keep Updated:** Rebase on main if needed
- **Be Patient:** Reviews may take time

### 8. Merge

Once approved, maintainers will merge your PR!

---

## 📋 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
function calculateDamage(base: number, modifier: number): number {
  return base + modifier;
}

// ❌ DON'T: Use any or implicit any
function calculateDamage(base, modifier) {
  return base + modifier;
}

// ✅ DO: Use interfaces for object types
interface CombatState {
  playerHP: number;
  shadowHP: number;
  lightLevel: number;
}

// ❌ DON'T: Use inline object types repeatedly
function updateCombat(state: { playerHP: number; shadowHP: number }) {
  // ...
}
```

### React Component Guidelines

```typescript
// ✅ DO: Use functional components with TypeScript
interface Props {
  name: string;
  onAction: (action: string) => void;
}

export const CombatButton: React.FC<Props> = ({ name, onAction }) => {
  return <button onClick={() => onAction(name)}>{name}</button>;
};

// ✅ DO: Use hooks for logic
export const Combat: React.FC = () => {
  const { state, actions } = useCombat();
  return <CombatDisplay state={state} actions={actions} />;
};

// ❌ DON'T: Put logic directly in components
export const Combat: React.FC = () => {
  const [hp, setHP] = useState(100);
  const handleAttack = () => {
    const damage = Math.floor(Math.random() * 10);
    setHP(hp - damage);
  };
  // ... lots of logic ...
};
```

### Testing Guidelines

```typescript
// ✅ DO: Write descriptive test names
describe('calculateDamage', () => {
  it('should return base damage when no modifiers applied', () => {
    expect(calculateDamage(10, 0)).toBe(10);
  });

  it('should apply positive modifiers correctly', () => {
    expect(calculateDamage(10, 5)).toBe(15);
  });
});

// ✅ DO: Test edge cases
it('should handle negative HP gracefully', () => {
  const result = updateHP(-50);
  expect(result).toBe(0);
});

// ✅ DO: Use arrange-act-assert pattern
it('should calculate damage with modifiers', () => {
  // Arrange
  const baseValue = 10;
  const modifiers = [{ type: 'multiply', value: 1.5 }];

  // Act
  const result = calculateDamage(baseValue, modifiers);

  // Assert
  expect(result).toBe(15);
});
```

---

## 🎯 Pull Request Guidelines

### PR Title Format

```
type(scope): brief description

Examples:
feat(combat): add PARRY action
fix(journal): resolve duplicate entry bug
docs(api): update hook documentation
test(combat): add integration tests
refactor(state): simplify store structure
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does and why.

## Changes
- List of specific changes made
- Each change on a new line
- Use bullet points

## Testing
How did you test these changes?
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Linting passes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No linting errors
- [ ] Commit messages follow conventions

## Related Issues
Closes #123
Relates to #456
```

---

## ✅ Code Review Checklist

When reviewing PRs, check:

**Code Quality:**
- [ ] Code is readable and well-structured
- [ ] TypeScript types are properly used
- [ ] No unnecessary complexity
- [ ] Follows DRY principle
- [ ] Error handling is appropriate

**Testing:**
- [ ] New code has test coverage
- [ ] Tests are meaningful and comprehensive
- [ ] All tests pass
- [ ] Edge cases are tested

**Documentation:**
- [ ] Code has JSDoc comments where needed
- [ ] Documentation files updated
- [ ] API changes documented
- [ ] README updated if needed

**Security:**
- [ ] No sensitive data in code
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] SQL injection prevented (using parameterized queries)

**Performance:**
- [ ] No obvious performance issues
- [ ] Efficient algorithms used
- [ ] No memory leaks
- [ ] Unnecessary re-renders avoided

---

## 🤝 Getting Help

### Where to Ask Questions

- **GitHub Discussions:** General questions and discussions
- **GitHub Issues:** Bug reports and feature requests
- **Discord** (if available): Real-time chat with community
- **Email:** For private or security-related inquiries

### Resources

- [Architecture Overview](../architecture/overview.md) - Understand the system
- [API Reference](../api/) - Code-level documentation
- [Testing Guide](../guides/testing.md) - How to write tests
- [User Guide](../guides/user-guide.md) - How the game works

---

## 🏆 Recognition

We value all contributions! Contributors are recognized:

- **Contributors List:** Listed in README.md
- **Release Notes:** Credited in changelog for significant contributions
- **Special Thanks:** Featured for major contributions
- **Maintainer Status:** Regular, high-quality contributors may become maintainers

---

## 🔒 Security & Privacy

### Reporting Security Issues

**⚠️ DO NOT report security vulnerabilities in public issues!**

Instead:
1. Email security contact (see [Security Guidelines](security.md))
2. Provide detailed description and reproduction steps
3. Wait for response before public disclosure
4. Follow responsible disclosure practices

See **[Security Guidelines](security.md)** for complete details.

---

## 📊 Contribution Metrics

We track (anonymized) contribution metrics:
- Pull requests submitted/merged
- Issues created/resolved
- Code review participation
- Documentation improvements
- Community support provided

These help us:
- Recognize active contributors
- Identify areas needing attention
- Guide project priorities
- Celebrate community growth

---

## 🌟 Best Practices

### Communication

- **Be Respectful:** Follow the Code of Conduct
- **Be Clear:** Provide context and details
- **Be Patient:** Maintainers are volunteers
- **Be Constructive:** Suggest solutions, not just problems
- **Be Collaborative:** Work together toward shared goals

### Code Contributions

- **Start Small:** Begin with small, focused changes
- **Ask First:** For large changes, discuss before implementing
- **Test Thoroughly:** Ensure changes work and don't break anything
- **Document Well:** Update docs with code changes
- **Follow Conventions:** Consistency makes code maintainable

### Documentation Contributions

- **Verify Accuracy:** Check against actual code
- **Be Comprehensive:** Cover all important details
- **Use Examples:** Show, don't just tell
- **Keep Updated:** Documentation should match current code
- **Be Clear:** Write for readers at different skill levels

---

## 📅 Release Cycle

**Versioning:** We use Semantic Versioning (SemVer)

- **Major (X.0.0):** Breaking changes
- **Minor (0.X.0):** New features, backward compatible
- **Patch (0.0.X):** Bug fixes, backward compatible

**Release Schedule:**
- **Patch releases:** As needed for critical bugs
- **Minor releases:** Every 4-6 weeks
- **Major releases:** 2-3 times per year

**Release Process:**
1. Feature freeze
2. Testing and bug fixes
3. Documentation updates
4. Release candidate
5. Final release

---

## 🎓 Learning Resources

**New to Contributing?**
- [First Contributions Guide](https://github.com/firstcontributions/first-contributions)
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)

**New to React/TypeScript?**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

**New to Testing?**
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](../guides/testing.md)

---

## 💌 Thank You!

Thank you for contributing to Luminaris Quest! Every contribution, no matter how small, helps make this therapeutic gaming experience better for everyone.

Your efforts help people:
- Explore difficult emotions safely
- Build resilience and coping skills
- Find support and connection
- Grow through play and reflection

**Together, we're creating something meaningful. Thank you for being part of it! ✨**

---

**Last Updated:** 2025-11-17
**Maintained By:** Luminaris Quest Core Team
**Community Size:** Growing! Join us!

