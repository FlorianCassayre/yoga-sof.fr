import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import {
  createCourseModel,
  deleteCourseModel,
  findCourseModel,
  findCourseModels,
  updateCourseModel
} from '../../services';
import { courseModelCreateSchema, courseModelGetSchema, courseModelUpdateSchema } from '../../../common/newSchemas';

export const courseModelRouter = trpc
  .router<ContextProtected>()
  .query('get', {
    input: courseModelGetSchema,
    resolve: async ({ input: { id } }) => {
      return findCourseModel({ where: { id } });
    },
  })
  .query('getAll', {
    resolve: async () => findCourseModels(),
  })
  .mutation('create', {
    input: courseModelCreateSchema,
    resolve: async ({ input }) => createCourseModel({ data: input }),
  })
  .mutation('update', {
    input: courseModelUpdateSchema,
    resolve: async ({ input: { id, ...data } }) => updateCourseModel({ where: { id }, data }),
  })
  .mutation('delete', {
    input: courseModelGetSchema,
    resolve: async ({ input: { id } }) => {
      await deleteCourseModel({ where: { id } });
    }
  });
