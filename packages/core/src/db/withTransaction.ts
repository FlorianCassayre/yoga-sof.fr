import { db, type DbTransaction } from './db';

export interface WithTransactionOptions {
  readOnly?: boolean;
}

export const withTransaction = <T>(
  callback: (tx: DbTransaction) => Promise<T>,
  { readOnly }: WithTransactionOptions = {},
): Promise<T> => db.transaction(callback, readOnly ? { accessMode: 'read only' } : undefined);
