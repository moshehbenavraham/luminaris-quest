import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}));

describe('Energy System Persistence', () => {
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
      error: null
    });

    mockSingle = vi.fn().mockReturnValue({
      data: null,
      error: { code: 'PGRST116' } // No rows found
    });

    mockEq = vi.fn().mockReturnValue({
      single: mockSingle,
      order: mockOrderBy
    });

    mockSelect = vi.fn().mockReturnValue({
      data: [],
      error: null
    });

    mockUpsert = vi.fn().mockReturnValue({
      select: mockSelect
    });

    mockFrom = vi.fn().mockReturnValue({
      upsert: mockUpsert,
      select: vi.fn().mockReturnValue({
        eq: mockEq
      })
    });

    (supabase.from as Mock).mockImplementation(mockFrom);
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Reset game store
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  describe('Saving Energy State', () => {
    it('should include energy fields when saving to Supabase', async () => {
      const { result } = renderHook(() => useGameStore());

      // Modify energy to non-default values
      act(() => {
        result.current.setPlayerEnergy(75);
      });

      // Save to Supabase
      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Verify upsert was called with energy fields
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_energy: 75,
          max_player_energy: 100
        }),
        expect.any(Object)
      );
    });

    it('should save current energy values, not default values', async () => {
      const { result } = renderHook(() => useGameStore());

      // Set energy to various values
      act(() => {
        result.current.modifyPlayerEnergy(-30); // 70
        result.current.modifyPlayerEnergy(15);  // 85
      });

      await act(async () => {
        await result.current.saveToSupabase();
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_energy: 85,
          max_player_energy: 100
        }),
        expect.any(Object)
      );
    });

    it('should handle energy at boundaries correctly', async () => {
      const { result } = renderHook(() => useGameStore());

      // Test at minimum
      act(() => {
        result.current.setPlayerEnergy(0);
      });

      await act(async () => {
        await result.current.saveToSupabase();
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_energy: 0,
          max_player_energy: 100
        }),
        expect.any(Object)
      );

      // Test at maximum
      act(() => {
        result.current.setPlayerEnergy(100);
      });

      await act(async () => {
        await result.current.saveToSupabase();
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_energy: 100,
          max_player_energy: 100
        }),
        expect.any(Object)
      );
    });
  });

  describe('Loading Energy State', () => {
    it('should load energy values from database', async () => {
      const { result } = renderHook(() => useGameStore());

      // Mock database response with energy values
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_energy: 60,
          max_player_energy: 100
        },
        error: null
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      expect(result.current.playerEnergy).toBe(60);
      expect(result.current.maxPlayerEnergy).toBe(100);
    });

    it('should use default values if energy fields are missing', async () => {
      const { result } = renderHook(() => useGameStore());

      // Mock database response without energy fields (legacy data)
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 75,
          player_level: 3,
          current_scene_index: 5,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([])
          // No energy fields
        },
        error: null
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Should default to 100/100
      expect(result.current.playerEnergy).toBe(100);
      expect(result.current.maxPlayerEnergy).toBe(100);
    });

    it('should handle null energy values gracefully', async () => {
      const { result } = renderHook(() => useGameStore());

      // Mock database response with null energy values
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 50,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_energy: null,
          max_player_energy: null
        },
        error: null
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Should default to 100/100
      expect(result.current.playerEnergy).toBe(100);
      expect(result.current.maxPlayerEnergy).toBe(100);
    });
  });

  describe('Energy Persistence with Other State', () => {
    it('should save and load energy alongside other game state', async () => {
      const { result } = renderHook(() => useGameStore());

      // Set various game state including energy
      act(() => {
        result.current.setGuardianTrust(75);
        result.current.setPlayerEnergy(50);
        result.current.modifyLightPoints(5);
        result.current.modifyShadowPoints(3);
      });

      // Save
      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Verify all state was saved
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          guardian_trust: 75,
          player_energy: 50,
          max_player_energy: 100
        }),
        expect.any(Object)
      );

      // Reset local state
      act(() => {
        result.current.resetGame();
      });

      // Mock load response
      mockSingle.mockReturnValueOnce({
        data: {
          guardian_trust: 75,
          player_level: 1,
          current_scene_index: 0,
          milestones: JSON.stringify([]),
          scene_history: JSON.stringify([]),
          player_energy: 50,
          max_player_energy: 100
        },
        error: null
      });

      // Load
      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Verify state was restored
      expect(result.current.guardianTrust).toBe(75);
      expect(result.current.playerEnergy).toBe(50);
      expect(result.current.maxPlayerEnergy).toBe(100);
    });
  });

  describe('Energy Save State Tracking', () => {
    it('should mark save state as changed when energy is modified', async () => {
      const { result } = renderHook(() => useGameStore());

      // Clear initial state
      act(() => {
        result.current.clearSaveError();
      });

      // Initially no unsaved changes after successful save
      mockUpsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          data: [{}],
          error: null
        })
      });

      await act(async () => {
        await result.current.saveToSupabase();
      });

      expect(result.current.saveState.hasUnsavedChanges).toBe(false);

      // Modify energy
      act(() => {
        result.current.modifyPlayerEnergy(-10);
      });

      // Should now have unsaved changes
      expect(result.current.saveState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const { result } = renderHook(() => useGameStore());
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock save error - ensure it fails on all retry attempts
      mockUpsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'Network error' }
        })
      });

      act(() => {
        result.current.setPlayerEnergy(50);
      });

      await act(async () => {
        await result.current.saveToSupabase();
      });

      // Should still have the energy value
      expect(result.current.playerEnergy).toBe(50);
      
      // Should mark save as having an error
      expect(result.current.saveState.status).toBe('error');
      expect(result.current.saveState.hasUnsavedChanges).toBe(true);

      consoleErrorSpy.mockRestore();
    });

    it('should handle load errors gracefully', async () => {
      const { result } = renderHook(() => useGameStore());
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set some energy value
      act(() => {
        result.current.setPlayerEnergy(75);
      });

      // Mock load error
      mockSingle.mockReturnValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await act(async () => {
        await result.current.loadFromSupabase();
      });

      // Should retain existing energy value
      expect(result.current.playerEnergy).toBe(75);

      consoleErrorSpy.mockRestore();
    });
  });
}); 