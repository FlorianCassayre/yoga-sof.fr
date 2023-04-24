import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/controllers';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({ req, res }),
  onError: ({ error, type, path, input, ctx, req }) => {
    console.error('Error caught by TRPC:');
    console.log(error);
  },
});
