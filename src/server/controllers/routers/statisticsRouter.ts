import { adminProcedure, router } from '../trpc';
import { z } from 'zod';
import { DateAggregationType, findAggregatedPayments, findPaymentsCategories } from '../../services/statistics';

export const statisticsRouter = router({
  findAggregatedPayments: adminProcedure
    .input(z.strictObject({ aggregation: z.nativeEnum(DateAggregationType) }))
    .query(async ({ input: { aggregation } }) => findAggregatedPayments({ aggregation })),
  findPaymentsCategories: adminProcedure
    .query(async () => findPaymentsCategories()),
});
