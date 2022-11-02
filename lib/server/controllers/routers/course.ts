import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { cancelCourse, findCourse, findCourses, findCoursesPaginated, updateCourse } from '../../services';
import { schemaWithPagination } from '../schemas';

export const courseRouter = trpc
  .router<ContextProtected>()
  .query('find', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id } });
    },
  })
  .query('findAll', {
    resolve: async () => findCourses(),
  })
  .query('findAllPaginated', {
    input: schemaWithPagination,
    resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })
  .mutation('update', {
    input: z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      notes: z.string().nullable(),
    }),
    resolve: async ({ input: { id, slots, notes } }) =>
      await updateCourse({ where: { id }, data: { slots, notes } }),
  })
  .mutation('cancel', {
    input: z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().nullable(),
    }),
    resolve: async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } }),
  });
