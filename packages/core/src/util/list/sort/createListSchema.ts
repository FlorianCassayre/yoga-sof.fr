import type { PgTable } from 'drizzle-orm/pg-core';

import { listSchema } from '../pagination/listSchema';
import { type SortableColumns, sortSchema } from './sortSchema';

export const createListSchema = <Table extends PgTable = never>(
  columns: NoInfer<SortableColumns<Table>>,
) =>
  listSchema.extend({
    sort: sortSchema(columns),
  });
