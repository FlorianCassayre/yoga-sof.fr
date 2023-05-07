import {
  createCourseModel,
  deleteCourseModel,
  findCourseModel,
  findCourseModels,
  updateCourseModel
} from '../../services';
import { courseModelCreateSchema, courseModelFindSchema, courseModelUpdateSchema } from '../../../common/schemas';
import { adminProcedure, router } from '../trpc';

export const courseModelRouter = router({
  find: adminProcedure
    .input(courseModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findCourseModel({ where: { id } });
    }),
  findAll: adminProcedure
    .query(async () => findCourseModels()),
  create: adminProcedure
    .input(courseModelCreateSchema)
    .mutation(async ({ input }) => createCourseModel({ data: input })),
  update: adminProcedure
    .input(courseModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateCourseModel({ where: { id }, data })),
  delete: adminProcedure
    .input(courseModelFindSchema)
    .mutation(async ({ input: { id } }) => await deleteCourseModel({ where: { id } })),
});
