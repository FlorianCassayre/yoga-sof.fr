import { cardSettingsTable, cardTemplatesTable, cardValidUntil } from '@yoga-sof/core';
import { cardsTable } from '@yoga-sof/core/server';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { COURSE_TYPES } from '../course/courseLegacySchemas';
import {
  CARD_VALIDITY_MONTHS,
  COUPON_COLUMNS,
  COUPON_MODEL_COLUMNS,
  COUPON_PURCHASE_COLUMNS,
  couponLegacySchema,
  couponModelLegacySchema,
  couponPurchaseLegacySchema,
} from './cardLegacySchemas';

interface CardsImportResult {
  cards: number;
  cardTemplates: number;
  disabledCoupons: number;
  unsupportedCoupons: number;
}

const legacyCoupon = (row: MysqlValue[]) => parseLegacyRow(row, COUPON_COLUMNS, couponLegacySchema);

const legacyCouponModel = (row: MysqlValue[]) =>
  parseLegacyRow(row, COUPON_MODEL_COLUMNS, couponModelLegacySchema);

const legacyCouponPurchase = (row: MysqlValue[]) =>
  parseLegacyRow(row, COUPON_PURCHASE_COLUMNS, couponPurchaseLegacySchema);

const templateKey = (type: string, price: number, count: number): string =>
  `${type}:${price}:${count}`;

export const cardsImport = async (
  client: Client,
  couponRows: MysqlValue[][],
  modelRows: MysqlValue[][],
  purchaseRows: MysqlValue[][],
  userIds: Map<number, string>,
): Promise<CardsImportResult> => {
  // Coupons do not reference a model: match them to a template with the same offer,
  // synthesizing the missing ones after the model ids.
  const templates = new Map<
    string,
    { id: number; type: 'adulte' | 'enfant'; price: number; count: number }
  >();
  let nextTemplateId = 0;
  for (const legacy of modelRows.map(legacyCouponModel)) {
    const type = COURSE_TYPES[legacy.courseType];
    if (!type) {
      continue;
    }
    const price = legacy.price * 100;
    templates.set(templateKey(type, price, legacy.quantity), {
      id: legacy.id,
      type,
      price,
      count: legacy.quantity,
    });
    nextTemplateId = Math.max(nextTemplateId, legacy.id + 1);
  }

  const usedRegistrations = new Map<number, Set<number>>();
  for (const legacy of purchaseRows.map(legacyCouponPurchase)) {
    const registrations = usedRegistrations.get(legacy.couponId) ?? new Set<number>();
    registrations.add(legacy.courseRegistrationId);
    usedRegistrations.set(legacy.couponId, registrations);
  }

  const cards: InsertRow<typeof cardsTable>[] = [];
  const counters = { disabledCoupons: 0, unsupportedCoupons: 0 };
  for (const legacy of couponRows.map(legacyCoupon)) {
    const type = COURSE_TYPES[legacy.courseType];
    const userId = userIds.get(legacy.userId);
    if (!type || !userId) {
      counters.unsupportedCoupons++;
      continue;
    }
    if (legacy.disabled) {
      counters.disabledCoupons++;
    }
    const price = legacy.price * 100;
    const key = templateKey(type, price, legacy.quantity);
    if (!templates.has(key)) {
      templates.set(key, { id: nextTemplateId++, type, price, count: legacy.quantity });
    }
    const template = templates.get(key)!;
    const remaining = Math.max(0, legacy.quantity - (usedRegistrations.get(legacy.id)?.size ?? 0));
    cards.push({
      id: legacy.id,
      version: 1,
      userId,
      templateId: template.id,
      type,
      price,
      count: legacy.quantity,
      remaining,
      validUntil: cardValidUntil({ purchasedAt: legacy.createdAt, months: CARD_VALIDITY_MONTHS }),
      createdAt: legacy.createdAt,
    });
  }

  const templateValues: InsertRow<typeof cardTemplatesTable>[] = [...templates.values()].map(
    (template) => ({
      id: template.id,
      version: 1,
      type: template.type,
      price: template.price,
      count: template.count,
    }),
  );
  await insertRows(client, cardTemplatesTable, templateValues, true);
  await insertRows(client, cardsTable, cards, true);
  const settings: InsertRow<typeof cardSettingsTable>[] = [
    { id: 1, version: 1, validityMonths: CARD_VALIDITY_MONTHS },
  ];
  await insertRows(client, cardSettingsTable, settings, true);

  return {
    cards: cards.length,
    cardTemplates: templateValues.length,
    disabledCoupons: counters.disabledCoupons,
    unsupportedCoupons: counters.unsupportedCoupons,
  };
};
