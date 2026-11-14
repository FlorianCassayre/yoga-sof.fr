import { sql } from 'drizzle-orm';
import { check, integer, pgTable } from 'drizzle-orm/pg-core';

import { idColumns } from '../../db/idColumns';
import { coursesTable } from '../course/coursesTable';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';

export const registerablesTable = pgTable(
  'registerables',
  {
    ...idColumns,
    capacity: integer().notNull(),
    registeredCount: integer().notNull().default(0),
    courseId: integer().references(() => coursesTable.id, { onDelete: 'cascade' }),
    courseBundleId: integer().references(() => courseBundlesTable.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [
    check('capacity_nonnegative', sql`${table.capacity} >= 0`),
    check('registered_count_nonnegative', sql`${table.registeredCount} >= 0`),
    check('registered_count_within_capacity', sql`${table.registeredCount} <= ${table.capacity}`),
    check(
      'owner_consistency',
      sql`(${table.courseId} IS NULL) <> (${table.courseBundleId} IS NULL)`,
    ),
  ],
);
