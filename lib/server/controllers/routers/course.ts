import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { cancelCourse, findCourse, findCoursesPaginated, updateCourse } from '../../services';
import { schemaWithPagination } from '../schemas';

export const courseRouter = trpc
  .router<ContextProtected>()
  .query('getOne', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id } });
    },
  })
  .query('getAllPaginated', {
    input: schemaWithPagination,
    resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })
  .mutation('update', {
    input: z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      notes: z.string().optional(),
    }),
    resolve: async ({ input: { id, slots, notes } }) =>
      await updateCourse({ where: { id }, data: { slots, notes } }),
  })
  .mutation('cancel', {
    input: z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().optional(),
    }),
    resolve: async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } }),
  });
