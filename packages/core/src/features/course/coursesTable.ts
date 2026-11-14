import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { usersTable } from '../auth/authTables';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';
import { courseTypeEnum } from './type/courseTypeEnum';
import { courseVisibilityEnum } from './visibility/courseVisibilityEnum';

export const coursesTable = pgTable(
  'courses',
  {
    ...idVersionedColumns,
    type: courseTypeEnum(),
    price: integer(),
    courseBundleId: integer().references(() => courseBundlesTable.id),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    endsAt: timestamp({ withTimezone: true }).notNull(),
    visibility: courseVisibilityEnum().notNull(),
    internalNotes: text().notNull().default(''),
    canceled: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    canceledBy: text().references(() => usersTable.id),
  },
  (table) => [
    check('price_nonnegative', sql`${table.price} >= 0`),
    check(
      'bundle_consistency',
      sql`(${table.courseBundleId} IS NOT NULL AND ${table.type} IS NULL AND ${table.price} IS NULL) OR (${table.courseBundleId} IS NULL AND ${table.type} IS NOT NULL AND ${table.price} IS NOT NULL)`,
    ),
    check(
      'canceled_consistency',
      sql`(${table.canceled} AND ${table.canceledAt} IS NOT NULL AND ${table.canceledBy} IS NOT NULL) OR (NOT ${table.canceled} AND ${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL)`,
    ),
    index('courses_starts_at_index').on(table.startsAt),
  ],
);
