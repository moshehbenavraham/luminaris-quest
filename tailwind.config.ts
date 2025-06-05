// Tailwind CSS configuration for Luminari's Quest
// Cross-references: .bolt/prompt (styling standards), .cursor/rules/ (component guidelines),
// components.json (Shadcn/UI integration), CONTRIBUTING.md (code style requirements)

import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: ["class"],
    theme: {
      extend: {
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [animate],
} satisfies Config  