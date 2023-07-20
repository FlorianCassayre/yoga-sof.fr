import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { membershipCreateLegacySchema, membershipFindSchema } from '../../../common/schemas/membership';
import { z } from 'zod';
import {
  createMembershipLegacy,
  disableMembership,
  findMembership,
  findMemberships
} from '../../services/membership';

export const membershipRouter = router({
  find: backofficeReadProcedure
    .input(membershipFindSchema)
    .query(async ({ input: { id } }) => findMembership({ where: { id } })),
  findAll: backofficeReadProcedure
    .input(z.object({
      includeDisabled: z.boolean().optional(),
      userId: z.number().int().min(0).optional(),
      noOrder: z.boolean().optional(),
    }))
    .query(async ({ input: { includeDisabled, userId, noOrder } }) => findMemberships({ where: { includeDisabled: !!includeDisabled, userId, noOrder } })),
  create: backofficeWriteProcedure
    .input(membershipCreateLegacySchema)
    .mutation(async ({ input: { membershipModelId, dateStart, users }, ctx: { session } }) =>
      createMembershipLegacy({ data: { membershipModelId, dateStart, users } })
    ),
  disable: backofficeWriteProcedure
    .input(membershipFindSchema)
    .mutation(async ({ input: { id } }) => disableMembership({ where: { id } })),
});
