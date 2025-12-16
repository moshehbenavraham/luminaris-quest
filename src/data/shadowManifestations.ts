import type { CombatState, ShadowAbility, ShadowManifestation } from '@/types';

/**
 * Shadow Manifestations - Enemy data for Light & Shadow Combat System
 *
 * Each shadow represents a different type of inner struggle that players
 * must overcome using therapeutic combat techniques. The shadows are designed
 * to teach emotional regulation through tactical gameplay.
 */

// Shadow ability implementations
const shadowAbilities = {
  // Doubt abilities
  selfQuestioning: {
    id: 'self-questioning',
    name: 'Self-Questioning',
    cooldown: 3,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Drains confidence steadily - reduces LP generation
      state.lpGenerationBlocked = Math.max(state.lpGenerationBlocked, 2);
      state.resources.lp = Math.max(0, state.resources.lp - 1);
    },
    description:
      'The inner critic whispers "What if you\'re wrong?" - eroding confidence and blocking your ability to generate hope',
  } as ShadowAbility,

  magnification: {
    id: 'magnification',
    name: 'Magnification',
    cooldown: 5,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Makes small worries feel overwhelming - increases damage taken
      state.damageMultiplier = 2;
    },
    description:
      'Catastrophic thinking takes hold - small concerns become overwhelming disasters in your mind',
  } as ShadowAbility,

  // Isolation abilities
  withdrawal: {
    id: 'withdrawal',
    name: 'Withdrawal',
    cooldown: 4,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Blocks healing and connection - prevents REFLECT action benefits
      state.healingBlocked = Math.max(state.healingBlocked, 3);
    },
    description:
      'The protective walls you built now keep out healing - isolation feels safer but blocks recovery',
  } as ShadowAbility,

  loneliness: {
    id: 'loneliness',
    name: 'Loneliness',
    cooldown: 6,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Converts LP to SP - isolation breeds more shadow
      const lpToConvert = Math.min(state.resources.lp, 3);
      state.resources.lp -= lpToConvert;
      state.resources.sp += lpToConvert;
    },
    description:
      'Deep loneliness whispers "No one understands" - hope dims as disconnection grows stronger',
  } as ShadowAbility,

  // Overwhelm abilities
  cascade: {
    id: 'cascade',
    name: 'Cascade',
    cooldown: 3,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Everything feels urgent - forces player to skip next turn
      state.skipNextTurn = true;
    },
    description:
      'A cascade of urgent demands floods your mind - "Everything must be done NOW!" - freezing you in analysis paralysis',
  } as ShadowAbility,

  pressure: {
    id: 'pressure',
    name: 'Pressure',
    cooldown: 4,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Increases resource costs - makes actions more expensive
      state.resources.lp = Math.max(0, state.resources.lp - 2);
      state.resources.sp = Math.max(0, state.resources.sp - 1);
    },
    description:
      'The weight of expectations crushes down - every choice feels impossibly heavy and draining',
  } as ShadowAbility,

  // Past Pain abilities
  flashback: {
    id: 'flashback',
    name: 'Flashback',
    cooldown: 5,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Reliving trauma - reduces damage reduction and increases vulnerability
      state.damageReduction = 0.5; // Take 50% more damage
      state.resources.sp += 2; // Trauma generates shadow points
    },
    description:
      'The past crashes into the present - old wounds feel fresh and raw, leaving you emotionally exposed',
  } as ShadowAbility,

  rumination: {
    id: 'rumination',
    name: 'Rumination',
    cooldown: 4,
    currentCooldown: 0,
    effect: (state: CombatState) => {
      // Stuck in negative thought loops - blocks positive actions
      state.lpGenerationBlocked = Math.max(state.lpGenerationBlocked, 3);
      state.healingBlocked = Math.max(state.healingBlocked, 2);
    },
    description:
      'Your mind replays painful moments endlessly - "What if I had..." - trapping you in cycles that prevent healing',
  } as ShadowAbility,
};

