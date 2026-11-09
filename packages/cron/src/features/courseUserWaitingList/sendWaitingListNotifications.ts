import {
  COURSE_WAITING_LIST_TEMPLATE,
  coursesTable,
  courseUserWaitingListsTable,
} from '@yoga-sof/core';
import { emailService, renderEmail, usersTable } from '@yoga-sof/core/server';
import { and, eq, gt } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { CronJob } from '../../runner';
import { errorMessage, type Mailer } from '../email/mailer';

// Notifies everyone still waiting on a future course (one e-mail per entry).
// A send failure leaves the entry unnotified so the next run retries it; the
// sent e-mails are recorded through the regular e-mail feature.
export const sendWaitingListNotifications =
  (db: NodePgDatabase, mailer: Mailer) => async (): Promise<void> => {
    const entries = await db
      .select({
        id: courseUserWaitingListsTable.id,
        courseId: coursesTable.id,
        courseType: coursesTable.type,
        courseStartsAt: coursesTable.startsAt,
        courseEndsAt: coursesTable.endsAt,
        userId: usersTable.id,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(courseUserWaitingListsTable)
      .innerJoin(coursesTable, eq(coursesTable.id, courseUserWaitingListsTable.courseId))
      .innerJoin(usersTable, eq(usersTable.id, courseUserWaitingListsTable.userId))
      .where(
        and(eq(courseUserWaitingListsTable.notified, false), gt(coursesTable.startsAt, new Date())),
      );

    for (const entry of entries) {
      try {
        const userEmail = entry.userEmail;
        if (userEmail === null) {
          continue;
        }
        const email = await renderEmail(COURSE_WAITING_LIST_TEMPLATE, {
          user: { id: entry.userId, name: entry.userName },
          course: {
            type: entry.courseType,
            startsAt: entry.courseStartsAt,
            endsAt: entry.courseEndsAt,
          },
        });
        await mailer.send({
          to: userEmail,
          subject: email.subject,
          html: email.html,
        });
        await db.transaction(async (tx) => {
          await tx
            .update(courseUserWaitingListsTable)
            .set({ notified: true, notifiedAt: new Date() })
            .where(eq(courseUserWaitingListsTable.id, entry.id));
          await emailService.create(
            {
              userId: entry.userId,
              type: email.type,
              destinationAddress: userEmail,
              subject: email.subject,
              message: email.html,
            },
            tx,
          );
        });
        console.log(`[waiting-list] notified entry #${entry.id} (${userEmail})`);
      } catch (error) {
        console.error(`[waiting-list] failed entry #${entry.id}: ${errorMessage(error)}`);
      }
    }
  };

// Six-field cron expression (node-cron) — the leading field is seconds.
export const waitingListJob = (db: NodePgDatabase, mailer: Mailer): CronJob => ({
  name: 'sendWaitingListNotifications',
  schedule: '0 0 * * * *',
  run: sendWaitingListNotifications(db, mailer),
});
