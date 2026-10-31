import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { courseTypeEnum } from './type/courseTypeEnum';
import { courseVisibilityEnum } from './visibility/courseVisibilityEnum';

export const coursesTable = pgTable(
  'courses',
  {
    ...idVersionedColumns,
    type: courseTypeEnum().notNull(),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    endsAt: timestamp({ withTimezone: true }).notNull(),
    capacity: integer().notNull(),
    registeredCount: integer().notNull().default(0),
    visibility: courseVisibilityEnum().notNull(),
    internalNotes: text().notNull().default(''),
  },
  (table) => [
    check('capacity_nonnegative', sql`${table.capacity} >= 0`),
    check('registered_count_nonnegative', sql`${table.registeredCount} >= 0`),
    check('registered_count_within_capacity', sql`${table.registeredCount} <= ${table.capacity}`),
  ],
);
