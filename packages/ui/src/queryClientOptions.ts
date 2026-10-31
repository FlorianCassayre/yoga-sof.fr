import type { QueryClientConfig } from '@tanstack/react-query';

export const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        (error as { data?: { code?: string } } | null)?.data?.code === undefined &&
        failureCount < 3,
    },
  },
};
