import { findEmailMessages } from '../../services';
import { adminProcedure, router } from '../trpc';

export const emailMessageRouter = router({
  findAll: adminProcedure
    .query(async () => findEmailMessages({
      include: {
        user: true,
      },
    })),
});
