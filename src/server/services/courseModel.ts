import { CourseModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { courseModelCreateSchema, courseModelUpdateSchema } from '../../common/schemas';

export const findCourseModel = async <Where extends Prisma.CourseModelWhereUniqueInput, Select extends Prisma.CourseModelSelect>(args: { where: Where, select?: Select }) =>
  prisma.courseModel.findUniqueOrThrow(args);

export const findCourseModels = async <Where extends Prisma.CourseModelWhereInput, Select extends Prisma.CourseModelSelect>(args: { where?: Where, select?: Select } = {}) =>
  prisma.courseModel.findMany(args);

export const createCourseModel = async <Data extends Prisma.CourseModelCreateInput, Select extends Prisma.CourseModelSelect>(args: { data: Data, select?: Select }) => {
  courseModelCreateSchema.parse(args.data);
  return prisma.courseModel.create(args);
}

export const updateCourseModel = async <Where extends Prisma.CourseModelWhereUniqueInput, Data extends Omit<CourseModel, 'id'>, Select extends Prisma.CourseModelSelect>(args: { where: Where, data: Data, select?: Select }) => {
  courseModelUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.courseModel.update(args);
}

export const deleteCourseModel = async <Where extends Prisma.CourseModelWhereUniqueInput, Select extends Prisma.CourseModelSelect>(args: { where: Where, select?: Select }) =>
  prisma.courseModel.delete(args);
