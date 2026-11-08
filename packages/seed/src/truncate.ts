import { config } from 'dotenv';

config({ path: '../../.env' });

import { truncateDatabase } from '@yoga-sof/core/server';
import { Client } from 'pg';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await truncateDatabase(client);
  } finally {
    await client.end();
  }
}

void main();
