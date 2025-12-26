/* eslint-disable react-hooks/set-state-in-effect -- SSR hydration pattern in useGameStore hook */
/* eslint-disable @typescript-eslint/no-explicit-any -- Complex state management with Supabase JSONB fields and error handling */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { SaveErrorType } from '@/types';
import type {
  CombatAction,
  CompletedScene,
  GameState,
  JournalEntry,
  Milestone,
  PlayerStatistics,
  SaveError,
  SaveState,
} from '@/types';
import type { DatabaseHealthStatus } from '@/lib/database-health';
import {
  performEnhancedHealthCheck,
  getCurrentHealthStatus,
  detectEnvironment,
} from '@/lib/database-health';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { createLogger as createEnvLogger, getEnvironmentConfig } from '@/lib/environment';
import { isLastScene } from '@/engine/scene-engine';
import { usePlayerResources } from '@/store/slices';

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Use shared environment-aware logger
const logger = createEnvLogger('GameStore');

// Error classification utility
const classifyError = (error: any): SaveErrorType => {
  if (!error) return SaveErrorType.UNKNOWN_ERROR;

  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';

  // Network-related errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch') ||
    code.includes('network')
  ) {
    return SaveErrorType.NETWORK_ERROR;
  }

  // Authentication errors
  if (
    message.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    code === 'unauthorized' ||
    code === 'forbidden'
  ) {
    return SaveErrorType.AUTHENTICATION_ERROR;
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('access denied') ||
    code.includes('permission')
  ) {
    return SaveErrorType.PERMISSION_ERROR;
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('constraint') ||
    message.includes('invalid') ||
    code.includes('constraint') ||
    code.includes('check')
  ) {
    return SaveErrorType.VALIDATION_ERROR;
  }

  return SaveErrorType.UNKNOWN_ERROR;
};

// Determine if an error type is retryable
const isRetryableError = (errorType: SaveErrorType): boolean => {
  switch (errorType) {
    case SaveErrorType.NETWORK_ERROR:
      return true; // Network issues are often temporary
    case SaveErrorType.AUTHENTICATION_ERROR:
      return false; // Auth issues need user intervention
    case SaveErrorType.PERMISSION_ERROR:
      return false; // Permission issues need admin intervention
    case SaveErrorType.VALIDATION_ERROR:
      return false; // Data validation errors won't fix themselves
    case SaveErrorType.UNKNOWN_ERROR:
      return true; // Retry unknown errors in case they're transient
    default:
      return false;
  }
};

const initialMilestones: Milestone[] = [
  { id: 'milestone-25', level: 25, label: 'Inner Strength', achieved: false },
  { id: 'milestone-50', level: 50, label: 'Finding Balance', achieved: false },
  { id: 'milestone-75', level: 75, label: 'Deep Connection', achieved: false },
];

// Experience Points calculation functions
const getXPRequiredForLevel = (level: number): number => {
  const baseXP = 100;
  const growthFactor = 1.4; // Gentle exponential growth
  return Math.floor(baseXP * Math.pow(growthFactor, level - 1));
};

const calculateLevelProgression = (totalXP: number) => {
  let level = 1;
  let xpForCurrentLevel = 0;

  while (totalXP >= xpForCurrentLevel + getXPRequiredForLevel(level)) {
    xpForCurrentLevel += getXPRequiredForLevel(level);
    level++;
  }

  const currentLevelXP = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = getXPRequiredForLevel(level);
  const xpToNext = xpNeededForNextLevel - currentLevelXP;

  return {
    level,
    currentLevelXP,
    xpToNext,
  };
};

// Level benefits calculation
export const getLevelBenefits = (level: number) => {
  return {
    maxEnergyBonus: Math.floor((level - 1) / 2) * 10, // +10 energy every 2 levels
    startingLPBonus: Math.floor((level - 1) / 3) * 5, // +5 LP every 3 levels
    energyCostReduction: Math.floor((level - 1) / 4), // -1 energy cost every 4 levels
    trustGainMultiplier: 1 + Math.floor((level - 1) / 5) * 0.2, // +20% trust every 5 levels
  };
};

