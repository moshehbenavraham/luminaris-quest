# Architecture Overview

**System Design and Technical Architecture of Luminari's Quest**

---

## Executive Summary

Luminari's Quest is a modern, therapeutic web application built with React 18, TypeScript 5.3+, and Vite 6.3+. The architecture follows industry best practices for scalable, maintainable, and performant single-page applications (SPAs), with a particular focus on therapeutic user experience and data security.

**Core Principles:**
- **Therapeutic-First Design**: Every architectural decision prioritizes user safety and therapeutic value
- **Type Safety**: Strict TypeScript enforcement prevents runtime errors
- **Component Composition**: Reusable, testable components following atomic design
- **State Management**: Centralized Zustand store with persistence
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: WCAG 2.1 AA compliance throughout

---

## Technology Stack

### Frontend Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI framework with hooks and concurrent features |
| **TypeScript** | 5.3+ | Static typing and IDE support |
| **Vite** | 6.3+ | Build tool with HMR and optimized bundling |
| **React Router** | 6.22+ | Client-side routing with lazy loading |
| **Zustand** | 5.0+ | Lightweight state management |
| **Tailwind CSS** | 3.4+ | Utility-first styling system |
| **shadcn/ui** | Latest | Accessible component library (Radix UI) |
| **Framer Motion** | 12.18+ | Animation and transitions |

### Backend & Database

| Service | Purpose |
|---------|---------|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth + Storage) |
| **PostgreSQL** | Relational database with JSONB support |
| **Row Level Security** | Database-level authorization |
| **Supabase Auth** | Email/password + social authentication |
| **Real-time** | Live data synchronization (planned) |

### Development & Quality

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality enforcement |
| **Prettier** | Code formatting consistency |
| **Vitest** | Unit and integration testing (370+ tests) |
| **Testing Library** | React component testing |
| **jest-axe** | Accessibility testing |
| **Lighthouse** | Performance auditing |

---

## Project Structure

```
luminaris-quest/
├── src/
│   ├── components/       # React components (atomic design)
│   │   ├── atoms/        # Basic building blocks (ImpactfulImage, etc.)
│   │   ├── combat/       # Combat UI components (DEPRECATED - old system)
│   │   ├── layout/       # Navigation, layout components
│   │   ├── organisms/    # Complex components (AudioPlayer)
│   │   ├── auth/         # Authentication components
│   │   └── ui/           # shadcn/ui component library
│   │
│   ├── pages/            # Route components
│   │   ├── Home.tsx      # Landing + authentication
│   │   ├── Adventure.tsx # Main gameplay interface
│   │   ├── Progress.tsx  # Stats and journal viewing
│   │   └── Profile.tsx   # User settings
│   │
│   ├── features/         # Feature modules (new architecture)
│   │   └── combat/       # NEW combat system (mobile-first rebuild)
│   │
│   ├── engine/           # Core game logic (pure functions)
│   │   ├── combat-engine.ts    # Combat mechanics
│   │   ├── scene-engine.ts     # Story progression
│   │   └── combat-balance.ts   # Balance testing
│   │
│   ├── store/            # State management
│   │   └── game-store.ts # Zustand store (single source of truth)
│   │
│   ├── hooks/            # Custom React hooks (10 hooks)
│   │   ├── useCombat.ts           # Combat interface
│   │   ├── use-auto-save.ts       # Auto-save logic
│   │   ├── use-mobile.tsx         # Responsive detection
│   │   ├── useCombatSounds.ts     # Audio integration
│   │   └── useImpactfulImage.ts   # Image optimization
│   │
│   ├── integrations/     # External services
│   │   └── supabase/
│   │       ├── client.ts # Supabase configuration
│   │       └── types.ts  # Database type definitions
│   │
│   ├── data/             # Static game data
│   │   ├── scenes.ts              # 20 therapeutic scenarios
│   │   ├── shadowManifestations.ts # Combat enemies
│   │   ├── audioPlaylist.ts       # Music tracks
│   │   └── imageRegistry.ts       # Optimized images
│   │
│   ├── lib/              # Utilities and helpers
│   │   ├── database-health.ts     # DB monitoring
│   │   ├── environment.ts         # Env detection
│   │   ├── performance-monitoring.ts
│   │   └── utils.ts               # Common utilities
│   │
│   ├── __tests__/        # Test suites (68+ files)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── engine/
│   │   └── integration/
│   │
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
│
├── docs/                 # Documentation (this file!)
├── public/               # Static assets
├── supabase/             # Database migrations
├── scripts/              # Build and utility scripts
└── config files          # TS, Vite, Tailwind, ESLint, etc.
```

