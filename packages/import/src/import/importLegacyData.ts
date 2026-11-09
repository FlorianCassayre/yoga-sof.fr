import type { Client } from 'pg';

import { cardsImport } from '../features/card/cardsImport';
import { coursesImport, reconcileRegisteredCounts } from '../features/course/coursesImport';
import { registrationsImport } from '../features/courseUserRegistration/registrationsImport';
import { courseWaitingListImport } from '../features/courseUserWaitingList/courseWaitingListImport';
import { emailsImport } from '../features/email/emailsImport';
import { membershipsImport } from '../features/membership/membershipsImport';
import { usersImport } from '../features/user/usersImport';
import type { MysqlValue } from '../parse/parseMysqlDump';

export interface LegacyData {
  users: MysqlValue[][];
  accounts: MysqlValue[][];
  courses: MysqlValue[][];
  registrations: MysqlValue[][];
  coupons: MysqlValue[][];
  couponModels: MysqlValue[][];
  couponPurchases: MysqlValue[][];
  memberships: MysqlValue[][];
  beneficiaries: MysqlValue[][];
  membershipModels: MysqlValue[][];
  emails: MysqlValue[][];
  emailAttachments: MysqlValue[][];
  waitingListEntries: MysqlValue[][];
}

export type ImportSummary = Omit<Awaited<ReturnType<typeof usersImport>>, 'userIds'> &
  Omit<Awaited<ReturnType<typeof coursesImport>>, 'keptCourseIds'> &
  Awaited<ReturnType<typeof registrationsImport>> &
  Awaited<ReturnType<typeof reconcileRegisteredCounts>> &
  Awaited<ReturnType<typeof cardsImport>> &
  Awaited<ReturnType<typeof membershipsImport>> &
  Awaited<ReturnType<typeof emailsImport>> &
  Awaited<ReturnType<typeof courseWaitingListImport>>;

const realignSequences = async (client: Client, tables: string[]) => {
  for (const table of tables) {
    await client.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT MAX(id) FROM "${table}"))`,
    );
  }
};

export const importLegacyData = async (
  client: Client,
  data: LegacyData,
): Promise<ImportSummary> => {
  const { userIds, ...userCounts } = await usersImport(client, data.users, data.accounts);
  const { keptCourseIds, ...courseCounts } = await coursesImport(client, data.courses);
  const registrationCounts = await registrationsImport(
    client,
    data.registrations,
    userIds,
    keptCourseIds,
  );
  const reconcileCounts = await reconcileRegisteredCounts(client);
  const cardCounts = await cardsImport(
    client,
    data.coupons,
    data.couponModels,
    data.couponPurchases,
    userIds,
  );
  const membershipCounts = await membershipsImport(
    client,
    data.memberships,
    data.beneficiaries,
    data.membershipModels,
    userIds,
  );
  const emailCounts = await emailsImport(client, data.emails, data.emailAttachments, userIds);
  const waitingListCounts = await courseWaitingListImport(
    client,
    data.waitingListEntries,
    data.emails,
    userIds,
    keptCourseIds,
  );
  await realignSequences(client, [
    'courses',
    'course_user_registrations',
    'course_user_waiting_lists',
    'card_templates',
    'cards',
    'card_settings',
    'memberships',
    'membership_prices',
    'membership_settings',
    'emails',
    'email_attachments',
  ]);
  return {
    ...userCounts,
    ...courseCounts,
    ...registrationCounts,
    ...reconcileCounts,
    ...cardCounts,
    ...membershipCounts,
    ...emailCounts,
    ...waitingListCounts,
  };
};
