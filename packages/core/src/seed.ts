import { config } from 'dotenv';

config({ path: '../../.env' });

import { faker } from '@faker-js/faker';
import { like, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { usersTable } from './features/auth/tables';
import { coursesTable } from './features/course';
import { courseUserRegistrationsTable } from './features/courseUserRegistration';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

const COURSE_COUNT = 50;
const USER_COUNT = 10;
const USER_EMAIL_DOMAIN = '@test.yoga-sof.fr';

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');

async function seedUsers() {
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

async function seedCourses() {
  await db.delete(coursesTable);

  const courses = Array.from({ length: COURSE_COUNT }, (): typeof coursesTable.$inferInsert => {
    const startsAt = faker.date.soon({ days: 90 });
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

    return {
      type: faker.helpers.arrayElement(['adulte', 'enfant'] as const),
      startsAt,
      endsAt,
      capacity: faker.number.int({ min: 8, max: 20 }),
      registeredCount: 0,
      visibility: faker.helpers.arrayElement(['public', 'private'] as const),
      internalNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? '',
    };
  });

  const inserted = await db.insert(coursesTable).values(courses).returning();
  console.log(`Seeded ${inserted.length} courses!`);
  return inserted;
}

async function seedRegistrations(
  courses: (typeof coursesTable.$inferSelect)[],
  users: (typeof usersTable.$inferSelect)[],
  admin: typeof usersTable.$inferSelect,
) {
  const registrations: (typeof courseUserRegistrationsTable.$inferInsert)[] = [];

  courses.forEach((course) => {
    const activeCount = Math.min(
      faker.number.int({ min: 0, max: users.length - 1 }),
      course.capacity,
    );
    registrations.push(
      ...Array.from({ length: activeCount }, (_, slot) => ({
        courseId: course.id,
        userId: users[slot]?.id ?? '',
        createdAt: faker.date.recent({ days: 45 }),
      })),
    );

    if (faker.helpers.maybe(() => true, { probability: 0.25 })) {
      const createdAt = faker.date.recent({ days: 45 });
      registrations.push({
        courseId: course.id,
        userId: users[activeCount % users.length]?.id ?? '',
        createdAt,
        canceled: true,
        canceledAt: faker.date.between({ from: createdAt, to: new Date() }),
        canceledBy: admin.id,
      });
    }
  });

  const inserted = await db.insert(courseUserRegistrationsTable).values(registrations).returning();

  await db.update(coursesTable).set({
    registeredCount: sql`(SELECT count(*) FROM "course_user_registrations" WHERE "course_user_registrations"."courseId" = "courses"."id" AND NOT "course_user_registrations"."canceled")`,
  });

  console.log(`Seeded ${inserted.length} registrations!`);
}

async function main() {
  await db.delete(courseUserRegistrationsTable);
  const { admin, users } = await seedUsers();
  if (!admin) {
    throw new Error('expected admin to be created');
  }
  const courses = await seedCourses();
  await seedRegistrations(courses, users, admin);
}

void main();
