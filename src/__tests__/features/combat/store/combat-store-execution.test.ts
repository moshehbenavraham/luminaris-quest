/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useCombatStore } from '../../../../features/combat/store/combat-store';
import type { ShadowManifestation } from '../../../../store/game-store';

// Mock timers for enemy turn delays
vi.useFakeTimers();

describe('Combat Store - Action Execution Flow', () => {
  let store: ReturnType<typeof useCombatStore>;
  const mockEnemy: ShadowManifestation = {
    id: 'test-shadow',
    name: 'Test Shadow',
    type: 'doubt',
    description: 'A manifestation of inner doubt',
    maxHP: 20,
    currentHP: 20,
    abilities: [],
    scene: 'test-scene',
    isDefeated: false,
  };

  beforeEach(() => {
    // Reset store state
    store = useCombatStore;
    store.getState().startCombat(mockEnemy);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Action Execution', () => {
    it('executes ILLUMINATE action correctly', () => {
      const initialState = store.getState();
      
      // Ensure player has enough LP
      store.setState({ 
        resources: { lp: 10, sp: 0 },
        playerLevel: 1
      });
      
      store.getState().executeAction('ILLUMINATE');
      
      const finalState = store.getState();
      
      // Check resource consumption
      expect(finalState.resources.lp).toBe(8); // 10 - 2
      
      // Check enemy took damage
      expect(finalState.enemy?.currentHP).toBeLessThan(mockEnemy.currentHP);
      
      // Check action was logged
      expect(finalState.log).toHaveLength(2); // Start combat + action
      const actionLog = finalState.log[1];
      expect(actionLog.action).toBe('ILLUMINATE');
      expect(actionLog.actor).toBe('PLAYER');
      expect(actionLog.effect).toContain('Dealt');
      
      // Check action tracking
      expect(finalState.preferredActions.ILLUMINATE).toBe(1);
    });

    it('executes REFLECT action correctly', () => {
      store.setState({ 
        resources: { lp: 5, sp: 3 }
      });
      
      store.getState().executeAction('REFLECT');
      
      const finalState = store.getState();
      
      // Check resource conversion
      expect(finalState.resources.sp).toBe(2); // 3 - 1
      expect(finalState.resources.lp).toBe(6); // 5 + 1
      
      // Check action was logged
      const actionLog = finalState.log[1];
      expect(actionLog.action).toBe('REFLECT');
      expect(actionLog.effect).toBe('Converted 1 SP to 1 LP');
      
      // Check action tracking
      expect(finalState.preferredActions.REFLECT).toBe(1);
    });

    it('executes ENDURE action correctly', () => {
      store.setState({ 
        resources: { lp: 5, sp: 2 }
      });
      
      store.getState().executeAction('ENDURE');
      
      const finalState = store.getState();
      
      // Check LP gain
      expect(finalState.resources.lp).toBe(6); // 5 + 1
      expect(finalState.resources.sp).toBe(2); // Unchanged
      
      // Check action was logged
      const actionLog = finalState.log[1];
      expect(actionLog.action).toBe('ENDURE');
      expect(actionLog.effect).toBe('Gained 1 LP from endurance');
      
      // Check action tracking
      expect(finalState.preferredActions.ENDURE).toBe(1);
    });

    it('executes EMBRACE action correctly', () => {
      store.setState({ 
        resources: { lp: 5, sp: 8 }
      });
      
      store.getState().executeAction('EMBRACE');
      
      const finalState = store.getState();
      
      // Check SP consumption
      expect(finalState.resources.sp).toBe(0); // All SP consumed
      expect(finalState.resources.lp).toBe(5); // Unchanged
      
      // Check enemy took damage
      expect(finalState.enemy?.currentHP).toBeLessThan(mockEnemy.currentHP);
      
      // Check action was logged
      const actionLog = finalState.log[1];
      expect(actionLog.action).toBe('EMBRACE');
      expect(actionLog.effect).toContain('Dealt');
      expect(actionLog.effect).toContain('consumed all SP');
      
      // Check action tracking
      expect(finalState.preferredActions.EMBRACE).toBe(1);
    });

    it('prevents action execution when insufficient resources', () => {
      store.setState({ 
        resources: { lp: 1, sp: 0 } // Not enough for ILLUMINATE
      });
      
      const initialState = store.getState();
      store.getState().executeAction('ILLUMINATE');
      const finalState = store.getState();
      
      // State should be unchanged
      expect(finalState.resources).toEqual(initialState.resources);
      expect(finalState.enemy?.currentHP).toBe(initialState.enemy?.currentHP);
      expect(finalState.log).toHaveLength(1); // Only start combat log
    });

    it('prevents action execution when not player turn', () => {
      store.setState({ 
        resources: { lp: 10, sp: 5 },
        isPlayerTurn: false
      });
      
      const initialState = store.getState();
      store.getState().executeAction('ILLUMINATE');
      const finalState = store.getState();
      
      // State should be unchanged
      expect(finalState.resources).toEqual(initialState.resources);
      expect(finalState.enemy?.currentHP).toBe(initialState.enemy?.currentHP);
      expect(finalState.log).toHaveLength(1); // Only start combat log
    });

    it('prevents action execution when combat not active', () => {
      store.setState({ 
        isActive: false,
        resources: { lp: 10, sp: 5 }
      });
      
      const initialState = store.getState();
      store.getState().executeAction('ILLUMINATE');
      const finalState = store.getState();
      
      // State should be unchanged
      expect(finalState.resources).toEqual(initialState.resources);
      expect(finalState.preferredActions.ILLUMINATE).toBe(0);
    });

    it('ends combat when enemy is defeated', () => {
      store.setState({ 
        resources: { lp: 10, sp: 0 },
        enemy: { ...mockEnemy, currentHP: 1 } // Low HP enemy
      });
      
      store.getState().executeAction('ILLUMINATE');
      
      const finalState = store.getState();
      
      // Combat should be ended
      expect(finalState.isActive).toBe(false);
      expect(finalState.combatEndStatus.isEnded).toBe(true);
      expect(finalState.combatEndStatus.victory).toBe(true);
    });
  });

  describe('Turn Management', () => {
    it('handles end turn correctly', () => {
      store.setState({ 
        turn: 1,
        isPlayerTurn: true,
        playerHealth: 100,
        resources: { lp: 5, sp: 2 }
      });
      
      store.getState().endTurn();
      
      // Player turn should end immediately
      expect(store.getState().isPlayerTurn).toBe(false);
      
      // Fast-forward enemy turn
      vi.advanceTimersByTime(1500);
      
      const finalState = store.getState();
      
      // Next turn should start
      expect(finalState.turn).toBe(2);
      expect(finalState.isPlayerTurn).toBe(true);
      
      // Player should have taken damage
      expect(finalState.playerHealth).toBeLessThan(100);
      
      // Player should gain SP from being attacked
      expect(finalState.resources.sp).toBe(3); // 2 + 1
      
      // Enemy action should be logged
      expect(finalState.log).toHaveLength(2); // Start combat + enemy action
      const enemyLog = finalState.log[1];
      expect(enemyLog.actor).toBe('SHADOW');
      expect(enemyLog.effect).toContain('Dealt');
    });

    it('prevents end turn when not player turn', () => {
      store.setState({ 
        turn: 1,
        isPlayerTurn: false
      });
      
      const initialState = store.getState();
      store.getState().endTurn();
      
      // Nothing should change
      expect(store.getState().turn).toBe(initialState.turn);
      expect(store.getState().isPlayerTurn).toBe(false);
    });

    it('prevents end turn when combat not active', () => {
      store.setState({ 
        isActive: false,
        turn: 1,
        isPlayerTurn: true
      });
      
      const initialState = store.getState();
      store.getState().endTurn();
      
      // Nothing should change
      expect(store.getState().turn).toBe(initialState.turn);
      expect(store.getState().isPlayerTurn).toBe(true);
    });

    it('ends combat when player is defeated', () => {
      store.setState({ 
        turn: 1,
        isPlayerTurn: true,
        playerHealth: 5, // Low health
        resources: { lp: 0, sp: 2 } // No defense
      });
      
      store.getState().endTurn();
      
      // Fast-forward enemy turn
      vi.advanceTimersByTime(1500);
      
      const finalState = store.getState();
      
      // Combat should be ended
      expect(finalState.isActive).toBe(false);
      expect(finalState.combatEndStatus.isEnded).toBe(true);
      expect(finalState.combatEndStatus.victory).toBe(false);
    });

    it('uses different enemy actions based on HP', () => {
      // Test desperate strike when enemy HP is low
      store.setState({ 
        turn: 1,
        isPlayerTurn: true,
        playerHealth: 100,
        resources: { lp: 5, sp: 2 },
        enemy: { ...mockEnemy, currentHP: 8 } // Below 50% of 20 HP
      });
      
      store.getState().endTurn();
      vi.advanceTimersByTime(1500);
      
      const finalState = store.getState();
      const enemyLog = finalState.log[1];
      expect(enemyLog.action).toBe('Desperate Strike');
    });
  });

  describe('Combat Flow Integration', () => {
    it('handles surrender correctly', () => {
      store.getState().surrender();
      
      const finalState = store.getState();
      
      expect(finalState.isActive).toBe(false);
      expect(finalState.combatEndStatus.isEnded).toBe(true);
      expect(finalState.combatEndStatus.victory).toBe(false);
      expect(finalState.combatEndStatus.reason).toContain('retreat');
    });

    it('tracks action preferences correctly', () => {
      store.setState({ 
        resources: { lp: 20, sp: 10 }
      });
      
      // Execute multiple actions
      store.getState().executeAction('ILLUMINATE');
      store.getState().executeAction('ILLUMINATE');
      store.getState().executeAction('REFLECT');
      store.getState().executeAction('ENDURE');
      
      const finalState = store.getState();
      
      expect(finalState.preferredActions.ILLUMINATE).toBe(2);
      expect(finalState.preferredActions.REFLECT).toBe(1);
      expect(finalState.preferredActions.ENDURE).toBe(1);
      expect(finalState.preferredActions.EMBRACE).toBe(0);
    });

    it('maintains combat log chronologically', () => {
      store.setState({ 
        resources: { lp: 10, sp: 5 }
      });
      
      // Execute action and end turn
      store.getState().executeAction('ILLUMINATE');
      store.getState().endTurn();
      vi.advanceTimersByTime(1500);
      
      const finalState = store.getState();
      
      // Should have: start combat, player action, enemy action
      expect(finalState.log).toHaveLength(3);
      expect(finalState.log[0].actor).toBe('SHADOW'); // Start combat
      expect(finalState.log[1].actor).toBe('PLAYER'); // Player action
      expect(finalState.log[2].actor).toBe('SHADOW'); // Enemy action
      
      // Check turn numbers
      expect(finalState.log[1].turn).toBe(1);
      expect(finalState.log[2].turn).toBe(1);
    });
  });

  describe('Resource Synchronization', () => {
    it('should sync resources from game store when provided', () => {
      const gameResources = {
        lightPoints: 15,
        shadowPoints: 8,
        playerHealth: 85,
        playerLevel: 3
      };
      
      // Start combat with game resources
      store.getState().startCombat(mockEnemy, gameResources);
      
      const finalState = store.getState();
      
      // Verify resources are synced correctly
      expect(finalState.resources.lp).toBe(15);
      expect(finalState.resources.sp).toBe(8);
      expect(finalState.playerHealth).toBe(85);
      expect(finalState.playerLevel).toBe(3);
      
      // Verify combat is active
      expect(finalState.isActive).toBe(true);
      expect(finalState.enemy).toBe(mockEnemy);
    });

    it('should use default resources when game resources not provided', () => {
      // Start combat without game resources
      store.getState().startCombat(mockEnemy);
      
      const finalState = store.getState();
      
      // Verify default resources are used
      expect(finalState.resources.lp).toBe(10); // Default from initialState
      expect(finalState.resources.sp).toBe(0);  // Default from initialState
      expect(finalState.playerHealth).toBe(100); // Default from initialState
      expect(finalState.playerLevel).toBe(1);   // Default from initialState
    });

    it('should handle partial game resources gracefully', () => {
      const partialGameResources = {
        lightPoints: 20,
        shadowPoints: 5,
        playerHealth: 75,
        playerLevel: 2
      };
      
      // Start combat with partial resources
      store.getState().startCombat(mockEnemy, partialGameResources);
      
      const finalState = store.getState();
      
      // Verify all provided resources are synced
      expect(finalState.resources.lp).toBe(20);
      expect(finalState.resources.sp).toBe(5);
      expect(finalState.playerHealth).toBe(75);
      expect(finalState.playerLevel).toBe(2);
    });
  });
});