# Luminari's Quest - User Guide

**How to Play: A Complete Guide to Your Therapeutic Journey**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Interface](#understanding-the-interface)
3. [Core Gameplay Mechanics](#core-gameplay-mechanics)
4. [Combat System](#combat-system)
5. [Journal System](#journal-system)
6. [Progress Tracking](#progress-tracking)
7. [Tips & Strategies](#tips--strategies)

---

## Getting Started

### Creating Your Account

1. Navigate to the homepage at [https://luminarisquest.org](https://luminarisquest.org)
2. Click **"Start Your Journey"**
3. Enter your email and create a secure password
4. Click **"Sign Up"** to create your account
5. Verify your email (check spam folder if needed)
6. Login with your credentials

### Your First Scene

After logging in, you'll be taken to the **Adventure** page where your journey begins:

1. Read the Guardian's welcome message
2. See your starting stats (Guardian Trust: 50/100, Energy: 100/100)
3. View your first scene: **"The Worried Merchant"**
4. Choose between **Bold** (immediate action) or **Cautious** (thoughtful approach)
5. Roll the dice (d20) to determine the outcome
6. See how your choice affects your Guardian Trust

---

## Understanding the Interface

### Main Navigation

The app has four main pages accessible from the top navigation bar:

#### 🏠 Home
- Landing page with authentication
- Sign up / Sign in options
- Hero image and welcome message

#### ⚔️ Adventure
- Main gameplay area
- Scene selection and story progression
- Combat encounters
- Journal prompts
- Audio player with therapeutic music

#### 📊 Progress
- View your Guardian Trust progression
- Track completed scenes
- Review journal entries
- See achievements and milestones
- Export progress reports

#### 👤 Profile
- Account settings
- Logout option
- Preference management
- Data export/deletion

### The Adventure Page Layout

```
┌─────────────────────────────────────┐
│  Adventure Hero Image               │  ← Therapeutic visuals
├─────────────────────────────────────┤
│  Guardian Spirit Message            │  ← Guidance and feedback
├─────────────────────────────────────┤
│  Stats Bar                          │  ← Trust, Energy, Resources
│  Trust: 50/100  Energy: 85/100     │
│  LP: 10  SP: 5                      │
├─────────────────────────────────────┤
│  Audio Player                       │  ← Background music
├─────────────────────────────────────┤
│  Scene Title & Description          │  ← Current scenario
│  [Bold Choice] [Cautious Choice]    │  ← Decision making
└─────────────────────────────────────┘
```

### Stats Bar Explained

| Stat | Range | Description |
|------|-------|-------------|
| **Guardian Trust** | 0-100 | Your bond with your guardian spirit. Core progression metric. |
| **Energy** | 0-100 | Required for actions. Regenerates 1 per minute when not in combat. |
| **Light Points (LP)** | 0+ | Positive emotional resources for combat. Used for Illuminate and Embrace actions. |
| **Shadow Points (SP)** | 0+ | Challenges to transform into growth. Used for Reflect action. |

---

## Core Gameplay Mechanics

### Scene Types

The game features 20 therapeutic scenarios across 5 types:

#### 1. Social Scenes (🤝)
- **Focus**: Interpersonal connection and empathy
- **Example**: "The Worried Merchant" - Offering comfort to someone in distress
- **Skills**: Emotional intelligence, compassion, active listening
- **DC Range**: 9-13

#### 2. Skill Scenes (🎯)
- **Focus**: Problem-solving and competence building
- **Example**: "The Ancient Lock" - Solving a complex puzzle
- **Skills**: Patience, analytical thinking, persistence
- **DC Range**: 11-15

#### 3. Combat Scenes (⚔️)
- **Focus**: Confronting internal struggles
- **Example**: "Shadow of Doubt" - Facing your inner critic
- **Skills**: Emotional regulation, courage, self-compassion
- **DC Range**: 12-16

#### 4. Journal Scenes (📝)
- **Focus**: Self-reflection and processing
- **Example**: Milestone journals at Trust levels 25, 50, 75
- **Skills**: Self-awareness, introspection, emotional literacy
- **DC Range**: N/A (triggered automatically)

#### 5. Exploration Scenes (🗺️)
- **Focus**: Discovery and perspective-taking
- **Example**: "The Hidden Grove" - Finding beauty in unexpected places
- **Skills**: Curiosity, mindfulness, openness
- **DC Range**: 10-14

### Making Choices

Every scene presents two options:

**Bold Choice** (🔥)
- Immediate, direct action
- Higher risk, higher reward
- Often involves courage or assertiveness
- Example: *"Offer immediate help and comfort"*

**Cautious Choice** (🌙)
- Thoughtful, measured response
- Lower risk, steady progress
- Often involves patience or wisdom
- Example: *"Listen carefully before responding"*

**There is no "correct" choice** - both paths are valid therapeutic approaches.

### Dice Rolling (d20 System)

After making a choice, you roll a 20-sided die:

```
Roll + Modifiers vs. Difficulty Check (DC)

Modifiers:
- Base: +0
- Player Level Bonus: +1 per level (after level 1)
- Random Roll: 1-20

Success: Total ≥ DC
Failure: Total < DC
```

**Examples:**

```
Scene: "The Ancient Lock" (DC 11)
Player Level: 3 (bonus: +2)
Roll: 14
Total: 14 + 2 = 16 ≥ 11 → SUCCESS ✓

Scene: "Shadow of Doubt" (DC 14)
Player Level: 1 (bonus: +0)
Roll: 7
Total: 7 + 0 = 7 < 14 → FAILURE ✗
```

### Success & Failure

**On Success:**
- Guardian Trust increases (+5 base, +1-3 from level bonuses)
- Receive positive guardian message
- Earn experience points
- Gain Light Points (+3-5)
- May earn energy rewards
- Progress to next scene

**On Failure:**
- Guardian Trust decreases (-5)
- Receive encouraging guardian message
- May trigger "learning moment" journal prompt
- Gain Shadow Points (+2-4)
- Can retry the scene
- Still gain experience (lower amount)

**Important:** Failure is part of the therapeutic process. Your guardian supports growth through setbacks.

---

## Combat System

### When Combat Occurs

Combat scenes trigger when you face Shadow Manifestations:

- **Shadow of Doubt** (Undermines confidence)
- **Veil of Isolation** (Represents loneliness)
- **Tide of Overwhelm** (Crushing pressure)
- **Echo of Past Pain** (Unresolved trauma)

### Combat Interface

```
┌─────────────────────────────────────┐
│  Shadow Manifestation               │
│  HP: 18/25  ████████░░░             │
├─────────────────────────────────────┤
│  Your Resources                      │
│  LP: 8/15  SP: 3/10  Health: 95/100 │
├─────────────────────────────────────┤
│  [ILLUMINATE] [REFLECT]             │
│  [ENDURE]     [EMBRACE]             │
├─────────────────────────────────────┤
│  Combat Log                          │
│  Turn 3: You used ILLUMINATE...     │
│  Turn 2: Shadow attacked...         │
└─────────────────────────────────────┘
```

### Combat Actions

#### 1. ILLUMINATE (💡)
**Cost:** 2 Light Points  
**Effect:** Deal damage to shadow manifestation  
**Damage:** 3 + floor(Guardian Trust / 4)  
**Therapeutic Insight:** Awareness and understanding reduce emotional pain

**Example:**
```
Trust: 60 → Damage: 3 + floor(60/4) = 3 + 15 = 18 damage
Trust: 40 → Damage: 3 + floor(40/4) = 3 + 10 = 13 damage
```

**When to Use:**
- High Guardian Trust (maximum effectiveness)
- Sufficient Light Points available
- Aggressive combat strategy

#### 2. REFLECT (🔄)
**Cost:** 3 Shadow Points  
**Effect:** Transform shadows into light + heal 1 HP  
**Conversion:** 3 SP → 2 LP + 1 HP healing  
**Therapeutic Insight:** Transforming challenges into wisdom and growth

**When to Use:**
- High Shadow Points accumulated
- Need healing
- Want to convert challenges into resources
- Defensive/recovery strategy

#### 3. ENDURE (🛡️)
**Cost:** None  
**Effect:** Reduce incoming damage by 50% + gain 2 LP  
**Duration:** Until end of shadow's next turn  
**Consecutive Bonus:** +1 LP per consecutive Endure  
**Therapeutic Insight:** Patience and resilience build strength over time

**When to Use:**
- Low on resources
- Expecting heavy shadow attack
- Building up Light Points
- Stalling for better positioning

#### 4. EMBRACE (🌑)
**Cost:** All Shadow Points  
**Effect:** Massive damage (2x SP as damage)  
**Risk:** Deals 1 HP damage to you per SP consumed  
**Therapeutic Insight:** High-risk integration of difficult emotions

**Example:**
```
SP: 10 → Damage to Shadow: 20
      → Damage to You: 10 HP
```

**When to Use:**
- Shadow at low HP (finishing move)
- High Shadow Points accumulated
- Willing to accept health cost
- All-or-nothing strategy

### Shadow Abilities

Shadows have unique abilities that activate on their turns:

- **Doubt**: Reduces your damage, inflicts despair
- **Isolation**: Blocks healing, cuts off support
- **Overwhelm**: Heavy damage attacks, crushing pressure
- **Past Pain**: Status effects, lingering trauma

### Combat Victory

**Victory Rewards:**
- Full HP restoration (back to 100)
- Light Point bonus (+5-8)
- Guardian Trust increase
- Growth message and therapeutic insight
- Unlock next scene
- Combat reflection journal prompt

**Defeat:**
- HP drops to 0
- Combat ends with learning opportunity
- Guardian encourages trying again
- Keep some resources for next attempt
- Scene remains available to retry

---

## Journal System

### Journal Types

#### 1. Milestone Journals (🏆)
**Triggered automatically when Guardian Trust reaches:**
- **Level 25** - "Inner Strength"
- **Level 50** - "Finding Balance"
- **Level 75** - "Deep Connection"

**Purpose:** Celebrate achievements and reflect on growth

**Prompts:**
```
"You've reached a significant milestone in your journey.
 
 Reflect on:
 - What have you learned about yourself?
 - How has your relationship with your guardian changed?
 - What strengths have you discovered?"
```

#### 2. Learning Journals (📖)
**Triggered after:**
- Failed scene attempts
- Combat defeats
- Challenging moments
- Level-up achievements

**Purpose:** Process setbacks and extract wisdom from challenges

**Prompts:**
```
"This moment offers valuable lessons.

Consider:
- What made this challenging?
- What did you learn from the experience?
- How might you approach similar situations differently?"
```

### Creating Journal Entries

1. **Prompt Appears:** Modal opens with the journal prompt
2. **Write Title:** Create a meaningful title (optional, defaults provided)
3. **Write Entry:** Express your thoughts freely (minimum 10 characters)
4. **Add Tags:** Categorize your entry (optional, suggestions provided)
5. **Save:** Click "Save Entry" - automatically saved to cloud

**Entry fields:**
- **Title**: 50 character maximum
- **Content**: 5000 character maximum
- **Tags**: Up to 5 tags, each 20 characters maximum
- **Type**: Automatically set (milestone or learning)
- **Trust Level**: Automatically recorded
- **Scene ID**: Automatically linked to current scene

### Viewing Journal Entries

Access your journal from the **Progress** page:

1. Click **"Progress"** in navigation
2. Scroll to **"Journal Entries"** section
3. Entries displayed in reverse chronological order (newest first)
4. See entry type, title, date, and trust level

### Editing Journal Entries

1. Find the entry in Progress page
2. Click **"Edit"** button
3. Modify title and/or content
4. Click **"Save Changes"**
5. Entry marked as "edited" with edit timestamp

### Deleting Journal Entries

1. Find the entry in Progress page
2. Click **"Delete"** button
3. Confirm deletion in popup
4. Entry permanently removed

**⚠️ Warning:** Deletion is permanent and cannot be undone.

---

## Progress Tracking

### The Progress Page

Access via top navigation → **Progress**

#### Trust Progression Chart
- Visual graph of Guardian Trust over time
- Shows milestones at 25, 50, 75
- Displays current trust level
- Tracks trust changes per scene

#### Scene Completion
- Total scenes completed
- Success/failure ratio
- Most recent completions
- Scene types attempted

#### Journal Stats
- Total entries written
- Milestone vs. learning ratio
- Most recent entries
- Tags used frequently

#### Achievements
- Milestones unlocked
- Level progression
- Combat victories
- Special accomplishments

### Experience & Leveling

**XP System:**
```
Level 1 → 2: 100 XP required
Level 2 → 3: 140 XP required
Level 3 → 4: 196 XP required
(Growth factor: 1.4x per level)
```

**XP Sources:**
- Scene success: +20-30 XP
- Scene failure: +5-10 XP
- Combat victory: +30-50 XP
- Journal entry: +10 XP
- Milestone: +50 XP

**Level Benefits:**

| Benefit | Every N Levels | Effect |
|---------|---------------|--------|
| Max Energy Bonus | 2 levels | +10 max energy |
| Starting LP Bonus | 3 levels | +5 Light Points at combat start |
| Energy Cost Reduction | 4 levels | -1 energy cost for actions |
| Trust Gain Multiplier | 5 levels | +20% trust gain from scenes |
| Dice Roll Bonus | 1 level | +1 to all d20 rolls |

**Example at Level 10:**
- Max Energy: 100 → 150 (+50)
- Starting LP: 10 → 25 (+15)
- Energy Cost: -2 (from base costs)
- Trust Gain: +40% (1.4x multiplier)
- Dice Bonus: +9 to all rolls

---

## Tips & Strategies

### For New Players

**1. Start Slow**
- Complete the first 5 scenes to understand mechanics
- Don't worry about optimizing every choice
- Experiment with both Bold and Cautious options
- Read guardian messages carefully

**2. Manage Energy**
- Energy regenerates 1 per minute outside combat
- Each scene action costs 5-10 energy
- At 0 energy, wait or rest
- Level up to increase max energy

**3. Journal Regularly**
- Don't skip journal prompts
- Write authentic reflections (this is for YOU)
- Use tags to organize thoughts
- Review old entries to see growth

**4. Understand Failure**
- Failure is part of the therapeutic process
- You still gain XP and resources from failures
- Guardian always supports you
- Learning moments are valuable

### Combat Strategies

**Balanced Strategy (Recommended for Beginners):**
```
Turn 1: ENDURE (build LP, reduce damage)
Turn 2: ILLUMINATE (deal damage)
Turn 3: ENDURE (build more LP)
Turn 4: ILLUMINATE (deal damage)
Repeat until shadow HP < 20
Final: EMBRACE (finish if SP > 10)
```

**Aggressive Strategy:**
```
Requirements: High Guardian Trust (60+)
Turn 1: ILLUMINATE
Turn 2: ILLUMINATE
Turn 3: ENDURE (recover LP)
Turn 4: ILLUMINATE
Keep pressure on shadow
```

**Defensive Strategy:**
```
Best for: Low HP, Low Trust
Turn 1: ENDURE
Turn 2: REFLECT (heal + convert SP)
Turn 3: ENDURE
Turn 4: ILLUMINATE (when safe)
Prioritize survival
```

**EMBRACE Finisher:**
```
Best when: Shadow HP ≤ 20, Your SP ≥ 10
Cost: 10 HP damage to you
Reward: 20 damage to shadow (instant kill)
Risk: Only use if your HP > 10
```

### Trust Management

**Building Trust:**
- Complete scenes successfully
- Make thoughtful choices
- Write journal entries
- Win combat encounters
- Reach milestones

**Maintaining Trust:**
- Don't panic after failures (only -5)
- One success recovers a failure
- Level bonuses multiply positive gains
- Long-term trend matters more than single scenes

**Trust Milestones:**

| Trust Level | Milestone | Reward |
|-------------|-----------|--------|
| 25 | Inner Strength | Milestone journal, +50 XP |
| 50 | Finding Balance | Milestone journal, +50 XP, combat bonus |
| 75 | Deep Connection | Milestone journal, +50 XP, major combat bonus |
| 100 | Perfect Bond | Story completion, special rewards |

### Resource Management

**Light Points:**
- Earned from: Scene success, Endure action, victory bonuses
- Spent on: Illuminate (2 LP), Embrace (LP converted from SP)
- Strategy: Maintain 4-6 LP reserve for ILLUMINATE actions

**Shadow Points:**
- Earned from: Scene failure, combat, shadow attacks
- Spent on: Reflect (3 SP), Embrace (all SP)
- Strategy: Convert to LP via REFLECT when SP > 6

**Energy:**
- Regenerates: 1 per minute (passive)
- Used for: Scene actions (5-10 energy each)
- Strategy: Don't drop below 20 energy (save for important scenes)

### Advanced Tips

**Scene Selection:**
1. **Mix scene types** for balanced progression
2. **Save combat scenes** for when Trust > 40
3. **Do journal scenes** immediately (don't skip milestones)
4. **Retry failed scenes** with opposite choice

**Combat Optimization:**
1. **Track shadow cooldowns** (abilities have 2-3 turn cooldowns)
2. **ENDURE before heavy attacks** (check combat log for patterns)
3. **REFLECT when SP > 6** (optimal conversion rate)
4. **Save EMBRACE for HP < 25%** (finishing move)

**Progression Path:**
```
Scenes 1-5:   Learn mechanics (Trust 40-60)
Scenes 6-10:  First combat (Trust 50-70)
Milestone 50: Trust established
Scenes 11-15: Advanced challenges (Trust 60-80)
Milestone 75: Deep connection
Scenes 16-20: Mastery (Trust 75-100)
```

---

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Arrow Keys**: Navigate choices
- **Esc**: Close modals

### Screen Reader Support
- All images have descriptive alt text
- Form fields properly labeled
- Combat log announces actions
- ARIA labels on interactive elements

### Visual Accessibility
- High contrast text
- Minimum 44px touch targets
- Clear focus indicators
- Responsive text sizing

---

## Privacy & Data

### What We Store
- Game progress (scenes, trust, resources)
- Journal entries (encrypted)
- Account information (email, password hash)
- Gameplay statistics

### What We Don't Store
- Personal identifying information beyond email
- Third-party tracking data
- Cookies beyond authentication
- Social media connections

### Data Control
- **Export**: Download all data as JSON
- **Delete**: Permanently remove account and data
- **Privacy**: Your journal is private and encrypted
- **Security**: Row-Level Security (RLS) in database

---

## Getting Help

### Common Questions

**Q: How do I increase Guardian Trust quickly?**  
A: Complete scenes successfully, level up for trust multipliers, win combat encounters.

**Q: What happens at 100 Trust?**  
A: Story completion, achievement unlocked, special rewards. (Trust can stay at 100.)

**Q: Can I lose all my progress?**  
A: No. Progress auto-saves every 30 seconds and after major events. Even if you fail scenes, you keep XP and resources.

**Q: Is there a "best" strategy?**  
A: No. Both Bold and Cautious choices are therapeutically valid. Play authentically.

**Q: How long does the game take?**  
A: 20-40 hours for full completion, depending on playstyle and reflection time.

### Support Resources

- **Documentation**: [docs/troubleshooting/faq.md](../troubleshooting/faq.md)
- **GitHub Issues**: [Report bugs](https://github.com/moshehbenavraham/luminaris-quest/issues)
- **Community**: [Skool Community](https://www.skool.com/ai-with-apex/about)

---

**Enjoy your therapeutic journey!** 🌟

Remember: This game is a supplemental tool for healing and growth, not a replacement for professional mental health care.

---

*Last Updated: 2025-11-17*  
*Verified Against: Source code v0.1.1*

