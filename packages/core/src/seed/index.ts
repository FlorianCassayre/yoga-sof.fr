import { config } from 'dotenv';

config({ path: '../../.env' });

import { faker } from '@faker-js/faker';
import { drizzle } from 'drizzle-orm/node-postgres';

import { courseUserRegistrationsTable } from '../features/courseUserRegistration';
import { seedCourses } from './seedCourses';
import { seedMemberships } from './seedMemberships';
import { seedRegistrations } from './seedRegistrations';
import { seedUsers } from './seedUsers';

const SEED = 42;

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

async function main() {
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

void main();
