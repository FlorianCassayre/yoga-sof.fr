import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

export const trpc = initTRPC.create({
  transformer: superjson,
});
