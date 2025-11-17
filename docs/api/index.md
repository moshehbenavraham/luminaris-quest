# API Documentation

## Overview

Luminari's Quest uses a combination of internal APIs and external services to provide a comprehensive therapeutic gaming experience. This document covers all API interactions, data structures, and integration patterns.

## Table of Contents

1. [Internal APIs](#internal-apis)
2. [External Service Integrations](#external-service-integrations)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security Considerations](#security-considerations)

## Internal APIs

### Game Store API

The game store provides centralized state management using Zustand with persistence.

#### Core State Interface

```typescript
interface GameState {
  // Player Progress
  guardianTrust: number;           // 0-100 trust level
  playerLevel: number;             // Player's current level
  currentSceneIndex: number;       // Current scene in progression
  
  // Combat Resources
  lightPoints: number;             // Positive emotional resources
  shadowPoints: number;            // Challenges to overcome
  
  // Progress Tracking
  milestones: Milestone[];         // Achievement milestones
  sceneHistory: CompletedScene[];  // Completed scene records
  journalEntries: JournalEntry[];  // Therapeutic journal entries
  
  // Combat State
  isInCombat: boolean;            // Combat mode flag
  currentEnemy: ShadowManifestation | null; // Current combat enemy
  combatTurn: number;             // Current combat turn
  
  // Persistence
  saveState: SaveState;           // Save operation status
  _hasHydrated: boolean;          // Hydration completion flag
}
```

#### Key Methods

##### `setGuardianTrust(trust: number): void`
Updates the guardian trust level and triggers milestone checks.

**Parameters:**
- `trust`: Number between 0-100

**Side Effects:**
- Triggers milestone achievement checks
- Updates UI components
- Persists to database

**Example:**
```typescript
const { setGuardianTrust } = useGameStore();
setGuardianTrust(75); // Sets trust to 75 and checks for milestone
```

##### `addJournalEntry(entry: JournalEntry): void`
Adds a new therapeutic journal entry.

**Parameters:**
- `entry`: JournalEntry object with required fields

**Validation:**
- Entry must have valid ID and content
- Type must be 'milestone' or 'learning'
- Trust level must be valid number

**Example:**
```typescript
const entry: JournalEntry = {
  id: 'journal-123',
  type: 'milestone',
  trustLevel: 50,
  content: 'Reflection on reaching trust level 50...',
  title: 'Milestone Reflection',
  tags: ['growth', 'trust'],
  isEdited: false,
  createdAt: Date.now()
};

addJournalEntry(entry);
```

##### `executeCombatAction(action: CombatAction): void`
Executes a combat action and processes results.

**Parameters:**
- `action`: One of 'ILLUMINATE', 'REFLECT', 'ENDURE', 'EMBRACE'

**Validation:**
- Player must be in combat
- Action must be valid for current resources
- Turn limit must not be exceeded

**Side Effects:**
- Updates combat state
- Modifies resources (LP/SP)
- Triggers shadow AI response
- Updates combat log

**Example:**
```typescript
const { executeCombatAction, canUseAction } = useGameStore();

if (canUseAction('ILLUMINATE')) {
  executeCombatAction('ILLUMINATE');
}
```

### Scene Engine API

The scene engine manages story progression and therapeutic scenarios.

#### Core Functions

##### `getScene(index: number): Scene | null`
Retrieves a scene by index.

**Parameters:**
- `index`: Scene index (0-based)

**Returns:**
- Scene object or null if index is invalid

**Example:**
```typescript
import { getScene } from '@/engine/scene-engine';

const scene = getScene(5);
if (scene) {
  console.log(scene.title, scene.text);
}
```

##### `handleSceneOutcome(scene: Scene, choice: 'bold' | 'cautious', roll: number): SceneOutcome`
Processes scene choice and dice roll.

**Parameters:**
- `scene`: Scene object
- `choice`: Player's choice ('bold' or 'cautious')
- `roll`: Dice roll result (1-20)

**Returns:**
- SceneOutcome with success/failure and resource changes

**Example:**
```typescript
import { handleSceneOutcome, rollDice } from '@/engine/scene-engine';

const scene = getScene(0);
const roll = rollDice();
const outcome = handleSceneOutcome(scene, 'bold', roll);

console.log(`Success: ${outcome.success}, Roll: ${outcome.roll}`);
```

### Combat Engine API

The combat engine handles therapeutic combat mechanics.

#### Core Functions

##### `executePlayerAction(action: CombatAction, state: CombatState): CombatActionResult`
Executes a player combat action.

**Parameters:**
- `action`: Combat action type
- `state`: Current combat state

**Returns:**
- CombatActionResult with damage, healing, and resource changes

**Example:**
```typescript
import { executePlayerAction } from '@/engine/combat-engine';

const result = executePlayerAction('ILLUMINATE', combatState);
console.log(`Damage dealt: ${result.damage}`);
```

##### `canPerformAction(action: CombatAction, resources: Resources): boolean`
Checks if an action can be performed with current resources.

**Parameters:**
- `action`: Combat action to check
- `resources`: Current LP/SP resources

**Returns:**
- Boolean indicating if action is possible

## External Service Integrations

### Supabase Integration

#### Authentication API

##### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
});
```

##### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

##### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

#### Database API

##### Save Game State
```typescript
const { error } = await supabase
  .from('game_states')
  .upsert({
    user_id: userId,
    guardian_trust: trust,
    player_level: level,
    current_scene_index: sceneIndex,
    milestones: milestonesArray,
    scene_history: historyArray,
    updated_at: new Date().toISOString()
  });
```

##### Load Game State
```typescript
const { data, error } = await supabase
  .from('game_states')
  .select('*')
  .eq('user_id', userId)
  .single();
