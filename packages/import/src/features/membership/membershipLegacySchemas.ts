import type { MembershipType } from '@yoga-sof/core';
import { z } from 'zod';

import { legacyDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyDateSchema,
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTinyIntSchema,
} from '../../parse/legacySchemas';

export const MEMBERSHIPS_TABLE = 'membership';
export const BENEFICIARIES_TABLE = '_user_membership';
export const MEMBERSHIP_MODELS_TABLE = 'membership_model';

export const membershipLegacySchema = z.object({
  id: legacyIntSchema,
  type: z.enum(['PERSON', 'FAMILY']),
  dateStart: legacyDateSchema,
  dateEnd: legacyDateSchema,
  price: legacyIntSchema,
  disabled: legacyTinyIntSchema,
  createdAt: legacyDatetimeSchema,
});

export const beneficiaryLegacySchema = z.object({
  membershipId: legacyIntSchema,
  userId: legacyIntSchema,
});

export const membershipModelLegacySchema = z.object({
  type: z.enum(['PERSON', 'FAMILY']),
  price: legacyIntSchema,
});

export const MEMBERSHIP_COLUMNS: LegacyRowColumns<typeof membershipLegacySchema> = {
  id: 0,
  type: 1,
  dateStart: 2,
  dateEnd: 3,
  price: 4,
  disabled: 5,
  createdAt: 6,
};

export const BENEFICIARY_COLUMNS: LegacyRowColumns<typeof beneficiaryLegacySchema> = {
  membershipId: 0,
  userId: 1,
};

export const MEMBERSHIP_MODEL_COLUMNS: LegacyRowColumns<typeof membershipModelLegacySchema> = {
  type: 0,
  price: 1,
};

export const MEMBERSHIP_TYPES: Record<
  z.output<typeof membershipLegacySchema>['type'],
  MembershipType
> = {
  PERSON: 'individuelle',
  FAMILY: 'famille',
};
