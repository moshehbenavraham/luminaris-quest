
/**
 * Scene Engine - Core narrative and progression system for Luminari's Quest
 * 
 * This module manages the therapeutic storytelling experience, providing
 * 20 carefully crafted scenarios that guide players through emotional
 * growth and healing. Each scene represents a different aspect of trauma
 * recovery and therapeutic progress.
 * 
 * @module SceneEngine
 */

import { SHADOW_IDS } from '../data/shadowManifestations';
import { getEnvironmentConfig } from '../lib/environment';

/**
 * Represents a single therapeutic scenario in the game
 * 
 * Each scene is designed to address specific therapeutic goals while
 * maintaining engaging gameplay. The structure supports multiple scene
 * types with varying difficulty levels and therapeutic focuses.
 */
export interface Scene {
  /** Unique identifier for the scene (kebab-case) */
  id: string;
  
  /** 
   * Scene type determining therapeutic focus:
   * - social: Interpersonal connection and empathy
   * - skill: Problem-solving and competence building
   * - combat: Confronting internal struggles
   * - journal: Self-reflection and processing
   * - exploration: Discovery and perspective-taking
   */
  type: 'social' | 'skill' | 'combat' | 'journal' | 'exploration';
  
  /** Display title for the scene (max 50 characters recommended) */
  title: string;
  
  /** Narrative description setting up the scenario (max 500 characters recommended) */
  text: string;
  
  /** Difficulty Check - target number for d20 roll (typically 10-20) */
  dc: number;
  
  /** Text displayed when the player succeeds the challenge */
  successText: string;
  
  /** Text displayed when the player fails the challenge */
  failureText: string;
  
  /** Available player choices for the scenario */
  choices: {
    /** Bold/aggressive choice option */
    bold: string;
    /** Cautious/thoughtful choice option */
    cautious: string;
  };
  
  // Combat integration properties
  /** Shadow manifestation type for combat scenes (references SHADOW_IDS) */
  shadowType?: string;
  
  /** Light Points awarded on success (overrides default if specified) */
  lpReward?: number;
  
  /** Shadow Points penalty on failure (overrides default if specified) */
  spPenalty?: number;
}

