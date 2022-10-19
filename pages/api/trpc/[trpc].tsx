import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../lib/server/controllers';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({ req, res }),
});
