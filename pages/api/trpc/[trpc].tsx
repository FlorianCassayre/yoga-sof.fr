import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../lib/server/controllers/router';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  //createContext: () => null,
});
