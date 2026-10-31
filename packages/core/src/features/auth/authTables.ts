import { defineTables } from '@auth/drizzle-adapter';

export const { usersTable, accountsTable, sessionsTable, verificationTokensTable } = defineTables();
