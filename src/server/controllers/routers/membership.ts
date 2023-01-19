import { adminProcedure, router } from '../trpc';
import { membershipCreateSchema, membershipFindSchema } from '../../../common/schemas/membership';
import { z } from 'zod';
import { createMembership, disableMembership, findMembership, findMemberships } from '../../services/membership';

export const membershipRouter = router({
  find: adminProcedure
    .input(membershipFindSchema)
    .query(async ({ input: { id } }) => findMembership({ where: { id } })),
  findAll: adminProcedure
    .input(z.object({ includeDisabled: z.boolean().optional() }))
    .query(async ({ input: { includeDisabled } }) => findMemberships({ where: { includeDisabled: !!includeDisabled } })),
  create: adminProcedure
    .input(membershipCreateSchema)
    .mutation(async ({ input: { membershipModelId, dateStart, users }, ctx: { session } }) =>
      createMembership({ data: { membershipModelId, dateStart, users } })
    ),
  disable: adminProcedure
    .input(membershipFindSchema)
    .mutation(async ({ input: { id } }) => disableMembership({ where: { id } })),
});
