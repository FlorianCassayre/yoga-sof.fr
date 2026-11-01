'use client';

import { AppProvider } from '@yoga-sof/ui/AppProvider';
import { type ReactNode, useMemo } from 'react';

import { BASE_PATH } from '../../basePath';
import { api, createTrpcClient } from '../../server/api';
import { theme } from '../../theme/theme';
import { AdminLayout } from './AdminLayout';

export const AdminProviders = ({ children, siteUrl }: { children: ReactNode; siteUrl: string }) => {
  const trpcClient = useMemo(() => createTrpcClient(BASE_PATH), []);

  return (
    <AppProvider theme={theme} trpc={{ api, client: trpcClient }}>
      <AdminLayout siteUrl={siteUrl}>{children}</AdminLayout>
    </AppProvider>
  );
};
