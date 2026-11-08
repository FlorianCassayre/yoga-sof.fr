import {
  membershipBeneficiariesTable,
  membershipPricesTable,
  membershipSettingsTable,
  membershipsTable,
} from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyDateTime } from '../../parse/legacyDateTime';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import {
  BENEFICIARY_COLUMNS,
  MEMBERSHIP_COLUMNS,
  MEMBERSHIP_MODEL_COLUMNS,
  MEMBERSHIP_TYPES,
} from './membershipSchemas';

interface MembershipsImportResult {
  memberships: number;
  beneficiaries: number;
  disabledMemberships: number;
}

const legacyMembership = (row: MysqlValue[]) => ({
  id: row[MEMBERSHIP_COLUMNS.id] as number,
  type: row[MEMBERSHIP_COLUMNS.type] as string,
  dateStart: row[MEMBERSHIP_COLUMNS.date_start] as string,
  dateEnd: row[MEMBERSHIP_COLUMNS.date_end] as string,
  price: row[MEMBERSHIP_COLUMNS.price] as number,
  disabled: row[MEMBERSHIP_COLUMNS.disabled] as number,
  createdAt: row[MEMBERSHIP_COLUMNS.created_at] as string,
});

const legacyBeneficiary = (row: MysqlValue[]) => ({
  membershipId: row[BENEFICIARY_COLUMNS.A] as number,
  userId: row[BENEFICIARY_COLUMNS.B] as number,
});

const legacyMembershipModel = (row: MysqlValue[]) => ({
  type: row[MEMBERSHIP_MODEL_COLUMNS.id] as string,
  price: row[MEMBERSHIP_MODEL_COLUMNS.price] as number,
});

export const membershipsImport = async (
  client: Client,
  membershipRows: MysqlValue[][],
  beneficiaryRows: MysqlValue[][],
  modelRows: MysqlValue[][],
  userIds: Map<number, string>,
): Promise<MembershipsImportResult> => {
  const memberships = new Map<
    number,
    {
      type: 'individuelle' | 'famille';
      startsAt: string;
      endsAt: string;
      price: number;
      createdAt: Date;
    }
  >();
  const startMonths = new Map<number, number>();
  let disabledMemberships = 0;
  for (const legacy of membershipRows.map(legacyMembership)) {
    const type = MEMBERSHIP_TYPES[legacy.type as keyof typeof MEMBERSHIP_TYPES];
    if (!type) {
      continue;
    }
    if (legacy.disabled) {
      disabledMemberships++;
    }
    memberships.set(legacy.id, {
      type,
      startsAt: legacy.dateStart,
      endsAt: legacy.dateEnd,
      price: legacy.price * 100,
      createdAt: parseLegacyDateTime(legacy.createdAt)!,
    });
    const month = +legacy.dateStart.slice(5, 7);
    startMonths.set(month, (startMonths.get(month) ?? 0) + 1);
  }
  const membershipValues: InsertRow<typeof membershipsTable>[] = [...memberships].map(
    ([id, membership]) => ({
      id,
      version: 1,
      type: membership.type,
      price: membership.price,
      startsAt: membership.startsAt,
      endsAt: membership.endsAt,
      createdAt: membership.createdAt,
    }),
  );
  await insertRows(client, membershipsTable, membershipValues, true);

  const beneficiaries = new Set<string>();
  const beneficiaryValues: InsertRow<typeof membershipBeneficiariesTable>[] = [];
  for (const legacy of beneficiaryRows.map(legacyBeneficiary)) {
    const userId = userIds.get(legacy.userId);
    if (!memberships.has(legacy.membershipId) || !userId) {
      continue;
    }
    const key = `${legacy.membershipId}:${legacy.userId}`;
    if (beneficiaries.has(key)) {
      continue;
    }
    beneficiaries.add(key);
    beneficiaryValues.push({ membershipId: legacy.membershipId, userId });
  }
  await insertRows(client, membershipBeneficiariesTable, beneficiaryValues);

  const priceValues: InsertRow<typeof membershipPricesTable>[] = [];
  for (const legacy of modelRows.map(legacyMembershipModel)) {
    const type = MEMBERSHIP_TYPES[legacy.type as keyof typeof MEMBERSHIP_TYPES];
    if (!type) {
      continue;
    }
    priceValues.push({ id: priceValues.length + 1, version: 1, type, price: legacy.price * 100 });
  }
  await insertRows(client, membershipPricesTable, priceValues, true);

  const seasonStartMonth = [...startMonths.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 9;
  const settings: InsertRow<typeof membershipSettingsTable>[] = [
    { id: 1, version: 1, seasonStartMonth },
  ];
  await insertRows(client, membershipSettingsTable, settings, true);

  return {
    memberships: membershipValues.length,
    beneficiaries: beneficiaryValues.length,
    disabledMemberships,
  };
};
