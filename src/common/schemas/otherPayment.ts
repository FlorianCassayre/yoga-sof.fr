import { z } from 'zod';
import { PaymentRecipient, TransactionType } from '@prisma/client';

export const otherPaymentFindSchema = z.object({
  id: z.number().int().min(0),
});

const otherPaymentSchemaBase = z.object({
  category: z.object({
    id: z.number().int().min(0),
  }),
  description: z.string(),
  provider: z.string(),
  recipient: z.nativeEnum(PaymentRecipient),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  date: z.date(),
});

export const otherPaymentCreateSchema = otherPaymentSchemaBase;

export const otherPaymentUpdateSchema = otherPaymentSchemaBase.merge(otherPaymentFindSchema);

export const otherPaymentFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
