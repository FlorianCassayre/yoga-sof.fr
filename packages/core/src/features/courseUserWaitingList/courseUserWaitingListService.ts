import { and, count, eq, sql } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { assertConflict, assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { coursesTable } from '../course';
import type { CourseType } from '../course/type/CourseType';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';
import { registerablesTable } from '../registerable/registerablesTable';
import type {
  courseUserWaitingListListSchema,
  courseUserWaitingListSubscribeSchema,
  courseUserWaitingListUnsubscribeSchema,
} from './courseUserWaitingListSchemas';
import { courseUserWaitingListsTable } from './courseUserWaitingListsTable';

const LIST_ORDER_COLUMNS = {
  createdAt: courseUserWaitingListsTable.createdAt,
  notifiedAt: courseUserWaitingListsTable.notifiedAt,
  userName: usersTable.name,
  courseStartsAt: coursesTable.startsAt,
};

export const courseUserWaitingListService = {
  subscribe: async (
    { courseId, userId }: z.infer<typeof courseUserWaitingListSubscribeSchema>,
    tx: DbTransaction,
  ) => {
    const [course] = await tx
      .select({ startsAt: coursesTable.startsAt, courseBundleId: coursesTable.courseBundleId })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));
    assertFound(course, 'La séance est introuvable.');
    assertInput(course.startsAt.getTime() > Date.now(), 'La séance a déjà eu lieu.');
    const [registerable] = await tx
      .select({
        capacity: registerablesTable.capacity,
        registeredCount: registerablesTable.registeredCount,
      })
      .from(registerablesTable)
      .where(
        course.courseBundleId === null
          ? eq(registerablesTable.courseId, courseId)
          : eq(registerablesTable.courseBundleId, course.courseBundleId),
      );
    assertFound(registerable, 'La séance est introuvable.');
    assertInput(
      registerable.registeredCount >= registerable.capacity,
      "La séance n'est pas complète.",
    );

    const [existing] = await tx
      .select({ id: courseUserWaitingListsTable.id })
      .from(courseUserWaitingListsTable)
      .where(
        and(
          eq(courseUserWaitingListsTable.courseId, courseId),
          eq(courseUserWaitingListsTable.userId, userId),
        ),
      );
    assertConflict(!existing, "Cet utilisateur est déjà sur la liste d'attente de cette séance.");

    const [row] = await tx
      .insert(courseUserWaitingListsTable)
      .values({ courseId, userId })
      .returning();
    assertInput(row, "Inscription à la liste d'attente impossible.");

    return row;
  },

  unsubscribe: async (
    { id }: z.infer<typeof courseUserWaitingListUnsubscribeSchema>,
    tx: DbTransaction,
  ) => {
    const [entry] = await tx
      .select({ startsAt: coursesTable.startsAt })
      .from(courseUserWaitingListsTable)
      .innerJoin(coursesTable, eq(coursesTable.id, courseUserWaitingListsTable.courseId))
      .where(eq(courseUserWaitingListsTable.id, id));
    assertFound(entry, "L'entrée de la liste d'attente est introuvable.");
    assertInput(entry.startsAt.getTime() > Date.now(), 'La séance a déjà eu lieu.');

    const [row] = await tx
      .delete(courseUserWaitingListsTable)
      .where(eq(courseUserWaitingListsTable.id, id))
      .returning();
    assertState(row, "Suppression de l'entrée de la liste d'attente impossible.");

    return row;
  },

  list: async (
    { sort, ...params }: z.infer<typeof courseUserWaitingListListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit, offset } = pagination(params);
    const { courseId, userId } = params;
    const filters = [
      ...(courseId !== undefined ? [eq(courseUserWaitingListsTable.courseId, courseId)] : []),
      ...(userId !== undefined ? [eq(courseUserWaitingListsTable.userId, userId)] : []),
    ];
    const rows = await tx
      .select({
        id: courseUserWaitingListsTable.id,
        courseId: courseUserWaitingListsTable.courseId,
        courseType: sql<CourseType>`coalesce(${coursesTable.type}, ${courseBundlesTable.type})`,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        userId: courseUserWaitingListsTable.userId,
        userName: usersTable.name,
        createdAt: courseUserWaitingListsTable.createdAt,
        notified: courseUserWaitingListsTable.notified,
        notifiedAt: courseUserWaitingListsTable.notifiedAt,
      })
      .from(courseUserWaitingListsTable)
      .innerJoin(coursesTable, eq(coursesTable.id, courseUserWaitingListsTable.courseId))
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId))
      .innerJoin(usersTable, eq(usersTable.id, courseUserWaitingListsTable.userId))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(limit)
      .offset(offset);
    const [totals] = await tx
      .select({ total: count() })
      .from(courseUserWaitingListsTable)
      .where(filters.length > 0 ? and(...filters) : undefined);

    return { rows, total: totals?.total ?? 0 };
  },
};
