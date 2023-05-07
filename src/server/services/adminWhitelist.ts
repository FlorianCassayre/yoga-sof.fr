import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export const findAdminsWhitelist = async () => prisma.adminWhitelist.findMany();

export const isWhitelistedAdmin = async (prisma: Prisma.TransactionClient, user: { email?: string | null }) => {
  if (user.email) {
    return !!(await prisma.adminWhitelist.count({
      where: {
        // This email must have necessarily come from one of the registered providers,
        // and cannot be changed manually. Thus, it should be safe to trust.
        email: user.email,
      },
    }));
  } else {
    return false;
  }
};
