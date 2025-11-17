/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Direct test to verify combat trigger fix works correctly
 */

import { describe, it, expect } from 'vitest';
import { useGameStoreBase } from '@/store/game-store';
import { SHADOW_IDS } from '@/data/shadowManifestations';

describe('Combat Trigger Direct Test', () => {
  it('should fix combat state hydration issue', () => {
    console.log('🔧 DIRECT COMBAT TRIGGER TEST');
    console.log('==============================');
    
    const store = useGameStoreBase.getState();
    
    // Reset and ensure hydration
    store.resetGame();
    store._setHasHydrated(true);
    
    console.log('Initial state:', {
      hasHydrated: store._hasHydrated,
      inCombat: store.combat?.inCombat
    });
    
    expect(store._hasHydrated).toBe(true);
    expect(store.combat?.inCombat).toBe(false);
    
    // Call startCombat directly
    store.startCombat(SHADOW_IDS.WHISPER_OF_DOUBT, 14);
    
    // Check state immediately after
    const afterCombat = useGameStoreBase.getState();
    console.log('After startCombat:', {
      hasHydrated: afterCombat._hasHydrated,
      inCombat: afterCombat.combat?.inCombat,
      enemyName: afterCombat.combat?.currentEnemy?.name,
      sceneDC: afterCombat.combat?.sceneDC
    });
    
    // This should pass with the fix
    expect(afterCombat.combat?.inCombat).toBe(true);
    expect(afterCombat.combat?.currentEnemy?.name).toBe('The Whisper of Doubt');
    expect(afterCombat.combat?.sceneDC).toBe(14);
    
    console.log('✅ Combat trigger working correctly!');
  });
  
  it('should test hydration wrapper behavior', () => {
    console.log('\n🧪 HYDRATION WRAPPER TEST');
    console.log('==========================');
    
    const baseStore = useGameStoreBase.getState();
    
    // Test hydration wrapper with hydrated = false
    baseStore._setHasHydrated(false);
    console.log('Hydrated = false, inCombat should be from actual store:', {
      baseStoreHydrated: baseStore._hasHydrated,
      baseStoreInCombat: baseStore.combat?.inCombat
    });
    
    // Test hydration wrapper with hydrated = true
    baseStore._setHasHydrated(true);
    console.log('Hydrated = true, inCombat should be from actual store:', {
      baseStoreHydrated: baseStore._hasHydrated,
      baseStoreInCombat: baseStore.combat?.inCombat
    });
    
    console.log('✅ Hydration wrapper test completed');
  });
});