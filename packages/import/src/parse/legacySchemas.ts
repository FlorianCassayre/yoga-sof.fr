import { z } from 'zod';

import type { MysqlValue } from './parseMysqlDump';

// The dump is read as latin1 so binary blobs survive byte for byte; text
// values are therefore latin1-encoded utf8 and decoded here.
export const legacyTextSchema = z
  .string()
  .nullable()
  .transform((value) => (value === null ? null : Buffer.from(value, 'latin1').toString('utf8')));

// Raw bytes of a `_binary` literal; latin1 reading keeps them intact.
export const legacyBlobSchema = z.string().transform((value) => Buffer.from(value, 'latin1'));

export const legacyIntSchema = z.number().int();

export const legacyTinyIntSchema = z.union([z.literal(0), z.literal(1)]);

export const legacyDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Column index maps into the legacy tuples, keyed by the fields of a row schema.
export type LegacyRowColumns<O extends z.ZodObject> = Record<keyof z.output<O> & string, number>;

// Parses one legacy tuple against the row schema, validating the dump data and
// providing the row type; the column map must cover every schema field.
export const parseLegacyRow = <O extends z.ZodObject>(
  row: MysqlValue[],
  columns: LegacyRowColumns<O>,
  schema: O,
): z.output<O> => {
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(schema.shape)) {
    raw[key] = row[columns[key as keyof z.output<O> & string]];
  }
  return schema.parse(raw);
};
