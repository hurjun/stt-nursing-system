import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Vitest configuration kept separate from vite.config.ts so the app build is
// not coupled to the test runner. Tests cover pure domain logic (clinical
// scoring, formatting, rounding normalization, CER, the store and the data
// generators), none of which need a DOM — so the lightweight `node`
// environment is used.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/store/**', 'src/data/**'],
      reporter: ['text', 'html'],
    },
  },
});
