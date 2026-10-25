import { DrizzleAdapter } from '@auth/drizzle-adapter';

import { db } from '../../db/db';
import { accountsTable, sessionsTable, usersTable, verificationTokensTable } from './tables';

export const authAdapter = DrizzleAdapter(db, {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
});
