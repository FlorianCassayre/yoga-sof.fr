import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from '../auth/authTables';
import { roleTypeEnum } from './type/roleTypeEnum';

export const userRolesTable = pgTable('user_roles', {
  userId: text()
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  role: roleTypeEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
