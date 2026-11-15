import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: false,
    environment: 'node',
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
});
