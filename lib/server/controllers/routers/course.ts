import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { cancelCourse, findCourse, updateCourse } from '../../services';

export const courseRouter = trpc
  .router<ContextProtected>()
  .query('getOne', {
    input: z.strictObject({
      id: z.number().int().positive(),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id } });
    },
  })
  .mutation('update', {
    input: z.strictObject({
      id: z.number().int().positive(),
      slots: z.number().int().min(0),
      notes: z.string().optional(),
    }),
    resolve: async ({ input: { id, slots, notes } }) =>
      await updateCourse({ where: { id }, data: { slots, notes } }),
  })
  .mutation('cancel', {
    input: z.strictObject({
      id: z.number().int().positive(),
      cancelationReason: z.string().optional(),
    }),
    resolve: async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } }),
  });
