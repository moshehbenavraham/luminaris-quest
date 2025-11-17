// Built with Bolt.new
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths({
    projects: ['./tsconfig.json', './tsconfig.test.json']
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './config/vitest.setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  },
});
