'use client';

import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import type { AppRouter } from './appRouter';

export const api = createTRPCReact<AppRouter>();

export const createTrpcClient = (basePath: string) =>
  api.createClient({
    links: [
      httpBatchLink({
        url: `${basePath}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
