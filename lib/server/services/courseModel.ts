import { CourseModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { courseModelCreateSchema, courseModelUpdateSchema } from '../../common/newSchemas';

export const findCourseModel = async (args: { where: Prisma.CourseModelWhereUniqueInput, select?: Prisma.CourseModelSelect }) =>
  prisma.courseModel.findUniqueOrThrow(args);

export const findCourseModels = async (args: { where?: Prisma.CourseModelWhereInput, select?: Prisma.CourseModelSelect } = {}) =>
  prisma.courseModel.findMany(args);

export const createCourseModel = async (args: { data: Prisma.CourseModelCreateInput, select?: Prisma.CourseModelSelect }) => {
  courseModelCreateSchema.parse(args.data);
  return prisma.courseModel.create(args);
}

export const updateCourseModel = async (args: { where: Prisma.CourseModelWhereUniqueInput, data: Partial<CourseModel>, select?: Prisma.CourseModelSelect }) => {
  courseModelUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.courseModel.update(args);
}

export const deleteCourseModel = async (args: { where: Prisma.CourseModelWhereUniqueInput, select?: Prisma.CourseModelSelect }) =>
  prisma.courseModel.delete(args);
