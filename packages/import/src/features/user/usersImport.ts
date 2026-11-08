import { accountsTable, userRolesTable, usersTable } from '@yoga-sof/core/server';
import type { Client } from 'pg';
import { v5 as uuidV5 } from 'uuid';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyDateTime } from '../../parse/legacyDateTime';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { ACCOUNT_COLUMNS, ROLES, USER_COLUMNS, USER_ID_NAMESPACE } from './userSchemas';

interface UsersImportResult {
  userIds: Map<number, string>;
  users: number;
  accounts: number;
  roles: number;
  duplicateEmails: number;
}

const accountsImport = async (client: Client, rows: MysqlValue[][], ids: Map<number, string>) => {
  const accounts: InsertRow<typeof accountsTable>[] = [];
  for (const legacy of rows.map(legacyAccount)) {
    const userId = ids.get(legacy.userId);
    if (!userId) {
      continue;
    }
    accounts.push({
      userId,
      type: legacy.type,
      provider: legacy.provider,
      providerAccountId: legacy.providerAccountId,
      refresh_token: legacy.refreshToken,
      access_token: legacy.accessToken,
      expires_at: legacy.expiresAt,
      token_type: legacy.tokenType,
      scope: legacy.scope,
      id_token: legacy.idToken,
      session_state: legacy.sessionState,
    });
  }
  await insertRows(client, accountsTable, accounts);
  return accounts.length;
};

const legacyUser = (row: MysqlValue[]) => ({
  id: row[USER_COLUMNS.id] as number,
  name: row[USER_COLUMNS.name] as string | null,
  email: row[USER_COLUMNS.email] as string | null,
  emailVerified: row[USER_COLUMNS.email_verified] as string | null,
  image: row[USER_COLUMNS.image] as string | null,
  customEmail: row[USER_COLUMNS.custom_email] as string | null,
  customName: row[USER_COLUMNS.custom_name] as string | null,
  createdAt: row[USER_COLUMNS.created_at] as string | null,
  role: row[USER_COLUMNS.role] as string,
});

const legacyAccount = (row: MysqlValue[]) => ({
  userId: row[ACCOUNT_COLUMNS.user_id] as number,
  type: row[ACCOUNT_COLUMNS.type] as string,
  provider: row[ACCOUNT_COLUMNS.provider] as string,
  providerAccountId: row[ACCOUNT_COLUMNS.provider_account_id] as string,
  refreshToken: row[ACCOUNT_COLUMNS.refresh_token] as string | null,
  accessToken: row[ACCOUNT_COLUMNS.access_token] as string | null,
  expiresAt: row[ACCOUNT_COLUMNS.expires_at] as number | null,
  tokenType: row[ACCOUNT_COLUMNS.token_type] as string | null,
  scope: row[ACCOUNT_COLUMNS.scope] as string | null,
  idToken: row[ACCOUNT_COLUMNS.id_token] as string | null,
  sessionState: row[ACCOUNT_COLUMNS.session_state] as string | null,
});

export const usersImport = async (
  client: Client,
  userRows: MysqlValue[][],
  accountRows: MysqlValue[][],
): Promise<UsersImportResult> => {
  const ids = new Map<number, string>();
  const users: InsertRow<typeof usersTable>[] = [];
  const roles: InsertRow<typeof userRolesTable>[] = [];
  const takenEmails = new Set<string>();
  let duplicateEmails = 0;
  for (const legacy of userRows.map(legacyUser)) {
    const id = uuidV5(String(legacy.id), USER_ID_NAMESPACE);
    ids.set(legacy.id, id);
    let email = legacy.email ?? legacy.customEmail;
    if (email !== null) {
      if (takenEmails.has(email.toLowerCase())) {
        email = null;
        duplicateEmails++;
      } else {
        takenEmails.add(email.toLowerCase());
      }
    }
    users.push({
      id,
      name: legacy.customName ?? legacy.name,
      email,
      emailVerified: parseLegacyDateTime(legacy.emailVerified),
      image: legacy.image,
    });
    const role = ROLES[legacy.role as keyof typeof ROLES];
    if (role) {
      roles.push({ userId: id, role, createdAt: parseLegacyDateTime(legacy.createdAt)! });
    }
  }
  await insertRows(client, usersTable, users);
  await insertRows(client, userRolesTable, roles);
  const accounts = await accountsImport(client, accountRows, ids);
  return { userIds: ids, users: users.length, accounts, roles: roles.length, duplicateEmails };
};
