# Troubleshooting

**Navigation:** [← Back to Documentation Index](../INDEX.md)

Welcome to the Luminaris Quest troubleshooting section! Find help, solutions to common problems, and debugging guides here.

---

## 🆘 Quick Help

### Having an Issue?

**Step 1:** Check if it's a common issue in **[FAQ](faq.md)**  
**Step 2:** Look for your error in **[Common Errors](common-errors.md)**  
**Step 3:** Use the **[Debugging Guide](debugging.md)** to investigate  
**Step 4:** Still stuck? See [Getting More Help](#getting-more-help) below

---

## 📚 Troubleshooting Documentation

### Core Resources

- **[FAQ](faq.md)** - Frequently Asked Questions
  - Installation and setup questions
  - Database and Supabase issues
  - Authentication problems
  - Game feature questions
  - Deployment concerns
  - Merged content from Supabase Troubleshooting Guide

- **[Common Errors](common-errors.md)** - Error messages and solutions
  - Build errors and solutions
  - Runtime errors (database, hydration, state)
  - Combat system errors
  - Performance issues
  - Testing and deployment errors
  - Step-by-step diagnostic checklist

- **[Debugging Guide](debugging.md)** - How to debug issues
  - Browser DevTools (Console, Network, Application)
  - React DevTools and Zustand DevTools
  - State debugging techniques
  - Combat and database debugging
  - Performance profiling
  - Test-driven debugging approach

---

## 🔍 Quick Diagnostic Checklist

Before diving deep, try these quick checks:

### Environment Issues

```bash
# 1. Check Node.js version (should be 18+)
node --version

# 2. Check npm version
npm --version

# 3. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Check environment variables
cat .env.local  # Make sure all required vars are set

# 5. Restart dev server
npm run dev
```

### Database Issues

```bash
# 1. Check Supabase connection
# Open browser console and look for connection errors

# 2. Verify Supabase credentials in .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Check Supabase project status
# Visit https://app.supabase.com and check if project is running

# 4. Check Row Level Security policies
# May need to disable RLS temporarily for debugging
```

### Build/Runtime Issues

```bash
# 1. Run linter
npm run lint

# 2. Run type checker
npm run type-check  # If available, or tsc --noEmit

# 3. Check for console errors
# Open browser DevTools Console tab

# 4. Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# 5. Run tests
npm test
```

---

## 🎯 Issue Categories

### Installation & Setup

**Common Issues:**
- Node.js version incompatibility
- Package installation failures
- Environment variable configuration
- Supabase setup problems

**Solutions:** See [FAQ - Installation Section](faq.md#installation--setup)

### Database & Authentication

**Common Issues:**
- Supabase connection errors
- Authentication failures
- Row Level Security blocking queries
- Data not syncing

**Solutions:** See [FAQ - Database Section](faq.md#database--supabase) and [Common Errors - Database](common-errors.md#database-errors)

### Game Features

**Common Issues:**
- Combat actions not working
- Scenes not loading
- Journal entries not saving
- Guardian Trust not updating

**Solutions:** See [FAQ - Game Features](faq.md#game-features) and [Common Errors - Combat](common-errors.md#combat-system-errors)

### Performance

**Common Issues:**
- Slow page loads
- Laggy UI interactions
- High memory usage
- Battery drain on mobile

**Solutions:** See [Common Errors - Performance](common-errors.md#performance-issues) and [Debugging Guide - Performance](debugging.md#performance-profiling)

### Testing & Development

**Common Issues:**
- Tests failing
- Hot reload not working
- Type errors
- Linting errors

**Solutions:** See [Common Errors - Testing](common-errors.md#testing-errors) and [Testing Guide](../guides/testing.md)

### Deployment

**Common Issues:**
- Build failures in CI/CD
- Environment variable problems
- Supabase connection in production
- CORS errors

**Solutions:** See [Common Errors - Deployment](common-errors.md#deployment-errors) and [Deployment Guide](../guides/deployment.md)

---

## 🛠️ Debugging Tools

### Browser DevTools

**Console:** View errors, warnings, and logs
- `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
- Look for red error messages
- Check for network request failures

**Network Tab:** Debug API calls
- Monitor Supabase requests
- Check request/response payloads
- Verify authentication headers

**Application Tab:** Inspect storage
- Local Storage: Check persisted state
- Session Storage: Check temporary state
- IndexedDB: Check Supabase cache

See **[Debugging Guide - Browser DevTools](debugging.md#browser-devtools)** for complete tutorial.

### React DevTools

**Component Tree:** Inspect component hierarchy
**Props & State:** View component data
**Profiler:** Measure render performance

Installation: [React DevTools Browser Extension](https://react.dev/learn/react-developer-tools)

See **[Debugging Guide - React DevTools](debugging.md#react-devtools)** for usage.

### Zustand DevTools

**State Inspector:** View entire Zustand store
**Time Travel:** Replay state changes
**Action Log:** See all state updates

See **[Debugging Guide - Zustand DevTools](debugging.md#zustand-devtools)** for setup and usage.

### Supabase Studio

**Database Browser:** View and edit tables
**SQL Editor:** Run custom queries
**Auth Management:** Manage users
**Logs:** View database logs

Access: [https://app.supabase.com](https://app.supabase.com)

See **[FAQ - Supabase](faq.md#database--supabase)** for common Supabase issues.

---

## 📊 Error Severity Levels

### Critical 🔴

**Impact:** Application completely broken
**Examples:** Can't start app, database completely inaccessible
**Priority:** Fix immediately
**Where to Look:** [Common Errors - Build Errors](common-errors.md#build-errors)

### High 🟠

**Impact:** Major feature not working
**Examples:** Combat not functioning, can't save journal entries
**Priority:** Fix within 24 hours
**Where to Look:** [Common Errors - Runtime Errors](common-errors.md#runtime-errors)

### Medium 🟡

**Impact:** Minor feature issue or performance problem
**Examples:** Slow loading, UI glitch, non-critical data not syncing
**Priority:** Fix within a week
**Where to Look:** [Common Errors - Performance Issues](common-errors.md#performance-issues)

### Low 🟢

**Impact:** Cosmetic or documentation issue
**Examples:** Typo, minor style issue, unclear error message
**Priority:** Fix when convenient
**Where to Look:** Consider contributing a fix! See [Contributing Guide](../contributing/index.md)

---

## 🔗 Related Documentation

### For Understanding the System

- [Architecture Overview](../architecture/overview.md) - System design
- [State Management](../architecture/state-management.md) - How state works
- [Database Schema](../architecture/database.md) - Database structure

### For Development

- [API Reference](../api/) - Code-level documentation
- [Hooks API](../api/hooks.md) - Custom hooks
- [Game Engine API](../api/game-engine.md) - Engine functions

### For Features

- [Combat System](../features/combat.md) - Combat implementation
- [Scene System](../features/scenes.md) - Scene implementation
- [Journal System](../features/journal.md) - Journal implementation
- [Guardian Trust](../features/guardian-trust.md) - Trust system

### For Contributors

- [Contributing Guide](../contributing/index.md) - How to contribute
- [Testing Guide](../guides/testing.md) - Testing practices
- [Deployment Guide](../guides/deployment.md) - Deployment procedures

---

## 📝 Reporting Issues

If you can't find a solution in our documentation, please report the issue:

### Before Reporting

1. **Search existing issues:** Your issue may already be reported
2. **Try to reproduce:** Can you consistently reproduce the issue?
3. **Gather information:** Error messages, browser/OS, reproduction steps
4. **Simplify:** Can you create a minimal reproduction case?

### Issue Report Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- Browser: [e.g. Chrome 119, Firefox 120]
- Node.js: [e.g. 18.17.0]
- npm: [e.g. 9.6.7]

## Error Messages
```
Paste any error messages or stack traces here
```

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

### Where to Report

- **Bugs:** [GitHub Issues](https://github.com/yourusername/luminaris-quest/issues)
- **Security:** [Security Email](../contributing/security.md) - DO NOT use public issues!
- **Questions:** [GitHub Discussions](https://github.com/yourusername/luminaris-quest/discussions)
- **Feature Requests:** [GitHub Issues with Feature Request template](https://github.com/yourusername/luminaris-quest/issues)

---

## 🎓 Learning to Debug

### Debugging Mindset

1. **Stay Calm:** Bugs are normal and solvable
2. **Be Systematic:** Follow a methodical approach
3. **Isolate the Problem:** Narrow down the cause
4. **Test Hypotheses:** Form theories and test them
5. **Document Findings:** Keep notes on what you try
6. **Ask for Help:** Don't struggle alone for too long

### Debugging Process

```
1. Reproduce the issue reliably
   ↓
2. Gather error messages and logs
   ↓
3. Form hypothesis about the cause
   ↓
4. Test hypothesis with debugging tools
   ↓
5. If correct: Fix the issue
   If wrong: Form new hypothesis
   ↓
6. Verify fix resolves the issue
   ↓
7. Add test to prevent regression
```

### Debugging Resources

- **[Debugging Guide](debugging.md)** - Complete debugging tutorial
- **[Common Errors](common-errors.md)** - Learn from common mistakes
- **[Testing Guide](../guides/testing.md)** - Test-driven debugging

---

## 💡 Pro Tips

### Quick Wins

1. **Hard Refresh:** Often fixes caching issues (Ctrl+Shift+R)
2. **Clear Storage:** Application tab → Clear all storage
3. **Incognito Mode:** Test without extensions and cached data
4. **Check Console:** Many issues show clear error messages
5. **Read Error Messages:** They often tell you exactly what's wrong

### Prevention

1. **Run Tests:** `npm test` before committing
2. **Run Linter:** `npm run lint` catches many issues
3. **Use TypeScript:** Catches type errors before runtime
4. **Check Build:** `npm run build` before deploying
5. **Read Documentation:** Understand how things work

### Performance

1. **Profile First:** Measure before optimizing
2. **Check Network:** Slow API calls?
3. **Monitor Memory:** Memory leaks?
4. **Use Production Build:** `npm run build` for performance testing
5. **Lighthouse Audit:** Check web vitals

---

## 🤝 Getting More Help

### Community Support

- **GitHub Discussions:** Ask questions and share knowledge
- **Discord** (if available): Real-time chat with community
- **Stack Overflow:** Tag with relevant technologies

### Professional Support

- **Maintainers:** Tag maintainers in issues for critical problems
- **Email:** For private or sensitive issues
- **Commercial Support:** (if available) For priority support

### Helping Others

- **Answer Questions:** Share your knowledge in Discussions
- **Improve Documentation:** Contribute fixes to these guides
- **Report Clear Issues:** Well-written reports help everyone
- **Share Solutions:** If you solve an issue, share how!

---

## 📈 Troubleshooting Statistics

We track common issues to improve the project:

- Most frequently reported errors
- Most viewed troubleshooting docs
- Resolution time for different issue types
- Common false alarms

This helps us:
- Improve error messages
- Add preventive measures
- Enhance documentation
- Guide development priorities

---

## ✨ Keep Calm and Debug On

Remember:

- **Every developer faces bugs** - You're not alone
- **Most bugs are simple** - Often just a typo or config issue
- **Documentation helps** - Use these guides as reference
- **Community helps** - Ask questions when stuck
- **You'll learn** - Debugging makes you a better developer

**Happy debugging! 🐛🔨**

---

**Last Updated:** 2025-11-17
**Maintained By:** Luminaris Quest Support Team
**Community Support:** Active and helpful!

