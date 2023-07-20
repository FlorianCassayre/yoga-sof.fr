import { z } from 'zod';
import {
  createUser,
  deleteUser,
  findUser,
  findUsers,
  findUserUpdate, mergeUsers,
  updateUser,
  updateUserDisable,
} from '../../services';
import {
  userCreateSchema,
  userDisableSchema,
  userFindSchema,
  usersMergeSchema,
  userUpdateSchema,
} from '../../../common/schemas/user';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { readTransaction, writeTransaction } from '../../prisma';

export const userRouter = router({
  find: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findUser({ where: { id } })),
  findAll: backofficeReadProcedure
    .input(z.strictObject({
      disabled: z.boolean().optional(),
      role: z.boolean().optional(),
    }))
    .query(async ({ input: { disabled, role } }) => findUsers({ where: { disabled, role } })),
  findUpdate: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return readTransaction(async (prisma) => findUserUpdate(prisma, { where: { id } }));
    }),
  create: backofficeWriteProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => writeTransaction(async (prisma) => createUser(prisma, { data: input }))),
  update: backofficeWriteProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUser({ where: { id }, data })),
  disabled: backofficeWriteProcedure
    .input(userDisableSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUserDisable({ where: { id }, data })),
  delete: backofficeWriteProcedure
    .input(userFindSchema)
    .mutation(async ({ input: { id } }) => deleteUser({ where: { id } })),
  merge: backofficeWriteProcedure
    .input(usersMergeSchema)
    .mutation(async ({ input: data }) => mergeUsers({ data }))
});
