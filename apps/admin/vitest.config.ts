import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: false,
    environment: 'jsdom',
    include: ['src/tests/**/*.test.{ts,tsx}'],
    setupFiles: ['src/tests/setup.ts'],
  },
});
