import { and, count, eq, inArray, isNotNull, notExists, or, type SQL, sql } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { assertConflict, assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { attendanceOpensAt, coursesTable } from '../course';
import { COURSE_TYPE_REGISTRATION_MODES } from '../course/type/courseRegistrationModes';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';
import { registerableService } from '../registerable/registerableService';
import { registerablesTable } from '../registerable/registerablesTable';
import type {
  registrationCoursePresenceListSchema,
  registrationCreateSchema,
  registrationEventListSchema,
  registrationListSchema,
  registrationPendingPresenceSchema,
  registrationSetPresenceSchema,
} from './registrationSchemas';
import { courseUserPresencesTable, registrationsTable } from './registrationsTable';

const coveringRegistrations = (tx: DbTransaction, courseId: number) =>
  or(
    eq(registrationsTable.courseId, courseId),
    inArray(
      registrationsTable.courseBundleId,
      tx
        .select({ id: coursesTable.courseBundleId })
        .from(coursesTable)
        .where(and(eq(coursesTable.id, courseId), isNotNull(coursesTable.courseBundleId))),
    ),
  );

const registrationFilters = (
  tx: DbTransaction,
  {
    courseId,
    courseBundleId,
    userId,
  }: { courseId?: number; courseBundleId?: number; userId?: string },
) => {
  const conditions: (SQL | undefined)[] = [eq(registrationsTable.canceled, false)];
  if (courseId !== undefined) {
    conditions.push(coveringRegistrations(tx, courseId));
  }
  if (courseBundleId !== undefined) {
    conditions.push(eq(registrationsTable.courseBundleId, courseBundleId));
  }
  if (userId !== undefined) {
    conditions.push(eq(registrationsTable.userId, userId));
  }
  return and(...conditions);
};

const LIST_ORDER_COLUMNS = {
  createdAt: registrationsTable.createdAt,
  courseStartsAt: coursesTable.startsAt,
  userName: usersTable.name,
};

export const registrationService = {
  create: async (
    { courseIds, bundleIds, userIds }: z.infer<typeof registrationCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(
      new Set(userIds).size === userIds.length,
      'Les utilisateurs doivent être distincts.',
    );

    const userRows = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));
    assertInput(userRows.length === userIds.length, 'Certains utilisateurs sont introuvables.');

    const seats: { id: number; message: string }[] = [];

    if (courseIds.length > 0) {
      assertInput(
        new Set(courseIds).size === courseIds.length,
        'Les séances doivent être distinctes.',
      );
      const courseRows = await tx
        .select({ id: coursesTable.id, type: coursesTable.type })
        .from(coursesTable)
        .where(inArray(coursesTable.id, courseIds));
      assertInput(courseRows.length === courseIds.length, 'Certaines séances sont introuvables.');
      assertInput(
        courseRows.every(
          (course) =>
            course.type !== null && COURSE_TYPE_REGISTRATION_MODES[course.type] === 'individual',
        ),
        "Certaines séances ne s'inscrivent qu'via un lot de séances.",
      );

      const registerableRows = await tx
        .select({ id: registerablesTable.id })
        .from(registerablesTable)
        .where(inArray(registerablesTable.courseId, courseIds));
      seats.push(
        ...registerableRows.flatMap((row) =>
          Array.from({ length: userIds.length }, () => ({
            id: row.id,
            message: 'La séance est complète.',
          })),
        ),
      );

      const existing = await tx
        .select({ userId: registrationsTable.userId })
        .from(registrationsTable)
        .where(
          and(
            inArray(registrationsTable.userId, userIds),
            inArray(registrationsTable.courseId, courseIds),
            eq(registrationsTable.canceled, false),
          ),
        );
      assertInput(existing.length === 0, 'Certains utilisateurs sont déjà inscrits à ces séances.');
    }

    if (bundleIds.length > 0) {
      assertInput(
        new Set(bundleIds).size === bundleIds.length,
        'Les lots de séances doivent être distincts.',
      );
      const bundleRows = await tx
        .select({ id: courseBundlesTable.id, type: courseBundlesTable.type })
        .from(courseBundlesTable)
        .where(inArray(courseBundlesTable.id, bundleIds));
      assertInput(bundleRows.length === bundleIds.length, 'Certains packs sont introuvables.');
      assertInput(
        bundleRows.every((bundle) => COURSE_TYPE_REGISTRATION_MODES[bundle.type] === 'bundle'),
        'Certains lots de séances ne peuvent pas être réservés.',
      );

      const registerableRows = await tx
        .select({ id: registerablesTable.id })
        .from(registerablesTable)
        .where(inArray(registerablesTable.courseBundleId, bundleIds));
      seats.push(
        ...registerableRows.flatMap((row) =>
          Array.from({ length: userIds.length }, () => ({
            id: row.id,
            message: 'Le lot de séances est complet.',
          })),
        ),
      );

      const existing = await tx
        .select({ userId: registrationsTable.userId })
        .from(registrationsTable)
        .where(
          and(
            inArray(registrationsTable.userId, userIds),
            inArray(registrationsTable.courseBundleId, bundleIds),
            eq(registrationsTable.canceled, false),
          ),
        );
      assertInput(
        existing.length === 0,
        'Certains utilisateurs sont déjà inscrits à ces lots de séances.',
      );
    }

    await registerableService.reserve(seats, tx);

    return tx
      .insert(registrationsTable)
      .values([
        ...courseIds.flatMap((courseId) => userIds.map((userId) => ({ courseId, userId }))),
        ...bundleIds.flatMap((courseBundleId) =>
          userIds.map((userId) => ({ courseBundleId, userId })),
        ),
      ])
      .returning({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        courseId: registrationsTable.courseId,
        courseBundleId: registrationsTable.courseBundleId,
      });
  },

  list: async ({ sort, ...params }: z.infer<typeof registrationListSchema>, tx: DbTransaction) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where = registrationFilters(tx, params);
    const rows = await tx
      .select({
        id: registrationsTable.id,
        courseId: registrationsTable.courseId,
        courseType: coursesTable.type,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        courseBundleId: registrationsTable.courseBundleId,
        courseBundleLabel: courseBundlesTable.label,
        userId: registrationsTable.userId,
        userName: usersTable.name,
        createdAt: registrationsTable.createdAt,
      })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(usersTable.id, registrationsTable.userId))
      .leftJoin(coursesTable, eq(coursesTable.id, registrationsTable.courseId))
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, registrationsTable.courseBundleId))
      .where(where)
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(registrationsTable).where(where);

    return { rows, total: totals?.total ?? 0 };
  },

  listCoursePresence: async (
    { courseId, sort, ...params }: z.infer<typeof registrationCoursePresenceListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where = registrationFilters(tx, { courseId });
    const rows = await tx
      .select({
        id: registrationsTable.id,
        userId: registrationsTable.userId,
        userName: usersTable.name,
        createdAt: registrationsTable.createdAt,
        present: courseUserPresencesTable.present,
        courseBundleId: registrationsTable.courseBundleId,
        courseBundleLabel: courseBundlesTable.label,
      })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(usersTable.id, registrationsTable.userId))
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, registrationsTable.courseBundleId))
      .leftJoin(
        courseUserPresencesTable,
        and(
          eq(courseUserPresencesTable.registrationId, registrationsTable.id),
          eq(courseUserPresencesTable.courseId, courseId),
        ),
      )
      .where(where)
      .orderBy(
        ...sortOrders(
          {
            createdAt: registrationsTable.createdAt,
            present: courseUserPresencesTable.present,
            userName: usersTable.name,
          },
          sort,
        ),
      )
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(registrationsTable).where(where);

    return { rows, total: totals?.total ?? 0 };
  },

  listEvents: async (
    { sort, ...params }: z.infer<typeof registrationEventListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const eventFilters = (canceled: boolean): ReturnType<typeof registrationFilters> =>
      and(
        canceled ? isNotNull(registrationsTable.canceledAt) : undefined,
        params.courseId === undefined ? undefined : coveringRegistrations(tx, params.courseId),
        params.userId === undefined ? undefined : eq(registrationsTable.userId, params.userId),
      );
    const events = tx
      .select({
        id: sql<string>`${registrationsTable.id} || ':registration'`.as('id'),
        type: sql<'inscription' | 'annulation'>`'inscription'`.as('type'),
        userId: registrationsTable.userId,
        courseId: registrationsTable.courseId,
        courseBundleId: registrationsTable.courseBundleId,
        date: registrationsTable.createdAt,
      })
      .from(registrationsTable)
      .where(eventFilters(false))
      .unionAll(
        tx
          .select({
            id: sql<string>`${registrationsTable.id} || ':cancelation'`.as('id'),
            type: sql<'inscription' | 'annulation'>`'annulation'`.as('type'),
            userId: registrationsTable.userId,
            courseId: registrationsTable.courseId,
            courseBundleId: registrationsTable.courseBundleId,
            date: sql<Date>`${registrationsTable.canceledAt}`.as('date'),
          })
          .from(registrationsTable)
          .where(eventFilters(true)),
      )
      .as('events');

    const eventOrderColumns = {
      date: events.date,
      type: events.type,
      userName: usersTable.name,
      courseStartsAt: coursesTable.startsAt,
    };

    const rows = await tx
      .select({
        id: events.id,
        type: events.type,
        date: events.date,
        userId: events.userId,
        userName: usersTable.name,
        courseId: events.courseId,
        courseType: coursesTable.type,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        courseBundleId: events.courseBundleId,
        courseBundleLabel: courseBundlesTable.label,
      })
      .from(events)
      .innerJoin(usersTable, eq(usersTable.id, events.userId))
      .leftJoin(coursesTable, eq(coursesTable.id, events.courseId))
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, events.courseBundleId))
      .orderBy(...sortOrders(eventOrderColumns, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(events);

    return { rows, total: totals?.total ?? 0 };
  },

  setPresence: async (
    { id, courseId, present }: z.infer<typeof registrationSetPresenceSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx.select().from(registrationsTable).where(eq(registrationsTable.id, id));
    assertFound(row, "L'inscription est introuvable.");
    assertConflict(!row.canceled, "L'inscription est annulée.");

    let covered: boolean;
    if (row.courseId !== null) {
      covered = row.courseId === courseId;
    } else if (row.courseBundleId !== null) {
      const [member] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(
          and(eq(coursesTable.id, courseId), eq(coursesTable.courseBundleId, row.courseBundleId)),
        );
      covered = member !== undefined;
    } else {
      covered = false;
    }
    assertState(covered, 'La séance ne fait pas partie de cette inscription.');

    const [course] = await tx
      .select({ startsAt: coursesTable.startsAt })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));
    assertState(course, 'La séance est introuvable.');
    assertState(
      new Date() >= attendanceOpensAt(course.startsAt),
      "L'appel n'est pas encore ouvert pour cette séance.",
    );

    if (present === null) {
      await tx
        .delete(courseUserPresencesTable)
        .where(
          and(
            eq(courseUserPresencesTable.registrationId, id),
            eq(courseUserPresencesTable.courseId, courseId),
          ),
        );
      return;
    }
    await tx
      .insert(courseUserPresencesTable)
      .values({ registrationId: id, courseId, present })
      .onConflictDoUpdate({
        target: [courseUserPresencesTable.registrationId, courseUserPresencesTable.courseId],
        set: { present },
      });
  },

  pendingPresence: async (
    { courseId }: z.infer<typeof registrationPendingPresenceSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .select({ pending: count() })
      .from(registrationsTable)
      .where(
        and(
          registrationFilters(tx, { courseId }),
          notExists(
            tx
              .select({ one: sql`1` })
              .from(courseUserPresencesTable)
              .where(
                and(
                  eq(courseUserPresencesTable.registrationId, registrationsTable.id),
                  eq(courseUserPresencesTable.courseId, courseId),
                ),
              ),
          ),
        ),
      );

    return { pending: row?.pending ?? 0 };
  },
};
