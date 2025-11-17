# API Reference

**Navigation:** [← Back to Documentation Index](../INDEX.md)

Welcome to the Luminaris Quest API documentation! These documents provide comprehensive technical references for the codebase, including hooks, game engines, and component APIs.

---

## 📚 API Documentation

### Core API References

- **[API Index](index.md)** - Comprehensive API documentation overview
  - Component APIs
  - Type definitions
  - Interface documentation
  - Utility functions
  - Integration APIs

- **[Hooks API](hooks.md)** - Custom React hooks documentation
  - State management hooks
  - Combat system hooks
  - System utility hooks
  - UI interaction hooks
  - Complete type signatures
  - Usage examples and best practices

- **[Game Engine API](game-engine.md)** - Game engine function reference
  - Combat engine API
  - Scene engine API
  - Dice rolling system
  - Balance constants
  - Shadow manifestation system
  - Pure function signatures with examples

---

## 🎯 Quick Reference Guide

### Custom Hooks (10 Total)

**State Management Hooks (3):**
- `useGameStore` - Main Zustand store access
- `useGameStoreActions` - Store actions only (optimized)
- `useCombatState` - Combat-specific state slice

**Combat System Hooks (3):**
- `useCombat` - Main combat logic handler
- `useCombatActions` - Combat action executor (NEW system)
- `useCombatVisuals` - Visual effects and animations

**System Utility Hooks (2):**
- `useSupabaseQuery` - Database queries with caching
- `useLocalStorage` - Persistent local state

**UI Interaction Hooks (2):**
- `useKeyboardShortcuts` - Keyboard event handling
- `useMediaQuery` - Responsive breakpoint detection

See **[Hooks API](hooks.md)** for complete documentation.

---

### Game Engine Functions

**Combat Engine:**
```typescript
// Action resolution
resolveAction(action: CombatAction, state: CombatState): CombatResult
calculateDamage(baseValue: number, modifiers: Modifier[]): number
applyLightEffect(damage: number, lightLevel: number): number

// State management
updateCombatState(state: CombatState, result: CombatResult): CombatState
checkVictoryCondition(state: CombatState): boolean
```

**Scene Engine:**
```typescript
// Scene management
loadScene(sceneId: string): Scene
resolveChoice(choice: Choice, guardianTrust: number): Outcome
calculateGuardianTrustDelta(choice: Choice, outcome: Outcome): number
```

**Dice System:**
```typescript
// Dice rolling
rollDice(sides: number, count: number): DiceResult
rollWithAdvantage(sides: number): number
rollWithDisadvantage(sides: number): number
```

See **[Game Engine API](game-engine.md)** for complete documentation.

---

## 🔍 Finding What You Need

### For Component Development

**Looking for component props?**
→ See **[API Index](index.md)** - Component Props section

**Need to use a hook?**
→ See **[Hooks API](hooks.md)** - Full hook documentation with examples

**Working with the game engine?**
→ See **[Game Engine API](game-engine.md)** - Engine function reference

### For Testing

**Writing hook tests?**
→ See **[Hooks API](hooks.md)** - Testing Patterns section

**Testing game engine functions?**
→ See **[Game Engine API](game-engine.md)** - Each function has test examples

**Need testing utilities?**
→ See **[Testing Guide](../guides/testing.md)**

### For Understanding Data Flow

**How does state flow through the app?**
→ See **[State Management](../architecture/state-management.md)**

**How do combat actions work?**
→ See **[Combat System](../features/combat.md)** + **[Game Engine API](game-engine.md)**

**How are scenes processed?**
→ See **[Scene System](../features/scenes.md)** + **[Game Engine API](game-engine.md)**

---

## 📖 API Documentation Standards

All API documentation in this folder follows these standards:

### Type Signatures

Complete TypeScript signatures with full type information:

```typescript
function resolveAction(
  action: CombatAction,
  state: CombatState
): CombatResult
```

### Parameter Documentation

```typescript
/**
 * Resolves a combat action and returns the result
 * @param action - The combat action to resolve (STRIKE, DEFEND, EMBRACE, REFLECT)
 * @param state - Current combat state including HP, Light, and Shadow stats
 * @returns Combat result with damage dealt, effects applied, and state changes
 */
```

