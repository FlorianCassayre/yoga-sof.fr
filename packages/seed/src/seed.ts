import { config } from 'dotenv';

config({ path: '../../.env' });

import { usersTable } from '@yoga-sof/core/server';
import { drizzle } from 'drizzle-orm/node-postgres';

import { seedAll } from './seedAll';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

async function main() {
  const seeded = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (seeded.length > 0) {
    console.log('Database is not empty, skipping the seed.');
    return;
  }
  console.log('Database is empty, seeding.');
  await seedAll(db);
}

void main();
