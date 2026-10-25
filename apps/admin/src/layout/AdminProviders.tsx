'use client';

import { AppProvider } from '@yoga-sof/ui/AppProvider';
import type { ReactNode } from 'react';

import { api, trpcClient } from '../server/api';
import { theme } from '../theme/theme';
import { AdminLayout } from './AdminLayout';

export const AdminProviders = ({ children }: { children: ReactNode }) => (
  <AppProvider theme={theme} trpc={{ api, client: trpcClient }}>
    <AdminLayout>{children}</AdminLayout>
  </AppProvider>
);
