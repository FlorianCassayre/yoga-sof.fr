import { config as dotenvConfig } from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenvConfig({ path: new URL('../../.env', import.meta.url) });

if (process.env.DATABASE_INTEGRATION_TEST_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_INTEGRATION_TEST_URL;
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
});
