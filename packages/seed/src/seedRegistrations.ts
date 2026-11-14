import { faker } from '@faker-js/faker';
import type { courseBundlesTable, coursesTable } from '@yoga-sof/core';
import { registerablesTable, registrationsTable } from '@yoga-sof/core';
import type { usersTable } from '@yoga-sof/core/server';
import { isNotNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface SeedRegistrationsParameters {
  courses: (typeof coursesTable.$inferSelect)[];
  bundles: (typeof courseBundlesTable.$inferSelect)[];
  users: (typeof usersTable.$inferSelect)[];
  admin: typeof usersTable.$inferSelect;
}

export async function seedRegistrations(
  db: NodePgDatabase,
  { courses, bundles, users, admin }: SeedRegistrationsParameters,
) {
  const registerables = await db
    .select({
      id: registerablesTable.id,
      courseId: registerablesTable.courseId,
      courseBundleId: registerablesTable.courseBundleId,
      capacity: registerablesTable.capacity,
    })
    .from(registerablesTable);
  const capacityOf = (courseBundleId: number | null, courseId: number | null) =>
    registerables.find(
      (registerable) =>
        registerable.courseId === courseId && registerable.courseBundleId === courseBundleId,
    )?.capacity ?? 0;

  const registrations: (typeof registrationsTable.$inferInsert)[] = [];

  courses
    .filter((course) => course.type !== null)
    .forEach((course) => {
      const activeCount = Math.min(
        faker.number.int({ min: 0, max: users.length - 1 }),
        capacityOf(null, course.id),
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

  bundles.forEach((bundle) => {
    const activeCount = Math.min(
      faker.number.int({ min: 1, max: users.length - 1 }),
      capacityOf(bundle.id, null),
    );
    registrations.push(
      ...Array.from({ length: activeCount }, (_, slot) => ({
        courseBundleId: bundle.id,
        userId: users[slot]?.id ?? '',
        createdAt: faker.date.recent({ days: 45 }),
      })),
    );

    if (faker.helpers.maybe(() => true, { probability: 0.25 })) {
      const createdAt = faker.date.recent({ days: 45 });
      registrations.push({
        courseBundleId: bundle.id,
        userId: users[activeCount % users.length]?.id ?? '',
        createdAt,
        canceled: true,
        canceledAt: faker.date.between({ from: createdAt, to: new Date() }),
        canceledBy: admin.id,
      });
    }
  });

  const inserted = await db.insert(registrationsTable).values(registrations).returning();

  await db
    .update(registerablesTable)
    .set({
      registeredCount: sql`(SELECT count(*) FROM "registrations" WHERE "registrations"."courseId" = "registerables"."courseId" AND NOT "registrations"."canceled")`,
    })
    .where(isNotNull(registerablesTable.courseId));
  await db
    .update(registerablesTable)
    .set({
      registeredCount: sql`(SELECT count(*) FROM "registrations" WHERE "registrations"."courseBundleId" = "registerables"."courseBundleId" AND NOT "registrations"."canceled")`,
    })
    .where(isNotNull(registerablesTable.courseBundleId));

  console.log(`Seeded ${inserted.length} registrations!`);
}
