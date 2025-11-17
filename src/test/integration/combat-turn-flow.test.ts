import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStoreBase as useGameStore } from '@/store/game-store'; // Use the base store for testing
import { COMBAT_BALANCE } from '@/engine/combat-engine';

describe('Combat Turn Flow', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.getState().resetGame();
    vi.clearAllMocks(); // Clear mocks to ensure test isolation
  });

  it('should correctly process a full combat turn: player action -> end turn -> shadow action', () => {
    // Set initial resources for the test
    useGameStore.getState().modifyLightPoints(10);

    const { startCombat, executeCombatAction, endTurn } = useGameStore.getState();

    // 1. Start Combat
    startCombat('whisper-of-doubt', 12);
    let state = useGameStore.getState();
    expect(state.combat.inCombat).toBe(true);
    expect(state.combat.turn).toBe(1);
    expect(state.combat.currentEnemy?.id).toBe('whisper-of-doubt');

    const initialPlayerLp = state.combat.resources.lp;
    const initialEnemyHp = state.combat.currentEnemy?.currentHP;

    // 2. Execute Player Action
    executeCombatAction('ILLUMINATE');
    state = useGameStore.getState();

    // Verify player action effects
    expect(state.combat.resources.lp).toBe(initialPlayerLp - COMBAT_BALANCE.ILLUMINATE_LP_COST);
    const expectedDamage = 3 + Math.floor(state.guardianTrust / 4);
    expect(state.combat.currentEnemy?.currentHP).toBe(initialEnemyHp! - expectedDamage);
    expect(state.combat.log.some(l => l.actor === 'PLAYER' && l.action === 'ILLUMINATE')).toBe(true);

    // At this point, the turn number should still be 1, as the turn hasn't ended yet
    expect(state.combat.turn).toBe(1);

    // 3. End Turn
    endTurn();
    state = useGameStore.getState();

    // Verify end of turn effects
    // Turn should have advanced
    expect(state.combat.turn).toBe(2);
    // Shadow should have taken an action
    expect(state.combat.log.some(l => l.actor === 'SHADOW')).toBe(true);
  });
});
