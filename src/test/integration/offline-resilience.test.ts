/**
 * Integration tests for offline resilience behavior
 *
 * Tests that critical game state persists to localStorage and gracefully
 * degrades when database operations fail.
 *
 * Session: phase00-session03-offline_resilience
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// Mock Supabase before importing the store
const mockSupabaseAuth = {
  getUser: vi.fn(),
};

const mockSupabaseFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => mockSupabaseAuth.getUser(),
    },
    from: (table: string) => mockSupabaseFrom(table),
  },
}));

// Mock shared resource store
vi.mock('@/store/slices', () => ({
  usePlayerResources: {
    getState: () => ({
      playerHealth: 100,
      maxPlayerHealth: 100,
      playerEnergy: 100,
      maxPlayerEnergy: 100,
      lightPoints: 10,
      shadowPoints: 5,
      getResourceSnapshot: () => ({
        playerHealth: 100,
        maxPlayerHealth: 100,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
        lightPoints: 10,
        shadowPoints: 5,
      }),
      setAllResources: vi.fn(),
      resetResources: vi.fn(),
    }),
  },
}));

// Import store after mocks
import { useGameStoreBase } from '@/store/game-store';

describe('Offline Resilience - Partialize Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('includes experiencePoints in partialize output', () => {
    // Modify experience points
    act(() => {
      useGameStoreBase.setState({ experiencePoints: 150 });
    });

    // Get what would be serialized to localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const partializedState = persistConfig.getOptions().partialize(useGameStoreBase.getState());

    expect(partializedState).toHaveProperty('experiencePoints');
    expect(partializedState.experiencePoints).toBe(150);
  });

  it('includes experienceToNext in partialize output', () => {
    act(() => {
      useGameStoreBase.setState({ experienceToNext: 200 });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const partializedState = persistConfig.getOptions().partialize(useGameStoreBase.getState());

    expect(partializedState).toHaveProperty('experienceToNext');
    expect(partializedState.experienceToNext).toBe(200);
  });

  it('includes playerStatistics in partialize output', () => {
    const testStats = {
      combatActions: {
        ILLUMINATE: 5,
        REFLECT: 3,
        ENDURE: 2,
        EMBRACE: 1,
      },
      totalCombatsWon: 10,
      totalCombatsLost: 2,
      totalTurnsPlayed: 50,
      averageCombatLength: 5,
    };

    act(() => {
      useGameStoreBase.setState({ playerStatistics: testStats });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const partializedState = persistConfig.getOptions().partialize(useGameStoreBase.getState());

    expect(partializedState).toHaveProperty('playerStatistics');
    expect(partializedState.playerStatistics).toEqual(testStats);
  });

  it('includes pendingMilestoneJournals as array in partialize output', () => {
    act(() => {
      useGameStoreBase.setState({ pendingMilestoneJournals: [25, 50] });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const partializedState = persistConfig.getOptions().partialize(useGameStoreBase.getState());

    expect(partializedState).toHaveProperty('pendingMilestoneJournals');
    expect(Array.isArray(partializedState.pendingMilestoneJournals)).toBe(true);
    expect(partializedState.pendingMilestoneJournals).toEqual([25, 50]);
  });

  it('serializes pendingMilestoneJournals correctly as JSON array', () => {
    act(() => {
      useGameStoreBase.setState({ pendingMilestoneJournals: [25, 50, 75] });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const partializedState = persistConfig.getOptions().partialize(useGameStoreBase.getState());

    // Verify JSON serialization produces valid array, not empty object
    const serialized = JSON.stringify(partializedState.pendingMilestoneJournals);
    expect(serialized).toBe('[25,50,75]');
    expect(serialized).not.toBe('{}');
  });
});

describe('Offline Resilience - Merge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('handles missing experiencePoints with default', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const mergeFunc = persistConfig.getOptions().merge;
    const currentState = useGameStoreBase.getState();

    // Simulate old localStorage without experiencePoints
    const persistedState = {
      guardianTrust: 75,
      playerLevel: 3,
      // experiencePoints missing
    };

    const mergedState = mergeFunc(persistedState, currentState);

    expect(mergedState.experiencePoints).toBe(currentState.experiencePoints);
  });

  it('handles missing playerStatistics with default', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const mergeFunc = persistConfig.getOptions().merge;
    const currentState = useGameStoreBase.getState();

    const persistedState = {
      guardianTrust: 75,
      // playerStatistics missing
    };

    const mergedState = mergeFunc(persistedState, currentState);

    expect(mergedState.playerStatistics).toEqual(currentState.playerStatistics);
  });

  it('migrates empty object {} from legacy Set serialization to empty array', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const mergeFunc = persistConfig.getOptions().merge;
    const currentState = useGameStoreBase.getState();

    // Simulate legacy localStorage where Set serialized to {}
    const persistedState = {
      guardianTrust: 75,
      pendingMilestoneJournals: {}, // Failed Set serialization
    };

    const mergedState = mergeFunc(persistedState, currentState);

    expect(Array.isArray(mergedState.pendingMilestoneJournals)).toBe(true);
    expect(mergedState.pendingMilestoneJournals).toEqual([]);
  });

  it('preserves valid array for pendingMilestoneJournals', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const mergeFunc = persistConfig.getOptions().merge;
    const currentState = useGameStoreBase.getState();

    const persistedState = {
      guardianTrust: 75,
      pendingMilestoneJournals: [25, 50],
    };

    const mergedState = mergeFunc(persistedState, currentState);

    expect(mergedState.pendingMilestoneJournals).toEqual([25, 50]);
  });

  it('handles undefined pendingMilestoneJournals with empty array', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accessing internal Zustand persist API for testing
    const persistConfig = (useGameStoreBase as any).persist;
    const mergeFunc = persistConfig.getOptions().merge;
    const currentState = useGameStoreBase.getState();

    const persistedState = {
      guardianTrust: 75,
      pendingMilestoneJournals: undefined,
    };

    const mergedState = mergeFunc(persistedState, currentState);

    expect(Array.isArray(mergedState.pendingMilestoneJournals)).toBe(true);
    expect(mergedState.pendingMilestoneJournals).toEqual([]);
  });
});

describe('Offline Resilience - Database Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset store to initial state
    act(() => {
      useGameStoreBase.setState({
        experiencePoints: 0,
        experienceToNext: 100,
        playerStatistics: {
          combatActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
          totalCombatsWon: 0,
          totalCombatsLost: 0,
          totalTurnsPlayed: 0,
          averageCombatLength: 0,
        },
        pendingMilestoneJournals: [],
        guardianTrust: 50,
        saveState: {
          status: 'idle',
          retryCount: 0,
          hasUnsavedChanges: false,
        },
      });
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('preserves localStorage values when database load fails with network error', async () => {
    // Set up cached values in store (simulating what localStorage would have)
    act(() => {
      useGameStoreBase.setState({
        experiencePoints: 500,
        experienceToNext: 150,
        guardianTrust: 80,
        pendingMilestoneJournals: [25],
      });
    });

    // Mock authenticated user
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock database error (network failure)
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Network request failed',
            },
          }),
        }),
      }),
    });

    // Call loadFromSupabase
    await act(async () => {
      await useGameStoreBase.getState().loadFromSupabase();
    });

    const state = useGameStoreBase.getState();

    // Verify cached values are preserved (not reset to defaults)
    expect(state.experiencePoints).toBe(500);
    expect(state.experienceToNext).toBe(150);
    expect(state.guardianTrust).toBe(80);
    expect(state.pendingMilestoneJournals).toEqual([25]);

    // Verify error state is set
    expect(state.saveState.status).toBe('error');
    expect(state.saveState.lastError).toContain('Database unavailable');
  });

  it('updates state when database load succeeds', async () => {
    // Mock authenticated user
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock successful database load
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'game_states') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  guardian_trust: 90,
                  player_level: 5,
                  current_scene_index: 3,
                  experience_points: 1000,
                  experience_to_next: 200,
                  player_statistics: {
                    combatActions: { ILLUMINATE: 10, REFLECT: 5, ENDURE: 3, EMBRACE: 2 },
                    totalCombatsWon: 15,
                    totalCombatsLost: 3,
                    totalTurnsPlayed: 100,
                    averageCombatLength: 6,
                  },
                  milestones: JSON.stringify([]),
                  scene_history: JSON.stringify([]),
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'journal_entries') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    await act(async () => {
      await useGameStoreBase.getState().loadFromSupabase();
    });

    const state = useGameStoreBase.getState();

    // Verify database values are loaded
    expect(state.guardianTrust).toBe(90);
    expect(state.playerLevel).toBe(5);
    expect(state.experiencePoints).toBe(1000);
    expect(state.experienceToNext).toBe(200);
    expect(state.saveState.status).toBe('success');
  });

  it('skips load gracefully when no user is authenticated', async () => {
    // Set initial values
    act(() => {
      useGameStoreBase.setState({
        experiencePoints: 300,
        guardianTrust: 60,
      });
    });

    // Mock no authenticated user
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await act(async () => {
      await useGameStoreBase.getState().loadFromSupabase();
    });

    const state = useGameStoreBase.getState();

    // Values should remain unchanged
    expect(state.experiencePoints).toBe(300);
    expect(state.guardianTrust).toBe(60);
  });
});

describe('Offline Resilience - pendingMilestoneJournals Array Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    act(() => {
      useGameStoreBase.setState({
        pendingMilestoneJournals: [],
        milestones: [
          { id: 'milestone-25', level: 25, label: 'Inner Strength', achieved: false },
          { id: 'milestone-50', level: 50, label: 'Finding Balance', achieved: false },
          { id: 'milestone-75', level: 75, label: 'Deep Connection', achieved: false },
        ],
        guardianTrust: 0,
        saveState: { status: 'idle', retryCount: 0, hasUnsavedChanges: false },
      });
    });
  });

  it('adds milestone level to pendingMilestoneJournals array on achievement', () => {
    act(() => {
      useGameStoreBase.getState().updateMilestone(25);
    });

    const state = useGameStoreBase.getState();
    expect(state.pendingMilestoneJournals).toContain(25);
    expect(Array.isArray(state.pendingMilestoneJournals)).toBe(true);
  });

  it('removes milestone level from array when journal is shown', () => {
    // First add a pending journal
    act(() => {
      useGameStoreBase.setState({ pendingMilestoneJournals: [25, 50] });
    });

    // Then mark it as shown
    act(() => {
      useGameStoreBase.getState().markMilestoneJournalShown(25);
    });

    const state = useGameStoreBase.getState();
    expect(state.pendingMilestoneJournals).not.toContain(25);
    expect(state.pendingMilestoneJournals).toContain(50);
  });

  it('does not duplicate milestone levels in array', () => {
    // Try to add same level twice
    act(() => {
      useGameStoreBase.setState({ pendingMilestoneJournals: [25] });
    });

    act(() => {
      useGameStoreBase.getState().updateMilestone(25);
    });

    const state = useGameStoreBase.getState();
    const count25 = state.pendingMilestoneJournals.filter((l: number) => l === 25).length;
    expect(count25).toBe(1);
  });

  it('resets pendingMilestoneJournals to empty array on game reset', () => {
    act(() => {
      useGameStoreBase.setState({ pendingMilestoneJournals: [25, 50, 75] });
    });

    act(() => {
      useGameStoreBase.getState().resetGame();
    });

    const state = useGameStoreBase.getState();
    expect(state.pendingMilestoneJournals).toEqual([]);
    expect(Array.isArray(state.pendingMilestoneJournals)).toBe(true);
  });
});
