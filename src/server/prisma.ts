import { Prisma, PrismaClient } from '@prisma/client';

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

export const transactionOptions: Parameters<(typeof prisma)['$transaction']>[1] = {
  isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, // (default for MySQL: RepeatableRead)
  maxWait: 2000, // (default: 2000)
  timeout: 5000, // (default: 5000)
}

export { prisma };
