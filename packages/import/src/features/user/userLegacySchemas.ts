import type { RoleType } from '@yoga-sof/core';
import { z } from 'zod';

import { legacyDatetimeSchema, legacyNullableDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTextSchema,
} from '../../parse/legacySchemas';

// Auth.js requires user ids to be UUIDs; derive them deterministically from the legacy ids.
export const USER_ID_NAMESPACE = '4b6fca5e-9e14-4a4d-8b9f-2b48ce6f5d31';

export const USERS_TABLE = 'user';
export const ACCOUNTS_TABLE = 'account';

export const userLegacySchema = z.object({
  id: legacyIntSchema,
  name: legacyTextSchema,
  email: legacyTextSchema,
  emailVerified: legacyNullableDatetimeSchema,
  image: legacyTextSchema,
  customEmail: legacyTextSchema,
  customName: legacyTextSchema,
  createdAt: legacyDatetimeSchema,
  role: z.enum(['ADMINISTRATOR', 'MANAGER', 'ASSOCIATE', 'MEMBER']),
});

export const accountLegacySchema = z.object({
  userId: legacyIntSchema,
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refreshToken: legacyTextSchema,
  accessToken: legacyTextSchema,
  expiresAt: legacyIntSchema.nullable(),
  tokenType: legacyTextSchema,
  scope: legacyTextSchema,
  idToken: legacyTextSchema,
  sessionState: legacyTextSchema,
});

export const USER_COLUMNS: LegacyRowColumns<typeof userLegacySchema> = {
  id: 0,
  name: 1,
  email: 2,
  emailVerified: 3,
  image: 4,
  customEmail: 5,
  customName: 6,
  createdAt: 9,
  role: 13,
};

export const ACCOUNT_COLUMNS: LegacyRowColumns<typeof accountLegacySchema> = {
  userId: 1,
  type: 2,
  provider: 3,
  providerAccountId: 4,
  refreshToken: 5,
  accessToken: 6,
  expiresAt: 7,
  tokenType: 8,
  scope: 9,
  idToken: 10,
  sessionState: 11,
};

export const ROLES: Record<z.output<typeof userLegacySchema>['role'], RoleType | undefined> = {
  ADMINISTRATOR: 'administrator',
  MANAGER: 'manager',
  ASSOCIATE: 'associate',
  MEMBER: undefined,
};
