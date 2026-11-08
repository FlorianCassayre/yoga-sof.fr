import { and, count, eq, inArray, isNotNull, isNull, type SQL, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { assertConflict, assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { attendanceOpensAt, coursesTable } from '../course';
import type {
  courseUserRegistrationCreateSchema,
  courseUserRegistrationEventListSchema,
  courseUserRegistrationListSchema,
  courseUserRegistrationPendingPresenceSchema,
  courseUserRegistrationSetPresenceSchema,
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
  present: courseUserRegistrationsTable.present,
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

    return tx
      .insert(courseUserRegistrationsTable)
      .values(courseIds.flatMap((courseId) => userIds.map((userId) => ({ courseId, userId }))))
      .returning({
        id: courseUserRegistrationsTable.id,
        courseId: courseUserRegistrationsTable.courseId,
        userId: courseUserRegistrationsTable.userId,
      });
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
        present: courseUserRegistrationsTable.present,
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
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
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
      .orderBy(...sortOrders(eventOrderColumns, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(events);

    return { rows, total: totals?.total ?? 0 };
  },

  setPresence: async (
    { id, present }: z.infer<typeof courseUserRegistrationSetPresenceSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .select()
      .from(courseUserRegistrationsTable)
      .where(eq(courseUserRegistrationsTable.id, id));
    assertFound(row, "L'inscription est introuvable.");
    assertConflict(!row.canceled, "L'inscription est annulée.");

    const [course] = await tx
      .select({ startsAt: coursesTable.startsAt })
      .from(coursesTable)
      .where(eq(coursesTable.id, row.courseId));
    assertState(course, 'La séance est introuvable.');
    assertState(
      new Date() >= attendanceOpensAt(course.startsAt),
      "L'appel n'est pas encore ouvert pour cette séance.",
    );

    const [updated] = await tx
      .update(courseUserRegistrationsTable)
      .set({ present })
      .where(eq(courseUserRegistrationsTable.id, id))
      .returning();
    assertState(updated, 'Mise à jour de la présence impossible.');

    return updated;
  },

  pendingPresence: async (
    { courseId }: z.infer<typeof courseUserRegistrationPendingPresenceSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .select({ pending: count() })
      .from(courseUserRegistrationsTable)
      .where(
        and(
          eq(courseUserRegistrationsTable.courseId, courseId),
          eq(courseUserRegistrationsTable.canceled, false),
          isNull(courseUserRegistrationsTable.present),
        ),
      );

    return { pending: row?.pending ?? 0 };
  },
};
