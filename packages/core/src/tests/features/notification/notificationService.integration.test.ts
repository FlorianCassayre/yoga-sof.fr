import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { usersTable } from '../../../features/auth/authTables';
import { coursesTable } from '../../../features/course/coursesTable';
import { notificationService } from '../../../features/notification/notificationService';
import { registerablesTable } from '../../../features/registerable/registerablesTable';
import {
  courseUserPresencesTable,
  registrationsTable,
} from '../../../features/registration/registrationsTable';

const courseValues = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  price: 0,
  visibility: 'public',
  internalNotes: 'note',
} as const satisfies typeof coursesTable.$inferInsert;

const EMAIL = 'notification-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('notificationService', () => {
  let userId = '';
  const courseIds: number[] = [];

  const insertCourse = async (
    endsAt: Date,
    overrides: Partial<typeof courseValues> = {},
  ): Promise<typeof coursesTable.$inferSelect> => {
    const [course] = await db
      .insert(coursesTable)
      .values({
        ...courseValues,
        startsAt: new Date(endsAt.getTime() - 2 * 60 * 60 * 1000),
        endsAt,
        ...overrides,
      })
      .returning();
    if (!course) {
      throw new Error('expected course to be created');
    }
    await db.insert(registerablesTable).values({ courseId: course.id, capacity: 12 });
    courseIds.push(course.id);

    return course;
  };

  const insertRegistration = async (courseId: number, present: boolean | null) => {
    const [registration] = await db
      .insert(registrationsTable)
      .values({ courseId, userId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }
    if (present !== null) {
      await db
        .insert(courseUserPresencesTable)
        .values({ registrationId: registration.id, courseId, present });
    }

    return registration;
  };

  beforeAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    const [user] = await db
      .insert(usersTable)
      .values({ email: EMAIL, name: 'Notif Test' })
      .returning();
    if (!user) {
      throw new Error('expected user to be created');
    }
    userId = user.id;
  });

  afterAll(async () => {
    await db.delete(coursesTable).where(inArray(coursesTable.id, courseIds));
    await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    await db.$client.end();
  });

  it('lists ended courses with unfilled presences', async () => {
    const pendingCourse = await insertCourse(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const answeredCourse = await insertCourse(new Date(Date.now() - 48 * 60 * 60 * 1000));
    const futureCourse = await insertCourse(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    await insertRegistration(pendingCourse.id, null);
    await insertRegistration(answeredCourse.id, true);
    await insertRegistration(futureCourse.id, null);

    const total = await withTransaction((tx) => notificationService.count(tx));
    const expectedBefore = total;
    expect(expectedBefore).toBeGreaterThanOrEqual(1);

    const listed = await withTransaction((tx) =>
      notificationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }] },
        tx,
      ),
    );
    const row = listed.rows.find((item) => item.courseId === pendingCourse.id);
    expect(row).toMatchObject({
      type: 'coursePresence',
      date: pendingCourse.endsAt,
    });
    expect(row?.id).toBe(`${pendingCourse.id}:presence`);
    expect(listed.rows.some((item) => item.courseId === answeredCourse.id)).toBe(false);
    expect(listed.rows.some((item) => item.courseId === futureCourse.id)).toBe(false);

    const [registration] = await db
      .select()
      .from(registrationsTable)
      .where(eq(registrationsTable.courseId, pendingCourse.id));
    if (!registration) {
      throw new Error('expected registration to be created');
    }
    await db
      .insert(courseUserPresencesTable)
      .values({ registrationId: registration.id, courseId: pendingCourse.id, present: true });
    await expect(withTransaction((tx) => notificationService.count(tx))).resolves.toBe(
      expectedBefore - 1,
    );
  });
});
