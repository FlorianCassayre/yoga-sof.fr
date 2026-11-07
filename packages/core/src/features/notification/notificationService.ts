import { and, count, eq, exists, isNull, lte, sql } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { pagination, sortOrders } from '../../util/list';
import { coursesTable } from '../course/coursesTable';
import { courseUserRegistrationsTable } from '../courseUserRegistration/courseUserRegistrationsTable';
import type { notificationListSchema } from './notificationSchemas';

// Courses whose end date has been reached and that still hold at least one
// active registration with an unfilled presence.
const pendingPresenceCourses = (tx: DbTransaction) =>
  and(
    lte(coursesTable.endsAt, new Date()),
    exists(
      tx
        .select({ one: sql`1` })
        .from(courseUserRegistrationsTable)
        .where(
          and(
            eq(courseUserRegistrationsTable.courseId, coursesTable.id),
            eq(courseUserRegistrationsTable.canceled, false),
            isNull(courseUserRegistrationsTable.present),
          ),
        ),
    ),
  );

const ORDER_COLUMNS = {
  courseStartsAt: coursesTable.startsAt,
  courseType: coursesTable.type,
  date: coursesTable.endsAt,
};

export const notificationService = {
  count: async (tx: DbTransaction): Promise<number> => {
    const [row] = await tx
      .select({ total: count() })
      .from(coursesTable)
      .where(pendingPresenceCourses(tx));

    return row?.total ?? 0;
  },

  list: async ({ sort, ...params }: z.infer<typeof notificationListSchema>, tx: DbTransaction) => {
    const { limit, offset } = pagination(params);

    const rows = await tx
      .select({
        id: sql<string>`${coursesTable.id} || ':presence'`.as('id'),
        type: sql<'coursePresence'>`'coursePresence'`.as('type'),
        courseId: coursesTable.id,
        courseType: coursesTable.type,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        date: coursesTable.endsAt,
      })
      .from(coursesTable)
      .where(pendingPresenceCourses(tx))
      .orderBy(...sortOrders(ORDER_COLUMNS, sort))
      .limit(limit)
      .offset(offset);

    const [totals] = await tx
      .select({ total: count() })
      .from(coursesTable)
      .where(pendingPresenceCourses(tx));

    return { rows, total: totals?.total ?? 0 };
  },
};
