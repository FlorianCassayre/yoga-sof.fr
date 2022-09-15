import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../lib/server/controllers';
import { TRPCError } from '@trpc/server';
import { ServiceError } from '../../../lib/server/services/helpers/errors';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/src/rpc/codes';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({ req, res }),
  onError: ({ error, type, path, input, ctx, req }) => {
    console.error('Error caught by TRPC:');
    console.log(error);
  },
});
