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

import React from 'react';
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
 */
export const CombatContainer: React.FC<CombatContainerProps> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        // Base mobile layout
        "flex flex-col h-full w-full p-4 gap-4 overflow-y-auto",
        // Tablet enhancements
        "sm:p-6 sm:gap-6",
        // Desktop layout
        "lg:max-w-6xl lg:mx-auto lg:py-8",
        // Custom classes
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Combat interface"
    >
      {children}
    </div>
  );
};

export default CombatContainer;