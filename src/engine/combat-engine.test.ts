import { describe, it, expect } from 'vitest';
import {
  calculateIlluminateDamage,
  calculateEmbraceDamage,
  canPerformAction,
  executePlayerAction,
  executeEnemyTurn,
  checkCombatEnd,
  getActionCost,
  getActionDescription,
  type CombatEngineState,
} from '@/engine/combat-engine';

const createState = (overrides: Partial<CombatEngineState> = {}): CombatEngineState => ({
  enemy: {
    id: 'test-shadow',
    name: 'Test Shadow',
    type: 'doubt',
    description: 'A test shadow',
    currentHP: 20,
    maxHP: 20,
    abilities: [],
    therapeuticInsight: 'Test insight',
    victoryReward: { lpBonus: 5, growthMessage: 'Growth', permanentBenefit: 'Benefit' },
  },
  resources: { lp: 10, sp: 5 },
  playerHealth: 100,
  playerLevel: 1,
  playerEnergy: 10,
  maxPlayerEnergy: 100,
  turn: 1,
  isPlayerTurn: true,
  statusEffects: {
    damageMultiplier: 1,
    damageReduction: 1,
    healingBlocked: 0,
    lpGenerationBlocked: 0,
    skipNextTurn: false,
    consecutiveEndures: 0,
  },
  preferredActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
  ...overrides,
});

describe('Combat Engine (new combat system semantics)', () => {
  it('calculateIlluminateDamage scales with level', () => {
    expect(calculateIlluminateDamage(1)).toBe(4); // 3 + floor(1*1.5)
    expect(calculateIlluminateDamage(5)).toBe(10); // 3 + floor(5*1.5)
  });

  it('calculateEmbraceDamage converts SP to damage with minimum 1', () => {
    expect(calculateEmbraceDamage(0)).toBe(1);
    expect(calculateEmbraceDamage(5)).toBe(2);
    expect(calculateEmbraceDamage(8)).toBe(4);
  });

  it('canPerformAction enforces LP/SP thresholds and ENDURE energy gating', () => {
    const state = createState({ resources: { lp: 1, sp: 0 }, playerEnergy: 0 });
    expect(canPerformAction('ILLUMINATE', state).canPerform).toBe(false);
    expect(canPerformAction('REFLECT', state).canPerform).toBe(false);
    expect(canPerformAction('EMBRACE', state).canPerform).toBe(false);

    expect(canPerformAction('ENDURE', state, { endureEnergyCost: 1 }).canPerform).toBe(false);
    expect(
      canPerformAction('ENDURE', { ...state, playerEnergy: 1 }, { endureEnergyCost: 1 }).canPerform,
    ).toBe(true);
  });

  it('executePlayerAction ILLUMINATE consumes LP and damages enemy', () => {
    const state = createState({ playerLevel: 1, resources: { lp: 10, sp: 0 } });
    const result = executePlayerAction('ILLUMINATE', state);

    expect(result.newState.resources.lp).toBe(8);
    expect(result.damage).toBe(4);
    expect(result.newState.enemy?.currentHP).toBe(16);
    expect(result.logEntry.action).toBe('ILLUMINATE');
  });

  it('executePlayerAction REFLECT converts SP to LP and heals deterministically with rng', () => {
    const state = createState({
      playerLevel: 3,
      playerHealth: 80,
      resources: { lp: 10, sp: 5 },
    });

    const result = executePlayerAction('REFLECT', state, { rng: () => 0 }); // heal = 1
    expect(result.newState.resources.sp).toBe(2);
    expect(result.newState.resources.lp).toBe(11);
    expect(result.newState.playerHealth).toBe(81);
  });

  it('executePlayerAction ENDURE gains LP and spends energy', () => {
    const state = createState({ playerEnergy: 10, resources: { lp: 10, sp: 0 } });
    const result = executePlayerAction('ENDURE', state, { endureEnergyCost: 1 });
    expect(result.newState.resources.lp).toBe(11);
    expect(result.newState.playerEnergy).toBe(9);
    expect(result.logEntry.effect).toContain('-1 Energy');
  });

  it('executePlayerAction EMBRACE consumes all SP and damages enemy', () => {
    const state = createState({ resources: { lp: 10, sp: 8 } });
    const result = executePlayerAction('EMBRACE', state);
    expect(result.newState.resources.sp).toBe(0);
    expect(result.damage).toBe(4);
    expect(result.newState.enemy?.currentHP).toBe(16);
  });

  it('executeEnemyTurn applies damage, grants SP, and advances turn (unless defeated)', () => {
    const state = createState({
      isPlayerTurn: false,
      resources: { lp: 10, sp: 5 },
      playerHealth: 100,
    });
    const result = executeEnemyTurn(state);

    expect(result.damage).toBe(3); // base 8 - floor(10*0.5)=5
    expect(result.newState.playerHealth).toBe(97);
    expect(result.newState.resources.sp).toBe(6);
    expect(result.newState.turn).toBe(2);
    expect(result.newState.isPlayerTurn).toBe(true);

    const defeatState = createState({
      isPlayerTurn: false,
      resources: { lp: 0, sp: 0 },
      playerHealth: 1,
    });
    const defeatResult = executeEnemyTurn(defeatState);
    expect(defeatResult.newState.playerHealth).toBe(0);
    expect(defeatResult.newState.turn).toBe(1);
    expect(defeatResult.newState.isPlayerTurn).toBe(false);
  });

  it('checkCombatEnd detects victory and defeat', () => {
    expect(
      checkCombatEnd(createState({ enemy: { ...createState().enemy!, currentHP: 0 } })).isEnded,
    ).toBe(true);
    expect(checkCombatEnd(createState({ playerHealth: 0 })).isEnded).toBe(true);
    expect(checkCombatEnd(createState()).isEnded).toBe(false);
  });

  it('getActionCost and getActionDescription are stable', () => {
    expect(getActionCost('ILLUMINATE')).toEqual({ lp: 2 });
    expect(getActionCost('REFLECT')).toEqual({ sp: 3 });
    expect(getActionCost('ENDURE', { endureEnergyCost: 1 })).toEqual({ energy: 1 });
    expect(getActionCost('EMBRACE')).toEqual({ sp: 5 });
    expect(getActionDescription('ILLUMINATE')).toContain('damage');
  });
});