---

## Architectural Patterns

### 1. Atomic Design (Component Architecture)

**Hierarchy:**
```
Atoms (smallest)
  ↓
Molecules (combinations of atoms)
  ↓
Organisms (complex UI sections)
  ↓
Templates (page layouts)
  ↓
Pages (full routes)
```

**Example Flow:**
```typescript
// Atom: Basic button
<Button>Click me</Button>

// Molecule: Button with icon
<IconButton icon={<Star />}>Favorite</IconButton>

// Organism: Stats bar with multiple buttons
<StatsBar trust={50} energy={75} />

// Page: Adventure page with organisms
<Adventure>
  <StatsBar />
  <ChoiceList />
  <AudioPlayer />
</Adventure>
```

**Benefits:**
- Reusability across features
- Easier testing of small units
- Clear component boundaries
- Simplified maintenance

### 2. Container/Presenter Pattern

**Containers (Smart Components):**
- Connect to Zustand store
- Handle business logic
- Manage side effects
- Pass data to presenters

**Presenters (Dumb Components):**
- Receive props only
- Pure rendering logic
- No side effects
- Highly reusable

**Example:**
```typescript
// Container: Adventure.tsx
export function Adventure() {
  const { guardianTrust, setGuardianTrust } = useGameStore();
  const handleTrustChange = (delta: number) => {
    setGuardianTrust(guardianTrust + delta);
  };
  
  return <ChoiceList onTrustChange={handleTrustChange} />;
}

// Presenter: ChoiceList.tsx
export function ChoiceList({ onTrustChange }: Props) {
  return (
    <div>
      <button onClick={() => onTrustChange(5)}>Good Choice</button>
    </div>
  );
}
```

### 3. Custom Hooks Pattern

**Purpose:** Extract reusable logic from components

**Categories:**
1. **State Hooks**: `useGameStore()`, `useCombatStore()`
2. **Effect Hooks**: `use-auto-save`, `use-health-monitoring`
3. **Derived State**: `useCombat()`, `useImpactfulImage()`
4. **Utility Hooks**: `use-mobile()`, `use-toast()`

**Benefits:**
- Logic reuse across components
- Easier testing of isolated logic
- Cleaner component code
- Better separation of concerns

### 4. Engine Pattern (Pure Functions)

**Core Concept:** Game logic as pure, testable functions

```typescript
// Pure function: No side effects, deterministic
export function calculateIlluminateDamage(guardianTrust: number): number {
  const baseDamage = 3;
  const trustBonus = Math.floor(guardianTrust / 4);
  return baseDamage + trustBonus;
}

// Input: 50 → Output: 15 (always)
// Input: 75 → Output: 21 (always)
// No database calls, no state mutations, no randomness
```

**Benefits:**
- Easy to test (no mocks needed)
- Predictable behavior
- No hidden dependencies
- Portable across environments

---

## Data Flow Architecture

### Unidirectional Data Flow

```
User Interaction (Event)
         ↓
   Event Handler (Component)
         ↓
   Action Dispatch (Store)
         ↓
   State Update (Zustand)
         ↓
   Re-render (React)
         ↓
   Updated UI (Component)
```

**Example: Scene Completion**
```typescript
1. User clicks "Bold Choice" button
   ↓
2. ChoiceList calls handleChoice()
   ↓
3. Roll dice, calculate outcome
   ↓
4. setGuardianTrust(newTrust) dispatched to store
   ↓
5. Zustand updates guardianTrust state
   ↓
6. React detects state change
   ↓
7. Components re-render with new trust value
   ↓
8. UI shows updated trust bar
```

### State Management Layers

