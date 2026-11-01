import { config } from 'dotenv';

config({ path: '../../.env' });

import { drizzle } from 'drizzle-orm/node-postgres';

import { seedAll } from './seedAll';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

void seedAll(db);
