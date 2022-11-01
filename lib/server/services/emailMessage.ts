import { Course, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { Pagination } from './helpers/types';
import { createPaginated, createPrismaPagination } from './helpers/pagination';

export const findEmailMessages = async (args: { where?: Prisma.EmailMessageWhereInput, select?: Prisma.EmailMessageSelect, include?: Prisma.EmailMessageInclude, orderBy?: Prisma.Enumerable<Prisma.EmailMessageOrderByWithRelationInput> } = {}) =>
  prisma.emailMessage.findMany(args);
