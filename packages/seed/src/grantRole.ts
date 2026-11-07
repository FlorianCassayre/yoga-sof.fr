import { config } from 'dotenv';

config({ path: '/home/opencode/yoga-sof.fr/.env' });

import { roleService, usersTable } from '@yoga-sof/core/server';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle({ connection: process.env.DATABASE_URL! });

const email = process.argv[2];
if (!email) throw new Error('usage: tsx src/grantRole.ts <email>');

import { eq } from 'drizzle-orm';

const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
if (!user) throw new Error(`No user with email ${email}`);

await db.transaction((tx) =>
  roleService.grantUserRole({ userId: user.id, role: 'administrator' }, tx),
);
console.log(`Granted administrateur to ${email} (${user.id})`);
await db.$client.end();
