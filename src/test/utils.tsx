/* eslint-disable react-refresh/only-export-components -- Test utilities export helper functions */

import type { ReactElement } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Custom render function that includes Router context
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// ============================================================
// React 19 Test Helpers
// ============================================================

/**
 * Helper for advancing timers with proper act() wrapping for React 19.
 * Use this instead of vi.advanceTimersByTime() when state updates are expected.
 *
 * @example
 * await advanceTimersAndAct(1500); // Advance 1.5 seconds
 */
export const advanceTimersAndAct = async (ms: number): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

/**
 * Helper for async operations that cause state updates.
 * Wraps callback in act() and waits for any pending updates.
 *
 * @example
 * await actWait(async () => {
 *   fireEvent.click(button);
 * });
 */
export const actWait = async (
  callback: () => void | Promise<void>,
  timeout = 3000,
): Promise<void> => {
  await act(async () => {
    await callback();
  });
  // Allow time for any cascading effects
  await waitFor(() => {}, { timeout });
};

/**
 * Enhanced render with automatic act() wrapping for React 19.
 * Use for components with immediate state updates on mount.
 *
 * @example
 * const result = await renderWithAct(<MyComponent />);
 */
export const renderWithAct = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): Promise<ReturnType<typeof render>> => {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(ui, { wrapper: AllTheProviders, ...options });
  });
  return result!;
};

export * from '@testing-library/react';
export { customRender as render };
