import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { idColumns } from '../../db/idColumns';
import { usersTable } from '../auth/authTables';
import { coursesTable } from '../course';

export const courseUserWaitingListsTable = pgTable(
  'course_user_waiting_lists',
  {
    ...idColumns,
    courseId: integer()
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    notified: boolean().notNull().default(false),
    notifiedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    uniqueIndex('course_user_waiting_lists_pair_unique').on(table.courseId, table.userId),
    check(
      'notified_consistency',
      sql`(${table.notified} AND ${table.notifiedAt} IS NOT NULL) OR (NOT ${table.notified} AND ${table.notifiedAt} IS NULL)`,
    ),
  ],
);
