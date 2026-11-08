import { accountsTable, userRolesTable, usersTable } from '@yoga-sof/core/server';
import type { Client } from 'pg';
import { v5 as uuidV5 } from 'uuid';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import {
  ACCOUNT_COLUMNS,
  accountLegacySchema,
  ROLES,
  USER_COLUMNS,
  USER_ID_NAMESPACE,
  userLegacySchema,
} from './userLegacySchemas';

interface UsersImportResult {
  userIds: Map<number, string>;
  users: number;
  accounts: number;
  roles: number;
  duplicateEmails: number;
}

const legacyUser = (row: MysqlValue[]) => parseLegacyRow(row, USER_COLUMNS, userLegacySchema);

const legacyAccount = (row: MysqlValue[]) =>
  parseLegacyRow(row, ACCOUNT_COLUMNS, accountLegacySchema);

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
      emailVerified: legacy.emailVerified,
      image: legacy.image,
    });
    const role = ROLES[legacy.role];
    if (role) {
      roles.push({ userId: id, role, createdAt: legacy.createdAt });
    }
  }
  await insertRows(client, usersTable, users);
  await insertRows(client, userRolesTable, roles);
  const accounts = await accountsImport(client, accountRows, ids);
  return { userIds: ids, users: users.length, accounts, roles: roles.length, duplicateEmails };
};
