import { z } from 'zod';
import { createUser, findUser, findUsers, findUserUpdate, updateUser, updateUserDisable } from '../../services';
import { userCreateSchema, userDisableSchema, userUpdateSchema } from '../../../common/schemas/user';
import { adminProcedure, router } from '../trpc';

export const userRouter = router({
  userFind: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findUser({ where: { id }, include: { courseRegistrations: { include: { course: true } }, accounts: true } });
    }),
  userFindAll: adminProcedure
    .query(async () => findUsers({ where: { disabled: false } })),
  userFindUpdate: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findUserUpdate({ where: { id } });
    }),
  userCreate: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => createUser({ data: input })),
  userUpdate: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUser({ where: { id }, data })),
  userDisabled: adminProcedure
    .input(userDisableSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUserDisable({ where: { id }, data })),
});
