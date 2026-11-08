import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { usersTable } from '../../../features/auth/authTables';
import { emailService } from '../../../features/email/emailService';
import { emailsTable } from '../../../features/email/emailsTable';

const EMAIL = 'email-resend-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('emailService.resend', () => {
  let userId = '';

  const insertEmail = (sentAt: Date | null, sendError: string | null) =>
    db
      .insert(emailsTable)
      .values({
        userId,
        type: 'other',
        destinationAddress: EMAIL,
        subject: 'Sujet',
        message: '<p>Salut</p>',
        sentAt,
        sendError,
      })
      .returning();

  beforeAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    const [user] = await db
      .insert(usersTable)
      .values({ email: EMAIL, name: 'Email Test' })
      .returning();
    if (!user) {
      throw new Error('expected user to be created');
    }
    userId = user.id;
  });

  afterAll(async () => {
    await db.delete(emailsTable).where(eq(emailsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    await db.$client.end();
  });

  it('clears the send error so the worker retries the e-mail', async () => {
    const [row] = await insertEmail(null, 'boom');
    if (!row) {
      throw new Error('expected email to be created');
    }

    await withTransaction((tx) => emailService.resend({ id: row.id }, tx));

    const [after] = await db
      .select({ sendError: emailsTable.sendError })
      .from(emailsTable)
      .where(eq(emailsTable.id, row.id));
    expect(after?.sendError).toBeNull();
  });

  it('rejects an already sent e-mail', async () => {
    const [row] = await insertEmail(new Date(), null);
    if (!row) {
      throw new Error('expected email to be created');
    }

    await expect(withTransaction((tx) => emailService.resend({ id: row.id }, tx))).rejects.toThrow(
      ServiceError,
    );
  });

  it('rejects an e-mail that is not marked as failed', async () => {
    const [row] = await insertEmail(null, null);
    if (!row) {
      throw new Error('expected email to be created');
    }

    await expect(withTransaction((tx) => emailService.resend({ id: row.id }, tx))).rejects.toThrow(
      ServiceError,
    );
  });

  it('rejects an unknown e-mail', async () => {
    await expect(withTransaction((tx) => emailService.resend({ id: -1 }, tx))).rejects.toThrow(
      ServiceError,
    );
  });
});
