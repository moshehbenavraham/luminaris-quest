import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  },
});
