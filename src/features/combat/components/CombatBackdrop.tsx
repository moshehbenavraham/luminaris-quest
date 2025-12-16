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
import { motion, AnimatePresence } from 'framer-motion';

interface CombatBackdropProps {
  isActive: boolean;
  children?: React.ReactNode;
}

/**
 * CombatBackdrop - Fullscreen backdrop for combat overlay
 *
 * This component provides a separate backdrop layer that:
 * - Covers the entire viewport without gaps
 * - Provides consistent blur effect
 * - Handles z-index properly
 * - Animates smoothly
 */
export const CombatBackdrop: React.FC<CombatBackdropProps> = ({ isActive, children }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop layer - separate from content, non-interactive */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-combat-backdrop bg-combat-backdrop pointer-events-none fixed inset-0 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Content layer - explicitly set pointer-events-auto to ensure interactivity
              during and after framer-motion animation transitions */}
          <motion.div
            initial={{ opacity: 0, pointerEvents: 'auto' as const }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-combat-content pointer-events-auto fixed inset-0"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CombatBackdrop;
