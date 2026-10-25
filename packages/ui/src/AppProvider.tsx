'use client';

import { CssBaseline, type Theme, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TRPCClient } from '@trpc/client';
import type { CreateTRPCReactBase } from '@trpc/react-query';
import type { AnyRouter } from '@trpc/server';
import { SnackbarProvider } from 'notistack';
import { type ReactNode, useState } from 'react';

import { ZodProvider } from './ZodProvider';

interface AppProviderProps<TRouter extends AnyRouter> {
  theme: Theme;
  trpc?: { api: CreateTRPCReactBase<TRouter, unknown>; client: TRPCClient<TRouter> };
  children: ReactNode;
}

export const AppProvider = <TRouter extends AnyRouter>({
  theme,
  trpc,
  children,
}: AppProviderProps<TRouter>) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) =>
              (error as { data?: { code?: string } } | null)?.data?.code === undefined &&
              failureCount < 3,
          },
        },
      }),
  );

  const app = (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
            <ZodProvider>{children}</ZodProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {trpc ? (
          <trpc.api.Provider client={trpc.client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{app}</QueryClientProvider>
          </trpc.api.Provider>
        ) : (
          app
        )}
      </body>
    </html>
  );
};
