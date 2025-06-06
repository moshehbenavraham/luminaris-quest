
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
        },
        fontFamily: {
          'heading': ['Roboto', 'Arial', 'sans-serif'],
          'body': ['Arial', 'system-ui', 'sans-serif'],
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
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
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "fade-in": "fade-in 0.3s ease-out",
          "slide-up": "slide-up 0.4s ease-out",
          "glow": "glow 2s ease-in-out infinite alternate",
        },
      },
    },
    plugins: [animate],
} satisfies Config
