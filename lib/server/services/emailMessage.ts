import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findEmailMessages = async <Where extends Prisma.EmailMessageWhereInput, Select extends Prisma.EmailMessageSelect, Include extends Prisma.EmailMessageInclude, OrderBy extends Prisma.Enumerable<Prisma.EmailMessageOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.emailMessage.findMany(args);
