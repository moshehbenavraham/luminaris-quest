---
trigger: always_on
---

---
description: 
globs: 
alwaysApply: true
---
---
description: Standards for integrating Sidebar into the main layout.
globs: ["src/components/Layout.tsx"]
alwaysApply: true
---

- Integrate Sidebar into the main layout, rendering on every page except authentication routes.
- Position Navbar at the top, Sidebar on the left (for desktop), and Footer at the bottom.
- Ensure the content area flexibly fills available space and remains responsive across all breakpoints.
- Follow component design standards in .bolt/prompt and coding quality rules in eslint.config.js.
- Reference components.json for Shadcn/UI component configuration and tailwind.config.ts for styling standards.

