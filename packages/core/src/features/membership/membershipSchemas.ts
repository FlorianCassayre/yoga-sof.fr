import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';
import { membershipTypeEnum } from './type/membershipTypeEnum';

export const membershipListSchema = listSchema
  .extend({
    sort: sortSchema({
      type: true,
      price: true,
      startsAt: true,
      createdAt: true,
    }),
  })
  .extend({
    userId: z.string().min(1).optional(),
  });

export const membershipCreateSchema = z
  .object({
    type: z.enum(membershipTypeEnum.enumValues),
    year: z.coerce.number().int().min(1900).max(2100),
    beneficiaries: z
      .array(z.object({ id: z.string().min(1) }))
      .min(1, 'Sélectionnez au moins un bénéficiaire.'),
  })
  .transform(({ beneficiaries, ...values }) => ({
    ...values,
    userIds: beneficiaries.map((beneficiary) => beneficiary.id),
  }));
