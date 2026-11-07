import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { usersTable } from '../../../features/auth/authTables';
import { coursesTable } from '../../../features/course/coursesTable';
import { courseUserRegistrationsTable } from '../../../features/courseUserRegistration/courseUserRegistrationsTable';
import { notificationService } from '../../../features/notification/notificationService';

const courseValues = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  capacity: 12,
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
    courseIds.push(course.id);

    return course;
  };

  const insertRegistration = (courseId: number, present: boolean | null) =>
    db.insert(courseUserRegistrationsTable).values({ courseId, userId, present });

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
    await db
      .delete(courseUserRegistrationsTable)
      .where(inArray(courseUserRegistrationsTable.courseId, courseIds));
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

    await db
      .update(courseUserRegistrationsTable)
      .set({ present: true })
      .where(eq(courseUserRegistrationsTable.courseId, pendingCourse.id));
    await expect(withTransaction((tx) => notificationService.count(tx))).resolves.toBe(
      expectedBefore - 1,
    );
  });
});
