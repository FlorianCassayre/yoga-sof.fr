import { and, eq } from 'drizzle-orm';
import type { PgColumn, PgInsertValue, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';

import { assertConflict, assertFound, assertState } from '../errors';
import type { DbTransaction } from './db';

type IdColumn = PgColumn & { _: { data: string | number } };
type VersionColumn = PgColumn & { _: { data: number } };

type IdTable = PgTable & { id: IdColumn };
type VersionedTable = PgTable & { id: IdColumn; version: VersionColumn };

export const getRow = async <Row>(
  tx: DbTransaction,
  table: IdTable,
  id: IdColumn['_']['data'],
  notFoundMessage: string,
): Promise<Row> => {
  const [row] = (await tx.select().from(table).where(eq(table.id, id)).limit(1)) as Row[];
  assertFound(row, notFoundMessage);
  return row;
};

export const createRow = async <Row>(
  tx: DbTransaction,
  table: PgTable,
  values: PgInsertValue<PgTable>,
  stateMessage: string,
): Promise<Row> => {
  const [row] = (await tx.insert(table).values(values).returning()) as Row[];
  assertState(row, stateMessage);
  return row;
};

export const updateRow = async <Row>(
  tx: DbTransaction,
  table: VersionedTable,
  values: { id: IdColumn['_']['data']; version: number } & PgUpdateSetSource<PgTable>,
  conflictMessage: string,
): Promise<Row> => {
  const { id, version, ...changes } = values;
  const [row] = (await tx
    .update(table)
    .set({ ...changes, version: version + 1 })
    .where(and(eq(table.id, id), eq(table.version, version)))
    .returning()) as Row[];
  assertConflict(row, conflictMessage);
  return row;
};
