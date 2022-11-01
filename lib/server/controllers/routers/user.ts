import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { findUser, findUsers } from '../../services';

export const userRouter = trpc
  .router<ContextProtected>()
  .query('get', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findUser({ where: { id } });
    },
  })
  .query('findAll', {
    resolve: async () => findUsers(),
  });
