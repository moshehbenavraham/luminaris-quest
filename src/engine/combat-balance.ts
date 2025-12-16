import type { ShadowManifestation, CombatState } from '@/types';
import { COMBAT_BALANCE, calculateEmbraceDamage, calculateIlluminateDamage } from './combat-engine';
import { shadowManifestations } from '../data/shadowManifestations';

/**
 * Combat Balance Analysis and Optimization System
 *
 * This module analyzes the mathematical balance of the combat system
 * and provides recommendations for optimal therapeutic gameplay experience.
 */

export interface BalanceMetrics {
  // Player action efficiency
  illuminateDamageRange: { min: number; max: number; average: number };
  embraceDamageRange: { min: number; max: number; average: number };
  resourceEfficiency: {
    lpPerDamage: number;
    spPerDamage: number;
    healingPerSP: number;
  };

  // Enemy balance
  shadowDifficulty: {
    [shadowId: string]: {
      hp: number;
      averageTurnsToDefeat: number;
      threatLevel: 'low' | 'medium' | 'high' | 'extreme';
      abilityPower: number;
    };
  };

  // Combat flow
  averageCombatLength: number;
  resourcePressure: 'low' | 'medium' | 'high';
  actionViability: {
    [action: string]: {
      usageRate: number;
      effectiveness: number;
      situationalValue: number;
    };
  };
}

export interface BalanceRecommendations {
  issues: Array<{
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    category: 'damage' | 'resources' | 'difficulty' | 'flow';
    description: string;
    recommendation: string;
    suggestedValues?: Record<string, number>;
  }>;

  optimizations: Array<{
    type: 'buff' | 'nerf' | 'adjust';
    target: string;
    reason: string;
    suggestedChange: string;
  }>;

  therapeuticImpact: {
    playerAgency: 'low' | 'medium' | 'high';
    strategicDepth: 'low' | 'medium' | 'high';
    emotionalPacing: 'too-fast' | 'optimal' | 'too-slow';
    learningCurve: 'too-steep' | 'optimal' | 'too-shallow';
  };
}

/**
 * Calculate damage range for ILLUMINATE action across player levels (NEW combat system).
 */
export function calculateIlluminateRange(levelRange: { min: number; max: number }): {
  min: number;
  max: number;
  average: number;
} {
  const minDamage = calculateIlluminateDamage(levelRange.min);
  const maxDamage = calculateIlluminateDamage(levelRange.max);

  return {
    min: minDamage,
    max: maxDamage,
    average: (minDamage + maxDamage) / 2,
  };
}

/**
 * Calculate damage range for EMBRACE action across SP levels
 */
export function calculateEmbraceRange(spRange: { min: number; max: number }): {
  min: number;
  max: number;
  average: number;
} {
  const minDamage = calculateEmbraceDamage(spRange.min);
  const maxDamage = calculateEmbraceDamage(spRange.max);

  return {
    min: minDamage,
    max: maxDamage,
    average: (minDamage + maxDamage) / 2,
  };
}

/**
 * Analyze shadow manifestation difficulty
 */
export function analyzeShadowDifficulty(shadow: ShadowManifestation): {
  hp: number;
  averageTurnsToDefeat: number;
  threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  abilityPower: number;
} {
  const hp = shadow.maxHP;

  // Calculate average damage per turn (assuming mixed strategy)
  const averageIlluminateDamage = calculateIlluminateRange({ min: 1, max: 5 }).average;
  const averageEmbraceDamage = calculateEmbraceRange({ min: 5, max: 10 }).average;
  const mixedDamagePerTurn = averageIlluminateDamage * 0.6 + averageEmbraceDamage * 0.4;

  const averageTurnsToDefeat = Math.ceil(hp / mixedDamagePerTurn);

  // Calculate ability power based on effects
  let abilityPower = 0;
  shadow.abilities.forEach((ability) => {
    // Simulate ability effects to measure power
    const mockState: CombatState = {
      inCombat: true,
      currentEnemy: shadow,
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      sceneDC: 12, // Default scene DC for balance calculations
      damageMultiplier: 1,
      damageReduction: 1,
      healingBlocked: 0,
      lpGenerationBlocked: 0,
      skipNextTurn: false,
      consecutiveEndures: 0,
      preferredActions: { ILLUMINATE: 0, REFLECT: 0, ENDURE: 0, EMBRACE: 0 },
      growthInsights: [],
      combatReflections: [],
    };

    const beforeState = { ...mockState };
    ability.effect(mockState);

    // Calculate power based on state changes
    const lpLoss = beforeState.resources.lp - mockState.resources.lp;
    const spGain = mockState.resources.sp - beforeState.resources.sp;
    const statusEffects =
      (mockState.healingBlocked > 0 ? 2 : 0) +
      (mockState.lpGenerationBlocked > 0 ? 2 : 0) +
      (mockState.skipNextTurn ? 3 : 0) +
      (mockState.damageMultiplier > 1 ? 3 : 0);

    abilityPower += lpLoss + spGain * 0.5 + statusEffects;
  });

  // Determine threat level
  let threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  const totalThreat = hp + abilityPower + averageTurnsToDefeat * 2;

  if (totalThreat < 20) threatLevel = 'low';
  else if (totalThreat < 35) threatLevel = 'medium';
  else if (totalThreat < 50) threatLevel = 'high';
  else threatLevel = 'extreme';

  return {
    hp,
    averageTurnsToDefeat,
    threatLevel,
    abilityPower,
  };
}

