import type { EmailType } from '@yoga-sof/core';
import { z } from 'zod';

import { legacyDatetimeSchema, legacyNullableDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyBlobSchema,
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTextSchema,
} from '../../parse/legacySchemas';

export const EMAILS_TABLE = 'email_message';
export const EMAIL_ATTACHMENTS_TABLE = 'email_message_attachment';

export const emailLegacySchema = z.object({
  id: legacyIntSchema,
  userId: legacyIntSchema,
  type: z.enum([
    'SESSION_CANCELED',
    'SESSION_REMINDER_NEWCOMER',
    'SESSION_REGISTRATION',
    'ORDER_CREATED',
    'COURSE_WAITING_LIST',
    'OTHER',
  ]),
  destinationAddress: legacyTextSchema,
  subject: legacyTextSchema,
  message: legacyTextSchema,
  createdAt: legacyDatetimeSchema,
  sentAt: legacyNullableDatetimeSchema,
  ccAddress: legacyTextSchema,
});

export const EMAIL_COLUMNS: LegacyRowColumns<typeof emailLegacySchema> = {
  id: 0,
  userId: 1,
  type: 2,
  destinationAddress: 3,
  subject: 4,
  message: 5,
  createdAt: 6,
  sentAt: 7,
  ccAddress: 8,
};

export const EMAIL_TYPES: Record<z.output<typeof emailLegacySchema>['type'], EmailType> = {
  SESSION_CANCELED: 'sessionCanceled',
  SESSION_REMINDER_NEWCOMER: 'sessionReminderNewcomer',
  SESSION_REGISTRATION: 'sessionRegistration',
  ORDER_CREATED: 'orderCreated',
  COURSE_WAITING_LIST: 'courseWaitingList',
  OTHER: 'other',
};

export const emailAttachmentLegacySchema = z.object({
  id: legacyIntSchema,
  emailMessageId: legacyIntSchema,
  filename: legacyTextSchema,
  file: legacyBlobSchema,
});

export const EMAIL_ATTACHMENT_COLUMNS: LegacyRowColumns<typeof emailAttachmentLegacySchema> = {
  id: 0,
  emailMessageId: 1,
  filename: 2,
  file: 3,
};
