# Architecture

**Navigation:** [← Back to Documentation Index](../INDEX.md)

Welcome to the Luminaris Quest architecture documentation! These documents describe the system design, technical architecture, and architectural patterns used throughout the project.

---

## 📐 System Design Principles

Luminaris Quest is built on these core architectural principles:

1. **Component-Based Architecture** - Modular, reusable React components following Atomic Design
2. **Type Safety** - Comprehensive TypeScript usage with strict type checking
3. **Separation of Concerns** - Clear boundaries between UI, logic, and data layers
4. **State Management** - Centralized Zustand store with selective persistence
5. **Performance First** - Optimized rendering, lazy loading, and efficient state updates
6. **Accessibility** - WCAG 2.1 AA compliance target
7. **Mobile-First** - Responsive design optimized for touch interfaces
8. **Security by Default** - Row Level Security, input validation, secure authentication

---

## 📚 Architecture Documentation

### System Overview

- **[Overview](overview.md)** - Complete system architecture documentation
  - Technology stack with version numbers
  - Project structure and organization
  - Architectural patterns and principles
  - Data flow and component hierarchy
  - Performance and optimization strategies
  - Testing architecture

### Core Systems

- **[Components](components.md)** - Component architecture and map
  - Component hierarchy and organization
  - Atomic Design implementation
  - Component responsibilities
  - Reusable UI components (shadcn/ui)
  - Container/Presenter patterns

- **[Database](database.md)** - Database schema and design
  - PostgreSQL schema via Supabase
  - Table structures and relationships
  - Row Level Security (RLS) policies
  - Indexes and performance optimization
  - Migration strategy

- **[State Management](state-management.md)** - Application state architecture
  - Zustand store design (70+ state fields)
  - State organization and structure
  - Persistence strategy (3-layer approach)
  - Hydration safety and SSR handling
  - Performance optimization techniques
  - Auto-save system implementation

- **[Environments](environments.md)** - Deployment and infrastructure architecture
  - Environment configurations (development, staging, production)
  - Infrastructure setup
  - CI/CD pipelines
  - Monitoring and logging
  - Performance optimization

---

## 🏗️ Technology Stack

**Frontend:**
- React 18 (UI framework)
- TypeScript 5 (type safety)
- Vite 5 (build tool)
- Tailwind CSS (styling)
- shadcn/ui (component library)

**State Management:**
- Zustand (global state)
- React Query / TanStack Query (server state)
- React Context (theme, localization)

**Backend:**
- Supabase (Backend-as-a-Service)
- PostgreSQL (database)
- Row Level Security (data security)
- Realtime subscriptions (live updates)

**Testing:**
- Vitest (unit/integration tests)
- React Testing Library (component tests)
- Playwright (E2E tests - planned)

**DevOps:**
- GitHub Actions (CI/CD)
- Netlify/Vercel (hosting options)
- Supabase Cloud (managed backend)

---

## 🎯 Architectural Patterns

### Component Architecture

**Atomic Design Pattern:**
```
Atoms → Molecules → Organisms → Templates → Pages
```

**Container/Presenter Pattern:**
- **Containers:** Handle logic, state, and data fetching
- **Presenters:** Pure UI components with props

### State Management Pattern

**Three-Layer Persistence:**
1. **Session Storage** - Short-term, tab-specific state
2. **Local Storage** - Long-term, cross-session state
3. **Database** - Persistent, cross-device state

### Data Flow Pattern

```
User Action → Component → Hook → Store/API → Update → Re-render
```

---

## 📊 Architecture Diagrams

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Interface                  │
│         (React Components + Tailwind)            │
├─────────────────────────────────────────────────┤
│              State Management Layer              │
│        (Zustand Store + React Hooks)             │
├─────────────────────────────────────────────────┤
│               Business Logic Layer               │
│      (Game Engine + Scene Engine + Combat)       │
├─────────────────────────────────────────────────┤
│              Data Integration Layer              │
│         (Supabase Client + API Hooks)            │
├─────────────────────────────────────────────────┤
│                Backend Services                  │
│   (Supabase: Auth + Database + Realtime + RLS)  │
└─────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Router
│   ├── Home Page
│   ├── Adventure Page
│   │   ├── Scene Engine
│   │   └── Combat System
│   ├── Progress Page
│   │   ├── Journal
│   │   └── Guardian Trust
│   └── Profile Page
│       └── User Settings
└── Providers
    ├── Theme Provider
    ├── Auth Provider
    └── State Provider
```

---

## 🔍 Quick Reference

**For Understanding the System:**
1. Start with **[Overview](overview.md)** for the big picture
2. Review **[Components](components.md)** to understand UI structure
3. Read **[State Management](state-management.md)** to understand data flow

**For Database Work:**
1. Refer to **[Database](database.md)** for schema and relationships
2. Check security policies and RLS implementation
3. Review migration procedures

**For Deployment:**
1. Read **[Environments](environments.md)** for infrastructure setup
2. Follow **[Deployment Guide](../guides/deployment.md)** for procedures

---

## 🔗 Related Documentation

- **[API Reference](../api/)** - Code-level API documentation
- **[Features](../features/)** - Feature-specific implementations
- **[Guides](../guides/)** - Practical how-to guides
- **[Contributing](../contributing/)** - Development guidelines

---

## 📝 Architecture Documentation Standards

All architecture documents follow these standards:

- **Accuracy:** Verified against actual implementation (code is truth)
- **Diagrams:** Include visual representations where helpful
- **Code Examples:** Real examples from the codebase with line references
- **Rationale:** Explain *why* architectural decisions were made
- **Trade-offs:** Document pros/cons of architectural choices
- **Evolution:** Track how architecture has changed over time

---

## 🔄 Architecture Evolution

**Current Version:** v2.0  
**Major Changes:**
- Migrated from legacy combat system to feature-based combat (v2.0)
- Added comprehensive state management with Zustand (v1.5)
- Implemented three-layer persistence strategy (v1.4)
- Added Row Level Security (v1.3)

See **[Roadmap](../contributing/roadmap.md)** for planned architectural improvements.

---

## 💡 Contributing to Architecture

When proposing architectural changes:

1. **Research:** Understand the current architecture thoroughly
2. **Justify:** Explain why the change is needed (problems it solves)
3. **Design:** Provide detailed design with diagrams
4. **Trade-offs:** Analyze pros/cons and alternatives
5. **Migration:** Plan migration path from current to proposed architecture
6. **Document:** Update architecture docs with the change

See **[Contributing Guidelines](../contributing/index.md)** for more details.

---

**Last Updated:** 2025-11-17
**Maintained By:** Luminaris Quest Architecture Team
**Architecture Version:** v2.0