/**
 * Calculate resource efficiency metrics
 */
export function calculateResourceEfficiency(): {
  lpPerDamage: number;
  spPerDamage: number;
  healingPerSP: number;
} {
  // ILLUMINATE: 2 LP for level-scaled damage (use levels 1-5 as representative)
  const averageIlluminateDamage = calculateIlluminateRange({ min: 1, max: 5 }).average;
  const lpPerDamage = COMBAT_BALANCE.ILLUMINATE_LP_COST / averageIlluminateDamage;

  // EMBRACE: Variable SP for damage (roughly 2 SP per 1 damage on average)
  const spPerDamage = 2; // 2 SP per 1 damage

  // REFLECT: 3 SP for +1 LP (health healing is random and not modeled here)
  const healingPerSP = COMBAT_BALANCE.REFLECT_LP_GAIN / COMBAT_BALANCE.REFLECT_SP_COST;

  return {
    lpPerDamage,
    spPerDamage,
    healingPerSP,
  };
}

/**
 * Analyze action viability and usage patterns
 */
export function analyzeActionViability(): {
  [action: string]: {
    usageRate: number;
    effectiveness: number;
    situationalValue: number;
  };
} {
  return {
    ILLUMINATE: {
      usageRate: 0.8, // High usage - primary damage dealer
      effectiveness: 0.85, // Very effective with trust scaling
      situationalValue: 0.7, // Good in most situations
    },
    REFLECT: {
      usageRate: 0.4, // Moderate usage - situational healing
      effectiveness: 0.6, // Moderate effectiveness
      situationalValue: 0.9, // Very valuable when healing is needed
    },
    ENDURE: {
      usageRate: 0.3, // Lower usage - defensive option
      effectiveness: 0.5, // Moderate effectiveness
      situationalValue: 0.8, // High value in desperate situations
    },
    EMBRACE: {
      usageRate: 0.5, // Moderate usage - SP conversion
      effectiveness: 0.7, // Good effectiveness
      situationalValue: 0.6, // Situational based on SP availability
    },
  };
}

/**
 * Generate comprehensive balance metrics for the combat system
 */
export function generateBalanceMetrics(): BalanceMetrics {
  const illuminateRange = calculateIlluminateRange({ min: 1, max: 5 });
  const embraceRange = calculateEmbraceRange({ min: 5, max: 10 });
  const resourceEfficiency = calculateResourceEfficiency();
  const actionViability = analyzeActionViability();

  // Analyze all shadow manifestations
  const shadowDifficulty: BalanceMetrics['shadowDifficulty'] = {};
  Object.entries(shadowManifestations).forEach(([, shadow]) => {
    shadowDifficulty[shadow.id] = analyzeShadowDifficulty(shadow);
  });

  // Calculate average combat length
  const averageCombatLength =
    Object.values(shadowDifficulty).reduce((sum, shadow) => sum + shadow.averageTurnsToDefeat, 0) /
    Object.values(shadowDifficulty).length;

  // Determine resource pressure
  let resourcePressure: 'low' | 'medium' | 'high';
  const lpCostRatio = resourceEfficiency.lpPerDamage;
  const spCostRatio = resourceEfficiency.spPerDamage;

  if (lpCostRatio < 0.4 && spCostRatio < 2.5) resourcePressure = 'low';
  else if (lpCostRatio < 0.6 && spCostRatio < 3) resourcePressure = 'medium';
  else resourcePressure = 'high';

  return {
    illuminateDamageRange: illuminateRange,
    embraceDamageRange: embraceRange,
    resourceEfficiency,
    shadowDifficulty,
    averageCombatLength,
    resourcePressure,
    actionViability,
  };
}

/**
 * Analyze balance and generate recommendations
 */
