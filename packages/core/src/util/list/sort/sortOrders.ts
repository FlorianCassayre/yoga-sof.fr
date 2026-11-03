import { asc, desc, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

type OrderableColumn = PgColumn | SQL | SQL.Aliased;

const orderColumn = (column: OrderableColumn, sort: 'asc' | 'desc'): SQL =>
  sort === 'desc' ? desc(column) : asc(column);

export const sortOrders = <Columns extends Record<string, OrderableColumn>>(
  columns: Columns,
  entries: { field: keyof Columns & string; sort: 'asc' | 'desc' }[],
): SQL[] => entries.map(({ field, sort }) => orderColumn(columns[field]!, sort));
