import { pgEnum } from 'drizzle-orm/pg-core';

export const emailTypeEnum = pgEnum('email_type', [
  'sessionCanceled',
  'sessionReminderNewcomer',
  'sessionRegistration',
  'orderCreated',
  'courseWaitingList',
  'other',
]);
