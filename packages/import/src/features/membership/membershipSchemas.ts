export const MEMBERSHIPS_TABLE = 'membership';
export const BENEFICIARIES_TABLE = '_user_membership';
export const MEMBERSHIP_MODELS_TABLE = 'membership_model';

export const MEMBERSHIP_COLUMNS = {
  id: 0,
  type: 1,
  date_start: 2,
  date_end: 3,
  price: 4,
  disabled: 5,
  created_at: 6,
} as const;

export const BENEFICIARY_COLUMNS = {
  A: 0,
  B: 1,
} as const;

export const MEMBERSHIP_MODEL_COLUMNS = {
  id: 0,
  price: 1,
} as const;

export const MEMBERSHIP_TYPES = {
  PERSON: 'individuelle',
  FAMILY: 'famille',
} as const;
