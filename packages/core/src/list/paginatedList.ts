import { count, type SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { listSchema } from './listSchema';

export type PaginatedListParams = z.infer<typeof listSchema>;

export interface PaginatedListOptions {
  orderBy: SQL[];
}

export interface PaginatedListResult<Row> {
  rows: Row[];
  total: number;
}

export const paginatedList = async <Row>(
  db: NodePgDatabase,
  table: PgTable,
  { page, pageSize }: PaginatedListParams,
  { orderBy }: PaginatedListOptions,
): Promise<PaginatedListResult<Row>> => {
  const rows = (await db
    .select()
    .from(table)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset(page * pageSize)) as Row[];
  const totals = await db.select({ total: count() }).from(table);

  return { rows, total: totals[0]?.total ?? 0 };
};
