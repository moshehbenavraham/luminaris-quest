All core app logic and UI were built primarily in Bolt.new

# Luminari's Quest · Component Map (MVP slices, top priority first)

> **Cross-References:** This roadmap follows build standards in `.bolt/prompt` and component guidelines in `.cursor/rules/`. For code quality standards, see `eslint.config.js`, `tsconfig.*.json`, and `../contributing/index.md`.

## ✅ Completed Components & Features

| Component/Feature | Status | Implementation Details |
|-------------------|--------|----------------------|
| **Project Scaffold** | ✅ Complete | React + TS via Vite, Tailwind, Shadcn/UI, `.bolt\prompt`, `.env.example`, MIT+OGL licenses |
| **Core Layout Shell** | ✅ Complete | `<Navbar />`, `<Sidebar />`, `<Footer />` with responsive design and proper navigation |
| **Page Component Architecture** | ✅ Complete | Extracted from `App.tsx`: `Home.tsx`, `Adventure.tsx`, `Progress.tsx`, `Profile.tsx` |
| **Auth Module** | ✅ Complete | `/login` & `/signup` routes with Supabase integration and protected routes |
| **Supabase Client Setup** | ✅ Complete | Full client configuration in `src/integrations/supabase/` with TypeScript types |
| **Game State Store** | ✅ Complete | Zustand with persistence, hydration safety, and milestone tracking |
| **Journal System** | ✅ Enhanced | Full CRUD operations with `JournalEntryCard` component |
| **Guardian Trust System** | ✅ Complete | Core mechanic with milestone achievements and progress tracking |
| **Scene Engine** | ✅ Complete | Therapeutic gameplay with dice mechanics and choice system |
| **Legal Compliance** | ✅ Complete | Comprehensive legal pages with tabbed interface |

### 🧩 Atomic Components

| Component | Status | Implementation Details |
|-----------|--------|----------------------|
| **ImpactfulImage** | ✅ Complete | Performance-optimized image component with WebP/AVIF support, LCP optimization, mobile-first design, and WCAG 2.1 AA compliance |

## 🔧 Recent Enhancements

### Journal System Improvements
- **JournalEntryCard Component**: Full CRUD functionality
  - Inline editing with save/cancel
  - Delete confirmation dialogs
  - Visual distinction between milestone and learning entries
  - Edit history tracking with timestamps
  - Proper TypeScript interfaces

### Code Quality & Architecture
- **TypeScript Compilation**: All errors resolved
- **Component Structure**: Clean separation of concerns with dedicated page files
- **ESLint Configuration**: Updated with browser globals and strict typing
- **Code Formatting**: Consistent Prettier formatting across all files

### State Management
- **Hydration Safety**: Prevents SSR/client mismatches
- **Milestone Deduplication**: Prevents runaway state growth
- **Journal Entry Limits**: Maintains performance with entry limits
- **Persistence**: Local storage with planned Supabase sync

## 🚧 In Progress / Planned Features

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| **Supabase Journal Sync** | High | Planned | Save/load journal entries to user profile |
| **AI Narrative Generation** | Medium | Planned | OpenAI integration for dynamic storytelling |
| **Leonardo Image Integration** | Medium | Planned | Dynamic art generation for story moments |
| **ElevenLabs Voice** | Low | Planned | TTS for immersive narration |
| **Music Player** | Low | Planned | Suno-generated background music |
| **Advanced Journal Features** | Medium | Planned | Tags, search, categories, export |

## 📊 Component Relationships

```
App.tsx
├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx (Navigation to all pages)
│   └── Footer.tsx
├── Pages/
│   ├── Home.tsx (Auth integration + ImpactfulImage)
│   ├── Adventure.tsx (ImpactfulImage integration)
│   │   ├── ChoiceList.tsx
│   │   ├── GuardianText.tsx
│   │   └── JournalModal.tsx
│   ├── Progress.tsx (ImpactfulImage integration)
│   │   └── JournalEntryCard.tsx ✨ (New CRUD functionality)
│   ├── Profile.tsx (ImpactfulImage integration)
│   └── Legal.tsx
├── Components/
│   └── atoms/
│       └── ImpactfulImage.tsx ✨ (Performance-optimized images)
├── Hooks/
│   └── useImpactfulImage.ts ✨ (Responsive image selection)
├── Data/
│   └── imageRegistry.ts ✨ (Centralized image assets)
└── Store/
    └── game-store.ts (Zustand with persistence)
```

## 🖼️ ImpactfulImage Component Details

### Component Interface
```typescript
interface ImpactfulImageProps {
  src: string;               // Image path
  alt: string;               // Accessible description
  ratio?: number;            // Aspect ratio (e.g. 16/9)
  priority?: boolean;        // true ⇒ eager loading + fetchpriority=high
  className?: string;        // Custom styling
  fallback?: string;         // Fallback image path if main fails
  blurDataUrl?: string;      // Base64 tiny placeholder for progressive loading
  objectPosition?: string;   // Control focus point (e.g., "center top")
}
```

### Key Features
- **Performance Optimization**: WebP/AVIF format support with automatic browser detection
- **LCP Optimization**: Priority loading for above-the-fold images
- **Mobile-First Design**: Responsive sizing with proper aspect ratio maintenance
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA attributes
- **Progressive Loading**: Blur-up pattern with base64 placeholders
- **Error Handling**: Graceful fallback to alternative image sources
- **TypeScript**: Fully typed with comprehensive prop validation

### Usage Examples
```tsx
// Basic usage with image registry
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

<ImpactfulImage
  src={imageRegistry.homeHero.avif || imageRegistry.homeHero.src}
  alt={imageRegistry.homeHero.alt}
  ratio={imageRegistry.homeHero.aspectRatio}
  priority={true}
  fallback={imageRegistry.homeHero.fallback}
  className="rounded-lg shadow-lg"
/>

// Advanced usage with hook
import { useOptimizedImageSrc } from '@/hooks/useImpactfulImage';

const optimizedSrc = useOptimizedImageSrc(imageRegistry.adventureHero);
<ImpactfulImage src={optimizedSrc} alt="Adventure scene" ratio={16/9} />
```

### Integration Status
- ✅ **Home.tsx**: Hero section with priority=true for LCP optimization
- ✅ **Adventure.tsx**: Top-of-fold positioning with responsive styling
- ✅ **Progress.tsx**: Optimized placement with border styling
- ✅ **Profile.tsx**: Circular profile image with mobile-first design
- ✅ **Test Coverage**: 29 comprehensive unit tests with 100% pass rate
- ✅ **Documentation**: Complete hook documentation in `docs/archive/useImpactfulImage.md`

## 🎯 Development Standards Met

- ✅ **TypeScript**: Strict typing with proper interfaces
- ✅ **Component Size**: All components under 250 lines
- ✅ **Atomic Design**: Clear separation of atoms, molecules, organisms
- ✅ **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- ✅ **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- ✅ **Error Handling**: Graceful fallbacks and error boundaries
- ✅ **Code Quality**: ESLint + Prettier configuration enforced

---

_Last updated: 2025-06-22 - ImpactfulImage component documentation added with comprehensive usage examples and integration details_

