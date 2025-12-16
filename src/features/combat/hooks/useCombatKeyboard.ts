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

import { useEffect, useCallback } from 'react';
import { useCombatStore } from './useCombatStore';
import type { CombatAction } from '@/types';

/**
 * Keyboard shortcuts for combat interface
 * 1 - ILLUMINATE
 * 2 - REFLECT
 * 3 - ENDURE
 * 4 - EMBRACE
 * Space/Enter - End Turn
 * Escape - Surrender
 */
export const useCombatKeyboard = (onActionExecuted?: (action: CombatAction) => void) => {
  // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This callback was NOT needed
  const { isActive, isPlayerTurn, executeAction, endTurn, surrender, canUseAction } =
    useCombatStore();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts when combat is active and it's player's turn
      if (!isActive || !isPlayerTurn) return;

      // Prevent shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Prevent default for our handled keys
      const handledKeys = ['1', '2', '3', '4', ' ', 'Enter', 'Escape'];
      if (handledKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case '1':
          if (canUseAction('ILLUMINATE')) {
            executeAction('ILLUMINATE');
            onActionExecuted?.('ILLUMINATE'); // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This callback was NOT needed
          }
          break;
        case '2':
          if (canUseAction('REFLECT')) {
            executeAction('REFLECT');
            onActionExecuted?.('REFLECT'); // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This callback was NOT needed
          }
          break;
        case '3':
          if (canUseAction('ENDURE')) {
            executeAction('ENDURE');
            onActionExecuted?.('ENDURE'); // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This callback was NOT needed
          }
          break;
        case '4':
          if (canUseAction('EMBRACE')) {
            executeAction('EMBRACE');
            onActionExecuted?.('EMBRACE'); // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This callback was NOT needed
          }
          break;
        case ' ':
        case 'Enter':
          endTurn();
          break;
        case 'Escape':
          surrender();
          break;
      }
    },
    [isActive, isPlayerTurn, executeAction, endTurn, surrender, canUseAction, onActionExecuted],
  );

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isActive, handleKeyPress]);

  // Return keyboard shortcuts info for UI display
  return {
    shortcuts: [
      { key: '1', action: 'ILLUMINATE' as CombatAction, description: 'Illuminate' },
      { key: '2', action: 'REFLECT' as CombatAction, description: 'Reflect' },
      { key: '3', action: 'ENDURE' as CombatAction, description: 'Endure' },
      { key: '4', action: 'EMBRACE' as CombatAction, description: 'Embrace' },
      { key: 'Space/Enter', action: null, description: 'End Turn' },
      { key: 'Escape', action: null, description: 'Surrender' },
    ],
  };
};
