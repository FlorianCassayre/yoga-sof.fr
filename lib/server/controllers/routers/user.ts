import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { createUser, findUser, findUsers, findUserUpdate, updateUser } from '../../services';
import { userCreateSchema, userUpdateSchema } from '../../../common/newSchemas/user';

export const userRouter = trpc
  .router<ContextProtected>()
  .query('find', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findUser({ where: { id } });
    },
  })
  .query('findAll', {
    resolve: async () => findUsers(),
  })
  .query('findUpdate', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findUserUpdate({ where: { id } });
    },
  })
  .mutation('create', {
    input: userCreateSchema,
    resolve: async ({ input }) => createUser({ data: input }),
  })
  .mutation('update', {
    input: userUpdateSchema,
    resolve: async ({ input: { id, ...data } }) => updateUser({ where: { id }, data }),
  });
