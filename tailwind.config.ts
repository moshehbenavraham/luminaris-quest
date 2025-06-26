
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
        colors: {
          // Brand Colors
          primary: {
            DEFAULT: '#865DFF',
            50: '#F3F0FF',
            100: '#E6DCFF',
            500: '#865DFF',
            600: '#7C4DFF',
            700: '#6B46C1',
            foreground: '#F7F8FA',
          },
          accent: {
            DEFAULT: '#00FFD0',
            50: '#E6FFFA',
            100: '#B3FFF0',
            500: '#00FFD0',
            600: '#00E6BB',
            foreground: '#272940',
          },
          neutral: {
            50: '#F7F8FA',
            100: '#ECECFF',
            200: '#D6DBF5',
            400: '#9196B3',
            800: '#272940',
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
          // Combat-specific colors
          combat: {
            backdrop: 'rgba(0, 0, 0, 0.8)',
            card: {
              DEFAULT: 'rgba(30, 30, 40, 0.95)',
              hover: 'rgba(40, 40, 50, 0.95)',
            },
            text: {
              DEFAULT: '#ffffff',
              muted: 'rgba(255, 255, 255, 0.8)',
              damage: '#ff4444',
              heal: '#00ff88',
              critical: '#ffd700',
              mana: '#4488ff',
            },
          },
        },
        fontFamily: {
          'heading': ['Roboto', 'Arial', 'sans-serif'],
          'body': ['Arial', 'system-ui', 'sans-serif'],
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
          'glass': '0 8px 32px rgba(134, 93, 255, 0.1)',
          'glass-hover': '0 12px 40px rgba(134, 93, 255, 0.2)',
          'primary': '0 4px 15px rgba(134, 93, 255, 0.3)',
          'primary-hover': '0 8px 25px rgba(134, 93, 255, 0.4)',
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          "fade-in": {
            "0%": {
              opacity: "0",
              transform: "translateY(10px)"
            },
            "100%": {
              opacity: "1",
              transform: "translateY(0)"
            }
          },
          "slide-up": {
            "0%": {
              opacity: "0",
              transform: "translateY(20px)"
            },
            "100%": {
              opacity: "1",
              transform: "translateY(0)"
            }
          },
          "glow": {
            "0%": {
              boxShadow: "0 0 20px rgba(134, 93, 255, 0.3)"
            },
            "100%": {
              boxShadow: "0 0 30px rgba(134, 93, 255, 0.6)"
            }
          },
          "combat-fade-in": {
            "0%": {
              opacity: "0"
            },
            "100%": {
              opacity: "1"
            }
          },
          "combat-slide-up": {
            "0%": {
              opacity: "0",
              transform: "translateY(20px)"
            },
            "100%": {
              opacity: "1",
              transform: "translateY(0)"
            }
          },
          "damage-float": {
            "0%": {
              opacity: "1",
              transform: "translateY(0)"
            },
            "100%": {
              opacity: "0",
              transform: "translateY(-30px)"
            }
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "fade-in": "fade-in 0.3s ease-out",
          "slide-up": "slide-up 0.4s ease-out",
          "glow": "glow 2s ease-in-out infinite alternate",
          "combat-fade-in": "combat-fade-in 0.3s ease-out",
          "combat-slide-up": "combat-slide-up 0.3s ease-out",
          "damage-float": "damage-float 1s ease-out",
        },
      },
    },
    plugins: [animate],
} satisfies Config
