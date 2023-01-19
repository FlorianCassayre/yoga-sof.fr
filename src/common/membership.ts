import { MembershipType } from '@prisma/client';

export const MembershipTypeNames: { [K in MembershipType]: string } = {
  [MembershipType.PERSON]: 'Individuelle',
  [MembershipType.FAMILY]: 'Famille',
};
