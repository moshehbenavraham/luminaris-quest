/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CombatContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CombatContainer - Responsive layout container for combat UI
 *
 * This component provides:
 * - Mobile-first responsive layout
 * - Proper padding and spacing
 * - Max-width constraints for larger screens
 * - Centered content alignment
 * - Focus management for accessibility and interaction
 */
export const CombatContainer: React.FC<CombatContainerProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the previously focused element when combat overlay appears
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the container after the entrance animation completes (300ms)
    // Using requestAnimationFrame ensures we're in sync with the browser's render cycle
    if (containerRef.current) {
      // Wait for animation to complete (300ms) plus one frame for stability
      const focusTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          containerRef.current?.focus();
        });
      }, 320);

      return () => {
        clearTimeout(focusTimer);
        // Return focus to previous element when unmounting
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, []);

  // Handle escape key to close combat (if needed in future)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Allow Tab navigation but ensure it stays within the combat overlay
      const focusableElements = containerRef.current?.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Trap focus within the overlay
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        // Base mobile layout
        'flex h-full w-full flex-col gap-4 overflow-y-auto p-4',
        // Tablet enhancements
        'sm:gap-6 sm:p-6',
        // Desktop layout
        'lg:mx-auto lg:max-w-6xl lg:py-8',
        // Focus styles for accessibility
        'focus:ring-primary-500 focus:ring-opacity-50 focus:ring-2 focus:outline-none',
        // Custom classes
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Combat interface"
      tabIndex={-1} // Make container focusable but not in tab order
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

export default CombatContainer;
