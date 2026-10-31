import type { membershipTypeEnum } from './membershipTypeEnum';

export type MembershipType = (typeof membershipTypeEnum.enumValues)[number];
