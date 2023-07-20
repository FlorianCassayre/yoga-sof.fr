import {
  createMembershipModel, deleteMembershipModel,
  findMembershipModel,
  findMembershipModels,
  updateMembershipModel
} from '../../services';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { membershipModelCreateSchema, membershipModelFindSchema, membershipModelUpdateSchema } from '../../../common/schemas/membershipModel';

export const membershipModelRouter = router({
  find: backofficeReadProcedure
    .input(membershipModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findMembershipModel({ where: { id } });
    }),
  findAll: backofficeReadProcedure
    .query(async () => findMembershipModels()),
  create: backofficeWriteProcedure
    .input(membershipModelCreateSchema)
    .mutation(async ({ input }) => createMembershipModel({ data: input })),
  update: backofficeWriteProcedure
    .input(membershipModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateMembershipModel({ where: { id }, data })),
  delete: backofficeWriteProcedure
    .input(membershipModelFindSchema)
    .mutation(async ({ input: { id } }) => {
      await deleteMembershipModel({ where: { id } });
    }),
});
