import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Ember Hearth Color Palette (Primary Brand)
        ember: {
          gold: '#e8a87c',
          rose: '#c4918a',
          sage: '#8ba888',
          lavender: '#a89bc4',
        },
        hearth: {
          deep: '#151118',
          mid: '#1e1a21',
          surface: '#2a252e',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          muted: '#d4cfc6',
        },
        taupe: '#a89b94',
        // Legacy Brand Colors (kept for compatibility, use ember colors for new UI)
        primary: {
          DEFAULT: '#e8a87c', // Updated to ember-gold
          50: '#fdf8f4',
          100: '#f9ede4',
          500: '#e8a87c',
          600: '#d99565',
          700: '#c4785a',
          foreground: '#151118',
        },
        accent: {
          DEFAULT: '#8ba888', // Updated to ember-sage
          50: '#f4f7f3',
          100: '#e5ede3',
          500: '#8ba888',
          600: '#769573',
          foreground: '#151118',
        },
        neutral: {
          50: '#f5f0e8',
          100: '#e8e3db',
          200: '#d4cfc6',
          400: '#a89b94',
          800: '#2a252e',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        // Semantic status colors - used app-wide for status indicators
        // (combat damage/healing, player stats, system health, choice indicators, etc.)
        // All colors verified for WCAG AA compliance (4.5:1 minimum on card backgrounds)
        status: {
          danger: '#ff5555', // Red - damage, errors, danger states (4.76:1)
          success: '#00ff88', // Green - healing, success, ok states (11.17:1)
          warning: '#ffd700', // Gold - critical hits, warnings, special states (10.68:1)
          info: '#5599ff', // Blue - mana, info, special indicators (5.27:1)
        },
        // Combat-specific colors (only for combat UI styling)
        combat: {
          backdrop: 'rgba(0, 0, 0, 0.8)',
          card: {
            DEFAULT: 'rgba(30, 30, 40, 0.95)',
            hover: 'rgba(40, 40, 50, 0.95)',
          },
          text: {
            DEFAULT: '#ffffff',
            muted: 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      fontFamily: {
        display: ['"Libre Baskerville"', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        'combat-backdrop': '100',
        'combat-content': '101',
        'combat-modal': '102',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Ember Hearth shadows (warm gold tones)
        glass: '0 8px 32px rgba(232, 168, 124, 0.08)',
        'glass-hover': '0 12px 40px rgba(232, 168, 124, 0.15)',
        primary: '0 4px 15px rgba(232, 168, 124, 0.25)',
        'primary-hover': '0 8px 25px rgba(232, 168, 124, 0.35)',
        ember: '0 0 24px rgba(232, 168, 124, 0.2)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        glow: {
          '0%': {
            boxShadow: '0 0 20px rgba(232, 168, 124, 0.25)',
          },
          '100%': {
            boxShadow: '0 0 30px rgba(232, 168, 124, 0.5)',
          },
        },
        'combat-fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'combat-slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'damage-float': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        'combat-fade-in': 'combat-fade-in 0.3s ease-out',
        'combat-slide-up': 'combat-slide-up 0.3s ease-out',
        'damage-float': 'damage-float 1s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
