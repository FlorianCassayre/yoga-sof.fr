import { emailAttachmentsTable, emailsTable } from '@yoga-sof/core/server';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import {
  EMAIL_ATTACHMENT_COLUMNS,
  EMAIL_COLUMNS,
  EMAIL_TYPES,
  emailAttachmentLegacySchema,
  emailLegacySchema,
} from './emailLegacySchemas';

interface EmailsImportResult {
  emails: number;
  unsentEmails: number;
  orphanEmails: number;
  emailAttachments: number;
  orphanEmailAttachments: number;
}

const legacyEmail = (row: MysqlValue[]) => parseLegacyRow(row, EMAIL_COLUMNS, emailLegacySchema);

const legacyEmailAttachment = (row: MysqlValue[]) =>
  parseLegacyRow(row, EMAIL_ATTACHMENT_COLUMNS, emailAttachmentLegacySchema);

export const emailsImport = async (
  client: Client,
  emailRows: MysqlValue[][],
  attachmentRows: MysqlValue[][],
  userIds: Map<number, string>,
): Promise<EmailsImportResult> => {
  const emails: InsertRow<typeof emailsTable>[] = [];
  let orphanEmails = 0;
  for (const legacy of emailRows.map(legacyEmail)) {
    const userId = userIds.get(legacy.userId);
    if (
      !userId ||
      legacy.destinationAddress === null ||
      legacy.subject === null ||
      legacy.message === null
    ) {
      orphanEmails++;
      continue;
    }
    emails.push({
      id: legacy.id,
      userId,
      type: EMAIL_TYPES[legacy.type],
      destinationAddress: legacy.destinationAddress,
      ccAddress: legacy.ccAddress,
      subject: legacy.subject,
      message: legacy.message,
      createdAt: legacy.createdAt,
      sentAt: legacy.sentAt,
      // An e-mail imported without a sent date must NOT be picked up by the
      // cron worker (the legacy state is lost) — a placeholder error marks it
      // as failed so only a manual resend sends it again.
      sendError: legacy.sentAt === null ? '?' : null,
    });
  }
  await insertRows(client, emailsTable, emails, true);

  const attachments: InsertRow<typeof emailAttachmentsTable>[] = [];
  let orphanEmailAttachments = 0;
  const emailIds = new Set(emails.map((email) => email.id));
  for (const legacy of attachmentRows.map(legacyEmailAttachment)) {
    if (!emailIds.has(legacy.emailMessageId) || legacy.filename === null) {
      orphanEmailAttachments++;
      continue;
    }
    attachments.push({
      id: legacy.id,
      emailId: legacy.emailMessageId,
      filename: legacy.filename,
      file: legacy.file,
    });
  }
  await insertRows(client, emailAttachmentsTable, attachments, true);

  return {
    emails: emails.length,
    unsentEmails: emails.filter((email) => email.sentAt === null).length,
    orphanEmails,
    emailAttachments: attachments.length,
    orphanEmailAttachments,
  };
};
