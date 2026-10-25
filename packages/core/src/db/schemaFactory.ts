import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { createSchemaFactory } from 'drizzle-orm/zod';
import { z } from 'zod';

const factory = createSchemaFactory({
  coerce: { date: true, number: true },
});

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

  return schema.omit({ version: true } as never) as z.ZodObject<
    Omit<typeof schema.shape, 'version'>
  >;
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

  return schema.extend({ id });
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

  return schema.extend({ id, version });
};
