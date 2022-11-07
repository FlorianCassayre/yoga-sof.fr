import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findAdminsWhitelist = async <Where extends Prisma.AdminWhitelistWhereInput, Select extends Prisma.AdminWhitelistSelect, OrderBy extends Prisma.Enumerable<Prisma.AdminWhitelistOrderByWithRelationInput>>(args: { where?: Where, select?: Select, orderBy?: OrderBy } = {}) =>
  prisma.adminWhitelist.findMany(args);
