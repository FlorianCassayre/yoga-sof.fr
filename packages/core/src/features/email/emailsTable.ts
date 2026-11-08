import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idColumns } from '../../db/idColumns';
import { usersTable } from '../auth/authTables';
import { emailTypeEnum } from './type/emailTypeEnum';

export const emailsTable = pgTable('emails', {
  ...idColumns,
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  type: emailTypeEnum().notNull(),
  destinationAddress: text().notNull(),
  ccAddress: text(),
  subject: text().notNull(),
  message: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp({ withTimezone: true }),
  sendError: text(),
});