### Usage Examples

Real code examples from the actual implementation:

```typescript
// Example from src/features/combat/useCombat.ts
const result = resolveAction(
  { type: 'STRIKE', target: 'shadow' },
  combatState
);
```

### Testing Examples

Unit test examples for verification:

```typescript
// Example test
expect(calculateDamage(10, [])).toBe(10);
expect(calculateDamage(10, [{ type: 'multiply', value: 1.5 }])).toBe(15);
```

---

## 🔗 Related Documentation

**Architecture Documentation:**
- [Architecture Overview](../architecture/overview.md) - System design
- [Components](../architecture/components.md) - Component architecture
- [State Management](../architecture/state-management.md) - State design

**Feature Documentation:**
- [Combat System](../features/combat.md) - Combat feature overview
- [Scene System](../features/scenes.md) - Scene system overview
- [Journal System](../features/journal.md) - Journal feature
- [Guardian Trust](../features/guardian-trust.md) - Trust system

**Developer Guides:**
- [Getting Started](../guides/getting-started.md) - Setup and installation
- [Testing Guide](../guides/testing.md) - Testing practices
- [Contributing](../contributing/index.md) - Development guidelines

---

## 🎓 API Usage Best Practices

### Using Custom Hooks

**✅ DO:**
- Use specific hooks for targeted state access (`useCombatState` vs `useGameStore`)
- Subscribe only to needed state slices for performance
- Use action-only hooks when you don't need state values
- Follow hook rules (only in function components, top-level calls)

**❌ DON'T:**
- Subscribe to entire store if you only need one field
- Call hooks conditionally or in loops
- Use hooks in class components or regular functions
- Mutate state directly (always use provided actions)

### Using Game Engine Functions

**✅ DO:**
- Treat engine functions as pure (no side effects)
- Pass complete state objects (don't partially update)
- Validate inputs before calling engine functions
- Use returned values immutably

**❌ DON'T:**
- Mutate engine function arguments
- Assume engine functions handle invalid input
- Call engine functions directly from UI components (use hooks)
- Cache engine results incorrectly (state may change)

---

## 📊 API Coverage

**Current API Documentation:**
- ✅ 10/10 custom hooks documented
- ✅ All combat engine functions documented
- ✅ All scene engine functions documented
- ✅ All major component props documented
- ✅ Type definitions and interfaces included
- ✅ Usage examples for all APIs
- ✅ Testing patterns documented

**Documentation Accuracy:**
- ✅ All APIs verified against source code
- ✅ Type signatures match implementation
- ✅ Examples tested and working
- ✅ Line references included for traceability

---

## 🔄 API Versioning

**Current API Version:** v2.0

**Breaking Changes in v2.0:**
- New combat system with `useCombatActions` hook
- Legacy combat system deprecated (still available)
- Updated `CombatState` interface with new fields
- New `resolveAction` function signature

**Deprecated APIs:**
- Old combat hooks (use `useCombatActions` instead)
- Legacy scene resolution (use new scene engine)

See **[Roadmap](../contributing/roadmap.md)** for planned API changes.

---

## 💡 Contributing to API Documentation

When adding or changing APIs:

1. **Update the API documentation** in the same PR as the code change
2. **Include type signatures** with complete TypeScript types
3. **Add usage examples** with real code from the implementation
4. **Add testing examples** showing how to test the API
5. **Document breaking changes** clearly with migration guides
6. **Update this README** if adding new API categories

See **[Contributing Guidelines](../contributing/index.md)** for detailed instructions.

---

## 🆘 Need Help?

**Can't find the API you need?**
→ Search the codebase or check **[API Index](index.md)**

**API not working as documented?**
→ Report an issue or check **[Troubleshooting](../troubleshooting/)**

**Want to propose a new API?**
→ Follow **[Contributing Guidelines](../contributing/index.md)**

**Need to understand how an API fits into the system?**
→ See **[Architecture Overview](../architecture/overview.md)**

---

**Last Updated:** 2025-11-17
**Maintained By:** Luminaris Quest API Documentation Team
**API Version:** v2.0

