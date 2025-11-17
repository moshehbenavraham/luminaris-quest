/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Reproduction test for combat trigger issue - verifying the complete flow
 */

import { describe, it, expect } from 'vitest';
import { useGameStoreBase } from '@/store/game-store';
import { handleSceneOutcome, getScene } from '@/engine/scene-engine';
import { SHADOW_IDS } from '@/data/shadowManifestations';

describe('Combat Trigger Flow Reproduction', () => {
  it('should reproduce complete combat trigger flow from scene failure to combat state', () => {
    const store = useGameStoreBase.getState();
    
    console.log('🎯 REPRODUCTION TEST: Combat Trigger Flow');
    console.log('==========================================');
    
    // Step 1: Reset to initial state and navigate to combat scene
    store.resetGame();
    
    // Set scene to combat-encounter (index 2)
    const targetSceneIndex = 2;
    for (let i = 0; i < targetSceneIndex; i++) {
      store.advanceScene();
    }
    
    const initialState = {
      currentSceneIndex: store.currentSceneIndex,
      inCombat: store.combat?.inCombat,
      lightPoints: store.lightPoints,
      shadowPoints: store.shadowPoints
    };
    
    console.log('📍 Initial State:', initialState);
    
    // Step 2: Get the combat scene
    const scene = getScene(store.currentSceneIndex);
    console.log('🏛️ Current Scene:', {
      index: store.currentSceneIndex,
      id: scene.id,
      type: scene.type,
      shadowType: scene.shadowType,
      dc: scene.dc
    });
    
    expect(scene.type).toBe('combat');
    expect(scene.shadowType).toBeDefined();
    
    // Step 3: Simulate failed DC check
    const outcome = handleSceneOutcome(scene, false, 1); // Roll 1, guaranteed fail
    console.log('🎲 Scene Outcome:', {
      success: outcome.success,
      triggeredCombat: outcome.triggeredCombat,
      shadowType: outcome.shadowType,
      resourceChanges: outcome.resourceChanges
    });
    
    expect(outcome.triggeredCombat).toBe(true);
    expect(outcome.shadowType).toBe(SHADOW_IDS.WHISPER_OF_DOUBT);
    
    // Step 4: Trigger combat manually (simulating ChoiceList behavior)
    if (outcome.triggeredCombat && outcome.shadowType) {
      store.startCombat(outcome.shadowType, scene.dc);
    }
    
    const combatState = {
      currentSceneIndex: store.currentSceneIndex,
      inCombat: store.combat?.inCombat,
      currentEnemy: store.combat?.currentEnemy?.name,
      combatResources: store.combat?.resources,
      sceneDC: store.combat?.sceneDC
    };
    
    console.log('⚔️ Combat State After Trigger:', combatState);
    
    // Step 5: Verify combat is active
    expect(store.combat?.inCombat).toBe(true);
    expect(store.combat?.currentEnemy).toBeTruthy();
    expect(store.combat?.currentEnemy?.name).toBe('The Whisper of Doubt');
    expect(store.combat?.sceneDC).toBe(scene.dc);
    
    // Step 6: Verify scene did NOT advance
    expect(store.currentSceneIndex).toBe(targetSceneIndex);
    
    // Step 7: Test combat end and scene advancement
    const combatResult = true; // Simulate victory
    store.endCombat(combatResult);
    
    const finalState = {
      currentSceneIndex: store.currentSceneIndex,
      inCombat: store.combat?.inCombat,
      lightPoints: store.lightPoints,
      shadowPoints: store.shadowPoints
    };
    
    console.log('🏁 Final State After Combat End:', finalState);
    
    // Step 8: Verify combat ended and scene advanced
    expect(store.combat?.inCombat).toBe(false);
    expect(store.currentSceneIndex).toBe(targetSceneIndex + 1); // Should advance after combat
    
    console.log('✅ REPRODUCTION TEST COMPLETED');
    console.log('==========================================');
    
    // Summary for debugging
    const summary = {
      'Initial Scene Index': initialState.currentSceneIndex,
      'Combat Scene Type': scene.type,
      'Failed DC Check': !outcome.success,
      'Combat Triggered': outcome.triggeredCombat,
      'Combat Started': combatState.inCombat,
      'Enemy Created': !!combatState.currentEnemy,
      'Scene Advanced During Combat': combatState.currentSceneIndex !== targetSceneIndex,
      'Combat Ended': !finalState.inCombat,
      'Scene Advanced After Combat': finalState.currentSceneIndex > targetSceneIndex
    };
    
    console.log('📊 Flow Summary:', summary);
    
    // All these should be true for proper functionality
    expect(summary['Failed DC Check']).toBe(true);
    expect(summary['Combat Triggered']).toBe(true);
    expect(summary['Combat Started']).toBe(true);
    expect(summary['Enemy Created']).toBe(true);
    expect(summary['Scene Advanced During Combat']).toBe(false);
    expect(summary['Combat Ended']).toBe(true);
    expect(summary['Scene Advanced After Combat']).toBe(true);
  });
  
  it('should identify if the issue is in scene persistence or state management', () => {
    const store = useGameStoreBase.getState();
    
    // Test state persistence across operations
    store.resetGame();
    
    console.log('🔍 PERSISTENCE TEST');
    console.log('===================');
    
    // Navigate to each combat scene and check state
    const combatScenes = [2, 7, 12, 17]; // Known combat scene indices
    
    combatScenes.forEach(sceneIndex => {
      // Reset and navigate to scene
      store.resetGame();
      for (let i = 0; i < sceneIndex; i++) {
        store.advanceScene();
      }
      
      const scene = getScene(sceneIndex);
      const beforeCombat = {
        sceneIndex: store.currentSceneIndex,
        inCombat: store.combat?.inCombat
      };
      
      // Trigger combat
      const outcome = handleSceneOutcome(scene, false, 1);
      if (outcome.triggeredCombat && outcome.shadowType) {
        store.startCombat(outcome.shadowType, scene.dc);
      }
      
      const duringCombat = {
        sceneIndex: store.currentSceneIndex,
        inCombat: store.combat?.inCombat
      };
      
      console.log(`Scene ${sceneIndex} (${scene.id}):`, {
        before: beforeCombat,
        during: duringCombat,
        sceneStayedSame: beforeCombat.sceneIndex === duringCombat.sceneIndex,
        combatActivated: duringCombat.inCombat
      });
      
      expect(duringCombat.sceneIndex).toBe(sceneIndex);
      expect(duringCombat.inCombat).toBe(true);
    });
    
    console.log('✅ PERSISTENCE TEST COMPLETED');
  });
});