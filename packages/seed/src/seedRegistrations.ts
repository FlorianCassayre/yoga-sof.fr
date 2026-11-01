import { faker } from '@faker-js/faker';
import { coursesTable, courseUserRegistrationsTable } from '@yoga-sof/core';
import type { usersTable } from '@yoga-sof/core/server';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface SeedRegistrationsParameters {
  courses: (typeof coursesTable.$inferSelect)[];
  users: (typeof usersTable.$inferSelect)[];
  admin: typeof usersTable.$inferSelect;
}

export async function seedRegistrations(
  db: NodePgDatabase,
  { courses, users, admin }: SeedRegistrationsParameters,
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
