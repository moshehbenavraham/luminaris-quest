import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';

// Mock logger to prevent console output during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('Combat Health Integration', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  it('should track player health in game state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.playerHealth).toBe(100);
    expect(result.current.maxPlayerHealth).toBe(100);
  });

  it('should modify player health correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.modifyPlayerHealth(-20);
    });
    
    expect(result.current.playerHealth).toBe(80);
  });

  it('should heal player health correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    // First damage the player
    act(() => {
      result.current.modifyPlayerHealth(-30);
    });
    expect(result.current.playerHealth).toBe(70);
    
    // Then heal
    act(() => {
      result.current.healPlayerHealth(15);
    });
    expect(result.current.playerHealth).toBe(85);
  });

  it('should not allow health to exceed maximum', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.healPlayerHealth(50);
    });
    
    expect(result.current.playerHealth).toBe(100); // Should stay at max
  });

  it('should not allow health to go below zero', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.modifyPlayerHealth(-150);
    });
    
    expect(result.current.playerHealth).toBe(0); // Should not go negative
  });

  it('should start combat with scene DC', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.startCombat('whisper-of-doubt', 14);
    });
    
    expect(result.current.combat.inCombat).toBe(true);
    expect(result.current.combat.sceneDC).toBe(14);
    expect(result.current.combat.currentEnemy).toBeTruthy();
  });

  it('should apply health damage during shadow actions', () => {
    const { result } = renderHook(() => useGameStore());

    // Set lower guardian trust to ensure enemy survives the first attack
    act(() => {
      result.current.setGuardianTrust(20); // Lower trust = less damage
      result.current.modifyLightPoints(10); // Ensure enough LP for ILLUMINATE
    });

    // Verify guardian trust was set correctly
    expect(result.current.guardianTrust).toBe(20);

    // Start combat with a specific scene DC
    act(() => {
      result.current.startCombat('whisper-of-doubt', 16);
    });

    const initialHealth = result.current.playerHealth;
    expect(initialHealth).toBe(100);

    // Verify combat state before action
    expect(result.current.combat.inCombat).toBe(true);
    expect(result.current.combat.currentEnemy?.currentHP).toBe(15);

    // Execute a player action to trigger shadow response
    act(() => {
      result.current.executeCombatAction('ILLUMINATE');
    });

    // Player health should be reduced after shadow action
    expect(result.current.playerHealth).toBeLessThan(initialHealth);

    // Verify combat log contains health damage information
    const lastLogEntry = result.current.combat.log[result.current.combat.log.length - 1];
    if (lastLogEntry.actor === 'SHADOW') {
      expect(lastLogEntry.resourceChange).toHaveProperty('healthDamage');
      expect(lastLogEntry.message).toContain('health damage');
    }
  });

  it('should calculate health damage based on scene DC and defenses', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Set up specific conditions for predictable damage calculation
    act(() => {
      result.current.setGuardianTrust(20); // Lower trust to ensure enemy survives
      result.current.modifyLightPoints(10); // Start with 10 LP for combat
    });
    
    // Start combat with known scene DC
    act(() => {
      result.current.startCombat('whisper-of-doubt', 14);
    });
    
    const initialHealth = result.current.playerHealth;
    
    // Execute combat action
    act(() => {
      result.current.executeCombatAction('ILLUMINATE');
    });
    
    // Calculate expected damage: Scene DC 14 - (LP defense + trust defense)
    // With trust 20, ILLUMINATE damage = 3 + floor(20/4) = 8, enemy survives with 7 HP
    // LP defense: 8 LP * 0.5 = 4 (after ILLUMINATE cost)
    // Trust defense: 20 * 0.1 = 2
    // Total defense: 4 + 2 = 6
    // Expected damage: 14 - 6 = 8
    const expectedDamage = 8;
    const actualDamage = initialHealth - result.current.playerHealth;
    
    expect(actualDamage).toBe(expectedDamage);
  });

  it('should apply minimum damage when defenses are very high', () => {
    const { result } = renderHook(() => useGameStore());

    // Set up very high defenses but use ENDURE to avoid killing enemy
    act(() => {
      result.current.setGuardianTrust(100); // 10 defense from trust
      result.current.modifyLightPoints(50); // High LP for high defense
    });

    // Start combat with low scene DC
    act(() => {
      result.current.startCombat('whisper-of-doubt', 8);
    });

    const initialHealth = result.current.playerHealth;

    // Execute ENDURE action (doesn't damage enemy, so shadow will act)
    act(() => {
      result.current.executeCombatAction('ENDURE');
    });

    // Should apply minimum damage even with high defenses
    // Scene DC 8 - (50 LP * 0.5 + 100 trust * 0.1) = 8 - 35 = minimum 1
    // But shadow abilities can apply damage multipliers (e.g., Magnification = 2x)
    const actualDamage = initialHealth - result.current.playerHealth;
    expect(actualDamage).toBeGreaterThanOrEqual(1); // At least minimum damage
  });

  it('should handle multiple combat rounds with cumulative health damage', () => {
    const { result } = renderHook(() => useGameStore());

    // Give player some resources for combat
    act(() => {
      result.current.modifyLightPoints(5); // Some LP for actions
    });

    act(() => {
      result.current.startCombat('whisper-of-doubt', 12);
    });

    const initialHealth = result.current.playerHealth;
    const healthAfterRounds: number[] = [initialHealth];

    // Execute 2 combat rounds (shadow has 2 abilities with cooldowns 3 and 5)
    for (let i = 0; i < 2; i++) {
      act(() => {
        result.current.executeCombatAction('ENDURE'); // Low-cost action
      });

      // Record health after each round
      healthAfterRounds.push(result.current.playerHealth);
    }

    // Health should decrease in the first two rounds
    expect(healthAfterRounds[1]).toBeLessThan(healthAfterRounds[0]); // Round 1
    expect(healthAfterRounds[2]).toBeLessThan(healthAfterRounds[1]); // Round 2

    // Total health loss should be cumulative
    const totalDamage = initialHealth - result.current.playerHealth;
    expect(totalDamage).toBeGreaterThan(10); // At least 2 rounds of significant damage
  });

  it('should reset health damage tracking when combat ends', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.startCombat('whisper-of-doubt', 14);
    });
    
    expect(result.current.combat.sceneDC).toBe(14);
    
    act(() => {
      result.current.endCombat(true);
    });
    
    expect(result.current.combat.inCombat).toBe(false);
    expect(result.current.combat.sceneDC).toBe(0);
  });
});
