import {
  membershipBeneficiariesTable,
  membershipPricesTable,
  membershipSettingsTable,
  membershipsTable,
} from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import {
  BENEFICIARY_COLUMNS,
  beneficiaryLegacySchema,
  MEMBERSHIP_COLUMNS,
  MEMBERSHIP_MODEL_COLUMNS,
  MEMBERSHIP_TYPES,
  membershipLegacySchema,
  membershipModelLegacySchema,
} from './membershipLegacySchemas';

interface MembershipsImportResult {
  memberships: number;
  beneficiaries: number;
  disabledMemberships: number;
}

const legacyMembership = (row: MysqlValue[]) =>
  parseLegacyRow(row, MEMBERSHIP_COLUMNS, membershipLegacySchema);

const legacyBeneficiary = (row: MysqlValue[]) =>
  parseLegacyRow(row, BENEFICIARY_COLUMNS, beneficiaryLegacySchema);

const legacyMembershipModel = (row: MysqlValue[]) =>
  parseLegacyRow(row, MEMBERSHIP_MODEL_COLUMNS, membershipModelLegacySchema);

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
    const type = MEMBERSHIP_TYPES[legacy.type];
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
      createdAt: legacy.createdAt,
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
    const type = MEMBERSHIP_TYPES[legacy.type];
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