const scenes: Scene[] = [
  {
    id: 'social-encounter',
    type: 'social',
    title: 'The Worried Merchant',
    text: "A traveling merchant sits by the roadside, tears streaming down his weathered face. His cart is overturned, goods scattered. 'Bandits took everything,' he whispers. 'My family's livelihood... gone.' He looks up at you with desperate hope. You could offer comfort, share resources, or help him gather his belongings.",
    dc: 9,
    successText:
      "Your words of comfort and genuine care touch the merchant's heart. He stands straighter, hope returning to his eyes. 'Thank you, young one. Your kindness reminds me that good still exists in this world.' Your guardian spirit glows warmly, sensing your growing empathy.",
    failureText:
      "Despite your good intentions, your words feel hollow and awkward. The merchant nods politely but remains distant, his pain unchanged. Your guardian spirit dims slightly, recognizing your struggle to connect with others' suffering.",
    choices: {
      bold: 'Offer immediate help and comfort',
      cautious: 'Listen carefully before responding',
    },
  },
  {
    id: 'skill-challenge',
    type: 'skill',
    title: 'The Ancient Lock',
    text: 'Before you stands an ornate chest, its surface covered in intricate mechanisms and glowing runes. The lock appears to be a puzzle requiring both dexterity and wisdom to solve. Ancient symbols shift and change as you approach. This could contain something valuable, but one wrong move might trigger unknown consequences.',
    dc: 11,
    successText:
      'Your fingers move with surprising grace across the mechanisms. The runes align perfectly, and the chest opens with a satisfying click. Inside, you find a small crystal that pulses with warm light. Your guardian spirit radiates pride at your growing skill and patience.',
    failureText:
      'The mechanisms resist your efforts, and the runes flash angrily before going dark. The chest remains sealed, and you feel a wave of frustration. Your guardian spirit offers gentle encouragement, reminding you that failure is part of learning.',
    choices: {
      bold: 'Trust your instincts and work quickly',
      cautious: 'Study the patterns before acting',
    },
  },
  {
    id: 'combat-encounter',
    type: 'combat',
    title: 'Shadow Wolf',
    text: 'A creature of living shadow emerges from the darkness between the trees. Its eyes glow with an otherworldly hunger, and its form shifts like smoke. This shadow wolf blocks your path, growling low. You sense it feeds on fear and doubt. You must decide how to face this manifestation of inner darkness.',
    dc: 15,
    successText:
      'You stand firm against the shadow wolf, your inner light blazing bright. The creature recoils, then slowly dissolves back into harmless shadows. Your courage has banished this manifestation of fear. Your guardian spirit shines brilliantly, proud of your bravery.',
    failureText:
      "Fear grips your heart as the shadow wolf advances. Though you manage to escape unharmed, the creature's presence lingers in your mind. Your guardian spirit wraps you in protective warmth, helping you process this encounter with your inner fears.",
    choices: {
      bold: 'Face the wolf with courage and determination',
      cautious: 'Seek to understand what the wolf represents',
    },
    // Combat integration
    shadowType: SHADOW_IDS.WHISPER_OF_DOUBT,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-reflection',
    type: 'journal',
    title: 'The Memory Pool',
    text: 'You discover a still pool that reflects not your face, but memories from your past. Images of loss, moments of joy, times of struggle all shimmer on the surface. Your guardian spirit whispers that this is a place of healing, where you can choose to face difficult memories or let them remain buried for now.',
    dc: 8,
    successText:
      "You kneel by the pool and allow the memories to wash over you. Though some bring pain, you find strength in acknowledging them. The pool's surface clears, showing your reflection with new wisdom in your eyes. Your guardian spirit glows with gentle approval.",
    failureText:
      'The memories feel too overwhelming, and you step back from the pool. The images fade, leaving you feeling disconnected from your past. Your guardian spirit offers comfort, understanding that healing takes time and cannot be rushed.',
    choices: {
      bold: 'Dive deep into the difficult memories',
      cautious: 'Approach the memories gradually and gently',
    },
  },
  {
    id: 'exploration-discovery',
    type: 'exploration',
    title: 'The Singing Crystals',
    text: "You enter a cavern filled with luminescent crystals that hum with ethereal music. Each crystal seems to respond to your emotions, their songs shifting in harmony with your inner state. At the cavern's heart stands a larger crystal, its song more complex and beautiful than the others. You sense this place holds ancient wisdom.",
    dc: 12,
    successText:
      "You attune yourself to the crystals' song, letting their harmony guide your movements. The large crystal's music becomes clearer, revealing melodies that speak of hope, resilience, and growth. Your guardian spirit resonates with the crystals, creating a symphony of healing energy.",
    failureText:
      "The crystals' songs feel chaotic and overwhelming. You struggle to find harmony with their music, and the large crystal's song remains mysterious and distant. Your guardian spirit helps steady you, but you sense you've missed something important in this sacred place.",
    choices: {
      bold: 'Touch the central crystal immediately',
      cautious: 'Listen to the smaller crystals first',
    },
  },
  {
    id: 'social-gathering',
    type: 'social',
    title: 'The Village Festival',
    text: "You arrive at a small village during their harvest festival. Laughter and music fill the air, but you notice an elderly woman sitting alone on the outskirts, watching the celebration with longing eyes. She seems forgotten by the revelers, her weathered hands clutching a small, worn photograph. The joy around you contrasts sharply with her solitude.",
    dc: 7,
    successText:
      "You approach the elderly woman with genuine warmth, asking about the photograph and listening to her stories of past festivals. Her face lights up as she shares memories of her late husband, and soon others join your conversation. Your guardian spirit radiates joy as you help bridge the gap between generations.",
    failureText:
      "Your attempt to include the woman feels forced and uncomfortable. She smiles politely but retreats further into herself, and the other villagers seem to avoid the awkward interaction. Your guardian spirit offers gentle guidance, helping you understand that authentic connection cannot be rushed.",
    choices: {
      bold: 'Invite her to dance and celebrate with everyone',
      cautious: 'Sit with her and ask about her memories',
    },
  },
  {
    id: 'skill-navigation',
    type: 'skill',
    title: 'The Mist-Shrouded Path',
    text: 'A thick, supernatural mist has descended upon the mountain path ahead. Strange whispers echo from within, and the trail seems to shift and change before your eyes. Your map is useless here - only your intuition and careful observation can guide you through this maze of illusion. One wrong turn could lead you deeper into the mist\'s embrace.',
    dc: 13,
    successText:
      'You close your eyes and trust your inner compass, feeling for the subtle currents of air and listening to the true sounds beneath the whispers. Step by careful step, you navigate through the illusion, emerging into clear sunlight on the other side. Your guardian spirit glows with pride at your growing wisdom and self-trust.',
    failureText:
      'The mist\'s illusions overwhelm your senses, and you find yourself walking in circles. Panic begins to set in as the whispers grow louder, but eventually you stumble back to where you started, exhausted and shaken. Your guardian spirit wraps you in comfort, reminding you that getting lost sometimes teaches us where we truly belong.',
    choices: {
      bold: 'Push forward quickly before the mist thickens',
      cautious: 'Move slowly and test each step carefully',
    },
  },
  {
    id: 'combat-isolation',
    type: 'combat',
    title: 'The Veil of Isolation',
    text: 'A shimmering barrier of dark energy materializes around you, cutting you off from the world. Within this veil, you face a shadow that mirrors your own form but radiates loneliness and despair. It speaks with your voice, whispering of times you felt abandoned, forgotten, or completely alone. This manifestation of isolation seeks to convince you that connection is impossible.',
    dc: 16,
    successText:
      'You reach out toward the shadow-self with compassion rather than fear, acknowledging the pain of isolation while affirming your capacity for connection. The veil dissolves as you embrace both your solitude and your need for others. Your guardian spirit shines brilliantly, celebrating your courage to face your deepest fears of abandonment.',
    failureText:
      'The shadow\'s words cut deep, and you feel the familiar ache of loneliness overwhelming you. Though you resist being consumed entirely, the veil lingers, leaving you feeling disconnected and vulnerable. Your guardian spirit offers patient presence, reminding you that even in isolation, you are not truly alone.',
    choices: {
      bold: 'Challenge the shadow directly with your inner strength',
      cautious: 'Try to understand what the shadow needs from you',
    },
    // Combat integration
    shadowType: SHADOW_IDS.VEIL_OF_ISOLATION,
    lpReward: 5,
    spPenalty: 4,
  },
  {
    id: 'journal-crossroads',
    type: 'journal',
    title: 'The Crossroads of Choice',
    text: 'You stand at a crossroads where three paths diverge, each marked by a stone tablet covered in ancient script. As you approach, the tablets begin to glow, revealing not directions but questions about your life\'s journey. The middle path asks about your dreams, the left about your fears, and the right about your regrets. Your guardian spirit suggests this is a place for deep reflection.',
    dc: 11,
    successText:
      'You sit quietly at the crossroads and honestly examine each question, writing your thoughts in your journal. The process is challenging but illuminating, helping you see patterns in your choices and growth in your character. The tablets\' glow softens to a warm, welcoming light. Your guardian spirit radiates approval at your willingness to face difficult truths.',
    failureText:
      'The questions feel too overwhelming, and you struggle to find honest answers. Your journal entries feel shallow and evasive, avoiding the deeper truths the crossroads seeks to reveal. The tablets\' light dims, but doesn\'t disappear entirely. Your guardian spirit offers gentle encouragement, understanding that self-reflection is a skill that develops over time.',
    choices: {
      bold: 'Write boldly about your deepest truths and desires',
      cautious: 'Explore your thoughts carefully, one question at a time',
    },
  },
  {
    id: 'exploration-sanctuary',
    type: 'exploration',
    title: 'The Hidden Sanctuary',
    text: 'Behind a waterfall, you discover a hidden sanctuary carved into living rock. Bioluminescent plants provide gentle light, and a natural spring creates a peaceful melody. Ancient murals cover the walls, depicting scenes of healing, growth, and transformation. At the sanctuary\'s heart lies a garden where impossible flowers bloom - each one representing a different aspect of emotional healing.',
    dc: 10,
    successText:
      'You move through the sanctuary with reverence, studying each mural and tending to the healing flowers. As you care for the garden, you feel your own wounds beginning to mend. The sanctuary responds to your presence, revealing hidden chambers filled with wisdom about recovery and resilience. Your guardian spirit harmonizes with the sanctuary\'s ancient peace.',
    failureText:
      'The sanctuary\'s beauty overwhelms you, and you feel unworthy of its peace. You rush through without truly connecting to its healing energy, missing the deeper lessons the murals and flowers could teach. The sanctuary remains beautiful but distant, its secrets locked away. Your guardian spirit reminds you that healing spaces require patience and self-compassion to fully embrace.',
    choices: {
      bold: 'Immediately begin tending to the healing garden',
      cautious: 'Study the murals first to understand the sanctuary\'s purpose',
    },
  },
  {
    id: 'social-mentor',
    type: 'social',
    title: 'The Weary Teacher',
    text: "In a small schoolhouse, you meet an exhausted teacher struggling to reach a group of troubled students. Her eyes are red from sleepless nights, and her voice cracks with frustration. 'I don't know how to help them anymore,' she confesses. 'They've been through so much trauma, and I feel like I'm failing them every day.' She looks to you with desperate hope for guidance or understanding.",
    dc: 13,
    successText:
      "You share your own experiences with learning and growth, offering both practical suggestions and emotional support. Your words remind her why she became a teacher, reigniting her passion and hope. The students sense the renewed energy and begin to respond more positively. Your guardian spirit glows warmly, recognizing your ability to inspire others through your own journey.",
    failureText:
      "Your advice feels generic and unhelpful, missing the deeper emotional needs behind her struggle. The teacher nods politely but remains discouraged, and the classroom atmosphere stays tense. Your guardian spirit offers gentle understanding, reminding you that sometimes the most important thing is simply being present with someone's pain.",
    choices: {
      bold: 'Share your personal story of overcoming challenges',
      cautious: 'Ask her to tell you more about each student\'s needs',
    },
  },
  {
    id: 'skill-crafting',
    type: 'skill',
    title: 'The Broken Heirloom',
    text: 'You discover a shattered family heirloom - a beautiful music box that once played lullabies for generations of children. Its delicate mechanisms are scattered, and the melody disc is cracked. The pieces seem to whisper of lost memories and broken connections. Repairing it will require patience, precision, and an understanding of how broken things can be made whole again.',
    dc: 13,
    successText:
      'With careful attention and gentle hands, you piece together the music box. As the final gear clicks into place, it begins to play a hauntingly beautiful lullaby. The melody seems to heal something deep within you, reminding you that broken things can indeed be restored. Your guardian spirit resonates with the music, celebrating your growing ability to mend what seems irreparable.',
    failureText:
      'Despite your best efforts, the delicate mechanisms resist your attempts at repair. Pieces slip from your fingers, and the melody remains silent. Frustration builds as you realize some damage runs too deep for simple fixes. Your guardian spirit offers comfort, teaching you that sometimes accepting brokenness is the first step toward healing.',
    choices: {
      bold: 'Work quickly to restore the music before it\'s too late',
      cautious: 'Study each piece carefully before attempting repairs',
    },
  },
  {
    id: 'combat-overwhelm',
    type: 'combat',
    title: 'The Storm of Overwhelm',
    text: 'Dark clouds gather overhead, but this is no ordinary storm. Lightning crackles with the energy of every overwhelming moment you\'ve ever faced - bills unpaid, deadlines missed, relationships strained, futures uncertain. The storm speaks in a cacophony of voices: responsibilities, expectations, fears, and pressures all demanding attention at once. You feel yourself drowning in the chaos of too much, too fast, too heavy.',
    dc: 17,
    successText:
      'You stand in the eye of the storm and breathe deeply, acknowledging each overwhelming voice without letting them control you. One by one, you address what you can and release what you cannot. The storm gradually calms, its chaotic energy transforming into manageable rain. Your guardian spirit shines through the clearing clouds, proud of your growing ability to find peace within chaos.',
    failureText:
      'The storm\'s intensity overwhelms your defenses, and you feel yourself swept away by the torrent of pressures and fears. Though you eventually find shelter, the experience leaves you feeling small and powerless against life\'s demands. Your guardian spirit wraps you in protective warmth, reminding you that even the strongest people sometimes need to weather the storm rather than fight it.',
    choices: {
      bold: 'Stand firm and face each overwhelming voice directly',
      cautious: 'Find shelter and wait for the storm to pass naturally',
    },
    // Combat integration
    shadowType: SHADOW_IDS.STORM_OF_OVERWHELM,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-letters',
    type: 'journal',
    title: 'The Unsent Letters',
    text: 'In an abandoned post office, you find a collection of unsent letters - messages of love, apology, gratitude, and goodbye that were never delivered. Some are addressed to people who have passed away, others to relationships that ended badly. Your guardian spirit whispers that this is a place where you can write your own unsent letter to someone important in your life.',
    dc: 11,
    successText:
      'You sit among the letters and pour your heart onto paper, writing to someone you\'ve lost or someone you\'ve hurt. The words flow freely, carrying years of unspoken emotions. As you finish, you feel a weight lift from your shoulders. Your guardian spirit glows softly, understanding that some conversations happen in the heart even when they can\'t happen in person.',
    failureText:
      'You struggle to find the right words, and your letter feels stilted and incomplete. The emotions you want to express remain locked inside, too complex or painful to capture on paper. Your guardian spirit offers patient presence, knowing that some feelings need time to find their voice.',
    choices: {
      bold: 'Write everything you\'ve always wanted to say, holding nothing back',
      cautious: 'Start with small, simple truths and build from there',
    },
  },
  {
    id: 'exploration-library',
    type: 'exploration',
    title: 'The Library of Lost Stories',
    text: 'You discover a vast library where the books contain not written words, but the untold stories of people\'s lives - dreams abandoned, paths not taken, words never spoken. The shelves stretch endlessly upward, filled with the weight of human potential. At the center stands a reading desk with an open book that seems to be writing itself, chronicling your own story as you live it.',
    dc: 14,
    successText:
      'You approach the writing book with curiosity rather than fear, reading the story of your life with compassion for both your struggles and your growth. You realize that your story is still being written, and you have the power to influence its direction. Your guardian spirit radiates joy as you embrace your role as both author and protagonist of your own journey.',
    failureText:
      'The weight of all the untold stories overwhelms you, and you feel lost among the endless possibilities of what could have been. Your own story seems small and insignificant compared to the vast potential surrounding you. Your guardian spirit gently guides you away from the overwhelming shelves, reminding you that your story matters precisely because it is yours.',
    choices: {
      bold: 'Read your story aloud to give it power and presence',
      cautious: 'Quietly study your story to understand its patterns',
    },
  },
  {
    id: 'social-reconciliation',
    type: 'social',
    title: 'The Estranged Friend',
    text: "At a crowded marketplace, you unexpectedly encounter someone who was once your closest friend but became distant after a painful misunderstanding years ago. They notice you too, and for a moment, time stops. The hurt in their eyes mirrors your own, but there's also a flicker of the warmth you once shared. Other shoppers bustle around you, unaware of this moment of reckoning between two wounded hearts.",
    dc: 12,
    successText:
      "You take a deep breath and approach with genuine vulnerability, acknowledging the pain between you without defensiveness. Your friend's walls begin to crumble as you both share your perspectives with honesty and compassion. Though the conversation is difficult, it opens a door to healing that has been closed for too long. Your guardian spirit radiates hope, celebrating your courage to mend broken bonds.",
    failureText:
      "Pride and old hurt make your words come out wrong, and the conversation becomes awkward and strained. Your friend retreats behind familiar walls, and the moment passes without resolution. The marketplace crowd seems to swallow the opportunity for healing. Your guardian spirit offers gentle comfort, reminding you that some reconciliations require multiple attempts and perfect timing.",
    choices: {
      bold: 'Approach immediately and address the past directly',
      cautious: 'Make gentle eye contact and see if they want to talk',
    },
  },
  {
    id: 'skill-restoration',
    type: 'skill',
    title: 'The Withered Garden',
    text: 'You come upon a once-magnificent garden now choked with weeds and neglect. Beneath the overgrowth, you can see hints of what it used to be - rare flowers struggling to bloom, fruit trees heavy with unpicked harvest, pathways obscured but not destroyed. A weathered sign reads "Memorial Garden - In loving memory of those we\'ve lost." This place needs more than gardening; it needs someone who understands that growth can emerge from grief.',
    dc: 14,
    successText:
      'You work with patient reverence, clearing weeds while preserving the struggling plants beneath. As you tend to each section, the garden begins to reveal its hidden beauty. Flowers bloom more vibrantly, and the memorial stones become visible again, each one honoring a life well-lived. Your guardian spirit glows with quiet satisfaction, recognizing your understanding that healing spaces require both effort and respect.',
    failureText:
      'Your enthusiasm leads you to work too quickly, accidentally damaging some of the delicate plants you meant to save. The garden resists your efforts, and you realize that restoration requires more patience and understanding than you initially brought to the task. Your guardian spirit offers gentle guidance, teaching you that some healing cannot be rushed.',
    choices: {
      bold: 'Clear the largest areas first to make dramatic progress',
      cautious: 'Work carefully around each plant to preserve what remains',
    },
  },
  {
    id: 'combat-past-pain',
    type: 'combat',
    title: 'The Echo of Past Pain',
    text: 'The air around you shimmers, and suddenly you\'re surrounded by ghostly echoes of your most painful memories. They don\'t just replay - they speak, accusing you of weakness, reminding you of every moment you felt helpless, abandoned, or broken. The echoes take the form of shadowy figures from your past, their voices layering into a chorus of old wounds. This manifestation feeds on unhealed trauma, growing stronger with each painful memory it can awaken.',
    dc: 18,
    successText:
      'You face the echoes with hard-won wisdom, acknowledging the pain they represent while refusing to let them define you. "You are part of my story," you tell them, "but you are not the end of it." The shadows begin to fade as you embrace both your wounds and your healing. Your guardian spirit blazes with fierce pride, celebrating your transformation of pain into strength.',
    failureText:
      'The echoes overwhelm you with their familiar sting, and you feel yourself pulled back into old patterns of hurt and helplessness. Though you don\'t surrender completely, the encounter leaves you feeling raw and vulnerable, as if old scabs have been torn away. Your guardian spirit surrounds you with protective warmth, reminding you that healing isn\'t linear and setbacks don\'t erase progress.',
    choices: {
      bold: 'Confront each painful memory with your current strength',
      cautious: 'Acknowledge the pain while focusing on how you\'ve grown',
    },
    // Combat integration
    shadowType: SHADOW_IDS.ECHO_OF_PAST_PAIN,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-legacy',
    type: 'journal',
    title: 'The Time Capsule',
    text: 'You discover an old time capsule buried beneath a great oak tree, filled with letters, photos, and mementos from people who wanted to leave something for the future. Among the items, you find a blank journal with a note: "For whoever finds this - tell us about the world you\'re building from the ashes of ours." Your guardian spirit whispers that this is an opportunity to reflect on what you want to leave behind for those who come after you.',
    dc: 13,
    successText:
      'You write with deep thoughtfulness about the lessons you\'ve learned, the love you\'ve discovered, and the hope you carry for the future. Your words become a bridge between past and future, honoring those who came before while inspiring those yet to come. The journal seems to glow with purpose as you write. Your guardian spirit radiates warmth, recognizing your growing understanding of your place in the larger story of healing.',
    failureText:
      'You struggle to find words worthy of such a profound opportunity. Your writing feels inadequate to capture the complexity of your journey or the depth of what you want to share. The blank pages seem to mock your efforts to articulate something meaningful. Your guardian spirit offers patient encouragement, reminding you that sometimes the most important messages are the simplest ones.',
    choices: {
      bold: 'Write about your biggest dreams and hopes for the future',
      cautious: 'Share the most important lessons you\'ve learned so far',
    },
  },
  {
    id: 'exploration-summit',
    type: 'exploration',
    title: 'The Summit of Reflection',
    text: 'After a long, winding climb, you reach the summit of a mountain that overlooks the entire landscape of your journey. From this vantage point, you can see all the places you\'ve been - the dark valleys, the peaceful meadows, the rushing rivers, and the quiet forests. The view stretches to the horizon, showing paths you haven\'t yet taken. At the summit\'s peak stands a simple stone chair, worn smooth by countless other travelers who have sat here to contemplate their journeys.',
    dc: 14,
    successText:
      'You sit in the ancient chair and let the full scope of your journey wash over you. From this height, even your darkest moments seem part of a larger pattern of growth and discovery. You feel a deep sense of accomplishment not just for reaching this summit, but for every step that brought you here. Your guardian spirit shines brilliantly, sharing in your moment of profound recognition and peace.',
    failureText:
      'The vastness of the view overwhelms you, and instead of feeling accomplished, you feel small and uncertain about the path ahead. The summit\'s perspective makes your problems seem both insignificant and insurmountable at the same time. Your guardian spirit settles beside you with gentle presence, reminding you that sometimes the most important view is not the distant horizon, but the solid ground beneath your feet.',
    choices: {
      bold: 'Stand tall and proclaim your growth to the world below',
      cautious: 'Sit quietly and absorb the wisdom of the journey',
    },
  },
  // New set of 20 scenes following the same pattern
  {
    id: 'social-bridge-builder',
    type: 'social',
    title: 'The Feuding Neighbors',
    text: 'You witness two neighbors arguing bitterly over a shared fence that has fallen into disrepair. Their children watch from windows, fear in their eyes as the adults\' voices rise. Years of accumulated grievances spill out - borrowed tools never returned, property lines disputed, harsh words spoken in anger. The broken fence seems symbolic of the broken relationship. Both turn to you, each demanding you take their side.',
    dc: 12,
    successText:
      'You gently redirect their attention from blame to their children\'s worried faces. Your calm presence and thoughtful questions help them remember they once shared dinners and celebrated holidays together. Slowly, they begin discussing how to repair the fence together. Your guardian spirit glows with satisfaction as you witness the beginning of reconciliation.',
    failureText:
      'Your attempt to mediate only seems to inflame tensions further. Each neighbor interprets your words as favoring the other, and the argument escalates. They storm off in opposite directions, leaving the fence - and their relationship - in ruins. Your guardian spirit dims with disappointment but reminds you that peace cannot be forced upon those not ready to receive it.',
    choices: {
      bold: 'Step between them and speak firmly about finding common ground',
      cautious: 'Listen to each side separately before bringing them together',
    },
  },
  {
    id: 'skill-stargazing',
    type: 'skill',
    title: 'The Celestial Map',
    text: 'An ancient astronomer\'s tower contains a complex celestial map that reportedly reveals hidden paths when the stars align correctly. The mechanism involves rotating multiple brass rings inscribed with constellations, each affecting the others in intricate ways. Local legends claim that those who solve the puzzle gain insight into their destiny. The brass is tarnished with age, making some markings difficult to read.',
    dc: 13,
    successText:
      'Your patient observation reveals the pattern - the rings represent not just stars, but life\'s cycles of growth, loss, and renewal. As you align them properly, the map projects a stunning hologram showing a path forward illuminated by starlight. Your guardian spirit pulses with cosmic energy, impressed by your ability to find order in apparent chaos.',
    failureText:
      'The more you manipulate the rings, the more confused the patterns become. Frustration clouds your judgment, and you spin them randomly, hoping for accidental success. The mechanism eventually locks, refusing further attempts. Your guardian spirit offers consolation, suggesting that perhaps you\'re not yet ready for the revelations this map might offer.',
    choices: {
      bold: 'Trust your intuition and adjust the rings by feel',
      cautious: 'Meticulously chart each ring\'s effect before moving them',
    },
  },
  {
    id: 'combat-shadow-whisper',
    type: 'combat',
    title: 'The Whispering Shade',
    text: 'In a narrow alley, shadows gather unnaturally, coalescing into a form that speaks with the voice of your inner critic. It knows every mistake you\'ve made, every opportunity you\'ve missed, every person you\'ve disappointed. The shade feeds on self-doubt, growing larger with each harsh whisper. "You\'ll never be enough," it hisses, its form shifting to show distorted reflections of your failures.',
    dc: 20,
    successText:
      'You acknowledge each whispered criticism without letting it define you. "I am more than my mistakes," you declare firmly. The shade recoils from your self-compassion, its whispers turning to desperate shrieks before it dissipates like smoke. Your guardian spirit burns bright with pride, celebrating your victory over destructive self-talk.',
    failureText:
      'The whispers strike too close to home, and you find yourself agreeing with the shade\'s cruel assessments. Though you eventually flee the alley, the doubts follow you like a cold shadow. Your guardian spirit wraps around you protectively, working to counter the poisonous whispers that now echo in your mind.',
    choices: {
      bold: 'Counter each whisper with affirmations of your worth',
      cautious: 'Seek to understand why these doubts have such power over you',
    },
    // Combat integration
    shadowType: SHADOW_IDS.WHISPER_OF_DOUBT,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-forgiveness',
    type: 'journal',
    title: 'The Forgiveness Tree',
    text: 'You find an ancient tree where people have tied thousands of ribbons, each representing someone they need to forgive - including themselves. A basket of blank ribbons and a sign invite you to add your own. Some ribbons are fresh and bright, others weathered by years of wind and rain. Your guardian spirit whispers that forgiveness is not forgetting, but releasing the poison of resentment.',
    dc: 8,
    successText:
      'You write names on several ribbons - those who hurt you, those you hurt, and finally, your own name. As you tie each ribbon to the tree, you feel weights lifting from your soul. The wind catches your ribbons, making them dance with thousands of others in a beautiful testament to human resilience. Your guardian spirit glows with warm approval.',
    failureText:
      'You hold the ribbon but cannot bring yourself to write any names. The act of forgiveness feels like betrayal of your pain, or admission of weakness. You leave with the blank ribbon crumpled in your pocket. Your guardian spirit remains patient, understanding that forgiveness is a journey that cannot be rushed.',
    choices: {
      bold: 'Write every name that comes to mind, holding nothing back',
      cautious: 'Start with forgiving yourself before moving to others',
    },
  },
  {
    id: 'exploration-underground',
    type: 'exploration',
    title: 'The Crystal Caverns',
    text: 'Beneath the earth, you discover a network of caverns where crystals grow in impossible formations - spirals that defy gravity, geometric patterns too perfect for nature. Each crystal resonates with a different emotion when touched. At the cavern\'s heart, a massive crystal formation pulses with all emotions at once, creating a symphony of human experience. The locals fear this place, calling it the Cave of Truth.',
    dc: 16,
    successText:
      'You navigate the emotional resonance with grace, allowing each feeling to flow through you without becoming lost in any single one. The central crystal responds to your emotional balance, revealing a hidden chamber filled with ancient wisdom about the importance of feeling all emotions fully. Your guardian spirit harmonizes with the crystals, creating a moment of perfect emotional clarity.',
    failureText:
      'The intensity of pure emotion overwhelms you. Joy becomes manic, sadness becomes despair, anger becomes rage. You flee the caverns, emotionally exhausted and confused. Your guardian spirit shields you from the worst effects, but you leave knowing you\'ve missed an important opportunity for emotional integration.',
    choices: {
      bold: 'Touch the central crystal immediately to experience everything',
      cautious: 'Explore each emotional crystal separately to prepare yourself',
    },
  },
  {
    id: 'social-wounded-healer',
    type: 'social',
    title: 'The Burnt-Out Nurse',
    text: 'In a small clinic, you meet a nurse who has given everything to help others but forgotten to care for herself. Her hands shake from exhaustion, her smile is forced, and you notice she\'s been crying. "I became a healer to fix people," she says softly, "but I can\'t even fix myself. How can I keep pretending to have answers when I\'m falling apart?" Other patients wait outside, needing her care.',
    dc: 11,
    successText:
      'You share the profound truth that wounded healers often provide the deepest healing, precisely because they understand suffering. Your words help her realize that self-care isn\'t selfish but necessary. She decides to ask for help herself, modeling for her patients that seeking support is strength. Your guardian spirit radiates understanding, recognizing a fellow traveler on the healing path.',
    failureText:
      'Your well-meaning advice sounds hollow to someone so deeply exhausted. She nods politely but you can see your words haven\'t reached her. She returns to her patients, pushing through her pain as always. Your guardian spirit aches with empathy, knowing that sometimes people must reach their own breaking point before accepting help.',
    choices: {
      bold: 'Insist she take a break immediately and offer to help with patients',
      cautious: 'Share your own struggles with burnout and recovery',
    },
  },
  {
    id: 'skill-memory-weaving',
    type: 'skill',
    title: 'The Memory Loom',
    text: 'You discover an ancient loom that weaves not fabric but memories into tangible tapestries. The mechanism is intricate - each thread represents a different memory, and the pattern you create determines whether the resulting tapestry brings comfort or pain. An old woman explains that master weavers can transform traumatic memories into sources of strength, but one wrong thread can unravel everything.',
    dc: 15,
    successText:
      'With delicate precision, you weave together memories of pain and joy, creating a tapestry that tells a story of resilience. The difficult memories, when woven with moments of love and growth, create a pattern of stunning beauty. Your guardian spirit watches in awe as you literally reweave your narrative into something empowering.',
    failureText:
      'The threads tangle in your hands, memories becoming knotted and confused. The tapestry you create is chaotic, neither comforting nor coherent. You\'re left more confused about your past than before. Your guardian spirit helps you carefully extract your memories from the loom, saving them for another attempt when you\'re ready.',
    choices: {
      bold: 'Weave your most difficult memories into the center of the design',
      cautious: 'Start with happy memories and gradually add difficult ones',
    },
  },
  {
    id: 'combat-isolation-veil',
    type: 'combat',
    title: 'The Mirror of Solitude',
    text: 'A wall of mirrors suddenly surrounds you, but each reflection shows you utterly alone in different scenarios - abandoned at a party, ignored in a crowd, forgotten by loved ones, dying without anyone to mourn you. The reflections begin to move independently, reaching out from the mirrors with hands of cold glass. This manifestation of isolation seeks to convince you that connection is an illusion and you will always be fundamentally alone.',
    dc: 21,
    successText:
      'You place your hand against the mirrors and speak truth: "I have been alone, but I have also been held. I have been forgotten, but I have also been remembered." The mirrors crack as you acknowledge both isolation and connection as part of human experience. They shatter into light, leaving you surrounded by warm memories of genuine connection. Your guardian spirit embraces you with fierce pride.',
    failureText:
      'The mirror images overwhelm you with their vivid portrayal of loneliness. You curl into yourself, unable to remember times of true connection. Though the mirrors eventually fade, they leave you feeling hollow and disconnected from others. Your guardian spirit stays close, a constant reminder that you are never truly alone.',
    choices: {
      bold: 'Shatter the mirrors with declarations of every connection you\'ve made',
      cautious: 'Close your eyes and focus on internal feelings of self-companionship',
    },
    // Combat integration
    shadowType: SHADOW_IDS.VEIL_OF_ISOLATION,
    lpReward: 5,
    spPenalty: 4,
  },
  {
    id: 'journal-inner-child',
    type: 'journal',
    title: 'The Childhood Haven',
    text: 'You stumble upon a hidden treehouse that seems frozen in time - inside are toys, drawings, and diary entries from a child who once found refuge here. As you explore, you realize this could have been your sanctuary as a child. Your guardian spirit suggests this is a place to reconnect with and write to your inner child - the part of you that still needs healing, play, and unconditional acceptance.',
    dc: 12,
    successText:
      'You write a letter to your younger self with all the compassion you wished someone had shown you then. You acknowledge their pain, celebrate their resilience, and promise to protect their wonder and joy. As you finish, the treehouse seems to glow with warm light. Your guardian spirit is moved by your ability to parent your own inner child.',
    failureText:
      'The exercise feels silly and uncomfortable. You struggle to connect with your inner child, feeling only awkwardness and resistance. Your letter remains unfinished, and you leave the treehouse feeling disconnected from an important part of yourself. Your guardian spirit remains supportive, knowing that inner child work requires great vulnerability.',
    choices: {
      bold: 'Write as if speaking directly to your child self in their worst moment',
      cautious: 'Begin by remembering what brought you joy as a child',
    },
  },
  {
    id: 'exploration-threshold',
    type: 'exploration',
    title: 'The Doorway Garden',
    text: 'You find a mystical garden filled with doorways - some grand and golden, others simple and worn. Each door stands alone, leading nowhere visible, but plaques describe what lies beyond: "Your Life If You\'d Made Different Choices," "The Person You\'re Becoming," "Forgiveness," "Your Greatest Fear." Some doors are locked, others stand invitingly open. Your guardian spirit warns that each threshold crossed will change you.',
    dc: 14,
    successText:
      'You explore several doorways with courage and wisdom, understanding that they offer perspective, not escape. Through one door you see who you might have been, and feel gratitude for who you are. Through another, you glimpse your potential and feel inspired. You leave the garden with deeper self-understanding. Your guardian spirit glows with approval at your brave self-exploration.',
    failureText:
      'The possibilities paralyze you. You stand before door after door, unable to cross any threshold for fear of what you might find or lose. The weight of infinite possibilities becomes crushing. You leave the garden having opened no doors, tormented by what might lie beyond them. Your guardian spirit comforts you, noting that sometimes the hardest choice is to choose at all.',
    choices: {
      bold: 'Open the door to your greatest fear first',
      cautious: 'Start with the door showing who you\'re becoming',
    },
  },
  {
    id: 'social-community-builder',
    type: 'social',
    title: 'The Divided Village',
    text: 'You arrive at a village split by an ancient feud. Children from opposing sides meet secretly to play together but are punished when caught. The adults refuse to speak of the original conflict, nursing grudges they inherited but don\'t fully understand. A festival approaches that once united the village, but now each side plans separate celebrations. The children beg you to help them heal their community.',
    dc: 10,
    successText:
      'You work with the children to create a surprise unified celebration, involving them in preparing traditional foods and dances from both sides. When the adults see their children working together joyfully, walls begin to crumble. By festival\'s end, the village celebrates as one for the first time in generations. Your guardian spirit beams with pride at your ability to heal communities through their youngest members.',
    failureText:
      'Your attempts to bridge the divide are met with suspicion and hostility. Adults accuse you of filling children\'s heads with dangerous ideas. The divided festivals proceed, more bitter than ever. Your guardian spirit mourns with you, but notes that some seeds of unity were still planted in young hearts.',
    choices: {
      bold: 'Organize a children\'s festival that forces adult participation',
      cautious: 'Slowly build trust with key elders from both sides',
    },
  },
  {
    id: 'skill-dreamcatcher',
    type: 'skill',
    title: 'The Nightmare Weaver',
    text: 'An old craftsperson teaches you to create dreamcatchers that can trap and transform nightmares into sources of insight. The process requires weaving with spider silk under moonlight while holding your worst nightmare in mind. Each knot must be tied with intention, and a single mistake can release the nightmare in amplified form. The elder warns that confronting nightmares this directly requires great skill and courage.',
    dc: 13,
    successText:
      'Your hands move with surprising steadiness as you weave your nightmare into the web. As the final knot is tied, the nightmare transforms - what once terrorized you becomes a teacher showing you your hidden strengths. The dreamcatcher glows softly, a testament to your ability to transform fear into wisdom. Your guardian spirit celebrates your mastery over your own darkness.',
    failureText:
      'Your concentration breaks at a crucial moment, and the nightmare energy escapes the incomplete web. You\'re overwhelmed by intensified fears and have to abandon the work. The experience leaves you shaken and more afraid of your nightmares than before. Your guardian spirit soothes you, explaining that some transformations require multiple attempts.',
    choices: {
      bold: 'Weave your absolute worst recurring nightmare',
      cautious: 'Practice with a minor fear before attempting the worst',
    },
  },
  {
    id: 'combat-storm-chaos',
    type: 'combat',
    title: 'The Tempest Within',
    text: 'A supernatural storm manifests around you, but this tempest is made of pure chaos - swirling with deadlines, bills, broken relationships, health scares, and every responsibility you\'ve ever shouldered. Lightning strikes with reminders of everything you haven\'t done, thunder roars with the voices of those you\'ve disappointed. The eye of this storm is where all your life\'s pressures converge into overwhelming force.',
    dc: 24,
    successText:
      'You find stillness in the chaos by accepting what you can and cannot control. You prioritize with clarity, release impossible standards, and forgive yourself for being human. The storm gradually organizes into manageable rain, then gentle mist. Your guardian spirit shines through the clearing weather, proud of your hard-won peace.',
    failureText:
      'The chaos consumes you. You spin frantically trying to address every pressure at once, only making the storm worse. When it finally passes, you\'re left exhausted and feeling more behind than ever. Your guardian spirit shields you from the worst damage while gently suggesting that chaos cannot be fought, only navigated.',
    choices: {
      bold: 'Stand in the eye and methodically address each pressure',
      cautious: 'Seek shelter and let the storm exhaust itself',
    },
    // Combat integration
    shadowType: SHADOW_IDS.STORM_OF_OVERWHELM,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-gratitude-depths',
    type: 'journal',
    title: 'The Well of Appreciation',
    text: 'You discover an ancient well that reflects not water but moments of gratitude from throughout your life - some remembered, many forgotten. A inscription reads: "Gratitude is not ignoring pain but finding light within darkness." Blank stones lie nearby for you to inscribe with appreciations and drop into the well. Each stone that enters creates ripples showing how that gratitude affected your life.',
    dc: 11,
    successText:
      'You write genuine appreciations on stone after stone - for lessons learned through pain, for people who stayed, for your own resilience. As each stone creates ripples, you see how gratitude has been a thread of strength through your darkest times. Your guardian spirit glows warmly, touched by your ability to find light in shadow.',
    failureText:
      'The exercise feels forced and false. You struggle to feel genuine gratitude while carrying so much pain. The stones you drop create no ripples, suggesting your appreciation lacks authenticity. Your guardian spirit remains patient, understanding that gratitude cannot be manufactured on demand.',
    choices: {
      bold: 'Write gratitudes for your most difficult experiences',
      cautious: 'Start with simple appreciations and work deeper',
    },
  },
  {
    id: 'exploration-between-worlds',
    type: 'exploration',
    title: 'The Twilight Bridge',
    text: 'At twilight, a bridge appears spanning a chasm between two realities - one showing your life as it is, the other showing a version where your trauma never happened. The bridge is narrow and fog-shrouded. You can see figures in both realities: yourself living different lives. Your guardian spirit warns that this bridge tests not your desire to change the past, but your acceptance of your actual journey.',
    dc: 12,
    successText:
      'You walk the bridge mindfully, observing both realities without judgment. You realize that while the untraumatized version seems happier, they lack the depth, compassion, and strength you\'ve earned. You choose your actual life with all its scars and growth. The bridge solidifies under your feet, becoming a path forward. Your guardian spirit radiates deep respect for your choice.',
    failureText:
      'The alternate reality mesmerizes you. You lean too far toward the life without trauma and nearly fall into the chasm of regret. Though you eventually retreat to safety, you\'re left tormented by "what ifs" and unable to appreciate your actual journey. Your guardian spirit holds space for your grief while gently redirecting you to the present.',
    choices: {
      bold: 'Walk confidently to the middle to see both realities clearly',
      cautious: 'Study each reality from the safety of solid ground first',
    },
  },
  {
    id: 'social-grief-companion',
    type: 'social',
    title: 'The Mourning Mother',
    text: 'In a quiet cemetery, you encounter a woman placing fresh flowers on a small grave. She\'s been coming daily for two years, unable to move forward from her loss. "People tell me to let go," she whispers, "but how do you let go of your heart?" She looks at you with eyes that have cried all their tears. The weight of her grief is palpable, almost crushing.',
    dc: 12,
    successText:
      'You sit with her in silence first, honoring her pain without trying to fix it. Then you gently share that grief is love with nowhere to go, and moving forward doesn\'t mean forgetting. Your presence and understanding help her realize she can carry her love forward in new ways. Your guardian spirit weeps with compassion, recognizing the sacred act of witnessing another\'s pain.',
    failureText:
      'Your attempts at comfort feel inadequate against such profound loss. Your words about healing and time sound hollow, even to you. She withdraws further into her grief, and you leave feeling helpless. Your guardian spirit reminds you that sometimes the greatest service is simply acknowledging that some pain cannot be soothed.',
    choices: {
      bold: 'Share your own experience with profound loss',
      cautious: 'Simply sit with her in respectful silence',
    },
  },
  {
    id: 'skill-heart-mending',
    type: 'skill',
    title: 'The Shattered Compass',
    text: 'You find a beautiful compass that once guided travelers through emotional landscapes, now shattered into dozens of pieces. Each fragment points to a different emotional direction - joy, sorrow, anger, peace, fear, love. Repairing it requires not just fitting pieces together, but understanding how all emotions work together to provide true direction. The manual warns that forcing pieces will create a compass that always leads astray.',
    dc: 14,
    successText:
      'You work with patient understanding, recognizing that each emotion has its place in the compass of the heart. As pieces click together, you see how anger can point toward boundaries, fear toward growth edges, sorrow toward what matters. The repaired compass spins freely, pointing toward emotional truth. Your guardian spirit marvels at your emotional integration.',
    failureText:
      'You try to exclude the "negative" emotional pieces, creating an incomplete compass that spins wildly without true direction. Your refusal to integrate all emotions leaves you more lost than before. Your guardian spirit gently collects the discarded pieces, saving them for when you\'re ready to accept all parts of your emotional landscape.',
    choices: {
      bold: 'Start with the most difficult emotions like anger and fear',
      cautious: 'Build outward from the center with balanced emotions',
    },
  },
  {
    id: 'combat-echo-trauma',
    type: 'combat',
    title: 'The Resonance of Pain',
    text: 'The ground beneath you cracks, releasing echoes of every moment your trust was betrayed, every time you were abandoned, every promise that was broken. These echoes take form as shadowy figures that speak with voices you recognize - people who hurt you, including versions of yourself at your lowest. They circle you, each touch bringing vivid flashbacks of pain. The shadow feeds on unprocessed trauma.',
    dc: 22,
    successText:
      'You stand firm in the center of the echoes and speak a powerful truth: "You are my history, not my destiny. I honor the pain you represent while choosing healing." The shadows pause, then begin to transform into teachers showing you your incredible resilience. Your guardian spirit blazes with fierce love as you integrate your trauma into your strength.',
    failureText:
      'The echoes drag you back into the worst moments of your life. You relive each betrayal, each abandonment, feeling as helpless as you did then. Though you eventually break free, you\'re left feeling retraumatized and fragile. Your guardian spirit wraps you in protective warmth, holding you through the aftermath of remembered pain.',
    choices: {
      bold: 'Face each echo and reclaim your power from that memory',
      cautious: 'Create protective boundaries while acknowledging the echoes',
    },
    // Combat integration
    shadowType: SHADOW_IDS.ECHO_OF_PAST_PAIN,
    lpReward: 4,
    spPenalty: 3,
  },
  {
    id: 'journal-future-self',
    type: 'journal',
    title: 'The Tomorrow Tree',
    text: 'You find a mystical tree where people hang letters to their future selves. Some are weathered by years, others fresh with hope. The tree invites you to write to who you\'ll be in five years - not with goals or expectations, but with compassion and curiosity. As you write, leaves fall showing glimpses of possible futures, each shaped by the choices you make today.',
    dc: 13,
    successText:
      'You write with tender honesty to your future self, acknowledging both hopes and fears while expressing trust in your continued growth. You offer forgiveness for future mistakes and gratitude for future courage. The tree responds by showing beautiful possibilities born from self-compassion. Your guardian spirit is moved by your ability to extend love forward in time.',
    failureText:
      'Your letter becomes a list of demands and expectations, putting pressure on your future self to be perfect. The tree\'s leaves show futures burdened by these impossible standards. You leave feeling anxious about living up to your own expectations. Your guardian spirit suggests that perhaps your future self needs acceptance, not assignments.',
    choices: {
      bold: 'Write raw truths about your hopes and fears for the future',
      cautious: 'Focus on offering compassion and understanding to future you',
    },
  },
  {
    id: 'exploration-healing-springs',
    type: 'exploration',
    title: 'The Springs of Renewal',
    text: 'Hidden in a grove, you discover thermal springs that legend says can wash away emotional wounds. The waters glow with soft bioluminescence, and each pool has different properties - one for grief, one for shame, one for rage, one for fear. Steam rises carrying whispers of all who have bathed here before. A sign warns that the springs don\'t erase pain but transform it into wisdom.',
    dc: 14,
    successText:
      'You enter each spring mindfully, allowing the waters to draw out stored pain while leaving the lessons learned. The experience is intense but cathartic - grief transforms into compassion, shame into humility, rage into boundaries, fear into awareness. You emerge feeling renewed but not erased. Your guardian spirit glows with the same soft light as the springs.',
    failureText:
      'You rush between springs hoping to quickly wash away all pain, but the rapid transitions overwhelm your system. Instead of transformation, you feel raw and exposed, your wounds opened but not healed. You leave the springs feeling more vulnerable than cleansed. Your guardian spirit suggests that healing waters require patience and presence to work their magic.',
    choices: {
      bold: 'Immerse fully in the most difficult pool first',
      cautious: 'Test each spring gradually before full immersion',
    },
  },
];

