import { findAdminsWhitelist } from '../../services';
import { adminProcedure, router } from '../trpc';

export const adminWhitelistRouter = router({
  adminWhitelistFindAll: adminProcedure
    .query(async () => findAdminsWhitelist()),
});
