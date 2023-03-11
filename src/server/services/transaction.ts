import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { transactionCreateSchema } from '../../common/schemas/transaction';

export const findTransactions = async (args?: { where?: { userId?: number } }) =>
  prisma.transaction.findMany({ ...args, include: { user: true } });

export const findTransaction = async (args: { where: Prisma.TransactionWhereUniqueInput }) => prisma.transaction.findMany(args);

export const createTransaction = async (args: { data: z.infer<typeof transactionCreateSchema> }) => {
  transactionCreateSchema.parse(args.data);
  return prisma.transaction.create(args);
};

export const deleteTransaction = async (args: { where: Prisma.TransactionWhereUniqueInput }) => prisma.transaction.delete(args);
