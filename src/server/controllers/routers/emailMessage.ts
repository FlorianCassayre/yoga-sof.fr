import { findEmailMessages } from '../../services';
import { adminProcedure, router } from '../trpc';
import { z } from 'zod';

export const emailMessageRouter = router({
  findAll: adminProcedure
    .input(z.strictObject({
      sent: z.boolean().optional(),
    }))
    .query(async ({ input: { sent } }) => findEmailMessages({ where: { sent } })),
});
