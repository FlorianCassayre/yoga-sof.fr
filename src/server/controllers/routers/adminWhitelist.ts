import { findAdminsWhitelist } from '../../services';
import { adminProcedure, router } from '../trpc';

export const adminWhitelistRouter = router({
  findAll: adminProcedure
    .query(async () => findAdminsWhitelist()),
});