export const getScene = (index: number): Scene => {
  return scenes[index];
};

export const isLastScene = (index: number): boolean => {
  return index >= scenes.length - 1;
};

export const getSceneProgress = (index: number): { current: number; total: number } => {
  return {
    current: index + 1,
    total: scenes.length,
  };
};

/**
 * Result of a dice roll against a difficulty check
 */
export interface DiceResult {
  /** The actual d20 roll result (1-20) */
  roll: number;
  /** The difficulty check target number */
  dc: number;
  /** Whether the roll succeeded (roll >= dc) */
  success: boolean;
}

/**
 * Performs a d20 dice roll against a difficulty check
 * 
 * This function simulates rolling a 20-sided die and comparing it against
 * a difficulty check (DC). Success occurs when the roll meets or exceeds
 * the DC. This mechanic adds uncertainty and excitement to scene outcomes.
 * 
 * @param dc - Difficulty Check target number (typically 10-20)
 * @param levelBonus - Bonus to add to the roll (typically player level - 1)
 * @returns DiceResult containing roll value, DC, and success status
 * 
 * @example
 * ```typescript
 * const playerLevel = 5;
 * const levelBonus = playerLevel - 1; // +4 bonus at level 5
 * const result = rollDice(15, levelBonus);
 * console.log(`Rolled ${result.roll} vs DC ${result.dc}`);
 * if (result.success) {
 *   console.log("Success!");
 * }
 * ```
 */
