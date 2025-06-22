import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Clean up DOM after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});

