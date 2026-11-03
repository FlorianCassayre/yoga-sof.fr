import type { PgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Collapses to `never` for `never`, so the required type parameter of
// `createListSchema` cannot be silently widened when it is omitted.
export type SortableColumns<Table extends PgTable> = Table extends never
  ? never
  : {
      [Key in keyof Table['_']['columns']]?: true;
    };

export const sortSchema = <Columns extends object>(columns: Columns) => {
  const fields = Object.keys(columns) as [keyof Columns & string];

  return z
    .object({ field: z.enum(fields), sort: z.enum(['asc', 'desc']) })
    .array()
    .min(1)
    .max(1);
};
