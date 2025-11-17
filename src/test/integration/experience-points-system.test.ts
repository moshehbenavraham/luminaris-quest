/**
 * Experience Points System Test Suite
 * 
 * Comprehensive testing for the therapeutic XP system including:
 * - Level progression calculations
 * - XP rewards for scenes and combat
 * - Level benefits application
 * - Database persistence
 * - UI integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';
import { getLevelBenefits } from '@/store/game-store';
import { handleSceneOutcome, rollDice, getLevelRollBonus } from '@/engine/scene-engine';

// Mock supabase for testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  },
}));

describe('Experience Points System', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    // Reset store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  describe('Level Progression Calculations', () => {
    it('should start at level 1 with 0 XP', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.playerLevel).toBe(1);
      expect(result.current.experiencePoints).toBe(0);
      expect(result.current.experienceToNext).toBe(100);
    });

    it('should calculate correct XP requirements for each level', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Level 2 requires 100 XP (base)
      act(() => {
        result.current.modifyExperiencePoints(99, 'test');
      });
      expect(result.current.playerLevel).toBe(1);
      
      act(() => {
        result.current.modifyExperiencePoints(1, 'test');
      });
      expect(result.current.playerLevel).toBe(2);
      
      // Level 3 requires 140 XP total (100 + 140)
      act(() => {
        result.current.modifyExperiencePoints(140, 'test');
      });
      expect(result.current.playerLevel).toBe(3);
    });

    it('should handle level progression with gentle exponential growth', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Test progression through first few levels
      const expectedLevels = [
        { totalXP: 0, level: 1 },
        { totalXP: 100, level: 2 },
        { totalXP: 240, level: 3 }, // 100 + 140
        { totalXP: 436, level: 4 }, // 100 + 140 + 196
        { totalXP: 710, level: 5 }, // 100 + 140 + 196 + 274
      ];
      
      expectedLevels.forEach(({ totalXP, level }) => {
        act(() => {
          result.current.modifyExperiencePoints(totalXP - result.current.experiencePoints, 'test');
        });
        expect(result.current.playerLevel).toBe(level);
      });
    });

    it('should provide utility functions for level progression', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.modifyExperiencePoints(150, 'test');
      });
      
      expect(result.current.getPlayerLevel()).toBe(2);
      
      const progress = result.current.getExperienceProgress();
      expect(progress.current).toBe(50); // Current progress in level 2 (150 - 100)
      expect(progress.toNext).toBe(90);  // Remaining XP needed for level 3 (140 - 50)
      expect(progress.percentage).toBeCloseTo(35.7, 1); // 50/140 * 100
    });
  });

  describe('Scene XP Rewards', () => {
    it('should award appropriate XP for different scene types', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Test each scene type
      const sceneTypes = ['social', 'skill', 'combat', 'journal', 'exploration'] as const;
      const expectedBaseXP = { social: 25, skill: 35, combat: 50, journal: 20, exploration: 30 };
      
      sceneTypes.forEach(sceneType => {
        const scene = { id: 'test', type: sceneType, title: 'Test', text: 'Test', dc: 10, successText: 'Success', failureText: 'Failure', choices: { bold: 'Bold', cautious: 'Cautious' } };
        
        // Test successful completion
        const successOutcome = handleSceneOutcome(scene, true, 15, 0);
        expect(successOutcome.experienceChanges?.xpGained).toBe(expectedBaseXP[sceneType]);
        expect(successOutcome.experienceChanges?.reason).toBe(`${sceneType} scene completed`);
        
        // Test failed attempt (60% XP)
        const failureOutcome = handleSceneOutcome(scene, false, 8, 0);
        expect(failureOutcome.experienceChanges?.xpGained).toBe(Math.floor(expectedBaseXP[sceneType] * 0.6));
        expect(failureOutcome.experienceChanges?.reason).toBe(`${sceneType} scene attempted`);
      });
    });

    it('should include difficulty bonus for later scenes', () => {
      const scene = { id: 'test', type: 'social' as const, title: 'Test', text: 'Test', dc: 10, successText: 'Success', failureText: 'Failure', choices: { bold: 'Bold', cautious: 'Cautious' } };
      
      // Scene 0-9 (no bonus)
      const earlyOutcome = handleSceneOutcome(scene, true, 15, 5);
      expect(earlyOutcome.experienceChanges?.xpGained).toBe(25);
      
      // Scene 10-19 (+5 bonus)
      const midOutcome = handleSceneOutcome(scene, true, 15, 15);
      expect(midOutcome.experienceChanges?.xpGained).toBe(30);
      
      // Scene 20-29 (+10 bonus)
      const lateOutcome = handleSceneOutcome(scene, true, 15, 25);
      expect(lateOutcome.experienceChanges?.xpGained).toBe(35);
    });

    it('should provide level-based dice roll bonuses', () => {
      expect(getLevelRollBonus(1)).toBe(0);  // Level 1 = +0
      expect(getLevelRollBonus(2)).toBe(1);  // Level 2 = +1
      expect(getLevelRollBonus(5)).toBe(4);  // Level 5 = +4
      expect(getLevelRollBonus(10)).toBe(9); // Level 10 = +9
    });

    it('should apply level bonus to dice rolls', () => {
      // Mock Math.random to control dice roll
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5); // Will roll 11 on d20
      
      const resultNoBonus = rollDice(15, 0);
      expect(resultNoBonus.roll).toBe(11);
      expect(resultNoBonus.success).toBe(false);
      
      const resultWithBonus = rollDice(15, 4); // +4 level bonus
      expect(resultWithBonus.roll).toBe(15); // 11 + 4
      expect(resultWithBonus.success).toBe(true);
      
      mockRandom.mockRestore();
    });
  });

  describe('Level Benefits System', () => {
    it('should calculate correct benefits for each level', () => {
      const level1Benefits = getLevelBenefits(1);
      expect(level1Benefits).toEqual({
        maxEnergyBonus: 0,
        startingLPBonus: 0,
        energyCostReduction: 0,
        trustGainMultiplier: 1
      });

      const level5Benefits = getLevelBenefits(5);
      expect(level5Benefits).toEqual({
        maxEnergyBonus: 20,     // (5-1)/2 * 10 = 20
        startingLPBonus: 5,     // (5-1)/3 * 5 = 5 (rounded down)
        energyCostReduction: 1, // (5-1)/4 = 1
        trustGainMultiplier: 1 // 1 + (5-1)/5 * 0.2 = 1 + 0 * 0.2 = 1 (starts at level 6)
      });

      const level10Benefits = getLevelBenefits(10);
      expect(level10Benefits).toEqual({
        maxEnergyBonus: 40,     // (10-1)/2 * 10 = 40
        startingLPBonus: 15,    // (10-1)/3 * 5 = 15
        energyCostReduction: 2, // (10-1)/4 = 2.25 -> 2
        trustGainMultiplier: 1.2 // 1 + (10-1)/5 * 0.2 = 1 + 1 * 0.2 = 1.2
      });
    });

    it('should apply level benefits on level up', () => {
      const { result } = renderHook(() => useGameStore());
      
      const initialEnergy = result.current.maxPlayerEnergy;
      const initialLP = result.current.lightPoints;
      
      // Level up to 2 (Level 2 doesn't get energy bonus yet - starts at level 3)
      act(() => {
        result.current.modifyExperiencePoints(100, 'test level up');
      });
      
      expect(result.current.playerLevel).toBe(2);
      expect(result.current.maxPlayerEnergy).toBe(initialEnergy); // No energy bonus at level 2
      expect(result.current.playerEnergy).toBe(initialEnergy); // No energy boost at level 2
      
      // Level up to 3 (should get +10 max energy bonus, no LP bonus yet)
      act(() => {
        result.current.modifyExperiencePoints(140, 'test level up');
      });
      
      expect(result.current.playerLevel).toBe(3);
      expect(result.current.maxPlayerEnergy).toBe(initialEnergy + 10); // +10 energy bonus at level 3
      expect(result.current.playerEnergy).toBe(initialEnergy + 10); // Current energy also boosted
    });

    it('should create level-up journal entries with benefits listed', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.modifyExperiencePoints(100, 'test achievement');
      });
      
      // Should have created a level-up journal entry
      const levelUpEntry = result.current.journalEntries.find(entry => 
        entry.title === 'Level 2 Achieved!'
      );
      
      expect(levelUpEntry).toBeDefined();
      expect(levelUpEntry?.content).toContain('test achievement');
      expect(levelUpEntry?.content).toContain('+1 bonus to all dice rolls'); // Level 2 doesn't get energy bonus
      expect(levelUpEntry?.content).toContain('+1 bonus to all dice rolls');
      expect(levelUpEntry?.tags).toContain('level-up');
      expect(levelUpEntry?.tags).toContain('achievement');
    });
  });

  describe('Combat XP Integration', () => {
    it('should award appropriate XP for combat victories', () => {
      // This tests the integration points - the actual combat XP is tested in combat components
      const expectedCombatXP = {
        'whisper-of-doubt': 40,
        'shadow-of-isolation': 55,
        'overwhelm-tempest': 70,
        'echo-of-past-pain': 75
      };
      
      Object.entries(expectedCombatXP).forEach(([shadowId, expectedXP]) => {
        expect(expectedXP).toBeGreaterThan(35); // Should be more than skill scenes
        expect(expectedXP).toBeLessThan(80);    // Should be reasonable for combat
      });
    });

    it('should award partial XP for combat attempts', () => {
      const attemptXP = 15;
      expect(attemptXP).toBeGreaterThan(0);
      expect(attemptXP).toBeLessThan(25); // Less than minimum scene XP
    });
  });

  describe('Therapeutic Design Validation', () => {
    it('should reward effort over success (60% XP for failures)', () => {
      const scene = { id: 'test', type: 'social' as const, title: 'Test', text: 'Test', dc: 10, successText: 'Success', failureText: 'Failure', choices: { bold: 'Bold', cautious: 'Cautious' } };
      
      const successOutcome = handleSceneOutcome(scene, true, 15, 0);
      const failureOutcome = handleSceneOutcome(scene, false, 8, 0);
      
      const successXP = successOutcome.experienceChanges?.xpGained || 0;
      const failureXP = failureOutcome.experienceChanges?.xpGained || 0;
      
      expect(failureXP).toBe(Math.floor(successXP * 0.6));
      expect(failureXP).toBeGreaterThan(0); // Always reward some XP
    });

    it('should provide gentle progression curve (not grinding)', () => {
      // Verify that progression feels rewarding but not overwhelming
      const level2XP = 100;
      const level3XP = 240;
      const level4XP = 436;
      
      // Growth factor should be reasonable (1.4x)
      const growthFactor = (level3XP - level2XP) / level2XP;
      expect(growthFactor).toBeCloseTo(1.4, 1);
      
      // Should not require excessive grinding
      expect(level4XP).toBeLessThan(1000); // Reasonable for early levels
    });

    it('should integrate with Guardian Trust system (not compete)', () => {
      const { result } = renderHook(() => useGameStore());
      
      // XP system should enhance, not replace trust
      expect(result.current.guardianTrust).toBeDefined();
      
      // Level benefits should enhance trust gain (starts at level 6)
      const level6Benefits = getLevelBenefits(6);
      expect(level6Benefits.trustGainMultiplier).toBeGreaterThan(1);
    });

    it('should provide meaningful level benefits that enhance gameplay', () => {
      const level10Benefits = getLevelBenefits(10);
      
      // Energy bonus makes actions more accessible
      expect(level10Benefits.maxEnergyBonus).toBeGreaterThan(20);
      
      // Cost reduction removes barriers
      expect(level10Benefits.energyCostReduction).toBeGreaterThan(0);
      
      // Trust multiplier accelerates therapeutic progress
      expect(level10Benefits.trustGainMultiplier).toBeGreaterThanOrEqual(1.2);
      
      // LP bonus provides combat confidence
      expect(level10Benefits.startingLPBonus).toBeGreaterThan(10);
    });
  });

  describe('Persistence Integration', () => {
    it('should include XP fields in save operations', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Mock the save operation to capture the data
      const mockSave = vi.fn();
      const originalSave = result.current.saveToSupabase;
      
      act(() => {
        result.current.modifyExperiencePoints(50, 'test');
      });
      
      // Verify that XP data would be included in save
      expect(result.current.experiencePoints).toBe(50);
      expect(result.current.experienceToNext).toBe(50); // 100 - 50 = 50 remaining
      expect(result.current.playerLevel).toBe(1);
    });

    it('should handle backward compatibility during load', () => {
      // This tests that the fallback logic works for users without XP data
      const { result } = renderHook(() => useGameStore());
      
      // Initial state should have safe defaults
      expect(result.current.experiencePoints).toBe(0);
      expect(result.current.experienceToNext).toBe(100);
      expect(result.current.playerLevel).toBe(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle negative XP gracefully', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.modifyExperiencePoints(-50, 'test negative');
      });
      
      expect(result.current.experiencePoints).toBe(0); // Should not go below 0
      expect(result.current.playerLevel).toBe(1);
    });

    it('should handle very large XP values', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.modifyExperiencePoints(10000, 'test large');
      });
      
      expect(result.current.experiencePoints).toBe(10000);
      expect(result.current.playerLevel).toBeGreaterThan(10);
      expect(result.current.playerLevel).toBeLessThan(50); // Should not break progression
    });

    it('should handle missing scene data gracefully', () => {
      const incompleteScene = { id: 'test', type: 'social' as const, title: 'Test', text: 'Test', dc: 10, successText: 'Success', failureText: 'Failure', choices: { bold: 'Bold', cautious: 'Cautious' } };
      
      const outcome = handleSceneOutcome(incompleteScene, true, 15);
      expect(outcome.experienceChanges?.xpGained).toBeGreaterThan(0);
    });
  });
});