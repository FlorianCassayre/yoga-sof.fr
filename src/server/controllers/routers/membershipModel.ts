import {
  createMembershipModel, deleteMembershipModel,
  findMembershipModel,
  findMembershipModels,
  updateMembershipModel
} from '../../services';
import { adminProcedure, router } from '../trpc';
import { membershipModelCreateSchema, membershipModelFindSchema, membershipModelUpdateSchema } from '../../../common/schemas/membershipModel';

export const membershipModelRouter = router({
  find: adminProcedure
    .input(membershipModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findMembershipModel({ where: { id } });
    }),
  findAll: adminProcedure
    .query(async () => findMembershipModels()),
  create: adminProcedure
    .input(membershipModelCreateSchema)
    .mutation(async ({ input }) => createMembershipModel({ data: input })),
  update: adminProcedure
    .input(membershipModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateMembershipModel({ where: { id }, data })),
  delete: adminProcedure
    .input(membershipModelFindSchema)
    .mutation(async ({ input: { id } }) => {
      await deleteMembershipModel({ where: { id } });
    }),
});
