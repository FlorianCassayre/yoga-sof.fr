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

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { usersTable } from '../auth/authTables';
import { coursesTable } from '../course';

export const courseUserRegistrationsTable = pgTable(
  'course_user_registrations',
  {
    ...idVersionedColumns,
    courseId: integer()
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    canceled: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    canceledBy: text().references(() => usersTable.id),
  },
  (table) => [
    uniqueIndex('course_user_registrations_active_unique')
      .on(table.courseId, table.userId)
      .where(sql`${table.canceled} = false`),
    check(
      'canceled_consistency',
      sql`(${table.canceled} AND ${table.canceledAt} IS NOT NULL AND ${table.canceledBy} IS NOT NULL) OR (NOT ${table.canceled} AND ${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL)`,
    ),
  ],
);
