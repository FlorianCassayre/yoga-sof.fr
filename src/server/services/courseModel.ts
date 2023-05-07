import { CourseModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { courseModelCreateSchema, courseModelUpdateSchema } from '../../common/schemas';

export const findCourseModel = async (args: { where: Prisma.CourseModelWhereUniqueInput }) =>
  prisma.courseModel.findUniqueOrThrow(args);

export const findCourseModels = async () =>
  (await prisma.courseModel.findMany())
    .sort(({ weekday: weekday1, timeStart: timeStart1 }, { weekday: weekday2, timeStart: timeStart2 }) =>
      weekday1 === weekday2 ? (timeStart1 < timeStart2 ? -1 : 1) : weekday1 - weekday2
    );

export const createCourseModel = (args: { data: Prisma.CourseModelCreateInput }) => {
  courseModelCreateSchema.parse(args.data);
  return prisma.courseModel.create(args);
}

export const updateCourseModel = (args: { where: Prisma.CourseModelWhereUniqueInput, data: Omit<CourseModel, 'id'> }) => {
  courseModelUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.courseModel.update(args);
}

export const deleteCourseModel = (args: { where: Prisma.CourseModelWhereUniqueInput }) => prisma.courseModel.delete(args);