export const useGameStoreBase = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      guardianTrust: 50,
      playerLevel: 1,
      currentSceneIndex: 0,
      journalEntries: [],
      milestones: initialMilestones,
      sceneHistory: [],
      pendingMilestoneJournals: [],

      // Player Health System
      playerHealth: 100,
      maxPlayerHealth: 100,

      // Player Energy System
      playerEnergy: 100,
      maxPlayerEnergy: 100,

      // Light & Shadow Combat Resources
      // Players start with some resources to enable combat functionality
      lightPoints: 10,
      shadowPoints: 5,

      // Experience Points System
      experiencePoints: 0,
      experienceToNext: 100, // XP needed for level 2

      // Player Statistics for therapeutic analytics
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

      // Combat System State
      combat: {
        inCombat: false,
        currentEnemy: null,
        resources: { lp: 0, sp: 0 },
        turn: 0,
        log: [],

        // Scene context
        sceneDC: 0, // Default DC when not in combat

        // Status effects
        damageMultiplier: 1,
        damageReduction: 1,
        healingBlocked: 0,
        lpGenerationBlocked: 0,
        skipNextTurn: false,
        consecutiveEndures: 0,

        // Therapeutic tracking
        preferredActions: {
          ILLUMINATE: 0,
          REFLECT: 0,
          ENDURE: 0,
          EMBRACE: 0,
        },
        growthInsights: [],
        combatReflections: [],
      },

      // Save operation state
      saveState: {
        status: 'idle',
        retryCount: 0,
        hasUnsavedChanges: false,
      },

      // Database health check state
      healthStatus: {
        isConnected: false,
        responseTime: 0,
        lastChecked: 0,
        environment: detectEnvironment(),
      },

      _hasHydrated: false,
      _isHealthMonitoringActive: false,
      _energyRegenInterval: undefined,
      _isEnergyRegenActive: false,

      // Actions
      setGuardianTrust: (trust: number) => {
        const clampedTrust = Math.max(0, Math.min(100, trust));
        set((state) => ({
          guardianTrust: clampedTrust,
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));

        // Check for milestone achievements
        get().updateMilestone(clampedTrust);
      },

      addJournalEntry: (entry: JournalEntry) => {
        set((state) => {
          // Check for duplicate milestone entries
          if (entry.type === 'milestone') {
            const existingMilestone = state.journalEntries.find(
              (e) => e.type === 'milestone' && e.trustLevel === entry.trustLevel,
            );
            if (existingMilestone) {
              return state;
            }
          }

          const newEntries = [...state.journalEntries, entry];
          // No limit on journal entries - store them all
          return {
            journalEntries: newEntries,
            saveState: { ...state.saveState, hasUnsavedChanges: true },
          };
        });

        // Don't auto-save - let the app decide when to save
      },

      updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, isEdited: true, editedAt: new Date() }
              : entry,
          ),
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));

        // Don't auto-save - let the app decide when to save
      },

      deleteJournalEntry: (id: string) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));

        // Don't auto-save - let the app decide when to save
      },

      completeScene: (scene: CompletedScene) => {
        set((state) => ({
          sceneHistory: [...state.sceneHistory, scene],
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      advanceScene: () => {
        set((state) => ({
          currentSceneIndex: state.currentSceneIndex + 1,
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      updateMilestone: (trustLevel: number) => {
        set((state) => {
          // Check which milestones need to be achieved
          const milestonesToAchieve = state.milestones.filter(
            (milestone) => trustLevel >= milestone.level && !milestone.achieved,
          );

          // If no milestones to achieve, return unchanged state
          if (milestonesToAchieve.length === 0) {
            return state; // Return same state reference - no change
          }

          // Check if we actually need to add new pending journals
          const levelsToAdd = milestonesToAchieve
            .map((m) => m.level)
            .filter((level) => !state.pendingMilestoneJournals.includes(level));

          // If nothing new to add to pending journals, just update milestones
          if (levelsToAdd.length === 0) {
            const updatedMilestones = state.milestones.map((milestone) => {
              if (trustLevel >= milestone.level && !milestone.achieved) {
                return {
                  ...milestone,
                  achieved: true,
                  achievedAt: Date.now(),
                };
              }
              return milestone;
            });

            return {
              milestones: updatedMilestones,
              saveState: { ...state.saveState, hasUnsavedChanges: true },
            };
          }

          // Create new array with added levels (immutable update)
          const newPendingJournals = [...state.pendingMilestoneJournals, ...levelsToAdd];

          const updatedMilestones = state.milestones.map((milestone) => {
            if (trustLevel >= milestone.level && !milestone.achieved) {
              return {
                ...milestone,
                achieved: true,
                achievedAt: Date.now(),
              };
            }
            return milestone;
          });

          return {
            milestones: updatedMilestones,
            pendingMilestoneJournals: newPendingJournals,
            saveState: { ...state.saveState, hasUnsavedChanges: true },
          };
        });
      },

      markMilestoneJournalShown: (level: number) => {
        set((state) => {
          // Only update if the level exists in the pending array
          if (!state.pendingMilestoneJournals.includes(level)) {
            return state; // Return same state reference - no change
          }

          // Create new array without the level (immutable update)
          const newPendingJournals = state.pendingMilestoneJournals.filter((l) => l !== level);
          return { pendingMilestoneJournals: newPendingJournals };
        });
      },

      resetGame: () => {
        // Reset resources in shared store
        usePlayerResources.getState().resetResources();

        set((state) => ({
          guardianTrust: 50,
          playerLevel: 1,
          currentSceneIndex: 0,
          journalEntries: [],
          milestones: initialMilestones.map((m) => ({
            ...m,
            achieved: false,
            achievedAt: undefined,
          })),
          sceneHistory: [],
          pendingMilestoneJournals: [],
          // Reset experience points
          experiencePoints: 0,
          experienceToNext: 100,
          // Reset player statistics
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
          // Reset combat state
          combat: {
            inCombat: false,
            currentEnemy: null,
            resources: { lp: 0, sp: 0 },
            turn: 0,
            log: [],

            // Scene context
            sceneDC: 0,

            // Status effects
            damageMultiplier: 1,
            damageReduction: 1,
            healingBlocked: 0,
            lpGenerationBlocked: 0,
            skipNextTurn: false,
            consecutiveEndures: 0,

            // Therapeutic tracking
            preferredActions: {
              ILLUMINATE: 0,
              REFLECT: 0,
              ENDURE: 0,
              EMBRACE: 0,
            },
            growthInsights: [],
            combatReflections: [],
          },
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
        // Also clear from storage to prevent rehydration of bad state
        localStorage.removeItem('luminari-game-state');
        localStorage.removeItem('luminari-player-resources');
      },

      // Player Health Management - delegated to shared resource store
      modifyPlayerHealth: (delta: number) => {
        const resourceStore = usePlayerResources.getState();
        const previous = resourceStore.playerHealth;
        resourceStore.modifyHealth(delta);
        logger.debug('Modified player health', {
          previous,
          delta,
          new: resourceStore.playerHealth,
          max: resourceStore.maxPlayerHealth,
        });
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      healPlayerHealth: (amount: number) => {
        const resourceStore = usePlayerResources.getState();
        const previous = resourceStore.playerHealth;
        resourceStore.healHealth(amount);
        logger.debug('Healed player health', {
          previous,
          healAmount: amount,
          new: resourceStore.playerHealth,
          max: resourceStore.maxPlayerHealth,
        });
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      setPlayerHealth: (health: number) => {
        const resourceStore = usePlayerResources.getState();
        const previous = resourceStore.playerHealth;
        resourceStore.setHealth(health);
        logger.debug('Set player health', {
          previous,
          new: resourceStore.playerHealth,
          max: resourceStore.maxPlayerHealth,
        });
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      // Player Energy Management - delegated to shared resource store
      modifyPlayerEnergy: (delta: number) => {
        const resourceStore = usePlayerResources.getState();
        resourceStore.modifyEnergy(delta);
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      setPlayerEnergy: (energy: number) => {
        const resourceStore = usePlayerResources.getState();
        resourceStore.setEnergy(energy);
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      // Light & Shadow Combat Resource Management - delegated to shared resource store
      modifyLightPoints: (delta: number) => {
        const resourceStore = usePlayerResources.getState();
        const previous = resourceStore.lightPoints;
        resourceStore.modifyLightPoints(delta);
        logger.debug('Modified light points', {
          previous,
          delta,
          new: resourceStore.lightPoints,
        });
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      modifyShadowPoints: (delta: number) => {
        const resourceStore = usePlayerResources.getState();
        const previous = resourceStore.shadowPoints;
        resourceStore.modifyShadowPoints(delta);
        logger.debug('Modified shadow points', {
          previous,
          delta,
          new: resourceStore.shadowPoints,
        });
        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      convertShadowToLight: (amount: number) => {
        const resourceStore = usePlayerResources.getState();
        const prevShadow = resourceStore.shadowPoints;
        const prevLight = resourceStore.lightPoints;

        if (prevShadow === 0) {
          logger.warn('No shadow points to convert', {
            requested: amount,
            available: prevShadow,
          });
          return;
        }

        resourceStore.convertShadowToLight(amount);

        logger.info('Converted shadow points to light', {
          converted: Math.min(amount, prevShadow),
          shadowPoints: { from: prevShadow, to: resourceStore.shadowPoints },
          lightPoints: { from: prevLight, to: resourceStore.lightPoints },
        });

        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));
      },

      // Experience Points Management
      modifyExperiencePoints: (delta: number, reason?: string) => {
        set((state) => {
          const newTotalXP = Math.max(0, state.experiencePoints + delta);
          const { level, xpToNext } = calculateLevelProgression(newTotalXP);
          const leveledUp = level > state.playerLevel;

          logger.debug('Modified experience points', {
            previous: state.experiencePoints,
            delta,
            new: newTotalXP,
            level,
            leveledUp,
            reason,
          });

          const baseUpdate = {
            experiencePoints: newTotalXP,
            experienceToNext: xpToNext,
            playerLevel: level,
            saveState: { ...state.saveState, hasUnsavedChanges: true },
          };

          if (leveledUp && reason) {
            // Calculate and apply level benefits
            const newBenefits = getLevelBenefits(level);
            const oldBenefits = getLevelBenefits(state.playerLevel);

            // Prepare benefit updates
            const benefitUpdates: any = {};

            // Get shared resource store to apply level benefits
            const resourceStore = usePlayerResources.getState();

            // Apply new max energy bonus
            const energyBonus = newBenefits.maxEnergyBonus - oldBenefits.maxEnergyBonus;
            if (energyBonus > 0) {
              // Update shared store (source of truth for resources)
              const newMaxEnergy = resourceStore.maxPlayerEnergy + energyBonus;
              const newEnergy = resourceStore.playerEnergy + energyBonus;
              resourceStore.setAllResources({
                maxPlayerEnergy: newMaxEnergy,
                playerEnergy: newEnergy,
              });
              // Also update local state for consistency during this render
              benefitUpdates.maxPlayerEnergy = newMaxEnergy;
              benefitUpdates.playerEnergy = newEnergy;
            }

            // Apply starting LP bonus (if gained new bonus levels)
            const lpBonus = newBenefits.startingLPBonus - oldBenefits.startingLPBonus;
            if (lpBonus > 0) {
              const newLP = Math.max(
                resourceStore.lightPoints,
                resourceStore.lightPoints + lpBonus,
              );
              resourceStore.setLightPoints(newLP);
              benefitUpdates.lightPoints = newLP;
            }

            // Create level-up journal entry with benefits description
            const benefitsText = [];
            if (energyBonus > 0) benefitsText.push(`+${energyBonus} max energy`);
            if (lpBonus > 0) benefitsText.push(`+${lpBonus} Light Points`);
            if (newBenefits.energyCostReduction > oldBenefits.energyCostReduction) {
              benefitsText.push(`-1 energy cost for actions`);
            }
            if (newBenefits.trustGainMultiplier > oldBenefits.trustGainMultiplier) {
              benefitsText.push(`+20% trust gain bonus`);
            }
            benefitsText.push(`+1 bonus to all dice rolls`);

            const benefitsDescription =
              benefitsText.length > 0
                ? `\n\nNew benefits gained:\n- ${benefitsText.join('\n- ')}`
                : '';

            // Trigger level-up celebration and journal prompt
            get().addJournalEntry({
              id: `level-up-${level}-${Date.now()}`,
              type: 'learning',
              title: `Level ${level} Achieved!`,
              content: `Your journey of growth continues. Reflect on how far you've come.\n\nReason for advancement: ${reason}${benefitsDescription}`,
              trustLevel: state.guardianTrust,
              tags: ['level-up', 'achievement'],
              timestamp: new Date(),
            });

            return {
              ...baseUpdate,
              ...benefitUpdates,
            };
          }

          return baseUpdate;
        });
      },

      getPlayerLevel: () => get().playerLevel,

      getExperienceProgress: () => {
        const toNext = get().experienceToNext;
        const totalNeededForNextLevel = getXPRequiredForLevel(get().playerLevel);
        const currentLevelProgress = totalNeededForNextLevel - toNext;

        return {
          current: currentLevelProgress, // XP progress in current level
          toNext: toNext, // XP remaining to next level
          percentage: (currentLevelProgress / totalNeededForNextLevel) * 100,
        };
      },

      // Player Statistics Management
      updateCombatStatistics: (
        actions: Record<CombatAction, number>,
        victory: boolean,
        turnsPlayed: number,
      ) => {
        set((state) => {
          const currentStats = state.playerStatistics;
          const totalCombats = currentStats.totalCombatsWon + currentStats.totalCombatsLost + 1;

          // Calculate new average combat length
          const newAverageCombatLength =
            (currentStats.averageCombatLength * (totalCombats - 1) + turnsPlayed) / totalCombats;

          logger.info('Updating combat statistics', {
            actions,
            victory,
            turnsPlayed,
            totalCombats,
            newAverageCombatLength,
          });

          return {
            playerStatistics: {
              combatActions: {
                ILLUMINATE: currentStats.combatActions.ILLUMINATE + (actions.ILLUMINATE || 0),
                REFLECT: currentStats.combatActions.REFLECT + (actions.REFLECT || 0),
                ENDURE: currentStats.combatActions.ENDURE + (actions.ENDURE || 0),
                EMBRACE: currentStats.combatActions.EMBRACE + (actions.EMBRACE || 0),
              },
              totalCombatsWon: currentStats.totalCombatsWon + (victory ? 1 : 0),
              totalCombatsLost: currentStats.totalCombatsLost + (victory ? 0 : 1),
              totalTurnsPlayed: currentStats.totalTurnsPlayed + turnsPlayed,
              averageCombatLength: newAverageCombatLength,
            },
            saveState: { ...state.saveState, hasUnsavedChanges: true },
          };
        });
      },

      getPlayerStatistics: () => get().playerStatistics,

      // Simplified endCombat - called by new combat system (CombatEndModal)
      // Advances scene on victory and restores player health
      endCombat: (victory: boolean) => {
        logger.info('Ending combat', { victory });

        // Restore health to full after combat via shared resource store
        usePlayerResources.getState().setHealth(100);

        set((state) => {
          const shouldAdvanceScene = victory && !isLastScene(state.currentSceneIndex);
          const newSceneIndex = shouldAdvanceScene
            ? state.currentSceneIndex + 1
            : state.currentSceneIndex;

          return {
            currentSceneIndex: newSceneIndex,
            saveState: { ...state.saveState, hasUnsavedChanges: true },
          };
        });
      },

      _setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      // Save state utilities
      checkUnsavedChanges: () => {
        const state = get();
        return (
          state.saveState.hasUnsavedChanges ||
          state.saveState.status === 'error' ||
          state.saveState.lastSaveTimestamp === undefined
        );
      },

      clearSaveError: () => {
        set((state) => ({
          saveState: {
            ...state.saveState,
            status: 'idle',
            lastError: undefined,
            retryCount: 0,
          },
        }));
      },

      saveToSupabase: async (): Promise<boolean> => {
        const state = get();

        // Don't save if already saving or no user is authenticated
        if (state.saveState.status === 'saving') {
          logger.debug('Save already in progress, skipping');
          return false;
        }

        // Get current user before starting save process
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            logger.warn('No authenticated user, skipping save', userError);
            set((state) => ({
              saveState: {
                ...state.saveState,
                status: 'error',
                lastError: userError?.message || 'No authenticated user',
                hasUnsavedChanges: true,
              },
            }));
            return false;
          }
        } catch (error) {
          logger.error('Error checking authentication before save', error);
          return false;
        }

        const attemptSave = async (attempt: number = 1): Promise<boolean> => {
          try {
            // Update save state to saving
            set((state) => ({
              saveState: {
                ...state.saveState,
                status: 'saving',
                retryCount: attempt - 1,
              },
            }));

            logger.debug(`Save attempt ${attempt}/${RETRY_CONFIG.maxAttempts}`);

            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
              logger.error('Authentication error during save', userError);
              throw {
                type: SaveErrorType.AUTHENTICATION_ERROR,
                message: userError?.message || 'No user authenticated - cannot save game state',
                originalError: userError,
              };
            }

            const currentState = get();
            const resourceSnapshot = usePlayerResources.getState().getResourceSnapshot();
            const startTime = Date.now();

            // Prepare game state data
            // Ensure all data is properly formatted for database
            // Note: Resource values come from shared resource store
            const gameState = {
              user_id: user.id,
              guardian_trust: currentState.guardianTrust,
              player_level: currentState.playerLevel,
              current_scene_index: currentState.currentSceneIndex,
              milestones: JSON.stringify(currentState.milestones),
              scene_history: JSON.stringify(currentState.sceneHistory),
              // Resources from shared store
              player_energy: resourceSnapshot.playerEnergy,
              max_player_energy: resourceSnapshot.maxPlayerEnergy,
              light_points: resourceSnapshot.lightPoints,
              shadow_points: resourceSnapshot.shadowPoints,
              player_health: resourceSnapshot.playerHealth,
              max_player_health: resourceSnapshot.maxPlayerHealth,
              // Experience points system
              experience_points: currentState.experiencePoints,
              experience_to_next: currentState.experienceToNext,
              // Player statistics for therapeutic analytics (cast to Json for Supabase JSONB)
              player_statistics: currentState.playerStatistics as unknown as Json,
              updated_at: new Date().toISOString(),
            };

            logger.debug('Saving game state', {
              userId: user.id,
              guardianTrust: gameState.guardian_trust,
              journalCount: currentState.journalEntries.length,
              playerEnergy: gameState.player_energy,
              maxPlayerEnergy: gameState.max_player_energy,
            });

            // Save game state with timeout
            const { data: savedState, error: stateError } = (await Promise.race([
              supabase.from('game_states').upsert(gameState, { onConflict: 'user_id' }).select(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timeout')), 30000),
              ),
            ])) as any;

            if (stateError) {
              logger.error('Failed to save game state', stateError);
              throw {
                type: classifyError(stateError),
                message: `Failed to save game state: ${stateError.message}`,
                originalError: stateError,
              };
            }

            logger.debug('Game state saved successfully', savedState);

            // Save journal entries if any exist
            if (currentState.journalEntries.length > 0) {
              // Format journal entries for database
              const journalEntries = currentState.journalEntries.map((entry) => {
                // Ensure timestamp is an ISO string
                const timestamp =
                  entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp;

                // Ensure editedAt is an ISO string if it exists
                const editedAt =
                  entry.editedAt instanceof Date ? entry.editedAt.toISOString() : entry.editedAt;

                return {
                  id: entry.id,
                  user_id: user.id,
                  type: entry.type,
                  trust_level: entry.trustLevel,
                  content: entry.content,
                  title: entry.title,
                  scene_id: entry.sceneId || null,
                  tags: Array.isArray(entry.tags) ? entry.tags : [],
                  is_edited: entry.isEdited || false,
                  created_at: timestamp,
                  edited_at: editedAt || null,
                };
              });

              logger.debug('Saving journal entries', {
                count: journalEntries.length,
                firstEntry: journalEntries[0]?.id,
              });

              const { data: savedEntries, error: journalError } = (await Promise.race([
                supabase
                  .from('journal_entries')
                  .upsert(journalEntries, { onConflict: 'id' })
                  .select(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Journal save timeout')), 30000),
                ),
              ])) as any;

              if (journalError) {
                logger.error('Failed to save journal entries', journalError);
                throw {
                  type: classifyError(journalError),
                  message: `Failed to save journal entries: ${journalError.message}`,
                  originalError: journalError,
                };
              }

              logger.debug('Journal entries saved successfully', {
                count: savedEntries?.length || 0,
              });
            }

            const saveTime = Date.now() - startTime;
            logger.info('Game state saved successfully', {
              saveTime: `${saveTime}ms`,
              attempt,
              journalCount: currentState.journalEntries.length,
            });

            // Update save state to success
            set((state) => ({
              saveState: {
                ...state.saveState,
                status: 'success',
                lastSaveTimestamp: Date.now(),
                lastError: undefined,
                retryCount: 0,
                hasUnsavedChanges: false,
              },
            }));

            return true;
          } catch (error: any) {
            const saveError: SaveError = {
              type: error.type || SaveErrorType.UNKNOWN_ERROR,
              message: error.message || 'Unknown save error',
              originalError: error.originalError || error,
              timestamp: Date.now(),
            };

            const {
              data: { user },
            } = await supabase.auth.getUser();

            logger.error('Save attempt failed', saveError, {
              attempt,
              userId: user?.id || 'unknown',
            });

            // Determine if we should retry
            const shouldRetry =
              attempt < RETRY_CONFIG.maxAttempts && isRetryableError(saveError.type);

            if (shouldRetry) {
              const delay = Math.min(
                RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
                RETRY_CONFIG.maxDelay,
              );

              logger.info(`Retrying save in ${delay}ms`, { attempt: attempt + 1 });

              // Wait before retry
              await new Promise((resolve) => setTimeout(resolve, delay));

              // Recursive retry
              return attemptSave(attempt + 1);
            } else {
              // Max attempts reached or non-retryable error
              logger.error('Save failed permanently', saveError, {
                maxAttemptsReached: attempt >= RETRY_CONFIG.maxAttempts,
                isRetryable: isRetryableError(saveError.type),
              });

              // Update save state to error
              set((state) => ({
                saveState: {
                  ...state.saveState,
                  status: 'error',
                  lastError: saveError.message,
                  retryCount: attempt,
                  hasUnsavedChanges: true,
                },
              }));

              // Don't throw - we want the game to continue even if save fails
              return false;
            }
          }
        };

        return await attemptSave();
      },

      loadFromSupabase: async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            logger.warn('No user authenticated - skipping load', userError);
            return;
          }

          logger.debug('Loading game state for user', { userId: user.id });

          // Load game state
          const { data: gameState, error: stateError } = await supabase
            .from('game_states')
            .select('*')
            .eq('user_id', user.id)
            .single();

          // Handle database errors gracefully - preserve localStorage cache
          if (stateError && stateError.code !== 'PGRST116') {
            // PGRST116 = no rows (expected for new users)
            // For other errors (network, permission, etc.), log warning and skip database merge
            // localStorage values remain intact from Zustand's automatic rehydration
            logger.warn('Database error loading game state - using cached localStorage values', {
              error: stateError.message,
              code: stateError.code,
            });

            // Update save state to reflect offline mode
            set((state) => ({
              saveState: {
                ...state.saveState,
                status: 'error',
                lastError: `Database unavailable: ${stateError.message}`,
                hasUnsavedChanges: state.saveState.hasUnsavedChanges,
              },
            }));

            // Skip database merge - localStorage values are already hydrated
            return;
          }

          logger.debug('Game state loaded', {
            found: !!gameState,
            guardianTrust: gameState?.guardian_trust || 0,
          });

          // Load journal entries
          const { data: journalEntries, error: journalError } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (journalError) {
            // Log warning and continue with cached data instead of throwing
            logger.warn('Error loading journal entries - using cached data', {
              error: journalError.message,
            });
            // Continue with empty journal entries from database, localStorage cache is preserved
          }

          logger.debug('Journal entries loaded', {
            count: journalEntries?.length || 0,
          });

          if (gameState || journalEntries) {
            // Parse JSON fields from database
            const parsedMilestones = gameState?.milestones
              ? typeof gameState.milestones === 'string'
                ? JSON.parse(gameState.milestones)
                : gameState.milestones
              : initialMilestones;

            const parsedSceneHistory = gameState?.scene_history
              ? typeof gameState.scene_history === 'string'
                ? JSON.parse(gameState.scene_history)
                : gameState.scene_history
              : [];

            // Load resources into shared store
            if (gameState) {
              const currentResources = usePlayerResources.getState().getResourceSnapshot();
              usePlayerResources.getState().setAllResources({
                playerEnergy: gameState.player_energy ?? currentResources.playerEnergy,
                maxPlayerEnergy: gameState.max_player_energy ?? currentResources.maxPlayerEnergy,
                lightPoints: gameState.light_points ?? currentResources.lightPoints,
                shadowPoints: gameState.shadow_points ?? currentResources.shadowPoints,
                playerHealth: gameState.player_health ?? currentResources.playerHealth,
                maxPlayerHealth: gameState.max_player_health ?? currentResources.maxPlayerHealth,
              });
            }

            set({
              ...(gameState && {
                guardianTrust: gameState.guardian_trust,
                playerLevel: gameState.player_level,
                currentSceneIndex: gameState.current_scene_index,
                milestones: parsedMilestones,
                sceneHistory: parsedSceneHistory,
                // Experience points system
                experiencePoints: gameState.experience_points ?? get().experiencePoints,
                experienceToNext: gameState.experience_to_next ?? get().experienceToNext,
                // Player statistics for therapeutic analytics (cast from Json)
                playerStatistics:
                  (gameState.player_statistics as unknown as PlayerStatistics) ??
                  get().playerStatistics,
              }),
              journalEntries:
                journalEntries?.map(
                  (entry) =>
                    ({
                      id: entry.id,
                      type: entry.type as 'milestone' | 'learning',
                      trustLevel: entry.trust_level,
                      content: entry.content,
                      title: entry.title,
                      timestamp: entry.created_at ? new Date(entry.created_at) : new Date(),
                      sceneId: entry.scene_id || undefined,
                      tags: Array.isArray(entry.tags)
                        ? entry.tags.filter((tag): tag is string => typeof tag === 'string')
                        : [],
                      isEdited: entry.is_edited || false,
                      editedAt: entry.edited_at ? new Date(entry.edited_at) : undefined,
                    }) as JournalEntry,
                ) || [],
              saveState: {
                status: 'success',
                lastSaveTimestamp: Date.now(),
                retryCount: 0,
                hasUnsavedChanges: false,
              },
            });

            logger.info('Game state loaded from Supabase successfully', {
              guardianTrust: gameState?.guardian_trust || 0,
              journalCount: journalEntries?.length || 0,
            });
          }
        } catch (error) {
          logger.error('Failed to load from Supabase:', error);

          // Update save state to reflect error
          set((state) => ({
            saveState: {
              ...state.saveState,
              status: 'error',
              lastError:
                error instanceof Error ? error.message : 'Unknown error loading from Supabase',
              hasUnsavedChanges: true,
            },
          }));

          // Don't throw - we want the game to continue even if load fails
        }
      },

      // Health check methods
      performHealthCheck: async () => {
        try {
          logger.debug('Performing database health check');

          const result = await performEnhancedHealthCheck();
          const newHealthStatus = getCurrentHealthStatus(result);

          set(() => ({
            healthStatus: newHealthStatus,
          }));

          if (result.success) {
            logger.debug('Health check successful', {
              responseTime: result.responseTime,
              environment: newHealthStatus.environment,
            });
          } else {
            logger.warn('Health check failed', {
              error: result.error,
              responseTime: result.responseTime,
            });
          }
        } catch (error: any) {
          logger.error('Health check threw exception', error);

          set(() => ({
            healthStatus: {
              isConnected: false,
              responseTime: 0,
              lastChecked: Date.now(),
              error: error.message || 'Health check failed',
              environment: detectEnvironment(),
            },
          }));
        }
      },

      startHealthMonitoring: () => {
        const state = get();

        // Don't start monitoring if already running
        if (state._isHealthMonitoringActive || state._healthCheckInterval) {
          logger.debug('Health monitoring already running');
          return;
        }

        logger.info('Starting database health monitoring');

        // Mark as active immediately to prevent race conditions
        set({ _isHealthMonitoringActive: true });

        // Perform initial health check
        get().performHealthCheck();

        // Set up periodic health checks using environment-specific interval
        const config = getEnvironmentConfig();
        const interval = setInterval(() => {
          const currentState = get();

          // Only perform health check if the app is active and user is present
          if (document.hidden || !document.hasFocus()) {
            logger.debug('Skipping health check - app not active');
            return;
          }

          currentState.performHealthCheck();
        }, config.healthCheckInterval);

        // Store interval reference
        set({ _healthCheckInterval: interval });
      },

      stopHealthMonitoring: () => {
        const state = get();

        if (state._healthCheckInterval) {
          logger.info('Stopping database health monitoring');
          clearInterval(state._healthCheckInterval);
          set({
            _healthCheckInterval: undefined,
            _isHealthMonitoringActive: false,
          });
        }
      },

      // Energy regeneration actions
      startEnergyRegeneration: () => {
        const state = get();

        // CRITICAL: Check and prevent duplicate starts atomically
        if (state._isEnergyRegenActive) {
          logger.debug('Energy regeneration already active, skipping start');
          return;
        }

        // CRITICAL: Always clear existing interval first if it exists (atomic cleanup)
        if (state._energyRegenInterval) {
          clearInterval(state._energyRegenInterval);
          logger.warn('Cleared existing energy regeneration interval');
        }

        logger.info('Starting energy regeneration');

        // Set active flag immediately to prevent race conditions
        set({ _isEnergyRegenActive: true });

        // Set up periodic regeneration using environment-specific interval
        const config = getEnvironmentConfig();
        const interval = setInterval(() => {
          const currentState = get();

          // Only regenerate energy if the app is active and user is present
          if (document.hidden || !document.hasFocus()) {
            logger.debug('Skipping energy regeneration - app not active');
            return;
          }

          currentState.regenerateEnergy();
        }, config.energyRegenInterval);

        // Store interval reference atomically
        set({ _energyRegenInterval: interval });
      },

      stopEnergyRegeneration: () => {
        const state = get();

        // Always reset flags, even if no interval exists (cleanup any inconsistent state)
        if (state._energyRegenInterval) {
          logger.info('Stopping energy regeneration');
          clearInterval(state._energyRegenInterval);
        } else if (state._isEnergyRegenActive) {
          logger.warn(
            'Clearing inconsistent energy regeneration state (active flag but no interval)',
          );
        }

        // Atomically reset both flags regardless of current state
        set({
          _energyRegenInterval: undefined,
          _isEnergyRegenActive: false,
        });
      },

      regenerateEnergy: () => {
        const resourceStore = usePlayerResources.getState();

        // Don't regenerate if already at max energy
        if (resourceStore.playerEnergy >= resourceStore.maxPlayerEnergy) {
          logger.debug('Energy regeneration skipped - already at max energy');
          return;
        }

        // Regenerate 1 energy via shared resource store
        const previousEnergy = resourceStore.playerEnergy;
        resourceStore.modifyEnergy(1);

        set((state) => ({
          saveState: { ...state.saveState, hasUnsavedChanges: true },
        }));

        logger.debug(`Energy regenerated: ${previousEnergy} -> ${resourceStore.playerEnergy}`);
      },
    }),
    {
      name: 'luminari-game-state',
      partialize: (state) => ({
        guardianTrust: state.guardianTrust,
        playerLevel: state.playerLevel,
        currentSceneIndex: state.currentSceneIndex,
        journalEntries: state.journalEntries.map((entry) => ({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        })),
        milestones: state.milestones.map((milestone) => ({
          ...milestone,
          achievedAt: milestone.achievedAt
            ? new Date(milestone.achievedAt).toISOString()
            : undefined,
        })),
        sceneHistory: state.sceneHistory.map((scene) => ({
          ...scene,
          completedAt: new Date(scene.completedAt).toISOString(),
        })),
        // Experience points for offline resilience
        experiencePoints: state.experiencePoints,
        experienceToNext: state.experienceToNext,
        // Player statistics for therapeutic analytics
        playerStatistics: state.playerStatistics,
        // Pending milestone journals (already an array, serializes correctly)
        pendingMilestoneJournals: state.pendingMilestoneJournals,
      }),
      // Add a merge function to handle rehydration
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;

        // Convert ISO strings back to Date objects
        const hydratedJournalEntries = (persistedState.journalEntries || []).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));

        // Properly merge milestones, ensuring we don't duplicate and maintain initial structure
        const mergedMilestones = initialMilestones.map((initialMilestone) => {
          const persistedMilestone = (persistedState.milestones || []).find(
            (m: any) => m.id === initialMilestone.id,
          );
          return persistedMilestone
            ? {
                ...initialMilestone,
                ...persistedMilestone,
                achievedAt: persistedMilestone.achievedAt
                  ? new Date(persistedMilestone.achievedAt).getTime()
                  : undefined,
              }
            : initialMilestone;
        });

        // Handle pendingMilestoneJournals migration from Set to Array
        // Legacy localStorage may have {} (failed Set serialization) or undefined
        const migratePendingMilestoneJournals = (data: any): number[] => {
          // Already a valid array
          if (Array.isArray(data)) return data;
          // Empty object from failed Set serialization or undefined/null
          if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return [];
          // Fallback for any other unexpected format
          return [];
        };

        return {
          ...currentState,
          ...persistedState,
          journalEntries: hydratedJournalEntries,
          milestones: mergedMilestones,
          // Experience points with defaults for backwards compatibility
          experiencePoints: persistedState.experiencePoints ?? currentState.experiencePoints,
          experienceToNext: persistedState.experienceToNext ?? currentState.experienceToNext,
          // Player statistics with defaults
          playerStatistics: persistedState.playerStatistics ?? currentState.playerStatistics,
          // Pending milestone journals with legacy migration
          pendingMilestoneJournals: migratePendingMilestoneJournals(
            persistedState.pendingMilestoneJournals,
          ),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);

// Hydration-safe hook that prevents mismatches
// Also combines game store with shared resource store for backwards compatibility
export const useGameStore = () => {
  const store = useGameStoreBase();
  const resources = usePlayerResources();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Return initial values during SSR/hydration to prevent mismatches
  // BUT allow real-time resource values to show through for combat system
  if (!hasMounted || !store._hasHydrated) {
    return {
      guardianTrust: 50,
      playerLevel: 1,
      currentSceneIndex: 0,
      journalEntries: [],
      milestones: initialMilestones,
      sceneHistory: [],
      pendingMilestoneJournals: [],

      // Player Health System - from shared resource store
      playerHealth: resources.playerHealth,
      maxPlayerHealth: resources.maxPlayerHealth,

      // Player Energy System - from shared resource store
      playerEnergy: resources.playerEnergy,
      maxPlayerEnergy: resources.maxPlayerEnergy,

      // Light & Shadow Combat Resources - from shared resource store
      lightPoints: resources.lightPoints,
      shadowPoints: resources.shadowPoints,

      // Experience Points System - from game store
      experiencePoints: store.experiencePoints,
      experienceToNext: store.experienceToNext,

      // Player Statistics - from game store
      playerStatistics: store.playerStatistics,

      // Combat System State - from game store
      combat: store.combat,

      saveState: {
        status: 'idle',
        retryCount: 0,
        hasUnsavedChanges: false,
      } as SaveState,
      healthStatus: {
        isConnected: false,
        responseTime: 0,
        lastChecked: 0,
        environment: detectEnvironment(),
      } as DatabaseHealthStatus,
      setGuardianTrust: store.setGuardianTrust,
      addJournalEntry: store.addJournalEntry,
      updateJournalEntry: store.updateJournalEntry,
      deleteJournalEntry: store.deleteJournalEntry,
      completeScene: store.completeScene,
      advanceScene: store.advanceScene,
      saveToSupabase: store.saveToSupabase,
      loadFromSupabase: store.loadFromSupabase,
      resetGame: store.resetGame,
      updateMilestone: store.updateMilestone,
      markMilestoneJournalShown: store.markMilestoneJournalShown,

      // Player Health Management - delegated to shared store via game store actions
      modifyPlayerHealth: store.modifyPlayerHealth,
      healPlayerHealth: store.healPlayerHealth,
      setPlayerHealth: store.setPlayerHealth,

      // Player Energy Management
      modifyPlayerEnergy: store.modifyPlayerEnergy,
      setPlayerEnergy: store.setPlayerEnergy,

      // Light & Shadow Combat Actions
      modifyLightPoints: store.modifyLightPoints,
      modifyShadowPoints: store.modifyShadowPoints,
      convertShadowToLight: store.convertShadowToLight,

      // Experience Points Management
      modifyExperiencePoints: store.modifyExperiencePoints,
      getPlayerLevel: store.getPlayerLevel,
      getExperienceProgress: store.getExperienceProgress,

      // Player Statistics Management
      updateCombatStatistics: store.updateCombatStatistics,
      getPlayerStatistics: store.getPlayerStatistics,

      // Combat System Actions (simplified)
      endCombat: store.endCombat,

      checkUnsavedChanges: store.checkUnsavedChanges,
      clearSaveError: store.clearSaveError,
      performHealthCheck: store.performHealthCheck,
      startHealthMonitoring: store.startHealthMonitoring,
      stopHealthMonitoring: store.stopHealthMonitoring,
      _hasHydrated: store._hasHydrated,
      _setHasHydrated: store._setHasHydrated,

      // Energy regeneration actions
      startEnergyRegeneration: store.startEnergyRegeneration,
      stopEnergyRegeneration: store.stopEnergyRegeneration,
      regenerateEnergy: store.regenerateEnergy,
    };
  }

  // Return combined store with resource values from shared store
  return {
    ...store,
    // Override resource values with shared store values
    playerHealth: resources.playerHealth,
    maxPlayerHealth: resources.maxPlayerHealth,
    playerEnergy: resources.playerEnergy,
    maxPlayerEnergy: resources.maxPlayerEnergy,
    lightPoints: resources.lightPoints,
    shadowPoints: resources.shadowPoints,
  };
};
