import { and, count, ilike, or, type SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { listSchema } from './listSchema';
import { pagination } from './pagination';
import { sortOrder } from './sortOrder';

export type PaginatedListParams = z.infer<typeof listSchema>;

export interface PaginatedListOptions {
  searchColumns?: (PgColumn | SQL)[];
  where?: SQL;
}

export interface PaginatedListResult<Row> {
  rows: Row[];
  total: number;
}

export const paginatedList = async <Row>(
  db: NodePgDatabase,
  table: PgTable,
  {
    page,
    pageSize,
    search,
    sort,
  }: PaginatedListParams & {
    sort: { field: string; sort: 'asc' | 'desc' }[];
  },
  { searchColumns, where: extraWhere }: PaginatedListOptions,
): Promise<PaginatedListResult<Row>> => {
  const searchWhere =
    search && searchColumns
      ? or(...searchColumns.map((column) => ilike(column, `%${search}%`)))
      : undefined;
  const where = and(extraWhere, searchWhere);
  const orderBy = sort.map((item) => sortOrder(table, item));
  const { limit, offset } = pagination({ page, pageSize });

  const rows = (await db
    .select()
    .from(table)
    .where(where)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset)) as Row[];
  const totals = await db.select({ total: count() }).from(table).where(where);

  return { rows, total: totals[0]?.total ?? 0 };
};
