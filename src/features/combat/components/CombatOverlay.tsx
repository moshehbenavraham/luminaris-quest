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
import { CombatBackdrop } from './CombatBackdrop';
import { CombatContainer } from './CombatContainer';
import { useCombatStore } from '@/features/combat/hooks/useCombatStore';

// Placeholder imports - will be replaced with actual components
const EnemyCard = () => <div className="bg-combat-card p-4 rounded-lg">Enemy Card Placeholder</div>;
const ResourcePanel = () => <div className="bg-combat-card p-4 rounded-lg">Resources Placeholder</div>;
const ActionGrid = () => <div className="bg-combat-card p-4 rounded-lg">Actions Placeholder</div>;
const ControlPanel = () => <div className="bg-combat-card p-4 rounded-lg">Controls Placeholder</div>;

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
export const CombatOverlay: React.FC<CombatOverlayProps> = ({ 'data-testid': _testId }) => {
  const { 
    isActive, 
    enemy, 
    hasHydrated,
    combatEndStatus 
  } = useCombatStore();
  
  // Don't render until hydrated to prevent SSR mismatch
  if (!hasHydrated) {
    return null;
  }
  
  // Don't render if not in combat
  if (!isActive || !enemy) {
    return null;
  }
  
  // Handle combat end state
  if (combatEndStatus.isEnded) {
    // TODO: Render CombatEndModal
    return (
      <CombatBackdrop isActive={true}>
        <CombatContainer>
          <div className="bg-combat-card p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-combat-text mb-4">
              {combatEndStatus.victory ? '✨ Victory!' : '💡 Learning Moment'}
            </h2>
            <p className="text-combat-text-muted">
              {combatEndStatus.reason}
            </p>
          </div>
        </CombatContainer>
      </CombatBackdrop>
    );
  }
  
  return (
    <CombatBackdrop isActive={isActive}>
      <CombatContainer>
        {/* Mobile Layout (default) */}
        <div className="flex flex-col gap-4 h-full">
          <EnemyCard />
          <ResourcePanel />
          <ActionGrid />
          <ControlPanel />
        </div>
        
        {/* Tablet Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 sm:h-full">
          <div className="sm:col-span-2">
            <EnemyCard />
          </div>
          <ResourcePanel />
          <div className="space-y-4">
            <ActionGrid />
            <ControlPanel />
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:h-full">
          <div className="lg:col-span-2 space-y-6">
            <EnemyCard />
            <ActionGrid />
          </div>
          <div className="space-y-6">
            <ResourcePanel />
            <ControlPanel />
          </div>
        </div>
      </CombatContainer>
    </CombatBackdrop>
  );
};

export default CombatOverlay;