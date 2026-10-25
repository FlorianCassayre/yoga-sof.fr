import { integer } from 'drizzle-orm/pg-core';

import { idColumns } from './idColumns';

export const idVersionedColumns = {
  ...idColumns,
  version: integer().notNull().default(1),
};
