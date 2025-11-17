/**
 * Test for the combat turn system fix that ensures enemy turns happen after each player action
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ShadowManifestation } from '@/store/game-store';
import { useCombatStore } from '@/features/combat/store/combat-store';

// Mock the sound manager to avoid import issues in tests
vi.mock('@/utils/sound-manager', () => ({
  soundManager: {
    playSound: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockEnemy: ShadowManifestation = {
  id: 'test-enemy',
  name: 'Test Shadow',
  description: 'A test shadow for combat testing',
  type: 'fear',
  maxHP: 20,
  currentHP: 20,
  difficulty: 'medium',
  therapeuticInsights: []
};

describe('Combat Turn System Fix', () => {
  beforeEach(() => {
    // Reset combat store to initial state
    const store = useCombatStore.getState();
    store.endCombat(false); // End any active combat
    store.clearCombatEnd(); // Clear end status
  });

  it('should automatically trigger enemy turn after player action', async () => {
    // Start combat
    useCombatStore.getState().startCombat(mockEnemy);
    
    // Get fresh state after starting combat
    let state = useCombatStore.getState();
    
    // Verify initial state
    expect(state.isActive).toBe(true);
    expect(state.isPlayerTurn).toBe(true);
    expect(state.turn).toBe(1);
    
    // Execute a player action
    useCombatStore.getState().executeAction('ILLUMINATE');
    
    // Get fresh state after action
    state = useCombatStore.getState();
    
    // After executeAction, isPlayerTurn should be false (enemy turn starts)
    expect(state.isPlayerTurn).toBe(false);
    
    // The key fix is that player actions now automatically trigger enemy turns
    // This is verified by the fact that isPlayerTurn becomes false immediately
    expect(state.isActive).toBe(true); // Combat should still be active
  });

  it('should still allow manual end turn to pass without taking action', () => {
    // Start combat
    useCombatStore.getState().startCombat(mockEnemy);
    
    // Initial state
    let state = useCombatStore.getState();
    expect(state.isPlayerTurn).toBe(true);
    expect(state.turn).toBe(1);
    
    // Use end turn to pass without taking action
    useCombatStore.getState().endTurn();
    
    // Should immediately set isPlayerTurn to false for enemy turn
    state = useCombatStore.getState();
    expect(state.isPlayerTurn).toBe(false);
    expect(state.isActive).toBe(true); // Combat should still be active
  });

  it('should not trigger enemy turn if combat ends due to victory', () => {
    // Start combat with very low HP enemy
    const weakEnemy = { ...mockEnemy, currentHP: 1 };
    useCombatStore.getState().startCombat(weakEnemy);
    
    // Execute action that should defeat enemy
    useCombatStore.getState().executeAction('ILLUMINATE');
    
    // Combat should have ended with victory
    const state = useCombatStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.combatEndStatus.victory).toBe(true);
    expect(state.combatEndStatus.isEnded).toBe(true);
  });

  it('should handle player actions triggering enemy turns', () => {
    // Start combat
    useCombatStore.getState().startCombat(mockEnemy);
    
    // Take first action
    useCombatStore.getState().executeAction('ENDURE'); // This gives LP, no resource cost
    
    // Immediately after player action, should be enemy turn
    let state = useCombatStore.getState();
    expect(state.isPlayerTurn).toBe(false);
    expect(state.isActive).toBe(true);
    
    // Reset for second test
    useCombatStore.getState().startCombat(mockEnemy);
    
    // Test with different action
    useCombatStore.getState().executeAction('ILLUMINATE');
    
    state = useCombatStore.getState();
    expect(state.isPlayerTurn).toBe(false);
    expect(state.isActive).toBe(true);
  });
});