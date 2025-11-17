# Testing Guide

## Overview

Luminari's Quest maintains high quality through comprehensive testing strategies that ensure therapeutic effectiveness, accessibility compliance, and technical reliability. This guide covers all aspects of testing from unit tests to user acceptance testing.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Architecture](#testing-architecture)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Accessibility Testing](#accessibility-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Therapeutic Validation](#therapeutic-validation)
10. [Continuous Integration](#continuous-integration)
11. [Test Data Management](#test-data-management)
12. [Troubleshooting](#troubleshooting)

## Testing Philosophy

### Core Principles

1. **Therapeutic Safety First**: All tests must validate that features support user emotional safety
2. **Accessibility by Default**: Every component must pass WCAG 2.1 AA compliance tests
3. **Performance Matters**: Critical user paths must meet performance budgets
4. **Real User Scenarios**: Tests should reflect actual therapeutic use cases
5. **Fail Fast**: Tests should catch issues early in the development cycle

### Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← User journeys, critical paths
                    │   (Few, Slow)   │
                ┌───┴─────────────────┴───┐
                │  Integration Tests      │ ← Component interactions
                │  (Some, Medium)         │
            ┌───┴─────────────────────────┴───┐
            │      Unit Tests                 │ ← Functions, components
            │      (Many, Fast)               │
        ┌───┴─────────────────────────────────┴───┐
        │         Static Analysis                 │ ← TypeScript, ESLint
        │         (Continuous)                    │
        └─────────────────────────────────────────┘
```

## Testing Architecture

### Test Framework Stack

- **Test Runner**: Vitest 3.2+ (fast, modern alternative to Jest)
- **React Testing**: React Testing Library (user-centric testing)
- **Accessibility**: Jest-axe (automated WCAG compliance)
- **Mocking**: Vitest built-in mocks and MSW for API mocking
- **Coverage**: V8 coverage provider (built into Vitest)

### Test Environment Setup

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
```

### Test File Organization

```
src/
├── __tests__/                    # Test files
│   ├── components/              # Component tests
│   ├── hooks/                   # Hook tests
│   ├── engine/                  # Game logic tests
│   ├── integration/             # Integration tests
│   ├── accessibility/           # Accessibility tests
│   ├── performance/             # Performance tests
│   └── test-utils.tsx          # Testing utilities
├── components/
│   └── Component.test.tsx       # Co-located component tests
└── hooks/
    └── useHook.test.ts         # Co-located hook tests
```

## Test Types

### Unit Tests

#### Component Testing
```typescript
// Example: Component unit test
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsBar } from '@/components/StatsBar';

describe('StatsBar', () => {
  it('displays trust level correctly', () => {
    render(<StatsBar trust={75} />);
    
    expect(screen.getByText('Trust: 75')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('shows milestone achievement at trust level 75', () => {
    render(<StatsBar trust={75} />);
    
    expect(screen.getByText(/milestone achieved/i)).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// Example: Hook unit test
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCombat } from '@/hooks/useCombat';

describe('useCombat', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCombat());
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.enemy).toBeNull();
    expect(result.current.turn).toBe(0);
  });

  it('starts combat correctly', () => {
    const { result } = renderHook(() => useCombat());
    
    act(() => {
      result.current.startCombat('WHISPER_OF_DOUBT');
    });
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.enemy).toBeDefined();
  });
});
```

#### Engine Testing
```typescript
// Example: Game logic unit test
import { describe, it, expect } from 'vitest';
import { calculateIlluminateDamage, canPerformAction } from '@/engine/combat-engine';

describe('Combat Engine', () => {
  describe('calculateIlluminateDamage', () => {
    it('calculates base damage correctly', () => {
      expect(calculateIlluminateDamage(0)).toBe(3); // Base damage
      expect(calculateIlluminateDamage(20)).toBe(8); // Base + trust bonus
    });

    it('scales with guardian trust', () => {
      expect(calculateIlluminateDamage(40)).toBe(13);
      expect(calculateIlluminateDamage(80)).toBe(23);
    });
  });

  describe('canPerformAction', () => {
    it('validates ILLUMINATE action requirements', () => {
      const state = { resources: { lp: 5, sp: 0 }, healingBlocked: 0 };
      const result = canPerformAction('ILLUMINATE', state, 50);
      
      expect(result.canPerform).toBe(true);
    });

    it('blocks ILLUMINATE when insufficient LP', () => {
      const state = { resources: { lp: 1, sp: 0 }, healingBlocked: 0 };
      const result = canPerformAction('ILLUMINATE', state, 50);
      
      expect(result.canPerform).toBe(false);
      expect(result.reason).toBe('Not enough Light Points');
    });
  });
});
```

### Integration Tests

#### Component Integration
```typescript
// Example: Component integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Adventure } from '@/pages/Adventure';
import { GameStoreProvider } from '@/store/game-store';

describe('Adventure Page Integration', () => {
  it('completes full scene interaction flow', async () => {
    render(
      <GameStoreProvider>
        <Adventure />
      </GameStoreProvider>
    );

    // Scene should be displayed
    expect(screen.getByText(/worried merchant/i)).toBeInTheDocument();

    // Make a choice
    fireEvent.click(screen.getByText(/offer immediate help/i));

    // Roll dice
    fireEvent.click(screen.getByText(/roll dice/i));

    // Verify outcome
    await waitFor(() => {
      expect(screen.getByText(/your words of comfort/i)).toBeInTheDocument();
    });

    // Verify trust increase
    expect(screen.getByText(/trust.*increased/i)).toBeInTheDocument();
  });
});
```

#### Combat System Integration
```typescript
// Example: Combat integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CombatOverlay } from '@/components/combat/CombatOverlay';
import { GameStoreProvider } from '@/store/game-store';

describe('Combat System Integration', () => {
  it('executes complete combat turn', async () => {
    render(
      <GameStoreProvider>
        <CombatOverlay />
      </GameStoreProvider>
    );

    // Start combat
    fireEvent.click(screen.getByText(/start combat/i));

    // Use ILLUMINATE action
    fireEvent.click(screen.getByText(/illuminate/i));

    // Verify action execution
    await waitFor(() => {
      expect(screen.getByText(/you illuminate/i)).toBeInTheDocument();
    });

    // Verify resource consumption
    expect(screen.getByText(/light points.*8/i)).toBeInTheDocument();
  });
});
```

### End-to-End Tests

#### Critical User Journeys
```typescript
// Example: E2E test (using Playwright or similar)
import { test, expect } from '@playwright/test';

test('complete therapeutic journey', async ({ page }) => {
  // Start the application
  await page.goto('/');

  // Sign up for new account
  await page.click('[data-testid="sign-up-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'securepassword');
  await page.click('[data-testid="submit-button"]');

  // Navigate to adventure
  await page.click('[data-testid="adventure-link"]');

  // Complete first scene
  await page.click('[data-testid="bold-choice"]');
  await page.click('[data-testid="roll-dice"]');
  
  // Verify trust increase
  await expect(page.locator('[data-testid="trust-level"]')).toContainText('13');

  // Complete milestone journal
  await page.click('[data-testid="journal-modal-open"]');
  await page.fill('[data-testid="journal-content"]', 'My first reflection...');
  await page.click('[data-testid="save-journal"]');

  // Verify journal saved
  await page.goto('/progress');
  await expect(page.locator('[data-testid="journal-entry"]')).toContainText('My first reflection');
});
```

## Running Tests

### Command Reference

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- StatsBar.test.tsx

# Run tests matching pattern
npm test -- --grep "combat"

# Run tests in specific directory
npm test -- src/__tests__/components/

# Run accessibility tests only
npm test -- --grep "accessibility"

# Run performance tests only
npm test -- --grep "performance"
```

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Writing Tests

### Test Structure Guidelines

#### AAA Pattern (Arrange, Act, Assert)
```typescript
describe('Component', () => {
  it('should do something when condition is met', () => {
    // Arrange - Set up test data and environment
    const props = { trust: 50, onUpdate: vi.fn() };
    
    // Act - Perform the action being tested
    render(<Component {...props} />);
    fireEvent.click(screen.getByRole('button'));
    
    // Assert - Verify the expected outcome
    expect(props.onUpdate).toHaveBeenCalledWith(51);
  });
});
```

#### Test Naming Conventions
- **Describe blocks**: Use the component/function name
- **Test cases**: Use "should [expected behavior] when [condition]"
- **Be specific**: Describe the exact scenario being tested

#### Test Data Management
```typescript
// test-utils.tsx
export const createMockGameState = (overrides = {}) => ({
  guardianTrust: 50,
  lightPoints: 10,
  shadowPoints: 5,
  currentSceneIndex: 0,
  isInCombat: false,
  ...overrides,
});

export const createMockScene = (overrides = {}) => ({
  id: 'test-scene',
  type: 'social' as const,
  title: 'Test Scene',
  text: 'Test scene description',
  dc: 12,
  successText: 'Success!',
  failureText: 'Failure!',
  choices: {
    bold: 'Bold choice',
    cautious: 'Cautious choice',
  },
  ...overrides,
});
```

### Mocking Strategies

#### Supabase Mocking
```typescript
// __mocks__/supabase.ts
export const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

#### Game Store Mocking
```typescript
// Mock game store for isolated component testing
const mockGameStore = {
  guardianTrust: 50,
  setGuardianTrust: vi.fn(),
  executeCombatAction: vi.fn(),
  addJournalEntry: vi.fn(),
  // ... other store methods
};

vi.mock('@/store/game-store', () => ({
  useGameStore: () => mockGameStore,
}));
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
// Example: Accessibility test
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { CombatOverlay } from '@/components/combat/CombatOverlay';

expect.extend(toHaveNoViolations);

describe('CombatOverlay Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<CombatOverlay />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    render(<CombatOverlay />);
    
    // Test tab order
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex');
    });
  });

  it('should have proper ARIA labels', () => {
    render(<CombatOverlay />);
    
    expect(screen.getByRole('main')).toHaveAttribute('aria-label');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow');
  });
});
```

### Manual Accessibility Testing

#### Screen Reader Testing
1. **NVDA** (Windows): Test with NVDA screen reader
2. **JAWS** (Windows): Test with JAWS screen reader
3. **VoiceOver** (macOS): Test with built-in VoiceOver
4. **Orca** (Linux): Test with Orca screen reader

#### Keyboard Navigation Testing
```typescript
// Example: Keyboard navigation test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

describe('Keyboard Navigation', () => {
  it('should navigate through combat actions with Tab', async () => {
    const user = userEvent.setup();
    render(<CombatOverlay />);
    
    // Tab through actions
    await user.tab();
    expect(screen.getByText('Illuminate')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByText('Reflect')).toHaveFocus();
    
    // Test Enter key activation
    await user.keyboard('{Enter}');
    expect(screen.getByText(/you illuminate/i)).toBeInTheDocument();
  });
});
```

## Performance Testing

### Performance Test Examples

```typescript
// Example: Performance test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Adventure } from '@/pages/Adventure';

describe('Adventure Performance', () => {
  it('should render within performance budget', () => {
    const startTime = performance.now();
    
    render(<Adventure />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should not cause memory leaks', () => {
    const { unmount } = render(<Adventure />);
    
    // Simulate user interactions
    // ... test interactions
    
    // Cleanup
    unmount();
    
    // Check for memory leaks (simplified)
    expect(document.querySelectorAll('[data-testid]')).toHaveLength(0);
  });
});
```

### Bundle Size Testing

```typescript
// scripts/test-bundle-size.js
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';

const BUNDLE_SIZE_LIMIT = 500 * 1024; // 500KB

const bundleContent = readFileSync('dist/assets/index.js');
const gzippedSize = gzipSync(bundleContent).length;

if (gzippedSize > BUNDLE_SIZE_LIMIT) {
  throw new Error(`Bundle size ${gzippedSize} exceeds limit ${BUNDLE_SIZE_LIMIT}`);
}

console.log(`Bundle size: ${gzippedSize} bytes (within limit)`);
```

## Security Testing

### Input Validation Testing

```typescript
// Example: Security test
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JournalModal } from '@/components/JournalModal';

describe('Journal Security', () => {
  it('should sanitize user input', () => {
    render(<JournalModal isOpen={true} onClose={vi.fn()} />);
    
    const maliciousInput = '<script>alert("xss")</script>';
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: maliciousInput } });
    
    // Verify script tags are not rendered
    expect(document.querySelector('script')).toBeNull();
  });

  it('should validate input length', () => {
    render(<JournalModal isOpen={true} onClose={vi.fn()} />);
    
    const longInput = 'a'.repeat(10001); // Exceeds 10000 char limit
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: longInput } });
    
    expect(screen.getByText(/content too long/i)).toBeInTheDocument();
  });
});
```

## Therapeutic Validation

### Therapeutic Content Testing

```typescript
// Example: Therapeutic validation test
import { describe, it, expect } from 'vitest';
import { scenes } from '@/engine/scene-engine';

describe('Therapeutic Content Validation', () => {
  it('should not contain triggering language', () => {
    const triggeringWords = ['suicide', 'self-harm', 'kill yourself'];
    
    scenes.forEach(scene => {
      triggeringWords.forEach(word => {
        expect(scene.text.toLowerCase()).not.toContain(word);
        expect(scene.successText.toLowerCase()).not.toContain(word);
        expect(scene.failureText.toLowerCase()).not.toContain(word);
      });
    });
  });

  it('should provide positive reinforcement', () => {
    scenes.forEach(scene => {
      // Success text should be encouraging
      const positiveWords = ['growth', 'progress', 'strength', 'wisdom'];
      const hasPositiveLanguage = positiveWords.some(word => 
        scene.successText.toLowerCase().includes(word)
      );
      
      expect(hasPositiveLanguage).toBe(true);
    });
  });

  it('should offer hope in failure scenarios', () => {
    scenes.forEach(scene => {
      // Failure text should offer learning opportunities
      const hopefulWords = ['learn', 'try', 'grow', 'next time'];
      const hasHopefulLanguage = hopefulWords.some(word => 
        scene.failureText.toLowerCase().includes(word)
      );
      
      expect(hasHopefulLanguage).toBe(true);
    });
  });
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run accessibility tests
      run: npm run test:a11y
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Build application
      run: npm run build
```

### Quality Gates

```typescript
// vitest.config.ts - Coverage thresholds
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Stricter thresholds for critical components
        'src/engine/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/components/combat/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
});
```

## Test Data Management

### Test Database Setup

```typescript
// test-setup/database.ts
import { createClient } from '@supabase/supabase-js';

export const setupTestDatabase = async () => {
  const testSupabase = createClient(
    process.env.VITE_TEST_SUPABASE_URL!,
    process.env.VITE_TEST_SUPABASE_ANON_KEY!
  );

  // Clean up test data
  await testSupabase.from('journal_entries').delete().neq('id', '');
  await testSupabase.from('game_states').delete().neq('user_id', '');

  return testSupabase;
};

export const teardownTestDatabase = async () => {
  // Cleanup after tests
  const testSupabase = createClient(
    process.env.VITE_TEST_SUPABASE_URL!,
    process.env.VITE_TEST_SUPABASE_ANON_KEY!
  );

  await testSupabase.from('journal_entries').delete().neq('id', '');
  await testSupabase.from('game_states').delete().neq('user_id', '');
};
```

### Mock Data Factories

```typescript
// test-utils/factories.ts
import { faker } from '@faker-js/faker';

export const createMockUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  created_at: faker.date.past().toISOString(),
});

export const createMockJournalEntry = (overrides = {}) => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['milestone', 'learning']),
  trust_level: faker.number.int({ min: 0, max: 100 }),
  content: faker.lorem.paragraphs(2),
  title: faker.lorem.sentence(),
  tags: faker.helpers.arrayElements(['growth', 'reflection', 'challenge'], 2),
  is_edited: false,
  created_at: faker.date.past().toISOString(),
  ...overrides,
});
```

## Troubleshooting

### Common Test Issues

#### Tests Failing Randomly
```typescript
// Problem: Race conditions in async tests
// Solution: Use proper async/await and waitFor

// ❌ Bad
it('should update state', () => {
  fireEvent.click(button);
  expect(screen.getByText('Updated')).toBeInTheDocument();
});

// ✅ Good
it('should update state', async () => {
  fireEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

#### Mock Not Working
```typescript
// Problem: Mock not being applied
// Solution: Ensure mock is hoisted and properly configured

// ❌ Bad - Mock inside test
it('should work', () => {
  vi.mock('@/store/game-store');
  // Test code
});

// ✅ Good - Mock at module level
vi.mock('@/store/game-store', () => ({
  useGameStore: () => mockStore,
}));

describe('Component', () => {
  it('should work', () => {
    // Test code
  });
});
```

#### Memory Leaks in Tests
```typescript
// Problem: Components not properly cleaned up
// Solution: Use cleanup and proper unmounting

afterEach(() => {
  cleanup(); // React Testing Library cleanup
  vi.clearAllMocks(); // Clear mock calls
});
```

### Debugging Tests

#### Debug Test Output
```bash
# Run tests with debug output
npm test -- --reporter=verbose

# Run single test with debugging
npm test -- --grep "specific test" --reporter=verbose

# Debug with browser
npm test -- --ui
```

#### Test Debugging Tools
```typescript
// Debug component state
import { screen, debug } from '@testing-library/react';

it('should debug component', () => {
  render(<Component />);
  
  // Print current DOM
  debug();
  
  // Print specific element
  debug(screen.getByRole('button'));
  
  // Use queries to inspect state
  screen.logTestingPlaygroundURL();
});
```

---

*This testing guide is updated regularly to reflect best practices and new testing strategies. Last updated: December 2024*

