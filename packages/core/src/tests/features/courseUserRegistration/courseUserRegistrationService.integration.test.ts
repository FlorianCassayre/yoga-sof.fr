import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { usersTable } from '../../../features/auth/authTables';
import type { courseCreateSchema } from '../../../features/course/courseSchemas';
import { coursesTable } from '../../../features/course/coursesTable';
import { courseUserRegistrationService } from '../../../features/courseUserRegistration/courseUserRegistrationService';
import { courseUserRegistrationsTable } from '../../../features/courseUserRegistration/courseUserRegistrationsTable';

const courseValues = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  capacity: 12,
  visibility: 'public',
  internalNotes: 'note',
} as const satisfies z.infer<typeof courseCreateSchema>;

const EMAIL = 'registration-test@example.com';
const OTHER_EMAIL = 'registration-other-test@example.com';
const CREATE_EMAIL = 'registration-create-test@example.com';
const CANCELER_EMAIL = 'registration-canceler-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseUserRegistrationService', () => {
  let courseId = 0;
  let fullCourseId = 0;
  let userId = '';
  let otherUserId = '';
  let createUserId = '';
  let cancelerId = '';

  beforeAll(async () => {
    const leftovers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.email, [EMAIL, OTHER_EMAIL, CREATE_EMAIL, CANCELER_EMAIL]));
    const leftoverIds = leftovers.map((row) => row.id);
    if (leftoverIds.length > 0) {
      await db
        .delete(courseUserRegistrationsTable)
        .where(inArray(courseUserRegistrationsTable.canceledBy, leftoverIds));
      await db.delete(usersTable).where(inArray(usersTable.id, leftoverIds));
    }

    const [course] = await db.insert(coursesTable).values(courseValues).returning();
    if (!course) {
      throw new Error('expected course to be created');
    }
    courseId = course.id;
    const [user, other, created, canceler] = await db
      .insert(usersTable)
      .values([
        { email: EMAIL, name: 'Inscrit Test' },
        { email: OTHER_EMAIL, name: 'Autre Test' },
        { email: CREATE_EMAIL, name: 'Créé Test' },
        { email: CANCELER_EMAIL, name: 'Annuleur Test' },
      ])
      .returning();
    if (!user || !other || !created || !canceler) {
      throw new Error('expected users to be created');
    }
    userId = user.id;
    otherUserId = other.id;
    createUserId = created.id;
    cancelerId = canceler.id;
  });

  afterAll(async () => {
    await db
      .delete(courseUserRegistrationsTable)
      .where(inArray(courseUserRegistrationsTable.courseId, [courseId, fullCourseId]));
    await db
      .delete(usersTable)
      .where(inArray(usersTable.email, [EMAIL, OTHER_EMAIL, CREATE_EMAIL, CANCELER_EMAIL]));
    await db.delete(coursesTable).where(inArray(coursesTable.id, [courseId, fullCourseId]));
    await db.$client.end();
  });

  const list = () =>
    withTransaction((tx) =>
      courseUserRegistrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }] },
        tx,
      ),
    );

  const cancel = (registrationId: number, at: Date) =>
    db
      .update(courseUserRegistrationsTable)
      .set({ canceled: true, canceledAt: at, canceledBy: cancelerId, version: 2 })
      .where(eq(courseUserRegistrationsTable.id, registrationId));

  it('lists active registrations with course, user and cancellation info', async () => {
    const [registration] = await db
      .insert(courseUserRegistrationsTable)
      .values({ courseId, userId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }

    const row = (await list()).rows.find((item) => item.id === registration.id);
    if (!row) {
      throw new Error('expected registration to be listed');
    }
    expect(row).toMatchObject({
      courseId,
      userId,
      courseType: 'adulte',
      courseEndsAt: courseValues.endsAt,
      userName: 'Inscrit Test',
      canceled: false,
      canceledAt: null,
      canceledById: null,
    });

    await cancel(registration.id, new Date());

    const stillListed = (await list()).rows.some((item) => item.id === registration.id);
    expect(stillListed).toBe(false);
  });

  it('sorts by joined columns', async () => {
    const result = await withTransaction((tx) =>
      courseUserRegistrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'userName', sort: 'asc' }] },
        tx,
      ),
    );

    const names = result.rows.map((row) => row.userName);
    expect(names).toEqual([...names].sort((a, b) => (a ?? '').localeCompare(b ?? '')));
  });

  it('creates registrations and keeps registeredCount consistent', async () => {
    await withTransaction((tx) =>
      courseUserRegistrationService.create(
        { courseIds: [courseId], userIds: [createUserId], notify: true },
        tx,
      ),
    );
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    expect(course?.registeredCount).toBe(1);

    await expect(
      withTransaction((tx) =>
        courseUserRegistrationService.create(
          { courseIds: [courseId], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow(ServiceError);
    const [stillOne] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    expect(stillOne?.registeredCount).toBe(1);

    await expect(
      withTransaction((tx) =>
        courseUserRegistrationService.create(
          { courseIds: [courseId, courseId], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow('Les séances doivent être distinctes.');

    await expect(
      withTransaction((tx) =>
        courseUserRegistrationService.create(
          { courseIds: [-100], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow(ServiceError);
  });

  it('rejects registering to a full course', async () => {
    const [fullCourse] = await db
      .insert(coursesTable)
      .values({ ...courseValues, capacity: 0 })
      .returning();
    if (!fullCourse) {
      throw new Error('expected course to be created');
    }
    fullCourseId = fullCourse.id;

    await expect(
      withTransaction((tx) =>
        courseUserRegistrationService.create(
          { courseIds: [fullCourse.id], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow('La séance est complète.');
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, fullCourse.id));
    expect(course?.registeredCount).toBe(0);
  });

  it('reconstructs inscription and cancellation events', async () => {
    const [registration] = await db
      .insert(courseUserRegistrationsTable)
      .values({ courseId, userId: otherUserId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }
    const canceledAt = new Date();
    await cancel(registration.id, canceledAt);

    const events = await withTransaction((tx) =>
      courseUserRegistrationService.listEvents(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }] },
        tx,
      ),
    );
    const registrationEvents = events.rows.filter((row) => row.courseId === courseId);

    const inscription = registrationEvents.find(
      (row) => row.type === 'inscription' && row.userId === otherUserId,
    );
    if (!inscription) {
      throw new Error('expected inscription event');
    }
    expect(inscription).toMatchObject({ courseId, userName: 'Autre Test' });
    expect(inscription.date).toEqual(registration.createdAt);

    const annulation = registrationEvents.find(
      (row) => row.type === 'annulation' && row.userId === otherUserId,
    );
    if (!annulation) {
      throw new Error('expected annulation event');
    }
    expect(annulation).toMatchObject({ courseId, userName: 'Autre Test' });
    expect(annulation.date).toEqual(canceledAt);
  });

  it('rejects a canceled registration without canceledAt and canceledBy', async () => {
    await expect(
      db
        .insert(courseUserRegistrationsTable)
        .values({ courseId, userId: otherUserId, canceled: true }),
    ).rejects.toThrow();
  });

  it('rejects an active registration with canceledAt and canceledBy', async () => {
    await expect(
      db.insert(courseUserRegistrationsTable).values({
        courseId,
        userId: otherUserId,
        canceledAt: new Date(),
        canceledBy: cancelerId,
      }),
    ).rejects.toThrow();
  });

  it('allows re-registering after cancellation', async () => {
    const [registration] = await db
      .insert(courseUserRegistrationsTable)
      .values({ courseId, userId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }
  });

  it('rejects a duplicate active registration for the same course and user', async () => {
    await expect(
      db.insert(courseUserRegistrationsTable).values({ courseId, userId: createUserId }),
    ).rejects.toThrow();
  });

  it('filters registrations and events by course and user', async () => {
    const byCourse = await withTransaction((tx) =>
      courseUserRegistrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }], courseId },
        tx,
      ),
    );
    expect(byCourse.total).toBe(2);
    expect(byCourse.rows.every((row) => row.courseId === courseId)).toBe(true);

    const byUser = await withTransaction((tx) =>
      courseUserRegistrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }], userId },
        tx,
      ),
    );
    expect(byUser.total).toBe(1);
    expect(byUser.rows[0]?.userId).toBe(userId);

    const forOtherUser = await withTransaction((tx) =>
      courseUserRegistrationService.list(
        {
          page: 0,
          pageSize: 50,
          sort: [{ field: 'createdAt', sort: 'desc' }],
          userId: otherUserId,
        },
        tx,
      ),
    );
    expect(forOtherUser.total).toBe(0);

    const eventsForCourse = await withTransaction((tx) =>
      courseUserRegistrationService.listEvents(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }], courseId },
        tx,
      ),
    );
    expect(eventsForCourse.total).toBe(6);
    expect(eventsForCourse.rows.every((row) => row.courseId === courseId)).toBe(true);

    const eventsForOtherUser = await withTransaction((tx) =>
      courseUserRegistrationService.listEvents(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }], userId: otherUserId },
        tx,
      ),
    );
    expect(eventsForOtherUser.total).toBe(2);
  });
});
