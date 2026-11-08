import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { bytea } from '../../db/bytea';
import { idColumns } from '../../db/idColumns';
import { emailsTable } from './emailsTable';

export const emailAttachmentsTable = pgTable('email_attachments', {
  ...idColumns,
  emailId: integer()
    .notNull()
    .references(() => emailsTable.id, { onDelete: 'cascade' }),
  filename: text().notNull(),
  file: bytea().notNull(),
});