// Shadow manifestation definitions
export const shadowManifestations: Record<string, ShadowManifestation> = {
  whisperOfDoubt: {
    id: 'whisper-of-doubt',
    name: 'The Whisper of Doubt',
    type: 'doubt',
    description:
      'A shadowy figure that echoes your deepest uncertainties and questions your every decision',
    currentHP: 15,
    maxHP: 15,
    abilities: [{ ...shadowAbilities.selfQuestioning }, { ...shadowAbilities.magnification }],
    therapeuticInsight:
      'Doubt signals that you care deeply about making wise choices. Practice self-compassion: "I can handle uncertainty and learn from whatever happens." Notice doubt without judgment, then take one small step forward toward growth.',
    victoryReward: {
      lpBonus: 5,
      growthMessage:
        "You've discovered that courage isn't the absence of doubt - it's acting with wisdom despite uncertainty. Your inner critic has become a gentle advisor.",
      permanentBenefit:
        'Enhanced distress tolerance and ability to make decisions while acknowledging uncertainty with self-compassion',
    },
  },

  veilOfIsolation: {
    id: 'veil-of-isolation',
    name: 'The Veil of Isolation',
    type: 'isolation',
    description:
      'A cold, distant presence that whispers that you are alone and that no one truly understands you',
    currentHP: 18,
    maxHP: 18,
    abilities: [{ ...shadowAbilities.withdrawal }, { ...shadowAbilities.loneliness }],
    therapeuticInsight:
      'Isolation once protected you from pain, but now it blocks healing too. Remind yourself: "I deserve connection and support." Start small - one text, one call, one moment of shared presence.',
    victoryReward: {
      lpBonus: 6,
      growthMessage:
        "You've learned that vulnerability is not weakness - it's the birthplace of courage, creativity, and connection. Your walls have become bridges.",
      permanentBenefit:
        'Increased capacity for authentic relationships and the courage to seek support when needed',
    },
  },

  stormOfOverwhelm: {
    id: 'storm-of-overwhelm',
    name: 'The Storm of Overwhelm',
    type: 'overwhelm',
    description:
      'A chaotic whirlwind of tasks, responsibilities, and pressures that seem impossible to manage',
    currentHP: 20,
    maxHP: 20,
    abilities: [{ ...shadowAbilities.cascade }, { ...shadowAbilities.pressure }],
    therapeuticInsight:
      'When everything feels urgent, pause and breathe. Ask: "What truly needs attention right now?" Break the overwhelming into "next right step." Remember: "I can only do one thing at a time, and that\'s enough."',
    victoryReward: {
      lpBonus: 7,
      growthMessage:
        "You've discovered your inner calm - the eye of the storm that remains peaceful while chaos swirls around. You can prioritize with clarity and act with intention.",
      permanentBenefit:
        'Mastery of stress response regulation and the ability to maintain perspective during overwhelming situations',
    },
  },

  echoOfPastPain: {
    id: 'echo-of-past-pain',
    name: 'The Echo of Past Pain',
    type: 'past-pain',
    description:
      'A haunting presence that brings forward old wounds and traumas, making them feel fresh and immediate',
    currentHP: 22,
    maxHP: 22,
    abilities: [{ ...shadowAbilities.flashback }, { ...shadowAbilities.rumination }],
    therapeuticInsight:
      'Your past pain is part of your story, not the whole story. Practice self-compassion: "I survived this, and I\'m still here." Healing doesn\'t erase the past - it transforms your relationship with it.',
    victoryReward: {
      lpBonus: 8,
      growthMessage:
        "You've transformed your deepest wounds into sources of wisdom and strength. Your scars have become sacred - proof of your resilience and capacity for healing.",
      permanentBenefit:
        'Post-traumatic growth: the ability to find meaning in suffering and use past pain as a source of empathy and strength',
    },
  },
};

// Helper function to get a fresh copy of a shadow manifestation
export function createShadowManifestation(shadowId: string): ShadowManifestation | null {
  // Map shadow IDs to object keys
  const shadowKeyMap: Record<string, string> = {
    'whisper-of-doubt': 'whisperOfDoubt',
    'veil-of-isolation': 'veilOfIsolation',
    'storm-of-overwhelm': 'stormOfOverwhelm',
    'echo-of-past-pain': 'echoOfPastPain',
  };

  const shadowKey = shadowKeyMap[shadowId];
  if (!shadowKey) {
    return null;
  }

  const template = shadowManifestations[shadowKey];
  if (!template) {
    return null;
  }

  // Deep copy to avoid modifying the original
  return {
    ...template,
    currentHP: template.maxHP,
    abilities: template.abilities.map((ability) => ({
      ...ability,
      currentCooldown: 0,
    })),
  };
}

// Export individual shadows for easy access
export const { whisperOfDoubt, veilOfIsolation, stormOfOverwhelm, echoOfPastPain } =
  shadowManifestations;

// Export shadow IDs for easy reference
export const SHADOW_IDS = {
  WHISPER_OF_DOUBT: 'whisper-of-doubt',
  VEIL_OF_ISOLATION: 'veil-of-isolation',
  STORM_OF_OVERWHELM: 'storm-of-overwhelm',
  ECHO_OF_PAST_PAIN: 'echo-of-past-pain',
} as const;
