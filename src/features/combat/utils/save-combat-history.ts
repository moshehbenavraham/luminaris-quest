/**
 * Combat History Persistence Utility
 *
 * Saves combat records to Supabase for therapeutic tracking and analytics.
 * This module is intentionally extracted to keep combat-store.ts under 500 lines.
 */

import { supabase } from '@/integrations/supabase/client';
import { useGameStoreBase } from '@/store/game-store';
import type { CombatAction, ShadowManifestation } from '@/types';
import type { TablesInsert, Json } from '@/integrations/supabase/types';

/**
 * Snapshot of player resources at a point in time (combat start/end).
 */
export interface ResourcesSnapshot {
  lp: number;
  sp: number;
  energy: number;
  health: number;
}

/**
 * Combat state required for history persistence.
 */
export interface CombatStateForHistory {
  enemy: ShadowManifestation | null;
  resources: { lp: number; sp: number };
  playerHealth: number;
  playerEnergy: number;
  playerLevel: number;
  turn: number;
  resourcesAtStart: ResourcesSnapshot | null;
  preferredActions: Record<CombatAction, number>;
  log: Array<{
    turn: number;
    actor: 'PLAYER' | 'SHADOW';
    action: string;
    effect: string;
    message: string;
    timestamp: number;
  }>;
}

/**
 * Save combat history to Supabase.
 *
 * This function is async but non-blocking. Errors are logged but not thrown
 * to prevent combat UX disruption. Returns the created record ID on success.
 *
 * @param state - Current combat state before reset
 * @param victory - Whether the player won
 * @returns Promise resolving to the created record ID, or null on failure
 */
export async function saveCombatHistory(
  state: CombatStateForHistory,
  victory: boolean,
): Promise<string | null> {
  try {
    // Check for authenticated user
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.warn('[CombatHistory] No authenticated user - skipping save');
      return null;
    }

    // Ensure we have required data
    if (!state.enemy) {
      console.warn('[CombatHistory] No enemy data - skipping save');
      return null;
    }

    // Get scene_index from game store
    const gameState = useGameStoreBase.getState();
    const sceneIndex = gameState.currentSceneIndex ?? 0;

    // Build resources_end snapshot
    const resourcesEnd: ResourcesSnapshot = {
      lp: state.resources.lp,
      sp: state.resources.sp,
      energy: state.playerEnergy,
      health: state.playerHealth,
    };

    // Limit combat log to last 50 entries
    const combatLog = state.log.slice(-50);

    // Build insert record with explicit type (cast snapshots to Json for Supabase)
    const insertRecord: TablesInsert<'combat_history'> = {
      user_id: authData.user.id,
      enemy_id: state.enemy.id,
      enemy_name: state.enemy.name,
      victory,
      turns_taken: state.turn,
      final_player_hp: state.playerHealth,
      final_enemy_hp: state.enemy.currentHP ?? 0,
      resources_start: (state.resourcesAtStart ?? resourcesEnd) as unknown as Json,
      resources_end: resourcesEnd as unknown as Json,
      actions_used: state.preferredActions as unknown as Json,
      combat_log: combatLog as unknown as Json,
      player_level: state.playerLevel,
      scene_index: sceneIndex,
    };

    // Insert combat history record
    const { data, error } = await supabase
      .from('combat_history')
      .insert(insertRecord)
      .select('id')
      .single();

    if (error) {
      console.error('[CombatHistory] Save failed:', error.message);
      return null;
    }

    if (data?.id) {
      console.debug('[CombatHistory] Saved combat history:', data.id);
      return data.id;
    }

    return null;
  } catch (err) {
    // Log error but do not throw - combat UX must not break
    console.error('[CombatHistory] Unexpected error:', err);
    return null;
  }
}
