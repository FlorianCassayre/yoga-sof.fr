import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { membershipCreateSchema } from '@yoga-sof/core/server';
import superjson from 'superjson';
import { describe, expect, it } from 'vitest';

import { trpc } from '../trpc';

const testRouter = trpc.router({
  membership: trpc.router({
    create: trpc.procedure.input(membershipCreateSchema).mutation(({ input }) => input),
    boom: trpc.procedure.mutation(() => {
      throw new Error('boom');
    }),
  }),
});

type TestRouter = typeof testRouter;

const client = createTRPCClient<TestRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost/api/trpc',
      transformer: superjson,
      fetch: (url, options) =>
        fetchRequestHandler({
          endpoint: '/api/trpc',
          req: new Request(url, options),
          router: testRouter,
          createContext: () => ({}),
        }),
    }),
  ],
});

describe('trpc errorFormatter', () => {
  it('surfaces a readable message for input validation errors', async () => {
    const error = await client.membership.create
      .mutate({ type: 'famille', year: 2026, beneficiaries: [] })
      .catch((mutationError: unknown) => mutationError);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Sélectionnez au moins un bénéficiaire.');
  });

  it('masks internal errors', async () => {
    const error = await client.membership.boom
      .mutate(undefined as never)
      .catch((mutationError: unknown) => mutationError);

    expect((error as Error).message).toBe('Une erreur est survenue.');
  });
});
