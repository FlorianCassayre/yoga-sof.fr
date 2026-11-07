import { sql } from 'drizzle-orm';
import { boolean, check, date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { usersTable } from '../auth/authTables';
import { courseTypeEnum } from '../course/type/courseTypeEnum';

export const cardsTable = pgTable(
  'cards',
  {
    ...idVersionedColumns,
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    templateId: integer().notNull(),
    type: courseTypeEnum().notNull(),
    price: integer().notNull(),
    count: integer().notNull(),
    remaining: integer().notNull(),
    validUntil: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    canceled: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    canceledBy: text().references(() => usersTable.id),
  },
  (table) => [
    check('price_nonnegative', sql`${table.price} >= 0`),
    check('count_positive', sql`${table.count} > 0`),
    check('remaining_nonnegative', sql`${table.remaining} >= 0`),
    check('remaining_within_count', sql`${table.remaining} <= ${table.count}`),
    check(
      'canceled_consistency',
      sql`(${table.canceled} AND ${table.canceledAt} IS NOT NULL AND ${table.canceledBy} IS NOT NULL) OR (NOT ${table.canceled} AND ${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL)`,
    ),
  ],
);
