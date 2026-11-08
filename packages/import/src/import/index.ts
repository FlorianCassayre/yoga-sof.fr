import { config } from 'dotenv';

config({ path: '../../.env' });

import { readFileSync } from 'node:fs';

import { truncateDatabase } from '@yoga-sof/core/server';
import { Client } from 'pg';

import {
  COUPON_MODELS_TABLE,
  COUPON_PURCHASES_TABLE,
  COUPONS_TABLE,
} from '../features/card/cardSchemas';
import { COURSES_TABLE, REGISTRATIONS_TABLE } from '../features/course/courseSchemas';
import {
  BENEFICIARIES_TABLE,
  MEMBERSHIP_MODELS_TABLE,
  MEMBERSHIPS_TABLE,
} from '../features/membership/membershipSchemas';
import { ACCOUNTS_TABLE, USERS_TABLE } from '../features/user/userSchemas';
import { parseMysqlInserts } from '../parse/parseMysqlDump';
import { importLegacyData, type LegacyData } from './importLegacyData';

const LEGACY_TABLES = [
  USERS_TABLE,
  ACCOUNTS_TABLE,
  COURSES_TABLE,
  REGISTRATIONS_TABLE,
  COUPONS_TABLE,
  COUPON_MODELS_TABLE,
  COUPON_PURCHASES_TABLE,
  MEMBERSHIPS_TABLE,
  BENEFICIARIES_TABLE,
  MEMBERSHIP_MODELS_TABLE,
];

const IGNORED_TABLES = [
  'session',
  'verification_token',
  'order',
  'order_payment',
  'order_purchased_coupon',
  'order_purchased_course_registration',
  'order_purchased_membership',
  'order_replacement_course_registration',
  'order_trial_course_registration',
  'transaction',
  'membership_model',
  'course_model',
  'course_bundle',
  'course_waiting_list',
  'email_message',
  'email_message_attachment',
  'other_payment',
  'other_payment_category',
  'lock_entity',
  '_prisma_migrations',
];

const main = async () => {
  const file = process.argv[2] ?? '../../db.sql';
  const parsed = new Map(
    parseMysqlInserts(readFileSync(file, 'utf8'), [...LEGACY_TABLES]).map((insert) => [
      insert.table,
      insert.values,
    ]),
  );
  const data: LegacyData = {
    users: parsed.get(USERS_TABLE) ?? [],
    accounts: parsed.get(ACCOUNTS_TABLE) ?? [],
    courses: parsed.get(COURSES_TABLE) ?? [],
    registrations: parsed.get(REGISTRATIONS_TABLE) ?? [],
    coupons: parsed.get(COUPONS_TABLE) ?? [],
    couponModels: parsed.get(COUPON_MODELS_TABLE) ?? [],
    couponPurchases: parsed.get(COUPON_PURCHASES_TABLE) ?? [],
    memberships: parsed.get(MEMBERSHIPS_TABLE) ?? [],
    beneficiaries: parsed.get(BENEFICIARIES_TABLE) ?? [],
    membershipModels: parsed.get(MEMBERSHIP_MODELS_TABLE) ?? [],
  };
  if (data.users.length === 0 || data.courses.length === 0) {
    throw new Error(`No legacy data found in '${file}'.`);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let summary;
  try {
    await truncateDatabase(client);
    await client.query('BEGIN');
    summary = await importLegacyData(client, data);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }

  console.log(
    `Imported ${summary.users} users (${summary.roles} roles), ${summary.accounts} accounts, ${summary.courses} courses, ${summary.registrations} registrations, ${summary.cardTemplates} card templates, ${summary.cards} cards, ${summary.memberships} memberships, ${summary.beneficiaries} beneficiaries.`,
  );
  console.log(
    `Skipped ${summary.canceledCourses} canceled courses, ${summary.unsupportedCourses} courses of an unsupported type, ${summary.orphanRegistrations} registrations pointing to skipped records, ${summary.duplicateRegistrations} duplicate active registrations, ${summary.unsupportedCoupons} coupons of an unsupported type.`,
  );
  if (summary.capacityRaises > 0) {
    console.log(
      `Raised the capacity of ${summary.capacityRaises} courses to fit their existing registrations.`,
    );
  }
  if (summary.pendingAttendance > 0) {
    console.log(
      `${summary.pendingAttendance} past courses have registrations without attendance information; they will surface as pending attendance tasks.`,
    );
  }
  if (summary.disabledMemberships > 0) {
    console.log(
      `${summary.disabledMemberships} disabled legacy memberships were imported as active.`,
    );
  }
  if (summary.disabledCoupons > 0) {
    console.log(
      `${summary.disabledCoupons} disabled legacy coupons were imported as active cards.`,
    );
  }
  if (summary.duplicateEmails > 0) {
    console.log(
      `${summary.duplicateEmails} users lost their duplicate email address, already used by another account.`,
    );
  }
  console.log(`Ignored legacy features: ${IGNORED_TABLES.join(', ')}.`);
};

void main();
