import type { Client } from 'pg';

import { cardsImport } from '../features/card/cardsImport';
import { coursesImport } from '../features/course/coursesImport';
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
}

export type ImportSummary = Omit<Awaited<ReturnType<typeof usersImport>>, 'userIds'> &
  Awaited<ReturnType<typeof coursesImport>> &
  Awaited<ReturnType<typeof cardsImport>> &
  Awaited<ReturnType<typeof membershipsImport>>;

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
  const courseCounts = await coursesImport(client, data.courses, data.registrations, userIds);
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
  await realignSequences(client, [
    'courses',
    'course_user_registrations',
    'card_templates',
    'cards',
    'card_settings',
    'memberships',
    'membership_prices',
    'membership_settings',
  ]);
  return { ...userCounts, ...courseCounts, ...cardCounts, ...membershipCounts };
};
