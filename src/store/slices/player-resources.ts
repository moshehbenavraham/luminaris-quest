/**
 * Player Resources Slice
 *
 * Shared resource state used by both game-store and combat-store.
 * This eliminates the resource duplication issue identified in the architecture audit.
 *
 * Resources managed:
 * - Player Health (0-maxPlayerHealth)
 * - Player Energy (0-maxPlayerEnergy)
 * - Light Points (LP) - Positive emotional resources
 * - Shadow Points (SP) - Challenges that can become growth
 *
 * @see docs/ongoing_projects/architecture-audit.md - Issue #1
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface PlayerResourcesState {
  // Health
  playerHealth: number;
  maxPlayerHealth: number;

  // Energy
  playerEnergy: number;
  maxPlayerEnergy: number;

  // Light & Shadow Points
  lightPoints: number;
  shadowPoints: number;

  // Actions
  modifyHealth: (delta: number) => void;
  setHealth: (health: number) => void;
  healHealth: (amount: number) => void;

  modifyEnergy: (delta: number) => void;
  setEnergy: (energy: number) => void;

  modifyLightPoints: (delta: number) => void;
  setLightPoints: (lp: number) => void;

  modifyShadowPoints: (delta: number) => void;
  setShadowPoints: (sp: number) => void;

  convertShadowToLight: (amount: number) => void;

  resetResources: () => void;

  // Bulk operations for combat
  setAllResources: (resources: Partial<PlayerResourcesState>) => void;
  getResourceSnapshot: () => ResourceSnapshot;

  // Hydration state
  _hasHydrated: boolean;
  _setHasHydrated: (hydrated: boolean) => void;
}

export interface ResourceSnapshot {
  playerHealth: number;
  maxPlayerHealth: number;
  playerEnergy: number;
  maxPlayerEnergy: number;
  lightPoints: number;
  shadowPoints: number;
}

// Default resource values
export const DEFAULT_RESOURCES: ResourceSnapshot = {
  playerHealth: 100,
  maxPlayerHealth: 100,
  playerEnergy: 100,
  maxPlayerEnergy: 100,
  lightPoints: 10,
  shadowPoints: 5,
};

/**
 * Shared player resources store
 *
 * This is the single source of truth for player resources.
 * Both game-store and combat-store subscribe to this store.
 */
export const usePlayerResources = create<PlayerResourcesState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        ...DEFAULT_RESOURCES,
        _hasHydrated: false,

        // Health management
        modifyHealth: (delta: number) => {
          set((state) => ({
            playerHealth: Math.max(0, Math.min(state.maxPlayerHealth, state.playerHealth + delta)),
          }));
        },

        setHealth: (health: number) => {
          set((state) => ({
            playerHealth: Math.max(0, Math.min(state.maxPlayerHealth, health)),
          }));
        },

        healHealth: (amount: number) => {
          const healAmount = Math.max(0, amount);
          set((state) => ({
            playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + healAmount),
          }));
        },

        // Energy management
        modifyEnergy: (delta: number) => {
          set((state) => ({
            playerEnergy: Math.max(0, Math.min(state.maxPlayerEnergy, state.playerEnergy + delta)),
          }));
        },

        setEnergy: (energy: number) => {
          set((state) => ({
            playerEnergy: Math.max(0, Math.min(state.maxPlayerEnergy, energy)),
          }));
        },

        // Light Points management
        modifyLightPoints: (delta: number) => {
          set((state) => ({
            lightPoints: Math.max(0, state.lightPoints + delta),
          }));
        },

        setLightPoints: (lp: number) => {
          set(() => ({
            lightPoints: Math.max(0, lp),
          }));
        },

        // Shadow Points management
        modifyShadowPoints: (delta: number) => {
          set((state) => ({
            shadowPoints: Math.max(0, state.shadowPoints + delta),
          }));
        },

        setShadowPoints: (sp: number) => {
          set(() => ({
            shadowPoints: Math.max(0, sp),
          }));
        },

        // Conversion
        convertShadowToLight: (amount: number) => {
          set((state) => {
            const shadowToConvert = Math.min(amount, state.shadowPoints);
            if (shadowToConvert === 0) return state;

            return {
              shadowPoints: state.shadowPoints - shadowToConvert,
              lightPoints: state.lightPoints + shadowToConvert,
            };
          });
        },

        // Reset to defaults
        resetResources: () => {
          set(DEFAULT_RESOURCES);
        },

        // Bulk operations for combat synchronization
        setAllResources: (resources: Partial<PlayerResourcesState>) => {
          set((state) => {
            const updates: Partial<PlayerResourcesState> = {};

            if (resources.playerHealth !== undefined) {
              updates.playerHealth = Math.max(
                0,
                Math.min(
                  resources.maxPlayerHealth ?? state.maxPlayerHealth,
                  resources.playerHealth,
                ),
              );
            }
            if (resources.maxPlayerHealth !== undefined) {
              updates.maxPlayerHealth = resources.maxPlayerHealth;
            }
            if (resources.playerEnergy !== undefined) {
              updates.playerEnergy = Math.max(
                0,
                Math.min(
                  resources.maxPlayerEnergy ?? state.maxPlayerEnergy,
                  resources.playerEnergy,
                ),
              );
            }
            if (resources.maxPlayerEnergy !== undefined) {
              updates.maxPlayerEnergy = resources.maxPlayerEnergy;
            }
            if (resources.lightPoints !== undefined) {
              updates.lightPoints = Math.max(0, resources.lightPoints);
            }
            if (resources.shadowPoints !== undefined) {
              updates.shadowPoints = Math.max(0, resources.shadowPoints);
            }

            return updates;
          });
        },

        // Get a snapshot of current resources
        getResourceSnapshot: (): ResourceSnapshot => {
          const state = get();
          return {
            playerHealth: state.playerHealth,
            maxPlayerHealth: state.maxPlayerHealth,
            playerEnergy: state.playerEnergy,
            maxPlayerEnergy: state.maxPlayerEnergy,
            lightPoints: state.lightPoints,
            shadowPoints: state.shadowPoints,
          };
        },

        // Hydration
        _setHasHydrated: (hydrated: boolean) => {
          set({ _hasHydrated: hydrated });
        },
      }),
      {
        name: 'luminari-player-resources',
        partialize: (state) => ({
          playerHealth: state.playerHealth,
          maxPlayerHealth: state.maxPlayerHealth,
          playerEnergy: state.playerEnergy,
          maxPlayerEnergy: state.maxPlayerEnergy,
          lightPoints: state.lightPoints,
          shadowPoints: state.shadowPoints,
        }),
        onRehydrateStorage: () => (state) => {
          state?._setHasHydrated(true);
        },
      },
    ),
  ),
);

/**
 * Selector hooks for optimized subscriptions
 */
export const selectHealth = (state: PlayerResourcesState) => ({
  playerHealth: state.playerHealth,
  maxPlayerHealth: state.maxPlayerHealth,
});

export const selectEnergy = (state: PlayerResourcesState) => ({
  playerEnergy: state.playerEnergy,
  maxPlayerEnergy: state.maxPlayerEnergy,
});

export const selectLightShadowPoints = (state: PlayerResourcesState) => ({
  lightPoints: state.lightPoints,
  shadowPoints: state.shadowPoints,
});

export const selectCombatResources = (state: PlayerResourcesState) => ({
  lp: state.lightPoints,
  sp: state.shadowPoints,
  playerHealth: state.playerHealth,
  playerEnergy: state.playerEnergy,
});

// Types are already exported with their interfaces above
