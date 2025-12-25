/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';
import { usePlayerResources } from '@/store/slices';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('MaxPlayerHealth Persistence', () => {
  const mockUser = { id: 'test-user-id' };
  let mockFrom: any;
  let mockUpsert: Mock;
  let mockSelect: Mock;
  let mockSingle: Mock;
  let mockEq: Mock;
  let mockOrderBy: Mock;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock chain
    mockOrderBy = vi.fn().mockReturnValue({
      data: [],
      error: null,
    });

    mockSingle = vi.fn().mockReturnValue({
      data: null,
      error: { code: 'PGRST116' }, // No rows found
    });

    mockEq = vi.fn().mockReturnValue({
      single: mockSingle,
      order: mockOrderBy,
    });

    mockSelect = vi.fn().mockReturnValue({
      data: [],
      error: null,
    });

    mockUpsert = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    mockFrom = vi.fn().mockReturnValue({
      upsert: mockUpsert,
      select: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
    });

    (supabase.from as Mock).mockImplementation(mockFrom);
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Reset game store and player resources
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  describe('Saving MaxPlayerHealth', () => {
    it('should include max_player_health when saving to Supabase', async () => {
      // Get direct access to player resources store
      const resourcesStore = usePlayerResources.getState();

      // Set maxPlayerHealth to a non-default value
      act(() => {
        resourcesStore.setAllResources({
          maxPlayerHealth: 150,
          playerHealth: 100,
        });
      });

      const { result } = renderHook(() => useGameStore());

      // Save to Supabase
      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Verify upsert was called with max_player_health
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_player_health: 150,
          player_health: 100,
        }),
        expect.any(Object),
      );
    });

    it('should save modified maxPlayerHealth correctly', async () => {
      const resourcesStore = usePlayerResources.getState();

      // Set maxPlayerHealth to various values
      act(() => {
        resourcesStore.setAllResources({
          maxPlayerHealth: 120,
        });
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.saveToSupabase();
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_player_health: 120,
        }),
        expect.any(Object),
      );
    });
  });

  describe('Loading MaxPlayerHealth', () => {
    it('should restore maxPlayerHealth from database', async () => {
      const { result } = renderHook(() => useGameStore());

      // Mock database response with maxPlayerHealth value
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_health: 100,
          max_player_health: 150,
          player_energy: 100,
          max_player_energy: 100,
        },
        error: null,
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Verify maxPlayerHealth was restored
      expect(result.current.maxPlayerHealth).toBe(150);
    });

    it('should use default value if max_player_health is null', async () => {
      const resourcesStore = usePlayerResources.getState();

      // Set a known default value first
      act(() => {
        resourcesStore.setAllResources({
          maxPlayerHealth: 100,
        });
      });

      const { result } = renderHook(() => useGameStore());

      // Mock database response with null max_player_health
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_health: 100,
          max_player_health: null,
          player_energy: 100,
          max_player_energy: 100,
        },
        error: null,
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Should use current/default value (100)
      expect(result.current.maxPlayerHealth).toBe(100);
    });

    it('should use default value if max_player_health is missing', async () => {
      const resourcesStore = usePlayerResources.getState();

      // Set a known default value first
      act(() => {
        resourcesStore.setAllResources({
          maxPlayerHealth: 100,
        });
      });

      const { result } = renderHook(() => useGameStore());

      // Mock database response without max_player_health field (legacy data)
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 75,
          player_level: 3,
          current_scene_index: 5,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          // No max_player_health field
        },
        error: null,
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Should default to 100
      expect(result.current.maxPlayerHealth).toBe(100);
    });
  });

  describe('Cross-Device Sync Simulation', () => {
    it('should persist maxPlayerHealth across save/reset/load cycle', async () => {
      const resourcesStore = usePlayerResources.getState();

      // Step 1: Set maxPlayerHealth to 150
      act(() => {
        resourcesStore.setAllResources({
          maxPlayerHealth: 150,
          playerHealth: 150,
        });
      });

      const { result } = renderHook(() => useGameStore());

      // Step 2: Save to Supabase
      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Verify save included correct value
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_player_health: 150,
        }),
        expect.any(Object),
      );

      // Step 3: Reset local state (simulates clearing localStorage)
      act(() => {
        result.current.resetGame();
      });

      // Verify reset occurred
      expect(result.current.maxPlayerHealth).toBe(100); // Default value

      // Step 4: Mock database response with previously saved value
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_health: 150,
          max_player_health: 150,
          player_energy: 100,
          max_player_energy: 100,
        },
        error: null,
      });

      // Step 5: Load from Supabase (simulates logging in on different device)
      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Step 6: Verify maxPlayerHealth was restored
      expect(result.current.maxPlayerHealth).toBe(150);
    });
  });

  describe('All 6 Resources Sync', () => {
    it('should save and load all 6 resource fields correctly', async () => {
      const resourcesStore = usePlayerResources.getState();

      // Set all 6 resources to non-default values
      act(() => {
        resourcesStore.setAllResources({
          playerHealth: 75,
          maxPlayerHealth: 150,
          playerEnergy: 80,
          maxPlayerEnergy: 120,
          lightPoints: 25,
          shadowPoints: 15,
        });
      });

      const { result } = renderHook(() => useGameStore());

      // Save
      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Verify all 6 resources were saved
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_health: 75,
          max_player_health: 150,
          player_energy: 80,
          max_player_energy: 120,
          light_points: 25,
          shadow_points: 15,
        }),
        expect.any(Object),
      );

      // Reset
      act(() => {
        result.current.resetGame();
      });

      // Mock load response
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_health: 75,
          max_player_health: 150,
          player_energy: 80,
          max_player_energy: 120,
          light_points: 25,
          shadow_points: 15,
        },
        error: null,
      });

      // Load
      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Verify all 6 resources were restored
      expect(result.current.playerHealth).toBe(75);
      expect(result.current.maxPlayerHealth).toBe(150);
      expect(result.current.playerEnergy).toBe(80);
      expect(result.current.maxPlayerEnergy).toBe(120);
      expect(result.current.lightPoints).toBe(25);
      expect(result.current.shadowPoints).toBe(15);
    });
  });
});