export function analyzeBalance(): BalanceRecommendations {
  const metrics = generateBalanceMetrics();
  const issues: BalanceRecommendations['issues'] = [];
  const optimizations: BalanceRecommendations['optimizations'] = [];

  // Check for damage scaling issues
  if (metrics.illuminateDamageRange.max - metrics.illuminateDamageRange.min > 6) {
    issues.push({
      severity: 'moderate',
      category: 'damage',
      description:
        'ILLUMINATE damage scaling creates large power gaps between low and high player levels',
      recommendation: 'Consider reducing level scaling factor or increasing base damage',
      suggestedValues: { ILLUMINATE_LEVEL_SCALING: 1.2, ILLUMINATE_BASE_DAMAGE: 4 },
    });
  }

  // Check resource efficiency balance
  if (metrics.resourceEfficiency.lpPerDamage > 0.5) {
    issues.push({
      severity: 'minor',
      category: 'resources',
      description: 'ILLUMINATE action may be too expensive relative to damage output',
      recommendation: 'Consider reducing LP cost or increasing base damage',
      suggestedValues: { ILLUMINATE_LP_COST: 1 },
    });
  }

  // Check shadow difficulty progression
  const shadowDiffs = Object.values(metrics.shadowDifficulty);
  const difficultyGaps = shadowDiffs
    .map((shadow, i) => {
      if (i === 0) return 0;
      return shadow.averageTurnsToDefeat - shadowDiffs[i - 1].averageTurnsToDefeat;
    })
    .slice(1);

  if (Math.max(...difficultyGaps) > 3) {
    issues.push({
      severity: 'moderate',
      category: 'difficulty',
      description: 'Large difficulty spikes between shadow manifestations',
      recommendation: 'Smooth difficulty progression by adjusting HP or abilities',
    });
  }

  // Check action viability
  const lowViabilityActions = Object.entries(metrics.actionViability)
    .filter(([_action, data]) => data.usageRate < 0.4)
    .map(([action]) => action);

  if (lowViabilityActions.length > 0) {
    issues.push({
      severity: 'major',
      category: 'flow',
      description: `Actions ${lowViabilityActions.join(', ')} have low usage rates`,
      recommendation: 'Buff underused actions or create more situations where they excel',
    });
  }

  // Generate optimizations
  if (metrics.resourcePressure === 'high') {
    optimizations.push({
      type: 'buff',
      target: 'Resource Generation',
      reason: 'High resource pressure may frustrate players',
      suggestedChange: 'Increase starting resources or add resource generation mechanics',
    });
  }

  if (metrics.averageCombatLength > 8) {
    optimizations.push({
      type: 'adjust',
      target: 'Combat Length',
      reason: 'Long combats may reduce therapeutic engagement',
      suggestedChange: 'Increase damage values or reduce enemy HP slightly',
    });
  }

  // Assess therapeutic impact
  const therapeuticImpact = {
    playerAgency:
      metrics.actionViability.ILLUMINATE.usageRate > 0.7
        ? 'high'
        : metrics.actionViability.ILLUMINATE.usageRate > 0.5
          ? 'medium'
          : 'low',
    strategicDepth: Object.values(metrics.actionViability).every((a) => a.situationalValue > 0.5)
      ? 'high'
      : 'medium',
    emotionalPacing:
      metrics.averageCombatLength < 5
        ? 'too-fast'
        : metrics.averageCombatLength > 10
          ? 'too-slow'
          : 'optimal',
    learningCurve:
      issues.filter((i) => i.severity === 'major' || i.severity === 'critical').length > 2
        ? 'too-steep'
        : 'optimal',
  } as const;

  return {
    issues,
    optimizations,
    therapeuticImpact,
  };
}

/**
 * Get balance summary for quick overview
 */
export function getBalanceSummary(): {
  overallHealth: 'excellent' | 'good' | 'needs-attention' | 'critical';
  keyMetrics: {
    averageCombatLength: number;
    resourcePressure: string;
    difficultyProgression: string;
  };
  topRecommendations: string[];
} {
  const analysis = analyzeBalance();
  const metrics = generateBalanceMetrics();

  // Determine overall health
  const criticalIssues = analysis.issues.filter((i) => i.severity === 'critical').length;
  const majorIssues = analysis.issues.filter((i) => i.severity === 'major').length;

  let overallHealth: 'excellent' | 'good' | 'needs-attention' | 'critical';
  if (criticalIssues > 0) overallHealth = 'critical';
  else if (majorIssues > 1) overallHealth = 'needs-attention';
  else if (analysis.issues.length > 3) overallHealth = 'good';
  else overallHealth = 'excellent';

  return {
    overallHealth,
    keyMetrics: {
      averageCombatLength: Math.round(metrics.averageCombatLength * 10) / 10,
      resourcePressure: metrics.resourcePressure,
      difficultyProgression:
        metrics.shadowDifficulty['whisper-of-doubt'].threatLevel +
        ' → ' +
        metrics.shadowDifficulty['echo-of-past-pain'].threatLevel,
    },
    topRecommendations: analysis.issues
      .sort((a, b) => {
        const severityOrder = { critical: 4, major: 3, moderate: 2, minor: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 3)
      .map((issue) => issue.recommendation),
  };
}
