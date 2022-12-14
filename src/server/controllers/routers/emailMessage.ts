import { findEmailMessages } from '../../services';
import { adminProcedure, router } from '../trpc';

export const emailMessageRouter = router({
  emailMessageFindAll: adminProcedure
    .query(async () => findEmailMessages({
      include: {
        user: true,
      },
    })),
});
