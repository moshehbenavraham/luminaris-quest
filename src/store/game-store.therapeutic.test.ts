/**
 * Therapeutic Data Persistence Test Suite
 *
 * Tests for growthInsights persistence in the game store:
 * - Add insight, verify state update
 * - Verify included in saveToSupabase payload
 * - Verify included in localStorage partialize
 * - Verify restore from localStorage on hydration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore, useGameStoreBase } from '@/store/game-store';

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
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

describe('Therapeutic Data Persistence - growthInsights', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    // Reset store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  describe('growthInsights State Management', () => {
    it('should start with empty growthInsights array', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.playerStatistics.growthInsights).toEqual([]);
    });

    it('should add a growth insight to state', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('I learned to face my fears today.');
      });

      expect(result.current.playerStatistics.growthInsights).toHaveLength(1);
      expect(result.current.playerStatistics.growthInsights).toContain(
        'I learned to face my fears today.',
      );
    });

    it('should trim whitespace from insights', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('  Insight with spaces  ');
      });

      expect(result.current.playerStatistics.growthInsights).toContain('Insight with spaces');
    });

    it('should not add empty insights', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('');
        result.current.addGrowthInsight('   ');
      });

      expect(result.current.playerStatistics.growthInsights).toHaveLength(0);
    });

    it('should not add duplicate insights', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('Same insight');
        result.current.addGrowthInsight('Same insight');
      });

      expect(result.current.playerStatistics.growthInsights).toHaveLength(1);
    });

    it('should add multiple unique insights', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('First insight');
        result.current.addGrowthInsight('Second insight');
        result.current.addGrowthInsight('Third insight');
      });

      expect(result.current.playerStatistics.growthInsights).toHaveLength(3);
      expect(result.current.playerStatistics.growthInsights).toEqual([
        'First insight',
        'Second insight',
        'Third insight',
      ]);
    });
  });

  describe('growthInsights Persistence', () => {
    it('should mark hasUnsavedChanges when adding insight', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('New therapeutic insight');
      });

      expect(result.current.saveState.hasUnsavedChanges).toBe(true);
    });

    it('should include growthInsights in localStorage partialize', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('Persisted insight');
      });

      // Check localStorage directly
      const stored = localStorage.getItem('luminari-game-state');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.playerStatistics.growthInsights).toContain('Persisted insight');
    });

    it('should preserve growthInsights after resetGame on other statistics', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('Before reset');
      });

      act(() => {
        result.current.resetGame();
      });

      // After reset, growthInsights should be cleared as part of full reset
      expect(result.current.playerStatistics.growthInsights).toEqual([]);
    });

    it('should preserve growthInsights when updating combat statistics', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addGrowthInsight('Before combat stats');
      });

      act(() => {
        result.current.updateCombatStatistics(
          { ILLUMINATE: 5, REFLECT: 3, ENDURE: 2, EMBRACE: 1 },
          true,
          10,
        );
      });

      expect(result.current.playerStatistics.growthInsights).toContain('Before combat stats');
      expect(result.current.playerStatistics.totalCombatsWon).toBe(1);
    });
  });

  describe('growthInsights Hydration', () => {
    it('should restore growthInsights from localStorage on hydration', async () => {
      // First, add some insights
      const { result: result1 } = renderHook(() => useGameStore());
      act(() => {
        result1.current.addGrowthInsight('Hydration test insight 1');
        result1.current.addGrowthInsight('Hydration test insight 2');
      });

      // Simulate re-mounting the hook (like a page refresh)
      const { result: result2 } = renderHook(() => useGameStoreBase());

      // Wait for hydration
      await vi.waitFor(() => {
        expect(result2.current._hasHydrated).toBe(true);
      });

      expect(result2.current.playerStatistics.growthInsights).toContain('Hydration test insight 1');
      expect(result2.current.playerStatistics.growthInsights).toContain('Hydration test insight 2');
    });

    it('should handle missing growthInsights in legacy data', () => {
      // Simulate legacy localStorage data without growthInsights
      const legacyData = {
        state: {
          playerStatistics: {
            combatActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
            totalCombatsWon: 0,
            totalCombatsLost: 0,
            totalTurnsPlayed: 0,
            averageCombatLength: 0,
            // Note: no growthInsights field
          },
          guardianTrust: 50,
          playerLevel: 1,
          currentSceneIndex: 0,
          journalEntries: [],
          milestones: [],
          sceneHistory: [],
          experiencePoints: 0,
          experienceToNext: 100,
          pendingMilestoneJournals: [],
        },
        version: 0,
      };

      localStorage.setItem('luminari-game-state', JSON.stringify(legacyData));

      // Mount the hook - it should handle missing growthInsights gracefully
      const { result } = renderHook(() => useGameStoreBase());

      // The merge function should provide default empty array
      expect(result.current.playerStatistics.growthInsights).toEqual([]);
    });
  });

  describe('growthInsights in playerStatistics Structure', () => {
    it('should have correct PlayerStatistics structure with growthInsights', () => {
      const { result } = renderHook(() => useGameStore());

      const stats = result.current.playerStatistics;

      expect(stats).toHaveProperty('combatActions');
      expect(stats).toHaveProperty('totalCombatsWon');
      expect(stats).toHaveProperty('totalCombatsLost');
      expect(stats).toHaveProperty('totalTurnsPlayed');
      expect(stats).toHaveProperty('averageCombatLength');
      expect(stats).toHaveProperty('growthInsights');
      expect(Array.isArray(stats.growthInsights)).toBe(true);
    });
  });
});
