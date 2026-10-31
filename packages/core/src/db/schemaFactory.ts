import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { getColumns } from 'drizzle-orm/utils';
import { createSchemaFactory } from 'drizzle-orm/zod';
import { z } from 'zod';

const factory = createSchemaFactory({
  coerce: { date: true, number: true },
});

// An empty input would coerce to a default value (0 or the epoch), so it is
// normalized to undefined and rejected by the coerced schema instead.
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const wrapCoercedColumns = <TSchema extends z.ZodObject>(
  schema: TSchema,
  table: PgTable,
): TSchema => {
  const isCoerced = (column: PgColumn) =>
    String(column.dataType).startsWith('number') || column.columnType === 'PgTimestamp';
  const wrapped = Object.entries(getColumns(table))
    .filter(([key, column]) => key in schema.shape && isCoerced(column))
    .map(([key]) => [key, z.preprocess(emptyToUndefined, schema.shape[key])] as const);

  return wrapped.length === 0 ? schema : (schema.extend(Object.fromEntries(wrapped)) as TSchema);
};

export const createInsertSchema = factory.createInsertSchema;

export const createSelectByIdSchema = <
  TTable extends PgTable,
  TIdColumn extends PgColumn & { _: { data: string | number } },
>(
  table: TTable & { id: TIdColumn },
) => {
  const selectSchema = factory.createSelectSchema(table as TTable);
  const { id } = selectSchema.shape as { id: z.ZodType<TIdColumn['_']['data']> };

  return z.object({ id });
};

export const createVersionedInsertSchema = <TTable extends PgTable>(
  table: TTable & { version: PgColumn & { _: { data: number } } },
) => {
  const schema = factory.createInsertSchema(table as TTable);

  return wrapCoercedColumns(
    schema.omit({ version: true } as never) as z.ZodObject<Omit<typeof schema.shape, 'version'>>,
    table,
  );
};

export const createUpdateSchema = <
  TTable extends PgTable,
  TIdColumn extends PgColumn & { _: { data: string | number } },
>(
  table: TTable & { id: TIdColumn },
) => {
  const schema = factory.createUpdateSchema(table as TTable);
  const selectSchema = factory.createSelectSchema(table as TTable);
  const { id } = selectSchema.shape as { id: z.ZodType<TIdColumn['_']['data']> };

  return wrapCoercedColumns(schema.extend({ id }), table);
};

export const createVersionedUpdateSchema = <
  TTable extends PgTable,
  TIdColumn extends PgColumn & { _: { data: string | number } },
>(
  table: TTable & { id: TIdColumn; version: PgColumn & { _: { data: number } } },
) => {
  const schema = factory.createUpdateSchema(table as TTable);
  const selectSchema = factory.createSelectSchema(table as TTable);
  const { id, version } = selectSchema.shape as {
    id: z.ZodType<TIdColumn['_']['data']>;
    version: z.ZodType<number>;
  };

  return wrapCoercedColumns(schema.extend({ id, version }), table);
};
