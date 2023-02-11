import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findAdminsWhitelist = async <Where extends Prisma.AdminWhitelistWhereInput, Select extends Prisma.AdminWhitelistSelect, OrderBy extends Prisma.Enumerable<Prisma.AdminWhitelistOrderByWithRelationInput>>(args: { where?: Where, select?: Select, orderBy?: OrderBy } = {}) =>
  prisma.adminWhitelist.findMany(args);

export const isWhitelistedAdmin = async (prisma: Prisma.TransactionClient, user: { email?: string | null }) => {
  if (user.email) {
    return !!(await prisma.adminWhitelist.count({
      where: {
        // This email must have necessarily come from one of the registered providers,
        // and cannot be changed manually. Thus it should be safe to trust.
        email: user.email,
      },
    }));
  } else {
    return false;
  }
};
