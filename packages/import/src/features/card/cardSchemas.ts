export const COUPONS_TABLE = 'coupon';
export const COUPON_MODELS_TABLE = 'coupon_model';
export const COUPON_PURCHASES_TABLE = 'order_purchased_coupon_course_registration';

export const COUPON_COLUMNS = {
  id: 0,
  code: 1,
  course_type: 2,
  quantity: 3,
  price: 4,
  disabled: 5,
  user_id: 6,
  created_at: 7,
} as const;

export const COUPON_MODEL_COLUMNS = {
  id: 0,
  course_type: 1,
  quantity: 2,
  price: 3,
} as const;

export const COUPON_PURCHASE_COLUMNS = {
  order_id: 0,
  coupon_id: 1,
  course_registration_id: 2,
} as const;

// The legacy application had no card validity setting; this mirrors the application default.
export const CARD_VALIDITY_MONTHS = 12;
