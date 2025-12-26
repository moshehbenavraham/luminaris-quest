import type { JournalEntry } from './journal';

// Light & Shadow Combat System Types (legacy game-store combat state)
export interface LightShadowResources {
  lp: number; // Light Points - Positive emotional resources
  sp: number; // Shadow Points - Challenges that can become growth
}

export type CombatAction = 'ILLUMINATE' | 'REFLECT' | 'ENDURE' | 'EMBRACE';

export interface ShadowManifestation {
  id: string;
  name: string;
  type: 'doubt' | 'isolation' | 'overwhelm' | 'past-pain';
  description: string;
  currentHP: number;
  maxHP: number;
  abilities: ShadowAbility[];
  therapeuticInsight: string;
  victoryReward: {
    lpBonus: number;
    growthMessage: string;
    permanentBenefit: string;
  };
}

export interface CombatLogEntry {
  turn: number;
  actor: 'PLAYER' | 'SHADOW';
  action: string;
  effect: string;
  resourceChange: Partial<LightShadowResources> & { enemyHP?: number; healthDamage?: number };
  message: string;
}

// Player Statistics for therapeutic analytics persistence
export interface PlayerStatistics {
  combatActions: {
    ILLUMINATE: number;
    REFLECT: number;
    ENDURE: number;
    EMBRACE: number;
  };
  totalCombatsWon: number;
  totalCombatsLost: number;
  totalTurnsPlayed: number;
  averageCombatLength: number;
  // Therapeutic growth insights collected during the player's journey
  growthInsights: string[];
}

export interface CombatState {
  inCombat: boolean;
  currentEnemy: ShadowManifestation | null;
  resources: LightShadowResources;
  turn: number;
  log: CombatLogEntry[];

  // Scene context for damage calculation
  sceneDC: number; // Difficulty check of the scene that triggered combat

  // Status effects
  damageMultiplier: number;
  damageReduction: number;
  healingBlocked: number;
  lpGenerationBlocked: number;
  skipNextTurn: boolean;
  consecutiveEndures: number;

  // Therapeutic tracking
  preferredActions: Record<CombatAction, number>;
  growthInsights: string[];
  combatReflections: JournalEntry[];
}

export interface ShadowAbility {
  id: string;
  name: string;
  cooldown: number;
  currentCooldown: number;
  effect: (state: CombatState) => void;
  description: string;
}
