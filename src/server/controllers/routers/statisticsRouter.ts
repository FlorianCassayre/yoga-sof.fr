import { adminProcedure, router } from '../trpc';
import { z } from 'zod';
import { DateAggregationType, findAggregatedPayments, findPaymentsCategories } from '../../services/statistics';
import { PaymentRecipient } from '@prisma/client';

export const statisticsRouter = router({
  findAggregatedPayments: adminProcedure
    .input(z.strictObject({ aggregation: z.nativeEnum(DateAggregationType) }))
    .query(async ({ input: { aggregation } }) => findAggregatedPayments({ aggregation })),
  findPaymentsCategories: adminProcedure
    .input(z.strictObject({ recipient: z.nativeEnum(PaymentRecipient) }))
    .query(async ({ input: { recipient } }) => findPaymentsCategories({ recipient })),
});
