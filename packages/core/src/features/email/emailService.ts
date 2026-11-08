import { and, count, eq, getColumns } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { assertConflict, assertFound } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { emailAttachmentsTable } from './emailAttachmentsTable';
import type {
  emailAttachmentGetSchema,
  emailCreateSchema,
  emailGetSchema,
  emailListSchema,
} from './emailSchemas';
import { emailsTable } from './emailsTable';

const orderColumns = {
  userName: usersTable.name,
  type: emailsTable.type,
  destinationAddress: emailsTable.destinationAddress,
  subject: emailsTable.subject,
  createdAt: emailsTable.createdAt,
  sentAt: emailsTable.sentAt,
};

export const emailService = {
  list: async ({ sort, ...params }: z.infer<typeof emailListSchema>, tx: DbTransaction) => {
    const { limit, offset } = pagination(params);

    const rows = await tx
      .select({
        id: emailsTable.id,
        userId: emailsTable.userId,
        userName: usersTable.name,
        type: emailsTable.type,
        destinationAddress: emailsTable.destinationAddress,
        subject: emailsTable.subject,
        createdAt: emailsTable.createdAt,
        sentAt: emailsTable.sentAt,
      })
      .from(emailsTable)
      .innerJoin(usersTable, eq(usersTable.id, emailsTable.userId))
      .where(params.userId === undefined ? undefined : eq(emailsTable.userId, params.userId))
      .orderBy(...sortOrders(orderColumns, sort))
      .limit(limit)
      .offset(offset);

    const [totals] = await tx
      .select({ total: count() })
      .from(emailsTable)
      .where(params.userId === undefined ? undefined : eq(emailsTable.userId, params.userId));

    return { rows, total: totals?.total ?? 0 };
  },

  get: async ({ id }: z.infer<typeof emailGetSchema>, tx: DbTransaction) => {
    const [row] = await tx
      .select({
        ...getColumns(emailsTable),
        userName: usersTable.name,
      })
      .from(emailsTable)
      .innerJoin(usersTable, eq(usersTable.id, emailsTable.userId))
      .where(eq(emailsTable.id, id));
    assertFound(row, "L'e-mail est introuvable.");

    return row;
  },

  resend: async ({ id }: z.infer<typeof emailGetSchema>, tx: DbTransaction) => {
    // Locks the row so a concurrent send (the worker holds it from its
    // SELECT … FOR UPDATE until it commits) cannot race with the re-check.
    const [row] = await tx
      .select({ sentAt: emailsTable.sentAt, sendError: emailsTable.sendError })
      .from(emailsTable)
      .where(eq(emailsTable.id, id))
      .for('update');
    assertFound(row, "L'e-mail est introuvable.");
    assertConflict(row.sentAt === null, 'Cet e-mail a déjà été envoyé.');
    assertConflict(row.sendError !== null, 'Seuls les e-mails en échec peuvent être renvoyés.');

    await tx.update(emailsTable).set({ sendError: null }).where(eq(emailsTable.id, id));
  },

  listAttachments: async ({ id }: z.infer<typeof emailGetSchema>, tx: DbTransaction) =>
    tx
      .select({ id: emailAttachmentsTable.id, filename: emailAttachmentsTable.filename })
      .from(emailAttachmentsTable)
      .where(eq(emailAttachmentsTable.emailId, id))
      .orderBy(emailAttachmentsTable.id),

  getAttachment: async (
    { id, attachmentId }: z.infer<typeof emailAttachmentGetSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .select({ filename: emailAttachmentsTable.filename, file: emailAttachmentsTable.file })
      .from(emailAttachmentsTable)
      .where(
        and(eq(emailAttachmentsTable.id, attachmentId), eq(emailAttachmentsTable.emailId, id)),
      );
    assertFound(row, 'La pièce jointe est introuvable.');

    return row;
  },

  create: async (
    { ccAddress, ...values }: z.infer<typeof emailCreateSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .insert(emailsTable)
      .values({ ...values, ccAddress: ccAddress ?? null })
      .returning();

    return row;
  },
};
