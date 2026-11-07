import { count, eq } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import type { Permission } from './permission/Permission';
import { ROLE_PERMISSIONS } from './permission/rolePermissions';
import type { roleListSchema } from './roleSchemas';
import type { RoleType } from './type/RoleType';
import { userRolesTable } from './userRolesTable';

const LIST_ORDER_COLUMNS = {
  userName: usersTable.name,
  role: userRolesTable.role,
};

export const roleService = {
  getUserRole: async (userId: string, tx: DbTransaction): Promise<RoleType | null> => {
    const [row] = await tx
      .select({ role: userRolesTable.role })
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId));

    return row?.role ?? null;
  },

  hasPermission: async (
    userId: string,
    permission: Permission,
    tx: DbTransaction,
  ): Promise<boolean> => {
    const role = await roleService.getUserRole(userId, tx);

    return role !== null && ROLE_PERMISSIONS[role].includes(permission);
  },

  grantUserRole: async (
    { userId, role }: { userId: string; role: RoleType },
    tx: DbTransaction,
  ) => {
    await tx.insert(userRolesTable).values({ userId, role }).onConflictDoNothing();
  },

  list: async ({ sort, ...params }: z.infer<typeof roleListSchema>, tx: DbTransaction) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const rows = await tx
      .select({
        userId: userRolesTable.userId,
        userName: usersTable.name,
        role: userRolesTable.role,
      })
      .from(userRolesTable)
      .innerJoin(usersTable, eq(usersTable.id, userRolesTable.userId))
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(userRolesTable);

    return { rows, total: totals?.total ?? 0 };
  },
};
