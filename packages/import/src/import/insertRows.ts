import { getTableColumns, getTableName, type InferInsertModel, type Table } from 'drizzle-orm';
import type { Client } from 'pg';

// The identity id column is excluded from InferInsertModel; it stays optional so that
// tables without one (composite primary keys) remain assignable.
export type InsertRow<T extends Table> = InferInsertModel<T> & { id?: number | string };

export type InsertValue = string | number | boolean | Date | Buffer | null;

const CHUNK_SIZE = 1000;

const serialize = (value: InsertValue): string => {
  if (value === null) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (Buffer.isBuffer(value)) {
    return `decode('${value.toString('hex')}', 'hex')`;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Cannot serialize the number '${value}'.`);
    }
    return String(value);
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (value.includes('\0')) {
    throw new Error(`Cannot serialize a string containing a NUL byte: '${value.slice(0, 50)}'.`);
  }
  return `'${value.replaceAll("'", "''")}'`;
};

export const insertRows = async <T extends Table>(
  client: Client,
  table: T,
  rows: InsertRow<T>[],
  overriding = false,
) => {
  if (rows.length === 0) {
    return;
  }
  const columns = getTableColumns(table);
  const keys = Object.keys(rows[0]!);
  const prefix = `INSERT INTO "${getTableName(table)}" (${keys
    .map((key) => `"${columns[key]!.name}"`)
    .join(', ')})${overriding ? ' OVERRIDING SYSTEM VALUE' : ''} VALUES `;
  for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
    const chunk = rows.slice(start, start + CHUNK_SIZE);
    const values = chunk
      .map(
        (row) =>
          `(${keys.map((key) => serialize((row as Record<string, unknown>)[key] as InsertValue)).join(', ')})`,
      )
      .join(', ');
    await client.query(prefix + values);
  }
};
