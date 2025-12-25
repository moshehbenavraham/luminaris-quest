import { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';

/**
 * Hook to manage energy regeneration lifecycle
 * Starts regeneration when component mounts and stops when it unmounts
 * Also pauses regeneration when in combat
 */
export function useEnergyRegeneration() {
  const { startEnergyRegeneration, stopEnergyRegeneration, _hasHydrated, combat } = useGameStore();

  useEffect(() => {
    // Only start regeneration after store has hydrated
    if (!_hasHydrated) return;

    // Start energy regeneration
    startEnergyRegeneration();

    // Cleanup function to stop regeneration
    return () => {
      stopEnergyRegeneration();
    };
  }, [_hasHydrated, startEnergyRegeneration, stopEnergyRegeneration]);

  // Monitor combat state to pause/resume regeneration
  useEffect(() => {
    if (!_hasHydrated) return;

    if (combat.inCombat) {
      // Combat started - regeneration will be paused by the regenerateEnergy function
      console.debug('[Energy Regeneration] Paused due to combat');
    } else {
      // Combat ended - regeneration will resume automatically
      console.debug('[Energy Regeneration] Resumed after combat');
    }
  }, [_hasHydrated, combat.inCombat]);
}
