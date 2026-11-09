import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { waitingListJob } from './features/courseUserWaitingList/sendWaitingListNotifications';
import type { Mailer } from './features/email/mailer';
import { emailJob } from './features/email/sendPendingEmails';
import type { CronJob } from './runner';

export const createJobs = (db: NodePgDatabase, mailer: Mailer): CronJob[] => [
  emailJob(db, mailer),
  waitingListJob(db, mailer),
];
