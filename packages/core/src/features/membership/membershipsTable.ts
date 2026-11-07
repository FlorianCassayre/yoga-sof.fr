import { sql } from 'drizzle-orm';
import { boolean, check, date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { usersTable } from '../auth/authTables';
import { membershipTypeEnum } from './type/membershipTypeEnum';

export const membershipsTable = pgTable(
  'memberships',
  {
    ...idVersionedColumns,
    type: membershipTypeEnum().notNull(),
    price: integer().notNull(),
    startsAt: date().notNull(),
    endsAt: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    canceled: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    canceledBy: text().references(() => usersTable.id),
  },
  (table) => [
    check('price_nonnegative', sql`${table.price} >= 0`),
    check('period_consistency', sql`${table.startsAt} <= ${table.endsAt}`),
    check(
      'canceled_consistency',
      sql`(${table.canceled} AND ${table.canceledAt} IS NOT NULL AND ${table.canceledBy} IS NOT NULL) OR (NOT ${table.canceled} AND ${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL)`,
    ),
  ],
);
