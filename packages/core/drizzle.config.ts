import 'dotenv/config';

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '../../.env' });

export default defineConfig({
  out: './drizzle',
  schema: ['./src/db/!(index).ts', './src/features/**/!(index|authAdapter).ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
