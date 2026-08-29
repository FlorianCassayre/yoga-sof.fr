import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '../../.env' });

const db = drizzle({
  connection: process.env.DATABASE_URL!
});

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  };
  await db.insert(usersTable).values(user);
  console.log('New user created!')
  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users)
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */
  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log('User info updated!')
  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log('User deleted!')
}

void main();