export const rollDice = (dc: number, levelBonus: number = 0): DiceResult => {
  const baseRoll = Math.floor(Math.random() * 20) + 1; // d20 roll
  const modifiedRoll = baseRoll + levelBonus; // Add level bonus
  return {
    roll: modifiedRoll,
    dc,
    success: modifiedRoll >= dc,
  };
};

/**
 * Represents the complete outcome of a scene interaction
 * 
 * This interface captures all the results of a player's scene choice,
 * including success/failure, resource changes, and potential combat triggers.
 */
export interface SceneOutcome {
  /** The scene that was processed */
  scene: Scene;
  /** Whether the player succeeded in the scene challenge */
  success: boolean;
  /** The dice roll result (if applicable) */
  roll?: number;
  /** Whether this outcome triggered a combat encounter */
  triggeredCombat?: boolean;
  /** The type of shadow manifestation for combat (if triggered) */
  shadowType?: string;
  /** Changes to player resources (Light Points/Shadow Points) */
  resourceChanges?: {
    /** Change in Light Points (positive = gain, negative = loss) */
    lpChange?: number;
    /** Change in Shadow Points (positive = gain, negative = loss) */
    spChange?: number;
  };
  /** Energy cost and reward information */
  energyChanges?: {
    /** Energy cost to attempt the scene (always negative or zero) */
    energyCost?: number;
    /** Energy reward for successful completion (always positive or zero) */
    energyReward?: number;
  };
  /** Experience points gained from this scene */
  experienceChanges?: {
    /** XP gained from the scene attempt/completion */
    xpGained?: number;
    /** Reason for XP award (for logging/display) */
    reason?: string;
  };
}

