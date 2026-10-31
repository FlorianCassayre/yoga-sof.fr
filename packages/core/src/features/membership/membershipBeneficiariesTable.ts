import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { usersTable } from '../auth/authTables';
import { membershipsTable } from './membershipsTable';

export const membershipBeneficiariesTable = pgTable(
  'membership_beneficiaries',
  {
    membershipId: integer()
      .notNull()
      .references(() => membershipsTable.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.membershipId, table.userId] })],
);
