/**
 * Store Slices
 *
 * Shared state slices used across multiple stores.
 * This pattern prevents state duplication and sync issues.
 */

export {
  usePlayerResources,
  selectHealth,
  selectEnergy,
  selectLightShadowPoints,
  selectCombatResources,
  DEFAULT_RESOURCES,
  type PlayerResourcesState,
  type ResourceSnapshot,
} from './player-resources';
