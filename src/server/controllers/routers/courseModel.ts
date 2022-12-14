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
  courseModelFind: adminProcedure
    .input(courseModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findCourseModel({ where: { id } });
    }),
  courseModelFindAll: adminProcedure
    .query(async () => findCourseModels()),
  courseModelCreate: adminProcedure
    .input(courseModelCreateSchema)
    .mutation(async ({ input }) => createCourseModel({ data: input })),
  courseModelUpdate: adminProcedure
    .input(courseModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateCourseModel({ where: { id }, data })),
  courseModelDelete: adminProcedure
    .input(courseModelFindSchema)
    .mutation(async ({ input: { id } }) => {
      await deleteCourseModel({ where: { id } });
    }),
});
