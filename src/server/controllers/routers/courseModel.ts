import {
  createCourseModel,
  deleteCourseModel,
  findCourseModel,
  findCourseModels,
  updateCourseModel
} from '../../services';
import { courseModelCreateSchema, courseModelFindSchema, courseModelUpdateSchema } from '../../../common/schemas';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';

export const courseModelRouter = router({
  find: backofficeReadProcedure
    .input(courseModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findCourseModel({ where: { id } });
    }),
  findAll: backofficeReadProcedure
    .query(async () => findCourseModels()),
  create: backofficeWriteProcedure
    .input(courseModelCreateSchema)
    .mutation(async ({ input }) => createCourseModel({ data: input })),
  update: backofficeWriteProcedure
    .input(courseModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateCourseModel({ where: { id }, data })),
  delete: backofficeWriteProcedure
    .input(courseModelFindSchema)
    .mutation(async ({ input: { id } }) => await deleteCourseModel({ where: { id } })),
});
