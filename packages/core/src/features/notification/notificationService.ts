import { and, count, eq, exists, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { pagination, sortOrders } from '../../util/list';
import { coursesTable } from '../course/coursesTable';
import type { CourseType } from '../course/type/CourseType';
import { courseUserRegistrationsTable } from '../courseUserRegistration/courseUserRegistrationsTable';
import { emailsTable } from '../email/emailsTable';
import type { notificationListSchema } from './notificationSchemas';
import type { NotificationType } from './NotificationType';

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

const notificationsSubquery = (tx: DbTransaction) =>
  tx
    .select({
      id: sql<string>`${coursesTable.id} || ':presence'`.as('id'),
      type: sql<NotificationType>`'coursePresence'`.as('type'),
      courseId: sql<number>`${coursesTable.id}`.as('courseId'),
      courseType: sql<CourseType>`${coursesTable.type}`.as('courseType'),
      courseStartsAt: sql<Date>`${coursesTable.startsAt}`
        .mapWith(coursesTable.startsAt)
        .as('courseStartsAt'),
      courseEndsAt: sql<Date>`${coursesTable.endsAt}`
        .mapWith(coursesTable.endsAt)
        .as('courseEndsAt'),
      date: sql<Date>`${coursesTable.endsAt}`.mapWith(coursesTable.endsAt).as('date'),
      emailId: sql<number>`null`.as('emailId'),
      subject: sql<string>`null`.as('subject'),
      destinationAddress: sql<string>`null`.as('destinationAddress'),
    })
    .from(coursesTable)
    .where(pendingPresenceCourses(tx))
    .unionAll(
      tx
        .select({
          id: sql<string>`${emailsTable.id} || ':email'`.as('id'),
          type: sql<NotificationType>`'emailFailed'`.as('type'),
          courseId: sql<number>`null`.as('courseId'),
          courseType: sql<CourseType>`null`.as('courseType'),
          courseStartsAt: sql<Date>`null`.as('courseStartsAt'),
          courseEndsAt: sql<Date>`null`.as('courseEndsAt'),
          date: sql<Date>`${emailsTable.createdAt}`.mapWith(emailsTable.createdAt).as('date'),
          emailId: sql<number>`${emailsTable.id}`.as('emailId'),
          subject: sql<string>`${emailsTable.subject}`.as('subject'),
          destinationAddress: sql<string>`${emailsTable.destinationAddress}`.as(
            'destinationAddress',
          ),
        })
        .from(emailsTable)
        .where(and(isNull(emailsTable.sentAt), isNotNull(emailsTable.sendError))),
    )
    .as('notifications');

export const notificationService = {
  count: async (tx: DbTransaction): Promise<number> => {
    const [presence] = await tx
      .select({ total: count() })
      .from(coursesTable)
      .where(pendingPresenceCourses(tx));
    const [emails] = await tx
      .select({ total: count() })
      .from(emailsTable)
      .where(and(isNull(emailsTable.sentAt), isNotNull(emailsTable.sendError)));

    return (presence?.total ?? 0) + (emails?.total ?? 0);
  },

  list: async ({ sort, ...params }: z.infer<typeof notificationListSchema>, tx: DbTransaction) => {
    const { limit, offset } = pagination(params);
    const subquery = notificationsSubquery(tx);

    const rows = await tx
      .select({
        id: subquery.id,
        type: subquery.type,
        courseId: subquery.courseId,
        courseType: subquery.courseType,
        courseStartsAt: subquery.courseStartsAt,
        courseEndsAt: subquery.courseEndsAt,
        emailId: subquery.emailId,
        subject: subquery.subject,
        destinationAddress: subquery.destinationAddress,
        date: subquery.date,
      })
      .from(subquery)
      .orderBy(
        ...sortOrders(
          {
            courseStartsAt: subquery.courseStartsAt,
            courseType: subquery.courseType,
            date: subquery.date,
          },
          sort,
        ),
      )
      .limit(limit)
      .offset(offset);

    const [presence] = await tx
      .select({ total: count() })
      .from(coursesTable)
      .where(pendingPresenceCourses(tx));
    const [emails] = await tx
      .select({ total: count() })
      .from(emailsTable)
      .where(and(isNull(emailsTable.sentAt), isNotNull(emailsTable.sendError)));

    return { rows, total: (presence?.total ?? 0) + (emails?.total ?? 0) };
  },
};
