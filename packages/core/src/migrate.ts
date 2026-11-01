import { config } from 'dotenv';

config({ path: '../../.env' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

const LOCK = 'yoga-sof:init';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', [LOCK]);
    await migrate(db, { migrationsFolder: 'drizzle' });
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', [LOCK]);
    await client.end();
  }
}

void main();
