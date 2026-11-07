import { sql } from 'drizzle-orm';
import { check, integer, pgTable } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../../db/idVersionedColumns';

export const cardSettingsTable = pgTable(
  'card_settings',
  {
    ...idVersionedColumns,
    validityMonths: integer().notNull().default(12),
  },
  (table) => [check('validity_months_range', sql`${table.validityMonths} BETWEEN 1 AND 120`)],
);
