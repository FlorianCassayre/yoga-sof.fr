import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { vi } from 'vitest';

export const renderWithProviders = (ui: ReactElement, queryClient = new QueryClient()) => ({
  queryClient,
  ...render(createElement(QueryClientProvider, { client: queryClient }, ui)),
});

export const fakeQuery = <Row>(data: Row | null) => ({
  useQuery: () => ({ data, isPending: false }),
});

export const fakeMutation = <Row, Input>(resolve: (input: Input) => Row | Promise<Row>) => {
  const mutateAsync = vi.fn((input: Input) => Promise.resolve(resolve(input)));

  return { useMutation: () => ({ mutateAsync, isPending: false, error: null }), mutateAsync };
};
