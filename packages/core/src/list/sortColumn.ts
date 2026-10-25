import { getColumns } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

export const sortColumn = <
  Table extends PgTable,
  Field extends keyof Table['_']['columns'] & string,
>(
  table: Table,
  field: Field,
): Table['_']['columns'][Field] => getColumns(table)[field];
