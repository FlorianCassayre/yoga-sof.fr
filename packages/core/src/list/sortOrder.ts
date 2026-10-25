import { asc, desc, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import { sortColumn } from './sortColumn';

export const sortOrder = <
  Table extends PgTable,
  Field extends keyof Table['_']['columns'] & string,
>(
  table: Table,
  { field, sort }: { field: Field; sort: 'asc' | 'desc' },
): SQL => (sort === 'desc' ? desc(sortColumn(table, field)) : asc(sortColumn(table, field)));
