/* eslint-disable react-hooks/set-state-in-effect -- Combat end state sync pattern */

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
 * Combat overlay interaction fix applied 2025-12-16:
 * - Added explicit pointer-events-auto to content layer in CombatBackdrop
 * - Synchronized focus timing with animation completion (320ms)
 *
 * Battle results modal fix applied 2025-12-16:
 * - Root cause: useCombatStore's hydration safety returned enemy: null during modal mount
 * - Solution: Capture combat data as snapshot when combat ends, pass as props to modal
 * - This bypasses the hydration race condition that caused the modal to render nothing
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CombatBackdrop } from './CombatBackdrop';
import { CombatContainer } from './CombatContainer';
import { EnemyCard } from './display/organisms/EnemyCard';
import { ResourcePanel } from './display/organisms/ResourcePanel';
import { ActionGrid } from './actions/ActionGrid';
import { ControlPanel } from './actions/ControlPanel';
import { CombatReflectionModal, type CombatEndSnapshot } from './resolution/CombatReflectionModal';
import { useCombatStore } from '@/features/combat/hooks/useCombatStore';
import { useCombatKeyboard } from '@/features/combat/hooks/useCombatKeyboard';
import type { CombatAction } from '@/types';

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
    playerEnergy,
    isPlayerTurn,
    turn,
    statusEffects,
    preferredActions,
    executeAction,
    endTurn,
    surrender,
    canUseAction,
    getActionCost,
    getActionDescription,
  } = useCombatStore();

  // State for keyboard action visual feedback (provides visual feedback when using keyboard shortcuts)
  const [keyboardActiveAction, setKeyboardActiveAction] = useState<CombatAction | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for tracking modal visibility and captured combat end data
  // We capture a snapshot when combat ends to avoid hydration race conditions in the modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [combatEndSnapshot, setCombatEndSnapshot] = useState<CombatEndSnapshot | null>(null);

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

  // Show reflection modal when combat ends - capture snapshot of combat data
  // This snapshot is passed as props to the modal to avoid hydration race conditions
  useEffect(() => {
    if (combatEndStatus.isEnded && enemy) {
      // Capture combat end data immediately to pass to modal
      setCombatEndSnapshot({
        enemy,
        victory: combatEndStatus.victory,
        reason: combatEndStatus.reason,
        resources: { ...resources },
        playerHealth,
        playerEnergy,
        turn,
        preferredActions: { ...preferredActions },
      });
      setShowReflectionModal(true);
    }
  }, [
    combatEndStatus.isEnded,
    combatEndStatus.victory,
    combatEndStatus.reason,
    enemy,
    resources,
    playerHealth,
    playerEnergy,
    turn,
    preferredActions,
  ]);

  // Handle close - clear both modal visibility and snapshot
  // (Defined before early returns to satisfy React hooks rules)
  const handleModalClose = useCallback(() => {
    setShowReflectionModal(false);
    setCombatEndSnapshot(null);
  }, []);

  // Don't render until hydrated to prevent SSR mismatch
  if (!hasHydrated) {
    return null;
  }

  // Handle combat end state with modal (check this BEFORE checking isActive)
  // We pass the snapshot data as props to avoid hydration race conditions in the modal
  if (combatEndStatus.isEnded && showReflectionModal && combatEndSnapshot) {
    return (
      <CombatReflectionModal
        isOpen={showReflectionModal}
        onClose={handleModalClose}
        combatSnapshot={combatEndSnapshot}
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
        <div className="flex h-full flex-col gap-4 lg:hidden">
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
            keyboardActiveAction={keyboardActiveAction}
          />
          <ControlPanel onEndTurn={endTurn} onSurrender={surrender} isPlayerTurn={isPlayerTurn} />
        </div>

        {/* Desktop Layout - only visible on large screens */}
        <div className="hidden lg:grid lg:h-full lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
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
              keyboardActiveAction={keyboardActiveAction}
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
            <ControlPanel onEndTurn={endTurn} onSurrender={surrender} isPlayerTurn={isPlayerTurn} />
          </div>
        </div>
      </CombatContainer>
    </CombatBackdrop>
  );
};

export default CombatOverlay;
