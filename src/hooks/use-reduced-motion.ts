/**
 * useReducedMotion Hook
 *
 * Returns true if the user prefers reduced motion, checking:
 * 1. The in-app setting from settings store (user's explicit preference)
 * 2. The OS-level prefers-reduced-motion media query (fallback)
 *
 * Use this hook to:
 * - Disable or simplify framer-motion animations
 * - Conditionally apply CSS animations
 * - Provide instant state changes instead of animated transitions
 *
 * Example usage with framer-motion:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * const animationProps = prefersReducedMotion
 *   ? { initial: false, animate: false }
 *   : { initial: { opacity: 0 }, animate: { opacity: 1 } };
 * ```
 */

import { useEffect, useState } from 'react';
import { useSettingsStoreBase } from '@/store/settings-store';

/**
 * Helper function to safely check OS reduced motion preference
 * Works in SSR, test environments, and browsers
 */
function getOsReducedMotionPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to check if user prefers reduced motion
 *
 * @returns boolean - true if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  // Get the in-app setting from the settings store
  const inAppPreference = useSettingsStoreBase((state) => state.accessibility.reducedMotion);

  // Track the OS-level media query preference
  // Initialize with current value to avoid cascading renders
  const [osPreference, setOsPreference] = useState(getOsReducedMotionPreference);

  useEffect(() => {
    // Check if window and matchMedia are available (SSR safety + test environment)
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    // Subscribe for changes to the OS preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setOsPreference(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Return true if EITHER preference indicates reduced motion
  return inAppPreference || osPreference;
}

/**
 * Returns framer-motion animation props that respect reduced motion preference
 *
 * @param enabledProps - Animation props to use when motion is enabled
 * @param disabledProps - Animation props to use when motion is disabled (defaults to instant)
 * @returns The appropriate animation props based on user preference
 */
export function useMotionProps<T extends object>(
  enabledProps: T,
  disabledProps?: Partial<T>,
): T | Partial<T> {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return disabledProps ?? {};
  }

  return enabledProps;
}

/**
 * Returns a transition configuration for framer-motion that respects reduced motion
 *
 * @param duration - Animation duration in seconds (when motion is enabled)
 * @returns Transition object with appropriate duration
 */
export function useMotionTransition(duration: number = 0.3): { duration: number } {
  const prefersReducedMotion = useReducedMotion();

  return {
    duration: prefersReducedMotion ? 0 : duration,
  };
}

export default useReducedMotion;
