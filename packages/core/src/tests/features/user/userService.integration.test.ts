import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { ServiceError } from '../../../errors';
import { usersTable } from '../../../features/auth/tables';
import { userService } from '../../../features/user/userService';

const EMAIL = 'user-list-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('userService', () => {
  afterAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    await db.$client.end();
  });

  it('throws on an unknown user', async () => {
    await expect(userService.get({ id: '69a53f8b-4680-4de9-9442-303b4c042bee' })).rejects.toThrow(
      ServiceError,
    );
    await expect(userService.get({ id: '69a53f8b-4680-4de9-9442-303b4c042bee' })).rejects.toThrow(
      "L'utilisateur est introuvable",
    );
  });

  it('lists users with pagination', async () => {
    await db.insert(usersTable).values({ email: EMAIL, name: 'Test User' });

    const result = await userService.list({ page: 0, pageSize: 50 });

    expect(result.rows.some((row) => row.email === EMAIL)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(result.rows.length);
  });
});
