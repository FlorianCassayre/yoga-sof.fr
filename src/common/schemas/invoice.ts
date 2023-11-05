import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const freeInvoiceSchema = z.strictObject({
  id: z.number().int().min(1),
  date: z.date(),
  paid: z.boolean(),
  receiver: z.strictObject({
    fullname: z.string().min(1),
    email: z.string().email(),
  }),
  items: z.array(z.strictObject({
    title: z.string().min(1),
    subtitle: z.string().nullish(),
    price: z.number().int().min(0),
    remark: z.string().nullish(),
  })),
  discount: z.number().int(),
  transactionType: z.nativeEnum(TransactionType).nullish(),
});
