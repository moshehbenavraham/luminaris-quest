/**
 * Test for the enemy turn system in combat
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCombatStore } from '@/features/combat/store/combat-store';
import { createShadowManifestation } from '@/data/shadowManifestations';

// Mock the sound manager
vi.mock('@/utils/sound-manager', () => ({
  soundManager: {
    playSound: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Combat Turn System', () => {
  let store: ReturnType<typeof useCombatStore>;
  
  beforeEach(() => {
    // Reset the store state completely
    const initialState = {
      isActive: false,
      enemy: null,
      resources: { lp: 10, sp: 0 },
      playerHealth: 100,
      playerLevel: 1,
      turn: 0,
      isPlayerTurn: true,
      combatEndStatus: {
        isEnded: false,
        victory: false,
        reason: '',
      },
      statusEffects: {
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: 0,
        lpGenerationBlocked: 0,
        skipNextTurn: false,
        consecutiveEndures: 0,
      },
      log: [],
      preferredActions: {
        ILLUMINATE: 0,
        REFLECT: 0,
        ENDURE: 0,
        EMBRACE: 0,
      },
      flags: {
        newCombatUI: true,
      },
      _hasHydrated: true,
    };
    
    // Reset store to initial state
    useCombatStore.setState(initialState);
    
    // Get fresh store reference
    store = useCombatStore.getState();
    
    // Start a combat with a test enemy
    const testEnemy = createShadowManifestation('whisper-of-doubt');
    if (testEnemy) {
      store.startCombat(testEnemy);
    }
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should handle player turn to enemy turn transition', async () => {
    vi.useFakeTimers();
    
    // Get fresh store state after combat started
    const currentState = useCombatStore.getState();
    
    // Initial state - should be player turn
    expect(currentState.isPlayerTurn).toBe(true);
    expect(currentState.turn).toBe(1);
    
    // Player ends turn
    currentState.endTurn();
    
    // Should immediately switch to enemy turn
    const afterEndTurn = useCombatStore.getState();
    expect(afterEndTurn.isPlayerTurn).toBe(false);
    expect(afterEndTurn.turn).toBe(1); // Turn number doesn't change until enemy finishes
    
    // Fast-forward through the enemy turn delay
    vi.advanceTimersByTime(2600); // 2.5s + buffer
    
    // Wait for async operations
    await vi.runAllTimersAsync();
    
    // Should now be back to player turn with incremented turn number
    const finalState = useCombatStore.getState();
    expect(finalState.isPlayerTurn).toBe(true);
    expect(finalState.turn).toBe(2);
  });

  it('should apply enemy damage during enemy turn', async () => {
    vi.useFakeTimers();
    
    const initialHealth = store.playerHealth;
    const initialSP = store.resources.sp;
    
    // End player turn to trigger enemy turn
    store.endTurn();
    
    // Fast-forward through enemy turn
    vi.advanceTimersByTime(2600);
    await vi.runAllTimersAsync();
    
    const finalState = useCombatStore.getState();
    
    // Player should have taken damage
    expect(finalState.playerHealth).toBeLessThan(initialHealth);
    
    // Player should have gained SP from being attacked
    expect(finalState.resources.sp).toBeGreaterThan(initialSP);
  });

  it('should add enemy action to combat log', async () => {
    vi.useFakeTimers();
    
    const initialLogLength = store.log.length;
    
    // End player turn
    store.endTurn();
    
    // Fast-forward through enemy turn
    vi.advanceTimersByTime(2600);
    await vi.runAllTimersAsync();
    
    const finalState = useCombatStore.getState();
    
    // Should have added an enemy action to the log
    expect(finalState.log.length).toBeGreaterThan(initialLogLength);
    
    // Check that the last log entry is from the enemy
    const lastLogEntry = finalState.log[finalState.log.length - 1];
    expect(lastLogEntry.actor).toBe('SHADOW');
    expect(['Shadow Attack', 'Desperate Strike']).toContain(lastLogEntry.action);
  });

  it('should end combat if player health reaches 0', async () => {
    vi.useFakeTimers();
    
    // Set player health very low
    useCombatStore.setState({ playerHealth: 1 });
    
    // End player turn
    store.endTurn();
    
    // Fast-forward through enemy turn
    vi.advanceTimersByTime(2600);
    await vi.runAllTimersAsync();
    
    const finalState = useCombatStore.getState();
    
    // Combat should be ended with defeat
    expect(finalState.isActive).toBe(false);
    expect(finalState.combatEndStatus.isEnded).toBe(true);
    expect(finalState.combatEndStatus.victory).toBe(false);
  });

  it('should not process enemy turn if combat is no longer active', async () => {
    vi.useFakeTimers();
    
    // End player turn
    store.endTurn();
    
    // End combat before enemy turn completes
    store.endCombat(true);
    
    const preEnemyTurnState = useCombatStore.getState();
    const preEnemyTurnHealth = preEnemyTurnState.playerHealth;
    
    // Fast-forward through enemy turn delay
    vi.advanceTimersByTime(2600);
    await vi.runAllTimersAsync();
    
    const finalState = useCombatStore.getState();
    
    // Player health should not have changed (no enemy attack)
    expect(finalState.playerHealth).toBe(preEnemyTurnHealth);
    
    // Combat should still be ended
    expect(finalState.isActive).toBe(false);
  });

  it('should play sound during enemy turn', async () => {
    vi.useFakeTimers();

    const { soundManager } = await import('@/utils/sound-manager');

    // End player turn
    store.endTurn();
    
    // Fast-forward through enemy turn
    vi.advanceTimersByTime(2600);
    await vi.runAllTimersAsync();
    
    // Should have played shadow attack sound
    expect(soundManager.playSound).toHaveBeenCalledWith('shadow-attack', 2);
  });
});