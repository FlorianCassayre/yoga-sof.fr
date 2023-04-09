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
import { adminProcedure, router } from '../trpc';
import { readTransaction, writeTransaction } from '../../prisma';

export const userRouter = router({
  find: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return readTransaction(async (prisma) => findUser(prisma, { where: { id }, include: { courseRegistrations: { include: { course: true } }, accounts: true, managedByUser: true, managedUsers: true, transactions: true, memberships: true } }));
    }),
  findAll: adminProcedure
    .input(z.strictObject({
      disabled: z.boolean().optional(),
    }))
    .query(async ({ input: { disabled } }) => findUsers({ where: { disabled } })),
  findUpdate: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return readTransaction(async (prisma) => findUserUpdate(prisma, { where: { id } }));
    }),
  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => writeTransaction(async (prisma) => createUser(prisma, { data: input }))),
  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUser({ where: { id }, data })),
  disabled: adminProcedure
    .input(userDisableSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUserDisable({ where: { id }, data })),
  delete: adminProcedure
    .input(userFindSchema)
    .mutation(async ({ input: { id } }) => deleteUser({ where: { id } })),
  merge: adminProcedure
    .input(usersMergeSchema)
    .mutation(async ({ input: data }) => mergeUsers({ data }))
});
