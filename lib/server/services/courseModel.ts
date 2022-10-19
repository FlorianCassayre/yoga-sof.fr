import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findCourseModels = async (args: { where?: Prisma.CourseModelWhereInput, select?: Prisma.CourseModelSelect } = {}) =>
  prisma.courseModel.findMany(args);