/**
 * Processes the outcome of a scene interaction
 * 
 * This function handles the complete resolution of a scene, including:
 * - Determining resource rewards/penalties
 * - Triggering combat encounters for failed combat scenes
 * - Applying scene-specific or default resource changes
 * 
 * @param scene - The scene being processed
 * @param success - Whether the player succeeded in the challenge
 * @param roll - The dice roll result (optional)
 * @returns Complete scene outcome with all effects
 * 
 * @example
 * ```typescript
 * const scene = getScene(0);
 * const diceResult = rollDice(scene.dc);
 * const outcome = handleSceneOutcome(scene, diceResult.success, diceResult.roll);
 * 
 * if (outcome.triggeredCombat) {
 *   // Start combat with outcome.shadowType
 * } else {
 *   // Apply resource changes
 *   updateResources(outcome.resourceChanges);
 * }
 * ```
 */
export const handleSceneOutcome = (
  scene: Scene,
  success: boolean,
  roll?: number,
  sceneIndex?: number
): SceneOutcome => {
  const config = getEnvironmentConfig();
  const outcome: SceneOutcome = {
    scene,
    success,
    roll,
    triggeredCombat: false,
    resourceChanges: {},
    energyChanges: {},
    experienceChanges: {}
  };

  // Energy cost is always applied (negative value for cost)
  const energyCost = config.sceneCosts[scene.type];
  outcome.energyChanges!.energyCost = -energyCost;

  // Experience points are always awarded (even for failed attempts)
  const xpGained = getSceneXPReward(scene.type, success, sceneIndex || 0);
  outcome.experienceChanges!.xpGained = xpGained;
  outcome.experienceChanges!.reason = `${scene.type} scene ${success ? 'completed' : 'attempted'}`;

  // Combat scene trigger - failed combat scenes trigger shadow battles
  if (scene.type === 'combat' && !success && scene.shadowType) {
    outcome.triggeredCombat = true;
    outcome.shadowType = scene.shadowType;
    // Energy cost still applies, but no immediate resource changes
    // Combat will handle rewards/penalties
    return outcome;
  }

  // Award resources based on outcome for non-combat scenes
  if (success) {
    // Success rewards Light Points
    const lpReward = scene.lpReward || getDefaultLPReward(scene.type);
    outcome.resourceChanges!.lpChange = lpReward;
    
    // Success also rewards energy (recovery bonus)
    const energyReward = config.sceneRewards[scene.type];
    outcome.energyChanges!.energyReward = energyReward;
  } else {
    // Failure penalties Shadow Points
    const spPenalty = scene.spPenalty || getDefaultSPPenalty(scene.type);
    outcome.resourceChanges!.spChange = spPenalty;
    // No energy reward on failure
  }

  return outcome;
};

