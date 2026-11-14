import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { usersTable } from '../../../features/auth/authTables';
import { coursesTable } from '../../../features/course/coursesTable';
import { courseBundlesTable } from '../../../features/courseBundle/courseBundlesTable';
import { registerablesTable } from '../../../features/registerable/registerablesTable';
import { registrationService } from '../../../features/registration/registrationService';
import {
  courseUserPresencesTable,
  registrationsTable,
} from '../../../features/registration/registrationsTable';

const courseValues = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  price: 2500,
  visibility: 'public',
  internalNotes: 'note',
} as const satisfies typeof coursesTable.$inferInsert;

const EMAIL = 'registration-test@example.com';
const OTHER_EMAIL = 'registration-other-test@example.com';
const CREATE_EMAIL = 'registration-create-test@example.com';

const insertCourse = async (course: typeof coursesTable.$inferInsert, capacity: number) => {
  const [row] = await db.insert(coursesTable).values(course).returning();
  if (!row) {
    throw new Error('expected course to be created');
  }
  await db.insert(registerablesTable).values({ courseId: row.id, capacity });

  return row;
};

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('registrationService', () => {
  let courseId = 0;
  let fullCourseId = 0;
  let bundleId = 0;
  const presenceCourseIds: number[] = [];
  let userId = '';
  let otherUserId = '';
  let createUserId = '';

  beforeAll(async () => {
    const leftovers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.email, [EMAIL, OTHER_EMAIL, CREATE_EMAIL]));
    const leftoverIds = leftovers.map((row) => row.id);
    if (leftoverIds.length > 0) {
      await db.delete(usersTable).where(inArray(usersTable.id, leftoverIds));
    }

    const course = await insertCourse(courseValues, 12);
    courseId = course.id;
    const [user, other, created] = await db
      .insert(usersTable)
      .values([
        { email: EMAIL, name: 'Inscrit Test' },
        { email: OTHER_EMAIL, name: 'Autre Test' },
        { email: CREATE_EMAIL, name: 'Créé Test' },
      ])
      .returning();
    if (!user || !other || !created) {
      throw new Error('expected users to be created');
    }
    userId = user.id;
    otherUserId = other.id;
    createUserId = created.id;
  });

  afterAll(async () => {
    await db
      .delete(usersTable)
      .where(inArray(usersTable.email, [EMAIL, OTHER_EMAIL, CREATE_EMAIL]));
    await db
      .delete(coursesTable)
      .where(inArray(coursesTable.id, [courseId, fullCourseId, ...presenceCourseIds]));
    if (bundleId > 0) {
      await db.delete(courseBundlesTable).where(eq(courseBundlesTable.id, bundleId));
    }
    await db.$client.end();
  });

  const list = () =>
    withTransaction((tx) =>
      registrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }] },
        tx,
      ),
    );

  const registeredCount = async (courseId2: number) => {
    const [registerable] = await db
      .select()
      .from(registerablesTable)
      .where(eq(registerablesTable.courseId, courseId2));

    return registerable?.registeredCount;
  };

  it('lists active registrations with course, bundle and user info', async () => {
    const [registration] = await db
      .insert(registrationsTable)
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
      courseBundleId: null,
      courseBundleLabel: null,
      userName: 'Inscrit Test',
    });

    await db.delete(registrationsTable).where(eq(registrationsTable.id, registration.id));
  });

  it('sorts by joined columns', async () => {
    const result = await withTransaction((tx) =>
      registrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'userName', sort: 'asc' }] },
        tx,
      ),
    );

    const names = result.rows.map((row) => row.userName);
    expect(names).toEqual([...names].sort((a, b) => (a ?? '').localeCompare(b ?? '')));
  });

  it('creates individual registrations and keeps registeredCount consistent', async () => {
    await withTransaction((tx) =>
      registrationService.create(
        { courseIds: [courseId], bundleIds: [], userIds: [createUserId], notify: true },
        tx,
      ),
    );
    expect(await registeredCount(courseId)).toBe(1);

    await expect(
      withTransaction((tx) =>
        registrationService.create(
          { courseIds: [courseId], bundleIds: [], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow('Certains utilisateurs sont déjà inscrits à ces séances.');
    expect(await registeredCount(courseId)).toBe(1);

    await expect(
      withTransaction((tx) =>
        registrationService.create(
          {
            courseIds: [courseId, courseId],
            bundleIds: [],
            userIds: [createUserId],
            notify: false,
          },
          tx,
        ),
      ),
    ).rejects.toThrow('Les séances doivent être distinctes.');

    await expect(
      withTransaction((tx) =>
        registrationService.create(
          { courseIds: [-100], bundleIds: [], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow(ServiceError);

    await db.delete(registrationsTable).where(eq(registrationsTable.userId, createUserId));
    await db
      .update(registerablesTable)
      .set({ registeredCount: 0 })
      .where(eq(registerablesTable.courseId, courseId));
    expect(await registeredCount(courseId)).toBe(0);
  });

  it('rejects registering to a full course', async () => {
    const fullCourse = await insertCourse({ ...courseValues, internalNotes: 'full' }, 0);
    fullCourseId = fullCourse.id;

    await expect(
      withTransaction((tx) =>
        registrationService.create(
          { courseIds: [fullCourse.id], bundleIds: [], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow('La séance est complète.');
    expect(await registeredCount(fullCourse.id)).toBe(0);
  });

  it('never exceeds the capacity under concurrent registrations', async () => {
    const concurrentCourse = await insertCourse(
      { ...courseValues, internalNotes: 'concurrent' },
      1,
    );
    presenceCourseIds.push(concurrentCourse.id);

    const results = await Promise.allSettled(
      [userId, otherUserId, createUserId].map((id) =>
        withTransaction((tx) =>
          registrationService.create(
            { courseIds: [concurrentCourse.id], bundleIds: [], userIds: [id], notify: false },
            tx,
          ),
        ),
      ),
    );
    const fulfilled = results.filter((result) => result.status === 'fulfilled');

    expect(fulfilled).toHaveLength(1);
    expect(await registeredCount(concurrentCourse.id)).toBe(1);
    await db.delete(registrationsTable).where(eq(registrationsTable.courseId, concurrentCourse.id));
    await db
      .update(registerablesTable)
      .set({ registeredCount: 0 })
      .where(eq(registerablesTable.courseId, concurrentCourse.id));
  });

  it('creates bundle registrations without touching the course counts', async () => {
    const [bundle] = await db
      .insert(courseBundlesTable)
      .values({ label: 'Lot intégration', type: 'enfant', price: 15000 })
      .returning();
    if (!bundle) {
      throw new Error('expected bundle to be created');
    }
    bundleId = bundle.id;
    const [bundleRegisterable] = await db
      .insert(registerablesTable)
      .values({ courseBundleId: bundle.id, capacity: 5 })
      .returning();
    if (!bundleRegisterable) {
      throw new Error('expected registerable to be created');
    }

    const created = await withTransaction((tx) =>
      registrationService.create(
        {
          courseIds: [],
          bundleIds: [bundle.id],
          userIds: [createUserId, otherUserId],
          notify: false,
        },
        tx,
      ),
    );
    expect(created).toHaveLength(2);
    expect(created.every((row) => row.courseBundleId === bundle.id && row.courseId === null)).toBe(
      true,
    );

    const [bundleCount] = await db
      .select()
      .from(registerablesTable)
      .where(eq(registerablesTable.id, bundleRegisterable.id));
    expect(bundleCount?.registeredCount).toBe(2);

    await expect(
      withTransaction((tx) =>
        registrationService.create(
          { courseIds: [], bundleIds: [bundle.id], userIds: [createUserId], notify: false },
          tx,
        ),
      ),
    ).rejects.toThrow('Certains utilisateurs sont déjà inscrits à ces lots de séances.');

    await db.delete(registrationsTable).where(eq(registrationsTable.courseBundleId, bundle.id));
  });

  it('reconstructs inscription and cancellation events', async () => {
    const [registration] = await db
      .insert(registrationsTable)
      .values({ courseId, userId: otherUserId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }
    const canceledAt = new Date();
    await db
      .update(registrationsTable)
      .set({ canceled: true, canceledAt, canceledBy: otherUserId, version: 2 })
      .where(eq(registrationsTable.id, registration.id));

    const events = await withTransaction((tx) =>
      registrationService.listEvents(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }], userId: otherUserId },
        tx,
      ),
    );
    const courseEvents = events.rows.filter((row) => row.courseId === courseId);

    const inscription = courseEvents.find((row) => row.type === 'inscription');
    if (!inscription) {
      throw new Error('expected inscription event');
    }
    expect(inscription).toMatchObject({ courseId, userName: 'Autre Test' });
    expect(inscription.date).toEqual(registration.createdAt);

    const annulation = courseEvents.find((row) => row.type === 'annulation');
    if (!annulation) {
      throw new Error('expected annulation event');
    }
    expect(annulation).toMatchObject({ courseId, userName: 'Autre Test' });
    expect(annulation.date).toEqual(canceledAt);

    await db.delete(registrationsTable).where(eq(registrationsTable.id, registration.id));
  });

  it('rejects inconsistent cancellation states', async () => {
    await expect(
      db.insert(registrationsTable).values({ courseId, userId: otherUserId, canceled: true }),
    ).rejects.toThrow();
    await expect(
      db.insert(registrationsTable).values({
        courseId,
        userId: otherUserId,
        canceledAt: new Date(),
        canceledBy: otherUserId,
      }),
    ).rejects.toThrow();
  });

  it('enforces one active registration per user and target', async () => {
    const [registration] = await db
      .insert(registrationsTable)
      .values({ courseId, userId })
      .returning();
    if (!registration) {
      throw new Error('expected registration to be created');
    }

    await expect(db.insert(registrationsTable).values({ courseId, userId })).rejects.toThrow();

    await db
      .update(registrationsTable)
      .set({ canceled: true, canceledAt: new Date(), canceledBy: userId, version: 2 })
      .where(eq(registrationsTable.id, registration.id));
    const [reRegistered] = await db
      .insert(registrationsTable)
      .values({ courseId, userId })
      .returning();
    if (!reRegistered) {
      throw new Error('expected re-registration to be created');
    }
    await db.delete(registrationsTable).where(eq(registrationsTable.userId, userId));
  });

  it('filters registrations and events by course and user', async () => {
    const [first] = await db.insert(registrationsTable).values({ courseId, userId }).returning();
    const [second] = await db
      .insert(registrationsTable)
      .values({ courseId, userId: otherUserId })
      .returning();
    if (!first || !second) {
      throw new Error('expected registrations to be created');
    }

    const byCourse = await withTransaction((tx) =>
      registrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }], courseId },
        tx,
      ),
    );
    expect(byCourse.total).toBe(2);
    expect(byCourse.rows.every((row) => row.courseId === courseId)).toBe(true);

    const byUser = await withTransaction((tx) =>
      registrationService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'createdAt', sort: 'desc' }], userId },
        tx,
      ),
    );
    expect(byUser.total).toBe(1);
    expect(byUser.rows[0]?.userId).toBe(userId);

    const eventsForCourse = await withTransaction((tx) =>
      registrationService.listEvents(
        { page: 0, pageSize: 50, sort: [{ field: 'date', sort: 'desc' }], courseId },
        tx,
      ),
    );
    expect(eventsForCourse.total).toBe(2);

    await db
      .delete(registrationsTable)
      .where(inArray(registrationsTable.id, [first.id, second.id]));
  });

  it('fills presence once the call window is open and counts pending presences', async () => {
    const [openCourse, closedCourse] = await Promise.all([
      insertCourse(
        {
          ...courseValues,
          startsAt: new Date(Date.now() + 30 * 60 * 1000),
          endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
        12,
      ),
      insertCourse(
        {
          ...courseValues,
          startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        },
        12,
      ),
    ]);
    presenceCourseIds.push(openCourse.id, closedCourse.id);

    const [registration, closedRegistration, canceledRegistration] = await db
      .insert(registrationsTable)
      .values([
        { courseId: openCourse.id, userId },
        { courseId: closedCourse.id, userId },
        {
          courseId: openCourse.id,
          userId: otherUserId,
          canceled: true,
          canceledAt: new Date(),
          canceledBy: otherUserId,
        },
      ])
      .returning();
    if (!registration || !closedRegistration || !canceledRegistration) {
      throw new Error('expected registrations to be created');
    }

    const pending = (id: number) =>
      withTransaction((tx) => registrationService.pendingPresence({ courseId: id }, tx));
    await expect(pending(openCourse.id)).resolves.toEqual({ pending: 1 });

    await withTransaction((tx) =>
      registrationService.setPresence(
        { id: registration.id, courseId: openCourse.id, present: true },
        tx,
      ),
    );
    await expect(pending(openCourse.id)).resolves.toEqual({ pending: 0 });

    await withTransaction((tx) =>
      registrationService.setPresence(
        { id: registration.id, courseId: openCourse.id, present: null },
        tx,
      ),
    );
    await expect(pending(openCourse.id)).resolves.toEqual({ pending: 1 });

    await withTransaction((tx) =>
      registrationService.setPresence(
        { id: registration.id, courseId: openCourse.id, present: false },
        tx,
      ),
    );
    const [presenceRow] = await db
      .select()
      .from(courseUserPresencesTable)
      .where(eq(courseUserPresencesTable.registrationId, registration.id));
    expect(presenceRow?.present).toBe(false);

    await expect(
      withTransaction((tx) =>
        registrationService.setPresence(
          { id: canceledRegistration.id, courseId: openCourse.id, present: true },
          tx,
        ),
      ),
    ).rejects.toThrow("L'inscription est annulée.");

    await expect(
      withTransaction((tx) =>
        registrationService.setPresence(
          { id: closedRegistration.id, courseId: closedCourse.id, present: false },
          tx,
        ),
      ),
    ).rejects.toThrow("L'appel n'est pas encore ouvert pour cette séance.");

    await db
      .delete(registrationsTable)
      .where(
        inArray(registrationsTable.id, [
          registration.id,
          closedRegistration.id,
          canceledRegistration.id,
        ]),
      );
  });

  it('lists course presences across individual and bundle registrations', async () => {
    const [bundle] = await db
      .insert(courseBundlesTable)
      .values({ label: 'Lot intégration', type: 'enfant', price: 15000 })
      .returning();
    if (!bundle) {
      throw new Error('expected bundle to be created');
    }
    await db.insert(registerablesTable).values({ courseBundleId: bundle.id, capacity: 5 });
    const bundledCourse = await insertCourse(
      { ...courseValues, type: null, price: null, courseBundleId: bundle.id },
      10,
    );
    presenceCourseIds.push(bundledCourse.id);

    const [individual] = await db
      .insert(registrationsTable)
      .values({ courseId: bundledCourse.id, userId })
      .returning();
    const [bundled] = await db
      .insert(registrationsTable)
      .values({ courseBundleId: bundle.id, userId: otherUserId })
      .returning();
    if (!individual || !bundled) {
      throw new Error('expected registrations to be created');
    }

    const listed = await withTransaction((tx) =>
      registrationService.listCoursePresence(
        {
          courseId: bundledCourse.id,
          page: 0,
          pageSize: 50,
          sort: [{ field: 'createdAt', sort: 'desc' }],
        },
        tx,
      ),
    );
    expect(listed.rows.map((row) => row.id).sort()).toEqual([individual.id, bundled.id].sort());
    expect(listed.rows.every((row) => row.present === null)).toBe(true);

    await withTransaction((tx) =>
      registrationService.setPresence(
        { id: bundled.id, courseId: bundledCourse.id, present: true },
        tx,
      ),
    );
    const afterPresence = await withTransaction((tx) =>
      registrationService.listCoursePresence(
        {
          courseId: bundledCourse.id,
          page: 0,
          pageSize: 50,
          sort: [{ field: 'createdAt', sort: 'desc' }],
        },
        tx,
      ),
    );
    expect(afterPresence.rows.find((row) => row.id === bundled.id)?.present).toBe(true);

    await expect(
      withTransaction((tx) =>
        registrationService.setPresence(
          { id: individual.id, courseId: bundledCourse.id + 1, present: true },
          tx,
        ),
      ),
    ).rejects.toThrow('La séance ne fait pas partie de cette inscription.');

    await db
      .delete(registrationsTable)
      .where(inArray(registrationsTable.id, [individual.id, bundled.id]));
    await db.delete(coursesTable).where(eq(coursesTable.id, bundledCourse.id));
    await db.delete(courseBundlesTable).where(eq(courseBundlesTable.id, bundle.id));
  });
});
