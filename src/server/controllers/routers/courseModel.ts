import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import {
  createCourseModel,
  deleteCourseModel,
  findCourseModel,
  findCourseModels,
  updateCourseModel
} from '../../services';
import { courseModelCreateSchema, courseModelFindSchema, courseModelUpdateSchema } from '../../../common/schemas';

export const courseModelRouter = trpc
  .router<ContextProtected>()
  .query('find', {
    input: courseModelFindSchema,
    resolve: async ({ input: { id } }) => {
      return findCourseModel({ where: { id } });
    },
  })
  .query('findAll', {
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
    input: courseModelFindSchema,
    resolve: async ({ input: { id } }) => {
      await deleteCourseModel({ where: { id } });
    }
  });
