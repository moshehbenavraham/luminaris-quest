/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 *
 * Therapeutic content utilities for combat resolution
 *
 * Shadow-specific therapeutic prompts and contextual messages
 * for post-combat reflection and journaling.
 */

export type ShadowType = 'doubt' | 'isolation' | 'overwhelm' | 'past-pain';

/**
 * Shadow-specific therapeutic prompts for post-combat reflection.
 * Each shadow type has 4 prompts tailored to the psychological theme.
 */
const THERAPEUTIC_PROMPTS: Record<ShadowType, string[]> = {
  doubt: [
    'What specific self-doubts showed up during this encounter? Notice them without judgment.',
    'When uncertainty arose, what helped you take action anyway? What inner resources did you discover?',
    'What evidence from your life contradicts the harsh voice of your inner critic?',
    "How can you speak to yourself with the same kindness you'd show a good friend facing similar doubts?",
  ],
  isolation: [
    'When do you notice yourself withdrawing from others? What triggers this protective response?',
    'What fears or past hurts make reaching out feel risky? How might you honor these concerns while still connecting?',
    'Who in your life has shown they care about you? How might you take one small step toward deeper connection?',
    'How can you create a balance between healthy solitude and meaningful connection with others?',
  ],
  overwhelm: [
    'What specific situations in your life mirror this overwhelming feeling? What patterns do you notice?',
    'When stress builds up, what does your body tell you? What early warning signs can you learn to recognize?',
    "What's one strategy that helped you break down this challenge? How can you apply this to real-life overwhelm?",
    'How might you create small pockets of calm and breathing space in your daily routine?',
  ],
  'past-pain': [
    'What past experiences still echo in your present responses? How do they try to protect you?',
    'How has your relationship with difficult memories evolved? What growth do you notice?',
    'What wisdom would you offer your past self? What do you wish you had known then?',
    'How can you honor your experiences as part of your story while not letting them write your future?',
  ],
};

/**
 * Victory messages for each shadow type - acknowledging growth and transformation.
 */
const VICTORY_MESSAGES: Record<ShadowType, string> = {
  doubt:
    'You transformed uncertainty from an enemy into a teacher. Your courage to act despite doubt has grown stronger.',
  isolation:
    'You chose vulnerable connection over protective withdrawal. Your capacity for authentic relationship has deepened.',
  overwhelm:
    'You found your center in the chaos and learned to prioritize with wisdom. Your resilience has been proven.',
  'past-pain':
    'You faced your deepest wounds with compassion and transformed pain into wisdom. Your healing journey continues with courage.',
};

/**
 * Defeat messages for each shadow type - reframing setbacks as learning opportunities.
 */
const DEFEAT_MESSAGES: Record<ShadowType, string> = {
  doubt:
    "Even in struggle, you showed up and tried. That's courage. Each encounter with uncertainty builds your tolerance for the unknown.",
  isolation:
    "This challenge reminded you that you don't have to face everything alone. Reaching out is an act of self-compassion.",
  overwhelm:
    "Sometimes stepping back to breathe and regroup is exactly what wisdom looks like. You're learning to honor your limits.",
  'past-pain':
    "Healing isn't linear, and setbacks don't erase progress. Every time you face your past, you're choosing growth over avoidance.",
};

/**
 * Get therapeutic prompts for a specific shadow type.
 * Falls back to 'doubt' prompts if type is unrecognized.
 */
export function getTherapeuticPrompts(shadowType: string): string[] {
  return THERAPEUTIC_PROMPTS[shadowType as ShadowType] || THERAPEUTIC_PROMPTS.doubt;
}

/**
 * Get contextual message based on combat outcome and shadow type.
 * Victory messages emphasize transformation; defeat messages reframe as learning.
 */
export function getContextualMessage(victory: boolean, shadowType: string): string {
  const type = shadowType as ShadowType;
  if (victory) {
    return VICTORY_MESSAGES[type] || VICTORY_MESSAGES.doubt;
  }
  return DEFEAT_MESSAGES[type] || DEFEAT_MESSAGES.doubt;
}
