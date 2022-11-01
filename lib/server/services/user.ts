import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findUser = async (args: { where: Prisma.UserWhereUniqueInput, select?: Prisma.UserSelect, include?: Prisma.UserInclude }) =>
  prisma.user.findUniqueOrThrow(args);

export const findUsers = async (args: { where?: Prisma.UserWhereInput, select?: Prisma.UserSelect, include?: Prisma.UserInclude, orderBy?: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput> } = {}) =>
  prisma.user.findMany(args);
