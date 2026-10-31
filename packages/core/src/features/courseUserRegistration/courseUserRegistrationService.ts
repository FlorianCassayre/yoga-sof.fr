import { and, asc, count, desc, eq, inArray, isNotNull, type SQL, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { assertConflict, assertInput } from '../../errors';
import { pagination } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { coursesTable } from '../course';
import type {
  courseUserRegistrationCreateSchema,
  courseUserRegistrationEventListSchema,
  courseUserRegistrationListSchema,
} from './courseUserRegistrationSchemas';
import { courseUserRegistrationsTable } from './courseUserRegistrationsTable';

const cancelerUsersTable = alias(usersTable, 'canceler');

// Optional course/user filters shared by the registration and event lists.
const registrationFilters = ({ courseId, userId }: { courseId?: number; userId?: string }) => {
  const conditions: SQL[] = [];
  if (courseId !== undefined) {
    conditions.push(eq(courseUserRegistrationsTable.courseId, courseId));
  }
  if (userId !== undefined) {
    conditions.push(eq(courseUserRegistrationsTable.userId, userId));
  }
  return conditions;
};

const LIST_ORDER_COLUMNS = {
  createdAt: courseUserRegistrationsTable.createdAt,
  courseStartsAt: coursesTable.startsAt,
  userName: usersTable.name,
};

export const courseUserRegistrationService = {
  create: async (
    { courseIds, userIds }: z.infer<typeof courseUserRegistrationCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(
      new Set(courseIds).size === courseIds.length,
      'Les séances doivent être distinctes.',
    );
    assertInput(
      new Set(userIds).size === userIds.length,
      'Les utilisateurs doivent être distincts.',
    );

    const courseRows = await tx
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(inArray(coursesTable.id, courseIds));
    assertInput(courseRows.length === courseIds.length, 'Certaines séances sont introuvables.');

    const userRows = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));
    assertInput(userRows.length === userIds.length, 'Certains utilisateurs sont introuvables.');

    const existing = await tx
      .select({
        courseId: courseUserRegistrationsTable.courseId,
        userId: courseUserRegistrationsTable.userId,
      })
      .from(courseUserRegistrationsTable)
      .where(
        and(
          inArray(courseUserRegistrationsTable.courseId, courseIds),
          inArray(courseUserRegistrationsTable.userId, userIds),
          eq(courseUserRegistrationsTable.canceled, false),
        ),
      );
    assertInput(existing.length === 0, 'Certains utilisateurs sont déjà inscrits à ces séances.');

    // Courses are locked in ID order to avoid deadlocks between concurrent registrations.
    for (const courseId of courseIds) {
      const [course] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(
          and(
            eq(coursesTable.id, courseId),
            sql`${coursesTable.registeredCount} < ${coursesTable.capacity}`,
          ),
        )
        .for('update');
      assertConflict(course, 'La séance est complète.');

      await tx
        .update(coursesTable)
        .set({ registeredCount: sql`${coursesTable.registeredCount} + 1` })
        .where(eq(coursesTable.id, courseId));
    }

    await tx
      .insert(courseUserRegistrationsTable)
      .values(courseIds.flatMap((courseId) => userIds.map((userId) => ({ courseId, userId }))));
  },
  list: async (
    { sort, ...params }: z.infer<typeof courseUserRegistrationListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const rows = await tx
      .select({
        id: courseUserRegistrationsTable.id,
        courseId: courseUserRegistrationsTable.courseId,
        courseType: coursesTable.type,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        userId: courseUserRegistrationsTable.userId,
        userName: usersTable.name,
        createdAt: courseUserRegistrationsTable.createdAt,
        canceled: courseUserRegistrationsTable.canceled,
        canceledAt: courseUserRegistrationsTable.canceledAt,
        canceledById: courseUserRegistrationsTable.canceledBy,
      })
      .from(courseUserRegistrationsTable)
      .innerJoin(coursesTable, eq(coursesTable.id, courseUserRegistrationsTable.courseId))
      .innerJoin(usersTable, eq(usersTable.id, courseUserRegistrationsTable.userId))
      .leftJoin(
        cancelerUsersTable,
        eq(cancelerUsersTable.id, courseUserRegistrationsTable.canceledBy),
      )
      .where(and(eq(courseUserRegistrationsTable.canceled, false), ...registrationFilters(params)))
      .orderBy(
        ...sort.map(({ field, sort: order }) =>
          order === 'desc' ? desc(LIST_ORDER_COLUMNS[field]) : asc(LIST_ORDER_COLUMNS[field]),
        ),
      )
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx
      .select({ total: count() })
      .from(courseUserRegistrationsTable)
      .where(and(eq(courseUserRegistrationsTable.canceled, false), ...registrationFilters(params)));

    return { rows, total: totals?.total ?? 0 };
  },

  listEvents: async (
    { sort, ...params }: z.infer<typeof courseUserRegistrationEventListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const events = tx
      .select({
        id: sql<string>`${courseUserRegistrationsTable.id} || ':registration'`.as('id'),
        type: sql<'inscription' | 'annulation'>`'inscription'`.as('type'),
        userId: courseUserRegistrationsTable.userId,
        courseId: courseUserRegistrationsTable.courseId,
        date: courseUserRegistrationsTable.createdAt,
      })
      .from(courseUserRegistrationsTable)
      .where(and(...registrationFilters(params)))
      .unionAll(
        tx
          .select({
            id: sql<string>`${courseUserRegistrationsTable.id} || ':cancelation'`.as('id'),
            type: sql<'inscription' | 'annulation'>`'annulation'`.as('type'),
            userId: courseUserRegistrationsTable.userId,
            courseId: courseUserRegistrationsTable.courseId,
            date: sql<Date>`${courseUserRegistrationsTable.canceledAt}`.as('date'),
          })
          .from(courseUserRegistrationsTable)
          .where(
            and(isNotNull(courseUserRegistrationsTable.canceledAt), ...registrationFilters(params)),
          ),
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
      })
      .from(events)
      .innerJoin(usersTable, eq(usersTable.id, events.userId))
      .innerJoin(coursesTable, eq(coursesTable.id, events.courseId))
      .orderBy(
        ...sort.map(({ field, sort: order }) =>
          order === 'desc' ? desc(eventOrderColumns[field]) : asc(eventOrderColumns[field]),
        ),
      )
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(events);

    return { rows, total: totals?.total ?? 0 };
  },
};
