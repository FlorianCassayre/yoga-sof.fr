import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { findAdminsWhitelist } from '../../services';

export const adminWhitelistRouter = trpc
  .router<ContextProtected>()
  .query('findAll', {
    resolve: async () => findAdminsWhitelist(),
  });
