import { like } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { usersTable } from '../../../features/auth/authTables';
import { roleService } from '../../../features/role/roleService';

const EMAIL_SUFFIX = 'role-service-test@example.com';
const EMAIL = EMAIL_SUFFIX;

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('roleService', () => {
  const clearUsers = () => db.delete(usersTable).where(like(usersTable.email, `%${EMAIL_SUFFIX}`));

  beforeAll(clearUsers);

  afterAll(async () => {
    await clearUsers();
    await db.$client.end();
  });

  it('grants a role once and reads it back', async () => {
    const [user] = await db
      .insert(usersTable)
      .values({ email: EMAIL, name: 'Role Test' })
      .returning();
    if (!user) throw new Error('expected user to be created');

    await withTransaction((tx) =>
      roleService.grantUserRole({ userId: user.id, role: 'manager' }, tx),
    );
    await withTransaction((tx) =>
      roleService.grantUserRole({ userId: user.id, role: 'administrator' }, tx),
    );

    expect(await withTransaction((tx) => roleService.getUserRole(user.id, tx))).toBe('manager');
    expect(
      await withTransaction((tx) => roleService.hasPermission(user.id, 'adminPanel', tx)),
    ).toBe(true);
  });

  it('reports no permission for a user without a role', async () => {
    const [user] = await db
      .insert(usersTable)
      .values({ email: `no-role-${EMAIL}`, name: 'No Role' })
      .returning();
    if (!user) throw new Error('expected user to be created');

    expect(await withTransaction((tx) => roleService.getUserRole(user.id, tx))).toBeNull();
    expect(
      await withTransaction((tx) => roleService.hasPermission(user.id, 'adminPanel', tx)),
    ).toBe(false);
  });

  it('lists the users that have a role', async () => {
    const [user] = await db
      .insert(usersTable)
      .values({ email: `list-${EMAIL}`, name: 'Listed Role' })
      .returning();
    if (!user) throw new Error('expected user to be created');
    await withTransaction((tx) =>
      roleService.grantUserRole({ userId: user.id, role: 'associate' }, tx),
    );

    const result = await withTransaction((tx) =>
      roleService.list({ page: 0, pageSize: 50, sort: [{ field: 'userName', sort: 'asc' }] }, tx),
    );

    expect(result.rows.some((row) => row.userId === user.id && row.role === 'associate')).toBe(
      true,
    );
    expect(result.total).toBeGreaterThanOrEqual(result.rows.length);
  });
});
