import { pgEnum } from 'drizzle-orm/pg-core';

export const membershipTypeEnum = pgEnum('membership_type', ['individuelle', 'famille']);
