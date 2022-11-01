import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findAdminsWhitelist = async (args: { where?: Prisma.AdminWhitelistWhereInput, select?: Prisma.AdminWhitelistSelect, orderBy?: Prisma.Enumerable<Prisma.AdminWhitelistOrderByWithRelationInput> } = {}) =>
  prisma.adminWhitelist.findMany(args);
