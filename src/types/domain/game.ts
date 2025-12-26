import type { DatabaseHealthStatus } from '@/lib/database-health';
import type { JournalEntry } from './journal';
import type { CompletedScene, Milestone } from './progression';
import type { CombatAction, CombatState, PlayerStatistics } from './combat';
import type { SaveState } from './save';

export interface GameState {
  guardianTrust: number;
  playerLevel: number;
  currentSceneIndex: number;
  journalEntries: JournalEntry[];
  milestones: Milestone[];
  sceneHistory: CompletedScene[];
  pendingMilestoneJournals: number[];

  // Player Health System
  playerHealth: number; // 0-100, represents player's overall health
  maxPlayerHealth: number; // Maximum health capacity

  // Player Energy System
  playerEnergy: number; // 0-100 represents player's current energy
  maxPlayerEnergy: number; // maximum energy capacity

  // Light & Shadow Combat Resources
  lightPoints: number;
  shadowPoints: number;

  // Experience Points System
  experiencePoints: number; // Current XP total
  experienceToNext: number; // XP needed for next level

  // Player Statistics for therapeutic analytics
  playerStatistics: PlayerStatistics;

  // Combat System State
  combat: CombatState;

  // Save operation state
  saveState: SaveState;

  // Database health check state
  healthStatus: DatabaseHealthStatus;

  // Actions
  setGuardianTrust: (trust: number) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  completeScene: (scene: CompletedScene) => void;
  advanceScene: () => void;
  saveToSupabase: () => Promise<boolean>;
  loadFromSupabase: () => Promise<void>;
  resetGame: () => void;
  updateMilestone: (level: number) => void;
  markMilestoneJournalShown: (level: number) => void;

  // Player Health Management
  modifyPlayerHealth: (delta: number) => void;
  healPlayerHealth: (amount: number) => void;
  setPlayerHealth: (health: number) => void;

  // Player Energy Management
  modifyPlayerEnergy: (delta: number) => void;
  setPlayerEnergy: (energy: number) => void;

  // Light & Shadow Combat Actions
  modifyLightPoints: (delta: number) => void;
  modifyShadowPoints: (delta: number) => void;
  convertShadowToLight: (amount: number) => void;

  // Experience Points Management
  modifyExperiencePoints: (delta: number, reason?: string) => void;
  getPlayerLevel: () => number;
  getExperienceProgress: () => { current: number; toNext: number; percentage: number };

  // Player Statistics Management
  updateCombatStatistics: (
    actions: Record<CombatAction, number>,
    victory: boolean,
    turnsPlayed: number,
  ) => void;
  updatePlayerStatistics: (preferredActions: Partial<Record<CombatAction, number>>) => void;
  getPlayerStatistics: () => PlayerStatistics;

  // Combat System Actions (simplified - new combat system in @/features/combat)
  endCombat: (victory: boolean) => void;

  // Save state utilities
  checkUnsavedChanges: () => boolean;
  clearSaveError: () => void;

  // Health check actions
  performHealthCheck: () => Promise<void>;
  startHealthMonitoring: () => void;
  stopHealthMonitoring: () => void;

  // Internal state (not persisted)
  _hasHydrated: boolean;
  _setHasHydrated: (hasHydrated: boolean) => void;
  _healthCheckInterval?: NodeJS.Timeout;
  _isHealthMonitoringActive: boolean;
  _energyRegenInterval?: NodeJS.Timeout;
  _isEnergyRegenActive: boolean;

  // Energy regeneration actions
  startEnergyRegeneration: () => void;
  stopEnergyRegeneration: () => void;
  regenerateEnergy: () => void;
}
