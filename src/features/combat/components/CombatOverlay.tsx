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
 * 
 * ⚠️ CLAUDE CODE FAILURE - ATTEMPT #3 ⚠️
 * Modified: 2025-06-28
 * FAILED: Added CombatReflectionModal integration to show battle results screen
 * but NO battle results screen appears after combat. The modal integration exists
 * but is not working. User still reports no battle results screen appears.
 * STATUS: FAILED ATTEMPT - Battle results screen still missing
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CombatBackdrop } from './CombatBackdrop';
import { CombatContainer } from './CombatContainer';
import { EnemyCard } from './display/organisms/EnemyCard';
import { ResourcePanel } from './display/organisms/ResourcePanel';
import { ActionGrid } from './actions/ActionGrid';
import { ControlPanel } from './actions/ControlPanel';
import { CombatReflectionModal } from './resolution/CombatReflectionModal';
import { useCombatStore } from '@/features/combat/hooks/useCombatStore';
import { useCombatKeyboard } from '@/features/combat/hooks/useCombatKeyboard';
import type { CombatAction } from '@/store/game-store';

interface CombatOverlayProps {
  'data-testid'?: string;
}

/**
 * CombatOverlay - Main orchestrator for the combat UI
 * 
 * This component:
 * - Manages the overall combat layout
 * - Coordinates between sub-components
 * - Handles responsive design
 * - Provides accessibility structure
 */
export const CombatOverlay: React.FC<CombatOverlayProps> = ({ 'data-testid': testId }) => {
  const { 
    isActive, 
    enemy, 
    hasHydrated,
    combatEndStatus,
    resources,
    playerHealth,
    playerLevel,
    isPlayerTurn,
    turn,
    statusEffects,
    executeAction,
    endTurn,
    surrender,
    canUseAction,
    getActionCost,
    getActionDescription
  } = useCombatStore();
  
  // ⚠️ CLAUDE CODE FAILED ASSUMPTION ALERT ⚠️
  // The keyboard action visual feedback system below was added based on INCORRECT ASSUMPTIONS
  // that the overlay interaction issue was caused by keyboard event conflicts. This was NOT
  // the actual problem. The real interaction blocking issue remains UNFIXED.
  //
  // FAILED ASSUMPTION: Keyboard event handling was causing interaction problems - IT WASN'T
  // FAILED ASSUMPTION: Visual feedback coordination would fix overlay blocking - IT DIDN'T  
  // FAILED ASSUMPTION: Duplicate event listeners were the root cause - THEY WEREN'T
  //
  // This entire implementation below was WASTED EFFORT addressing NON-EXISTENT problems.
  
  // State for keyboard action visual feedback
  const [keyboardActiveAction, setKeyboardActiveAction] = useState<CombatAction | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for tracking modal visibility
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  
  // Handle keyboard action visual feedback
  const handleKeyboardAction = useCallback((action: CombatAction) => {
    setKeyboardActiveAction(action);
    
    // Clear active state after animation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setKeyboardActiveAction(null);
      timeoutRef.current = null;
    }, 200);
  }, []);
  
  // Enable keyboard shortcuts with visual feedback
  useCombatKeyboard(handleKeyboardAction);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Show reflection modal when combat ends
  useEffect(() => {
    if (combatEndStatus.isEnded && enemy) {
      setShowReflectionModal(true);
    }
  }, [combatEndStatus.isEnded, enemy]);
  
  // Don't render until hydrated to prevent SSR mismatch
  if (!hasHydrated) {
    return null;
  }
  
  // Handle combat end state with modal (check this BEFORE checking isActive)
  if (combatEndStatus.isEnded && showReflectionModal) {
    return (
      <CombatReflectionModal 
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        data-testid="combat-reflection-modal"
      />
    );
  }
  
  // Don't render if not in combat
  if (!isActive || !enemy) {
    return null;
  }
  
  return (
    <CombatBackdrop isActive={isActive} data-testid={testId}>
      <CombatContainer>
        {/* Mobile Layout (default) - only visible on small screens */}
        <div className="flex flex-col gap-4 h-full lg:hidden">
          <EnemyCard
            enemy={enemy}
            statusEffects={statusEffects}
            isEnemyTurn={!isPlayerTurn}
            turnNumber={turn}
          />
          <ResourcePanel
            playerHealth={playerHealth}
            maxHealth={100} // TODO: Get from game store
            resources={resources}
            statusEffects={statusEffects}
            playerLevel={playerLevel}
            isPlayerTurn={isPlayerTurn}
          />
          <ActionGrid
            canUseAction={canUseAction}
            getActionCost={getActionCost}
            getActionDescription={getActionDescription}
            onActionExecute={executeAction}
            isPlayerTurn={isPlayerTurn}
            keyboardActiveAction={keyboardActiveAction} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This prop was NOT needed
          />
          <ControlPanel
            onEndTurn={endTurn}
            onSurrender={surrender}
            isPlayerTurn={isPlayerTurn}
          />
        </div>
        
        {/* Desktop Layout - only visible on large screens */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:h-full">
          <div className="lg:col-span-2 space-y-6">
            <EnemyCard
              enemy={enemy}
              statusEffects={statusEffects}
              isEnemyTurn={!isPlayerTurn}
              turnNumber={turn}
            />
            <ActionGrid
              canUseAction={canUseAction}
              getActionCost={getActionCost}
              getActionDescription={getActionDescription}
              onActionExecute={executeAction}
              isPlayerTurn={isPlayerTurn}
              keyboardActiveAction={keyboardActiveAction} // ⚠️ CLAUDE CODE FAILED ASSUMPTION - This prop was NOT needed
            />
          </div>
          <div className="space-y-6">
            <ResourcePanel
              playerHealth={playerHealth}
              maxHealth={100}
              resources={resources}
              statusEffects={statusEffects}
              playerLevel={playerLevel}
              isPlayerTurn={isPlayerTurn}
            />
            <ControlPanel
              onEndTurn={endTurn}
              onSurrender={surrender}
              isPlayerTurn={isPlayerTurn}
            />
          </div>
        </div>
      </CombatContainer>
    </CombatBackdrop>
  );
};

export default CombatOverlay;