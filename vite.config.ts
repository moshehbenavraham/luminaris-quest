import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '::',
    port: 8080,
    hmr: {
      clientPort: 8080,
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      // Suppress warnings
      onwarn(warning, warn) {
        // Suppress "Generated an empty chunk" warnings
        if (warning.code === 'EMPTY_BUNDLE') return;
        // Suppress pure comment warnings from next-themes
        if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('/*#__PURE__*/'))
          return;
        // Show other warnings
        warn(warning);
      },
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI utility libraries
          'ui-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge'],

          // Radix UI components (large bundle)
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],

          // Backend and data libraries
          'data-vendor': ['@supabase/supabase-js', 'zustand'],

          // Form and interaction libraries
          'form-vendor': ['react-hook-form', 'react-day-picker', 'input-otp'],

          // Animation and media libraries
          'media-vendor': ['framer-motion', 'react-h5-audio-player', 'embla-carousel-react'],

          // Chart and visualization libraries
          'chart-vendor': ['recharts'],

          // AI and external services
          'ai-vendor': ['openai'],

          // Additional UI components
          'component-vendor': ['cmdk', 'sonner', 'vaul', 'react-resizable-panels'],

          // Theme and styling
          'theme-vendor': ['next-themes', 'tailwindcss-animate'],

          // Icons
          'icon-vendor': ['lucide-react'],
        },
      },
    },
  },
  // Add this to help with platform-specific dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
