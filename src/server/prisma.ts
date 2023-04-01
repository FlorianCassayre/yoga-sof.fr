import { Prisma, PrismaClient, LockEntityType } from '@prisma/client';

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
};

const LOCK_ENTITY_TABLE: string = 'lock_entity';
const LOCK_ENTITY_ID: LockEntityType = LockEntityType.GLOBAL;

const transaction = <R>(tx: (prisma: Prisma.TransactionClient) => Promise<R>, write: boolean): Promise<R> =>
  prisma.$transaction(async prisma => {
    await prisma.$executeRawUnsafe(
      write
        ? `SELECT * FROM ${LOCK_ENTITY_TABLE} WHERE ID = '${LOCK_ENTITY_ID}' FOR UPDATE` // Write
        : `SELECT * FROM ${LOCK_ENTITY_TABLE} WHERE ID = '${LOCK_ENTITY_ID}' FOR SHARE` // Read
    );
    return tx(prisma);
  }, transactionOptions);

export const readTransaction = <R>(tx: (prisma: Prisma.TransactionClient) => Promise<R>): Promise<R> => transaction(tx, false);
export const writeTransaction = <R>(tx: (prisma: Prisma.TransactionClient) => Promise<R>): Promise<R> => transaction(tx, true);

export { prisma };
