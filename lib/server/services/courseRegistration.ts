import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findCourseRegistrations = async <Where extends Prisma.CourseRegistrationWhereInput, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.courseRegistration.findMany(args);

export const findCourseRegistrationEvents = async <Where extends Pick<Prisma.CourseRegistrationWhereInput, 'courseId' | 'userId'>, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.courseRegistration.findMany(args);