**Layer 1: Component State (useState)**
- UI-only state (modal open/closed, form values)
- Not persisted
- Local to component

**Layer 2: Zustand Store**
- Game state (trust, resources, progress)
- Persisted to localStorage
- Shared across components

**Layer 3: Database (Supabase)**
- Long-term persistence
- Cross-device sync
- Backup and recovery

**Sync Flow:**
```
Component State → Zustand Store → localStorage
                         ↓
                   (auto-save)
                         ↓
                  Supabase Database
```

---

## Security Architecture

### Authentication Flow

```
1. User submits email + password
   ↓
2. Supabase Auth validates credentials
   ↓
3. JWT token issued (short-lived)
   ↓
4. Token stored in secure HTTP-only cookie
   ↓
5. All API requests include token
   ↓
6. Server validates token + RLS policies
   ↓
7. Data returned only if authorized
```

### Row Level Security (RLS)

**Policy Structure:**
```sql
-- Example: Journal entries table
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own journal entries" 
ON journal_entries
FOR SELECT 
USING (auth.uid() = user_id);

-- Enforced at database level (cannot be bypassed from client)
```

**Benefits:**
- Database-level security
- Prevents horizontal privilege escalation
- No reliance on application logic
- Automatic enforcement

### Data Protection

**In Transit:**
- HTTPS/TLS 1.3 encryption
- Secure WebSocket connections (planned)
- API key rotation

**At Rest:**
- PostgreSQL encryption
- Encrypted backups
- Secure key storage (environment variables)

**Client-Side:**
- No sensitive data in localStorage (only game state)
- JWT tokens in secure cookies
- No API keys in client code

---

## Performance Architecture

### Code Splitting Strategy

```typescript
// Route-based splitting (lazy loading)
const Adventure = lazy(() => import('./pages/Adventure'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));

// Bundle sizes:
- Main bundle: ~150 KB (gzipped)
- Adventure chunk: ~80 KB (lazy loaded)
- Progress chunk: ~40 KB (lazy loaded)
- Profile chunk: ~30 KB (lazy loaded)
```

**Benefits:**
- Faster initial page load
- Load only what's needed
- Better caching
- Improved Core Web Vitals

### Image Optimization

```typescript
// Multi-format strategy
const image = {
  src: '/images/hero.jpg',         // Fallback (JPEG)
  avif: '/images/hero.avif',       // Best compression
  webp: '/images/hero.webp',       // Good compression
  alt: 'Hero image',
  aspectRatio: 16/9,
  priority: true                   // Preload for LCP
};

// Browser selects best format:
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero image" loading="eager" />
</picture>
```

**Savings:**
- AVIF: 50-80% smaller than JPEG
- WebP: 30-50% smaller than JPEG
- Lazy loading for below-fold images

### State Optimization

```typescript
// Selective subscriptions (only re-render when needed)
// Bad: Component re-renders on ANY state change
const state = useGameStore();

// Good: Component re-renders only when trust changes
const guardianTrust = useGameStore(state => state.guardianTrust);
```

**Zustand Auto-Optimization:**
- Shallow equality checks
- Only changed selectors trigger re-renders
- No unnecessary component updates

---

## Testing Architecture

### Testing Pyramid

```
     /\
    /E2E\          (10% - End-to-end tests)
   /------\
  /Integr.\       (30% - Integration tests)
 /----------\
/ Unit Tests \    (60% - Unit tests)
--------------
```

**Test Distribution:**
- **370+ total tests**
- Unit: ~220 tests (components, hooks, engines)
- Integration: ~110 tests (data flow, API)
- E2E: ~40 tests (critical user paths)

### Test Categories

**1. Component Tests**
```typescript
// Example: JournalModal.test.tsx
describe('JournalModal', () => {
  it('validates minimum content length', () => {
    render(<JournalModal isOpen={true} />);
    fireEvent.change(textarea, { target: { value: 'short' } });
    expect(screen.getByText(/at least 10 characters/)).toBeInTheDocument();
  });
});
```

