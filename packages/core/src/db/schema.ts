import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { idColumns } from './idColumns';

export const usersTable = pgTable('users', {
  ...idColumns,
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
