/**
 * Integration Test: preferredActions Persistence
 *
 * Tests for T021: Combat -> Game Store preferredActions flow
 * Verifies that preferredActions from combat-store accumulate
 * into playerStatistics.combatActions in game-store after combat ends.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCombatStore } from '@/features/combat/store/combat-store';
import { useGameStoreBase } from '@/store/game-store';
import { usePlayerResources } from '@/store/slices';
import type { ShadowManifestation } from '@/types';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  },
}));

// Mock environment config and logger
vi.mock('@/lib/environment', () => ({
  getEnvironmentConfig: () => ({
    combatEnergyCosts: {
      illuminate: 0,
      reflect: 0,
      endure: 10,
      embrace: 0,
    },
  }),
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock sound manager
vi.mock('@/utils/sound-manager', () => ({
  soundManager: {
    playSound: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock database health
vi.mock('@/lib/database-health', () => ({
  detectEnvironment: vi.fn().mockReturnValue('local'),
  performEnhancedHealthCheck: vi.fn().mockResolvedValue({ success: true, responseTime: 50 }),
  getCurrentHealthStatus: vi.fn().mockReturnValue({
    isConnected: true,
    responseTime: 50,
    lastChecked: Date.now(),
    environment: 'local',
  }),
}));

// Test enemy
const testEnemy: ShadowManifestation = {
  id: 'test-shadow',
  name: 'Test Shadow',
  description: 'A test enemy',
  currentHP: 50,
  maxHP: 50,
  baseDamage: 10,
  abilities: [],
  tier: 1,
  therapeuticInsight: 'Test insight',
  triggerThemes: ['test'],
  copingStrategies: ['test strategy'],
  difficulty: 'medium',
};

describe('preferredActions Persistence Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Reset player resources
    act(() => {
      usePlayerResources.getState().resetResources();
      usePlayerResources.getState().setAllResources({
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    // Reset game store statistics
    act(() => {
      useGameStoreBase.setState({
        playerStatistics: {
          combatActions: {
            ILLUMINATE: 0,
            REFLECT: 0,
            ENDURE: 0,
            EMBRACE: 0,
          },
          totalCombatsWon: 0,
          totalCombatsLost: 0,
          totalTurnsPlayed: 0,
          averageCombatLength: 0,
        },
        _hasHydrated: true,
      });
    });

    // Reset combat store
    act(() => {
      useCombatStore.setState({
        isActive: false,
        enemy: null,
        preferredActions: {
          ILLUMINATE: 0,
          REFLECT: 0,
          ENDURE: 0,
          EMBRACE: 0,
        },
        _hasHydrated: true,
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should persist preferredActions to game-store on combat victory', async () => {
    // Start combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    // Simulate combat actions by directly setting preferredActions
    // (In real gameplay, these would be incremented by executeAction)
    act(() => {
      useCombatStore.setState({
        preferredActions: {
          ILLUMINATE: 3,
          REFLECT: 2,
          ENDURE: 1,
          EMBRACE: 0,
        },
      });
    });

    // Verify combat store has the actions
    expect(useCombatStore.getState().preferredActions).toEqual({
      ILLUMINATE: 3,
      REFLECT: 2,
      ENDURE: 1,
      EMBRACE: 0,
    });

    // End combat with victory
    act(() => {
      useCombatStore.getState().endCombat(true);
    });

    // Verify game-store playerStatistics was updated
    const gameState = useGameStoreBase.getState();
    expect(gameState.playerStatistics.combatActions).toEqual({
      ILLUMINATE: 3,
      REFLECT: 2,
      ENDURE: 1,
      EMBRACE: 0,
    });
  });

  it('should persist preferredActions to game-store on combat defeat', async () => {
    // Start combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    // Simulate combat actions
    act(() => {
      useCombatStore.setState({
        preferredActions: {
          ILLUMINATE: 1,
          REFLECT: 0,
          ENDURE: 2,
          EMBRACE: 1,
        },
      });
    });

    // End combat with defeat
    act(() => {
      useCombatStore.getState().endCombat(false);
    });

    // Verify game-store playerStatistics was updated even on defeat
    const gameState = useGameStoreBase.getState();
    expect(gameState.playerStatistics.combatActions).toEqual({
      ILLUMINATE: 1,
      REFLECT: 0,
      ENDURE: 2,
      EMBRACE: 1,
    });
  });

  it('should accumulate action counts across multiple combats', async () => {
    // First combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    act(() => {
      useCombatStore.setState({
        preferredActions: {
          ILLUMINATE: 2,
          REFLECT: 1,
          ENDURE: 0,
          EMBRACE: 0,
        },
      });
    });

    act(() => {
      useCombatStore.getState().endCombat(true);
    });

    // Verify first combat counts
    expect(useGameStoreBase.getState().playerStatistics.combatActions).toEqual({
      ILLUMINATE: 2,
      REFLECT: 1,
      ENDURE: 0,
      EMBRACE: 0,
    });

    // Second combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    act(() => {
      useCombatStore.setState({
        preferredActions: {
          ILLUMINATE: 1,
          REFLECT: 2,
          ENDURE: 3,
          EMBRACE: 1,
        },
      });
    });

    act(() => {
      useCombatStore.getState().endCombat(true);
    });

    // Verify accumulated counts (2+1=3 ILLUMINATE, 1+2=3 REFLECT, 0+3=3 ENDURE, 0+1=1 EMBRACE)
    expect(useGameStoreBase.getState().playerStatistics.combatActions).toEqual({
      ILLUMINATE: 3,
      REFLECT: 3,
      ENDURE: 3,
      EMBRACE: 1,
    });
  });

  it('should handle empty preferredActions (no actions taken)', async () => {
    // Start combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    // Don't take any actions - preferredActions stays at 0s
    expect(useCombatStore.getState().preferredActions).toEqual({
      ILLUMINATE: 0,
      REFLECT: 0,
      ENDURE: 0,
      EMBRACE: 0,
    });

    // End combat (surrender)
    act(() => {
      useCombatStore.getState().endCombat(false);
    });

    // Verify game-store statistics unchanged (all zeros)
    const gameState = useGameStoreBase.getState();
    expect(gameState.playerStatistics.combatActions).toEqual({
      ILLUMINATE: 0,
      REFLECT: 0,
      ENDURE: 0,
      EMBRACE: 0,
    });
  });

  it('should mark game-store as having unsaved changes after preferredActions update', async () => {
    // Reset saveState
    act(() => {
      useGameStoreBase.setState({
        saveState: {
          status: 'idle',
          retryCount: 0,
          hasUnsavedChanges: false,
        },
      });
    });

    // Start and end combat
    act(() => {
      useCombatStore.getState().startCombat(testEnemy, {
        lightPoints: 20,
        shadowPoints: 10,
        playerHealth: 100,
        playerLevel: 1,
        playerEnergy: 100,
        maxPlayerEnergy: 100,
      });
    });

    act(() => {
      useCombatStore.setState({
        preferredActions: {
          ILLUMINATE: 1,
          REFLECT: 0,
          ENDURE: 0,
          EMBRACE: 0,
        },
      });
    });

    act(() => {
      useCombatStore.getState().endCombat(true);
    });

    // Verify game-store has unsaved changes
    expect(useGameStoreBase.getState().saveState.hasUnsavedChanges).toBe(true);
  });
});