**2. Hook Tests**
```typescript
// Example: useCombat.test.ts
describe('useCombat', () => {
  it('calculates correct ILLUMINATE damage', () => {
    const { result } = renderHook(() => useCombat());
    const damage = result.current.calculateDamage('ILLUMINATE', 50);
    expect(damage).toBe(15); // 3 base + floor(50/4) = 15
  });
});
```

**3. Engine Tests**
```typescript
// Example: combat-engine.test.ts
describe('calculateIlluminateDamage', () => {
  it('scales damage with guardian trust', () => {
    expect(calculateIlluminateDamage(0)).toBe(3);
    expect(calculateIlluminateDamage(50)).toBe(15);
    expect(calculateIlluminateDamage(100)).toBe(28);
  });
});
```

**4. Accessibility Tests**
```typescript
// Example: Adventure.a11y.test.tsx
it('has no accessibility violations', async () => {
  const { container } = render(<Adventure />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Deployment Architecture

### Build Process

```bash
1. Source Code (TypeScript + React)
   ↓
2. Type Checking (tsc --noEmit)
   ↓
3. Linting (ESLint)
   ↓
4. Testing (Vitest - 370+ tests)
   ↓
5. Building (Vite)
   ↓
6. Optimization (minification, tree-shaking, code splitting)
   ↓
7. Asset Generation (gzip, brotli compression)
   ↓
8. Deployment (Netlify)
```

### Environment Strategy

| Environment | Purpose | Database | Branch |
|-------------|---------|----------|--------|
| **Development** | Local testing | Local/Supabase dev | feature/* |
| **Staging** | Pre-production testing | Supabase staging | develop |
| **Production** | Live application | Supabase production | main |

**Configuration:**
```env
# Development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_DEBUG_MODE=true

# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_DEBUG_MODE=false
```

### CDN & Caching Strategy

**Static Assets:**
- Images: Cache for 1 year (immutable)
- JS/CSS: Cache for 1 year (hash-based filenames)
- HTML: No cache (always fresh)

**API Responses:**
- Game state: No cache (real-time)
- Static data (scenes, shadows): Cache for 1 hour
- Images: Cache for 1 week

---

## Scalability Considerations

### Current Scale

**Metrics:**
- Users: Hundreds (small scale)
- Database: ~2 tables, <10,000 rows
- Storage: ~100 MB (images, audio)
- Bandwidth: ~500 GB/month

### Growth Strategy

**Phase 1: 1,000 users**
- Current architecture sufficient
- No changes needed

**Phase 2: 10,000 users**
- Add database indexes
- Implement query caching
- CDN for all assets

**Phase 3: 100,000+ users**
- Horizontal database scaling
- Microservices for AI features
- Redis caching layer
- Load balancing

---

## Future Architecture

### Planned Enhancements

**1. Offline Support**
```typescript
// Service Worker + IndexedDB
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Cache game state locally
// Sync when online
```

**2. Real-Time Features**
```typescript
// Supabase real-time subscriptions
supabase
  .channel('game-state')
  .on('postgres_changes', { event: 'UPDATE' }, (payload) => {
    // Update UI in real-time
  })
  .subscribe();
```

**3. AI Integration**
```typescript
// OpenAI GPT-4 for dynamic narratives
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'system', content: promptTemplate }],
});
```

**4. Analytics Dashboard**
```typescript
// Track therapeutic progress
// Visualize growth patterns
// Generate insights
```

---

## Design Principles Summary

### 1. **Therapeutic Safety First**
- All features reviewed for psychological impact
- Failure is framed as learning
- No punishing mechanics

### 2. **Accessibility by Default**
- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader support

### 3. **Performance Matters**
- <2s page load (target)
- <100ms interaction response
- 60 FPS animations

### 4. **Type Safety Everywhere**
- Strict TypeScript mode
- No `any` types (enforced by linter)
- Full type coverage

### 5. **Test-Driven Quality**
- 370+ automated tests
- 80%+ code coverage
- CI/CD integration

---

## Related Documentation

- [State Management](./state-management.md)
- [Database Schema](./database.md)
- [Component Map](./components.md)
- [API Documentation](../api/index.md)
- [Testing Guide](../guides/testing.md)

---

*Last Updated: 2025-11-17*  
*Verified Against: package.json v0.1.1, src/ directory structure*

