/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Debug test to identify the exact issue with combat state management
 */

import { describe, it, expect } from 'vitest';
import { useGameStoreBase, useGameStore } from '../store/game-store';
import { SHADOW_IDS } from '../data/shadowManifestations';

describe('Combat State Debug', () => {
  it('should debug combat state access and hydration issues', () => {
    console.log('🔍 COMBAT STATE DEBUG');
    console.log('======================');
    
    // Test direct store access
    const baseStore = useGameStoreBase.getState();
    console.log('📦 Base Store Initial State:', {
      hasHydrated: baseStore._hasHydrated,
      combatExists: !!baseStore.combat,
      combatInCombat: baseStore.combat?.inCombat,
      combatStructure: Object.keys(baseStore.combat || {})
    });
    
    // Test wrapper store access
    const wrappedStore = useGameStore.getState();
    console.log('🎁 Wrapped Store Initial State:', {
      hasHydrated: wrappedStore._hasHydrated,
      combatExists: !!wrappedStore.combat,
      combatInCombat: wrappedStore.combat?.inCombat,
      combatStructure: Object.keys(wrappedStore.combat || {})
    });
    
    // Set hydrated flag and test again
    baseStore._setHasHydrated(true);
    const hydratedWrappedStore = useGameStore.getState();
    console.log('💧 Hydrated Wrapped Store State:', {
      hasHydrated: hydratedWrappedStore._hasHydrated,
      combatExists: !!hydratedWrappedStore.combat,
      combatInCombat: hydratedWrappedStore.combat?.inCombat,
      combatStructure: Object.keys(hydratedWrappedStore.combat || {})
    });
    
    // Test startCombat function on base store
    console.log('\n⚔️ Testing Base Store startCombat...');
    baseStore.startCombat(SHADOW_IDS.WHISPER_OF_DOUBT, 14);
    
    const afterCombatBase = useGameStoreBase.getState();
    console.log('📦 Base Store After startCombat:', {
      combatInCombat: afterCombatBase.combat?.inCombat,
      enemyName: afterCombatBase.combat?.currentEnemy?.name,
      sceneDC: afterCombatBase.combat?.sceneDC
    });
    
    // Test if wrapped store sees the changes
    const afterCombatWrapped = useGameStore.getState();
    console.log('🎁 Wrapped Store After startCombat:', {
      combatInCombat: afterCombatWrapped.combat?.inCombat,
      enemyName: afterCombatWrapped.combat?.currentEnemy?.name,
      sceneDC: afterCombatWrapped.combat?.sceneDC
    });
    
    // Test if wrapping store startCombat works differently
    console.log('\n🎁 Testing Wrapped Store startCombat...');
    wrappedStore.endCombat(false); // Reset first
    wrappedStore.startCombat(SHADOW_IDS.VEIL_OF_ISOLATION, 16);
    
    const afterWrappedCombat = useGameStore.getState();
    console.log('🎁 Wrapped Store After Own startCombat:', {
      combatInCombat: afterWrappedCombat.combat?.inCombat,
      enemyName: afterWrappedCombat.combat?.currentEnemy?.name,
      sceneDC: afterWrappedCombat.combat?.sceneDC
    });
    
    console.log('======================');
    
    // The fix verification
    expect(afterWrappedCombat.combat?.inCombat).toBe(true);
  });
  
  it('should identify if the problem is hydration timing', () => {
    console.log('⏰ HYDRATION TIMING TEST');
    console.log('========================');
    
    const baseStore = useGameStoreBase.getState();
    
    // Reset everything
    baseStore.resetGame();
    
    // Test combat start BEFORE hydration
    console.log('🔄 Before hydration...');
    baseStore._setHasHydrated(false);
    const preHydrationStore = useGameStore.getState();
    
    console.log('Pre-hydration state:', {
      hasHydrated: preHydrationStore._hasHydrated,
      canStartCombat: typeof preHydrationStore.startCombat === 'function'
    });
    
    preHydrationStore.startCombat(SHADOW_IDS.WHISPER_OF_DOUBT, 14);
    const afterPreHydrationCombat = useGameStore.getState();
    
    console.log('After combat start (pre-hydration):', {
      combatInCombat: afterPreHydrationCombat.combat?.inCombat,
      baseStoreInCombat: useGameStoreBase.getState().combat?.inCombat
    });
    
    // Test combat start AFTER hydration
    console.log('\n💧 After hydration...');
    baseStore._setHasHydrated(true);
    baseStore.endCombat(false); // Reset
    
    const postHydrationStore = useGameStore.getState();
    console.log('Post-hydration state:', {
      hasHydrated: postHydrationStore._hasHydrated,
      canStartCombat: typeof postHydrationStore.startCombat === 'function'
    });
    
    postHydrationStore.startCombat(SHADOW_IDS.WHISPER_OF_DOUBT, 14);
    const afterPostHydrationCombat = useGameStore.getState();
    
    console.log('After combat start (post-hydration):', {
      combatInCombat: afterPostHydrationCombat.combat?.inCombat,
      baseStoreInCombat: useGameStoreBase.getState().combat?.inCombat
    });
    
    console.log('========================');
    
    // Should work after hydration
    expect(afterPostHydrationCombat.combat?.inCombat).toBe(true);
  });
});