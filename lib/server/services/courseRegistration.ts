import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findCourseRegistrations = async (args: { where?: Prisma.CourseRegistrationWhereInput, select?: Prisma.CourseRegistrationSelect, include?: Prisma.CourseRegistrationInclude, orderBy?: Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput> } = {}) =>
  prisma.courseRegistration.findMany(args);
