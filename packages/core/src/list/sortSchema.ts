import type { PgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export type SortableColumns<Table extends PgTable> = {
  [Key in keyof Table['_']['columns']]?: true;
};

export const sortSchema = <Columns extends Record<string, true>>(columns: Columns) => {
  const fields = Object.keys(columns) as [keyof Columns & string];

  return z
    .object({ field: z.enum(fields), sort: z.enum(['asc', 'desc']) })
    .array()
    .min(1)
    .max(1);
};
