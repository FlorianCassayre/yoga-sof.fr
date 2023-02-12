import { z } from 'zod';
import { createUser, findUser, findUsers, findUserUpdate, updateUser, updateUserDisable } from '../../services';
import { userCreateSchema, userDisableSchema, userUpdateSchema } from '../../../common/schemas/user';
import { adminProcedure, router } from '../trpc';
import { prisma, transactionOptions } from '../../prisma';

export const userRouter = router({
  find: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return prisma.$transaction(async (prisma) => findUser(prisma, { where: { id }, include: { courseRegistrations: { include: { course: true } }, accounts: true, managedByUser: true, managedUsers: true } }), transactionOptions);
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
      return prisma.$transaction(async (prisma) => findUserUpdate(prisma, { where: { id } }), transactionOptions);
    }),
  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => prisma.$transaction(async (prisma) => createUser(prisma, { data: input }), transactionOptions)),
  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUser({ where: { id }, data })),
  disabled: adminProcedure
    .input(userDisableSchema)
    .mutation(async ({ input: { id, ...data } }) => updateUserDisable({ where: { id }, data })),
});
