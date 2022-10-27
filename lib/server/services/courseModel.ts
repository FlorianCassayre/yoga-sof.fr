import { CourseModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findCourseModels = async (args: { where?: Prisma.CourseModelWhereInput, select?: Prisma.CourseModelSelect } = {}) =>
  prisma.courseModel.findMany(args);

export const createCourseModel = async (args: { data: Prisma.CourseModelCreateInput, select?: Prisma.CourseModelSelect }) =>
  prisma.courseModel.create(args);

export const updateCourseModel = async (args: { where: Prisma.CourseModelWhereUniqueInput, data: Partial<CourseModel>, select?: Prisma.CourseModelSelect }) =>
  prisma.courseModel.update(args);
