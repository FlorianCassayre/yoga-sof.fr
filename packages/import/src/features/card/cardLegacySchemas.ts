import { z } from 'zod';

import { legacyDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTinyIntSchema,
} from '../../parse/legacySchemas';

export const COUPONS_TABLE = 'coupon';
export const COUPON_MODELS_TABLE = 'coupon_model';
export const COUPON_PURCHASES_TABLE = 'order_purchased_coupon_course_registration';

export const couponLegacySchema = z.object({
  id: legacyIntSchema,
  courseType: z.enum(['YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD']),
  quantity: legacyIntSchema,
  price: legacyIntSchema,
  disabled: legacyTinyIntSchema,
  userId: legacyIntSchema,
  createdAt: legacyDatetimeSchema,
});

export const couponModelLegacySchema = z.object({
  id: legacyIntSchema,
  courseType: z.enum(['YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD']),
  quantity: legacyIntSchema,
  price: legacyIntSchema,
});

export const couponPurchaseLegacySchema = z.object({
  couponId: legacyIntSchema,
  courseRegistrationId: legacyIntSchema,
});

export const COUPON_COLUMNS: LegacyRowColumns<typeof couponLegacySchema> = {
  id: 0,
  courseType: 2,
  quantity: 3,
  price: 4,
  disabled: 5,
  userId: 6,
  createdAt: 7,
};

export const COUPON_MODEL_COLUMNS: LegacyRowColumns<typeof couponModelLegacySchema> = {
  id: 0,
  courseType: 1,
  quantity: 2,
  price: 3,
};

export const COUPON_PURCHASE_COLUMNS: LegacyRowColumns<typeof couponPurchaseLegacySchema> = {
  couponId: 1,
  courseRegistrationId: 2,
};

// The legacy application had no card validity setting; this mirrors the application default.
export const CARD_VALIDITY_MONTHS = 12;
