import { faker } from '@faker-js/faker';
import { courseUserRegistrationsTable } from '@yoga-sof/core';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { seedCourses } from './seedCourses';
import { seedMemberships } from './seedMemberships';
import { seedRegistrations } from './seedRegistrations';
import { seedUsers } from './seedUsers';

const SEED = 42;

export async function seedAll(db: NodePgDatabase) {
  faker.seed(SEED);

  await db.delete(courseUserRegistrationsTable);
  const { admin, users } = await seedUsers(db);
  if (!admin) {
    throw new Error('expected admin to be created');
  }
  const courses = await seedCourses(db);
  await seedRegistrations(db, { courses, users, admin });
  await seedMemberships(db, { users });
}