```

##### Save Journal Entry
```typescript
const { error } = await supabase
  .from('journal_entries')
  .upsert({
    id: entry.id,
    user_id: userId,
    type: entry.type,
    trust_level: entry.trustLevel,
    content: entry.content,
    title: entry.title,
    scene_id: entry.sceneId,
    tags: entry.tags,
    is_edited: entry.isEdited,
    created_at: entry.createdAt,
    edited_at: entry.editedAt
  });
```

### Planned AI Service Integrations

#### OpenAI Integration (Planned)

```typescript
// Narrative generation
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a therapeutic storyteller for a trauma recovery game..."
    },
    {
      role: "user",
      content: `Generate a scene continuation based on: ${context}`
    }
  ],
  max_tokens: 500,
  temperature: 0.7
});
```

#### Leonardo.AI Integration (Planned)

```typescript
// Image generation
const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LEONARDO_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: sceneDescription,
    modelId: 'therapeutic-art-model',
    width: 1024,
    height: 768,
    num_images: 1
  })
});
```

#### ElevenLabs Integration (Planned)

```typescript
// Voice synthesis
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: narrativeText,
    voice_settings: {
      stability: 0.75,
      similarity_boost: 0.75
    }
  })
});
```

## Database Schema

### Tables

#### `game_states`
Stores player progress and game state.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Primary key, references auth.users(id) |
| `guardian_trust` | INTEGER | Trust level (0-100) |
| `player_level` | INTEGER | Player's current level |
| `current_scene_index` | INTEGER | Current scene position |
| `milestones` | JSONB | Array of milestone objects |
| `scene_history` | JSONB | Array of completed scenes |
| `updated_at` | TIMESTAMP | Last update time |

#### `journal_entries`
Stores therapeutic journal entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key, unique entry ID |
| `user_id` | UUID | References auth.users(id) |
| `type` | TEXT | 'milestone' or 'learning' |
| `trust_level` | INTEGER | Trust level when created |
| `content` | TEXT | Journal entry content |
| `title` | TEXT | Entry title |
| `scene_id` | TEXT | Associated scene (nullable) |
| `tags` | JSONB | Array of tags |
| `is_edited` | BOOLEAN | Edit status flag |
| `created_at` | TIMESTAMP | Creation time |
| `edited_at` | TIMESTAMP | Last edit time (nullable) |

### Row Level Security (RLS)

All tables implement RLS policies ensuring users can only access their own data:

```sql
-- Example policy for game_states
CREATE POLICY "Users can view own game state" ON game_states
  FOR SELECT USING (auth.uid() = user_id);
```

## Authentication

### JWT Token Structure

Supabase provides JWT tokens with the following structure:

```json
{
  "aud": "authenticated",
  "exp": 1640995200,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{"method": "password", "timestamp": 1640908800}]
}
```

### Protected Routes

Routes requiring authentication:
- `/adventure` - Main gameplay
- `/progress` - Progress tracking
- `/profile` - User profile

### Session Management

- **Session Duration**: 1 hour (configurable)
- **Refresh Token**: 30 days
- **Auto-refresh**: Handled by Supabase client
- **Logout**: Clears all local storage and redirects

## Error Handling

### Error Types

```typescript
export enum SaveErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Error Response Format

```typescript
interface APIError {
  type: SaveErrorType;
  message: string;
  originalError?: any;
  timestamp: number;
}
```

### Retry Logic

The application implements exponential backoff for failed requests:

```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  backoffMultiplier: 2
};
```

## Rate Limiting

### Supabase Limits

- **Requests per minute**: 100 (free tier)
- **Database connections**: 60 (free tier)
- **Storage**: 500MB (free tier)

### Client-side Throttling

- **Save operations**: Debounced to prevent excessive saves
- **API calls**: Queued and batched where possible
- **Real-time subscriptions**: Limited to essential data only

## Security Considerations

### Data Protection

- **Encryption**: All data encrypted in transit (HTTPS) and at rest
- **RLS Policies**: Database-level user isolation
- **Input Validation**: All user inputs validated and sanitized
- **XSS Prevention**: React's built-in XSS protection

### API Security

- **Authentication**: Required for all sensitive operations
- **CORS**: Configured for specific domains only
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Sanitization**: All inputs cleaned before processing

### Privacy Compliance

- **HIPAA-Aware**: Designed with healthcare privacy in mind
- **Data Minimization**: Only collect necessary data
- **User Control**: Users can delete their data
- **Audit Logging**: Track data access and modifications

## Testing APIs

### Unit Testing

```typescript
// Example API test
describe('Game Store API', () => {
  test('setGuardianTrust updates trust level', () => {
    const store = useGameStore.getState();
    store.setGuardianTrust(75);
    expect(store.guardianTrust).toBe(75);
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('Supabase Integration', () => {
  test('saves game state successfully', async () => {
    const result = await saveGameState(mockGameState);
    expect(result.error).toBeNull();
  });
});
```

### API Mocking

For development and testing without external dependencies:

```typescript
// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn()
  }))
};
```

## Performance Optimization

### Caching Strategy

- **Static Assets**: Cached with long TTL
- **API Responses**: Cached with appropriate TTL
- **Database Queries**: Optimized with indexes
- **Real-time Updates**: Selective subscriptions only

### Batch Operations

- **Journal Saves**: Batched to reduce database calls
- **State Updates**: Debounced to prevent excessive saves
- **Image Loading**: Lazy loaded with progressive enhancement

---

*For more detailed information, see the individual component documentation and the [../architecture/database.md](../architecture/database.md) documentation.*

