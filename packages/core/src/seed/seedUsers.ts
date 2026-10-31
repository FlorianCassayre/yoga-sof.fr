import { faker } from '@faker-js/faker';
import { like } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { usersTable } from '../features/auth/authTables';

const USER_COUNT = 10;
const USER_EMAIL_DOMAIN = '@test.yoga-sof.fr';

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');

export async function seedUsers(db: NodePgDatabase) {
  await db.delete(usersTable).where(like(usersTable.email, `%${USER_EMAIL_DOMAIN}`));

  const users = await db
    .insert(usersTable)
    .values(
      Array.from({ length: USER_COUNT + 1 }, () => {
        const name = faker.person.fullName();

        return {
          name,
          email: `${slug(name)}-${faker.string.alphanumeric({ length: 4, casing: 'lower' })}${USER_EMAIL_DOMAIN}`,
          emailVerified: new Date(),
        };
      }),
    )
    .returning();

  console.log(`Seeded ${users.length} users!`);

  return { admin: users[0], users: users.slice(1) };
}
