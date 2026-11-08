import { emailAttachmentsTable, emailsTable } from '@yoga-sof/core/server';
import { and, asc, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { CronJob } from '../../runner';
import { errorMessage, type Mailer } from './mailer';

const BATCH_SIZE = 20;

// Sends every pending e-mail (no sent date and no recorded error). Rows are
// locked with FOR UPDATE SKIP LOCKED so concurrent workers never send the same
// e-mail twice; a failure is recorded on the row (no automatic retry — the
// notification system offers a manual resend instead).
export const sendPendingEmails =
  (db: NodePgDatabase, mailer: Mailer) => async (): Promise<void> => {
    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(emailsTable)
        .where(and(isNull(emailsTable.sentAt), isNull(emailsTable.sendError)))
        .orderBy(asc(emailsTable.createdAt))
        .limit(BATCH_SIZE)
        .for('update', { skipLocked: true });

      for (const row of rows) {
        try {
          const attachments = await tx
            .select({
              filename: emailAttachmentsTable.filename,
              file: emailAttachmentsTable.file,
            })
            .from(emailAttachmentsTable)
            .where(eq(emailAttachmentsTable.emailId, row.id));
          await mailer.send({
            to: row.destinationAddress,
            cc: row.ccAddress ?? undefined,
            subject: row.subject,
            html: row.message,
            attachments: attachments.length > 0 ? attachments : undefined,
          });
          await tx
            .update(emailsTable)
            .set({ sentAt: new Date() })
            .where(eq(emailsTable.id, row.id));
          console.log(`[email] sent #${row.id} to ${row.destinationAddress}`);
        } catch (error) {
          await tx
            .update(emailsTable)
            .set({ sendError: errorMessage(error) })
            .where(eq(emailsTable.id, row.id));
          console.error(`[email] failed #${row.id}: ${errorMessage(error)}`);
        }
      }
    });
  };

// Six-field cron expression (node-cron) — the leading field is seconds.
export const emailJob = (db: NodePgDatabase, mailer: Mailer): CronJob => ({
  name: 'sendPendingEmails',
  schedule: '*/5 * * * * *',
  run: sendPendingEmails(db, mailer),
});
