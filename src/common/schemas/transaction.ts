import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const transactionFindSchema = z.object({
  id: z.number().int().min(0),
});

export const transactionCreateSchema = z.object({
  userId: z.number().int().min(0),
  amount: z.number().int().min(1),
  date: z.date(),
  type: z.nativeEnum(TransactionType),
  comment: z.string().nullable(),
});

export const transactionGetTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
