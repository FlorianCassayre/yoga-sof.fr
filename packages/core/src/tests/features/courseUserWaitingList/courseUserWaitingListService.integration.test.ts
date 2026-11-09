import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { usersTable } from '../../../features/auth/authTables';
import { coursesTable } from '../../../features/course/coursesTable';
import { courseUserRegistrationsTable } from '../../../features/courseUserRegistration/courseUserRegistrationsTable';
import { courseUserWaitingListService } from '../../../features/courseUserWaitingList/courseUserWaitingListService';
import { courseUserWaitingListsTable } from '../../../features/courseUserWaitingList/courseUserWaitingListsTable';

const EMAIL = 'waiting-list-test@example.com';
const OTHER_EMAIL = 'waiting-list-other-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseUserWaitingListService', () => {
  let openCourseId = 0;
  let fullCourseId = 0;
  let pastCourseId = 0;
  let userId = '';
  let otherUserId = '';

  const courseValues = (startsAt: string, capacity: number): typeof coursesTable.$inferInsert => ({
    type: 'adulte',
    startsAt: new Date(startsAt),
    endsAt: new Date('2099-06-02T10:00:00.000Z'),
    capacity,
    visibility: 'public',
    internalNotes: 'note',
  });

  const register = (courseId: number, id: string) =>
    db.insert(courseUserRegistrationsTable).values({ courseId, userId: id });

  beforeAll(async () => {
    const leftovers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.email, [EMAIL, OTHER_EMAIL]));
    const leftoverIds = leftovers.map((row) => row.id);
    if (leftoverIds.length > 0) {
      await db.delete(usersTable).where(inArray(usersTable.id, leftoverIds));
    }

    const [openCourse, pastCourse] = await db
      .insert(coursesTable)
      .values([
        courseValues('2099-06-01T08:00:00.000Z', 12),
        courseValues('2000-01-01T08:00:00.000Z', 12),
      ])
      .returning();
    const [fullCourse] = await db
      .insert(coursesTable)
      .values({ ...courseValues('2099-06-01T08:00:00.000Z', 1), registeredCount: 1 })
      .returning();
    if (!openCourse || !fullCourse || !pastCourse) {
      throw new Error('expected courses to be created');
    }
    openCourseId = openCourse.id;
    fullCourseId = fullCourse.id;
    pastCourseId = pastCourse.id;
    const [user, other] = await db
      .insert(usersTable)
      .values([
        { email: EMAIL, name: 'Liste Test' },
        { email: OTHER_EMAIL, name: 'Autre Liste' },
      ])
      .returning();
    if (!user || !other) {
      throw new Error('expected users to be created');
    }
    userId = user.id;
    otherUserId = other.id;
    await register(fullCourseId, otherUserId);
    await db
      .update(coursesTable)
      .set({ registeredCount: 1 })
      .where(eq(coursesTable.id, fullCourseId));
  });

  afterAll(async () => {
    await db
      .delete(coursesTable)
      .where(inArray(coursesTable.id, [openCourseId, fullCourseId, pastCourseId]));
    await db.delete(usersTable).where(inArray(usersTable.id, [userId, otherUserId]));
    await db.$client.end();
  });

  it('subscribes to a full future course', async () => {
    const entry = await withTransaction((tx) =>
      courseUserWaitingListService.subscribe({ courseId: fullCourseId, userId }, tx),
    );

    expect(entry.courseId).toBe(fullCourseId);
    expect(entry.userId).toBe(userId);
    expect(entry.notified).toBe(false);
    expect(entry.notifiedAt).toBeNull();
  });

  it('rejects a second subscription for the same pair', async () => {
    await expect(
      withTransaction((tx) =>
        courseUserWaitingListService.subscribe({ courseId: fullCourseId, userId }, tx),
      ),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('rejects a subscription to a course that is not full', async () => {
    await expect(
      withTransaction((tx) =>
        courseUserWaitingListService.subscribe({ courseId: openCourseId, userId }, tx),
      ),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('rejects a subscription to a past course', async () => {
    await expect(
      withTransaction((tx) =>
        courseUserWaitingListService.subscribe({ courseId: pastCourseId, userId }, tx),
      ),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('unsubscribes from a future course', async () => {
    const [entry] = await db
      .select({ id: courseUserWaitingListsTable.id })
      .from(courseUserWaitingListsTable)
      .where(eq(courseUserWaitingListsTable.userId, userId));
    if (!entry) {
      throw new Error('expected entry to be created');
    }

    const row = await withTransaction((tx) =>
      courseUserWaitingListService.unsubscribe({ id: entry.id }, tx),
    );

    expect(row.id).toBe(entry.id);
    const [leftover] = await db
      .select({ id: courseUserWaitingListsTable.id })
      .from(courseUserWaitingListsTable)
      .where(eq(courseUserWaitingListsTable.id, entry.id));
    expect(leftover).toBeUndefined();
  });

  it('rejects an unsubscribe from a past course', async () => {
    const [entry] = await db
      .insert(courseUserWaitingListsTable)
      .values({ courseId: pastCourseId, userId })
      .returning();
    if (!entry) {
      throw new Error('expected entry to be created');
    }

    await expect(
      withTransaction((tx) => courseUserWaitingListService.unsubscribe({ id: entry.id }, tx)),
    ).rejects.toBeInstanceOf(ServiceError);
  });
});
