'use client';

import { CssBaseline, type Theme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TRPCClient } from '@trpc/client';
import type { CreateTRPCReactBase } from '@trpc/react-query';
import type { AnyRouter } from '@trpc/server';
import { SnackbarProvider } from 'notistack';
import { type ReactNode, useState } from 'react';

import { ZodProvider } from './ZodProvider';

interface UiRootLayoutProps<TRouter extends AnyRouter> {
  theme: Theme;
  trpc?: { api: CreateTRPCReactBase<TRouter, unknown>; client: TRPCClient<TRouter> };
  children: ReactNode;
}

export const UiRootLayout = <TRouter extends AnyRouter>({
  theme,
  trpc,
  children,
}: UiRootLayoutProps<TRouter>) => {
  const [queryClient] = useState(() => new QueryClient());

  const app = (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
          <ZodProvider>{children}</ZodProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
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
