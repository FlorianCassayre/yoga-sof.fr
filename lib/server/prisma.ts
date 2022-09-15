import { PrismaClient } from '@prisma/client';

// From: https://flaviocopes.com/nextjs-fix-prismaclient-unable-run-browser/

let prisma: PrismaClient; // eslint-disable-line import/no-mutable-exports

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const g = global as { prisma?: PrismaClient };
  if (!g.prisma) {
    g.prisma = new PrismaClient();
  }
  prisma = g.prisma;
}

export { prisma };