/**
 * Gets default LP reward for successful scenes by type
 */
const getDefaultLPReward = (sceneType: Scene['type']): number => {
  switch (sceneType) {
    case 'social': return 3;
    case 'skill': return 2;
    case 'combat': return 4; // Higher reward for combat success
    case 'journal': return 2;
    case 'exploration': return 3;
    default: return 2;
  }
};

/**
 * Gets default SP penalty for failed scenes by type
 */
const getDefaultSPPenalty = (sceneType: Scene['type']): number => {
  switch (sceneType) {
    case 'social': return 2;
    case 'skill': return 1;
    case 'combat': return 3; // Higher penalty for combat failure
    case 'journal': return 1;
    case 'exploration': return 2;
    default: return 1;
  }
};

/**
 * Calculates the level-based bonus to dice rolls
 * +1 bonus per level gained (so Level 1 = +0, Level 5 = +4)
 */
export const getLevelRollBonus = (playerLevel: number): number => {
  return Math.max(0, playerLevel - 1);
};

/**
 * Gets XP reward for scene completion based on type, success, and scene index
 */
const getSceneXPReward = (sceneType: Scene['type'], success: boolean, sceneIndex: number): number => {
  const baseXP = {
    social: 25,      // Interpersonal growth
    skill: 35,       // Problem-solving 
    combat: 50,      // Confronting shadows
    journal: 20,     // Self-reflection
    exploration: 30  // Discovery
  };
  
  const successMultiplier = success ? 1.0 : 0.6; // Partial XP for attempts
  const difficultyBonus = Math.floor(sceneIndex / 10) * 5; // Progressive difficulty
  
  return Math.floor((baseXP[sceneType] + difficultyBonus) * successMultiplier);
};

/**
 * Maps scene IDs to appropriate shadow types for combat encounters
 */
export const mapSceneToShadowType = (sceneId: string): string => {
  // Map specific scenes to specific shadows
  const sceneToShadowMap: Record<string, string> = {
    'combat-encounter': SHADOW_IDS.WHISPER_OF_DOUBT,
    'combat-isolation': SHADOW_IDS.VEIL_OF_ISOLATION,
    'combat-overwhelm': SHADOW_IDS.STORM_OF_OVERWHELM,
    'combat-past-pain': SHADOW_IDS.ECHO_OF_PAST_PAIN,
    // Add more mappings as needed
  };

  return sceneToShadowMap[sceneId] || SHADOW_IDS.WHISPER_OF_DOUBT;
};
