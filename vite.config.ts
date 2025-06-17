import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  server: {
    host: "::",
    port: 8080,
    hmr: {
      clientPort: 8080,
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge'],
        }
      }
    }
  },
  // Add this to help with platform-specific dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
})
