import { config } from 'dotenv';

config({ path: '../../.env' });

import { truncateDatabase } from '@yoga-sof/core/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import { seedAll } from './seedAll';

const main = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await truncateDatabase(client);
  } finally {
    await client.end();
  }

  const db = drizzle({
    connection: process.env.DATABASE_URL!,
  });
  await seedAll(db);
};

void main();
