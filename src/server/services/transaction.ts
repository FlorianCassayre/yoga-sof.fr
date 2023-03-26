import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { transactionCreateSchema } from '../../common/schemas/transaction';

export const findTransactions = async (args?: { where?: { userId?: number, notMigrated?: boolean } }) =>
  prisma.transaction.findMany({ where: { userId: args?.where?.userId, order: args?.where?.notMigrated ? null : undefined }, include: { user: true } });

export const findTransaction = async (args: { where: Prisma.TransactionWhereUniqueInput }) => prisma.transaction.findUniqueOrThrow(args);

export const createTransaction = async (args: { data: z.infer<typeof transactionCreateSchema> }) => {
  transactionCreateSchema.parse(args.data);
  return prisma.transaction.create(args);
};

export const updateTransaction = async (args: { where: Prisma.TransactionWhereUniqueInput, data: z.infer<typeof transactionCreateSchema> }) => {
  transactionCreateSchema.parse(args.data);
  return prisma.transaction.update(args);
};

export const deleteTransaction = async (args: { where: Prisma.TransactionWhereUniqueInput }) => prisma.transaction.delete(args);
