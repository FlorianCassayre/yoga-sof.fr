import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { usersTable } from '../auth/authTables';
import { coursesTable } from '../course/coursesTable';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';

export const registrationsTable = pgTable(
  'registrations',
  {
    ...idVersionedColumns,
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    courseId: integer().references(() => coursesTable.id, { onDelete: 'cascade' }),
    courseBundleId: integer().references(() => courseBundlesTable.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    canceled: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    canceledBy: text().references(() => usersTable.id),
  },
  (table) => [
    uniqueIndex('registrations_active_course_unique')
      .on(table.userId, table.courseId)
      .where(sql`NOT ${table.canceled} AND ${table.courseId} IS NOT NULL`),
    uniqueIndex('registrations_active_bundle_unique')
      .on(table.userId, table.courseBundleId)
      .where(sql`NOT ${table.canceled} AND ${table.courseBundleId} IS NOT NULL`),
    check(
      'target_consistency',
      sql`(${table.courseId} IS NULL) <> (${table.courseBundleId} IS NULL)`,
    ),
    check(
      'canceled_consistency',
      sql`(${table.canceled} AND ${table.canceledAt} IS NOT NULL AND ${table.canceledBy} IS NOT NULL) OR (NOT ${table.canceled} AND ${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL)`,
    ),
  ],
);

export const courseUserPresencesTable = pgTable(
  'course_user_presences',
  {
    registrationId: integer()
      .notNull()
      .references(() => registrationsTable.id, { onDelete: 'cascade' }),
    courseId: integer()
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    present: boolean().notNull(),
  },
  (table) => [primaryKey({ columns: [table.registrationId, table.courseId] })],
);
