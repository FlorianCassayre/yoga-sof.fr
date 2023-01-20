import { adminProcedure, router } from '../trpc';
import { membershipCreateSchema, membershipFindSchema } from '../../../common/schemas/membership';
import { z } from 'zod';
import { createMembership, disableMembership, findMembership, findMemberships } from '../../services/membership';

export const membershipRouter = router({
  find: adminProcedure
    .input(membershipFindSchema)
    .query(async ({ input: { id } }) => {
      return findMembership({ where: { id } });
    }),
  findAll: adminProcedure
    .input(z.object({
      includeDisabled: z.boolean().optional(),
      userId: z.number().int().min(0).optional(),
    }))
    .query(async ({ input: { includeDisabled, userId } }) => findMemberships({ where: { includeDisabled: !!includeDisabled, userId } })),
  create: adminProcedure
    .input(membershipCreateSchema)
    .mutation(async ({ input: { membershipModelId, dateStart, users }, ctx: { session } }) =>
      createMembership({ data: { membershipModelId, dateStart, users } })
    ),
  disable: adminProcedure
    .input(membershipFindSchema)
    .mutation(async ({ input: { id } }) => disableMembership({ where: { id } })),
});
