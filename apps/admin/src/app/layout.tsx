'use client';

import { UiRootLayout } from '@yoga-sof/ui/UiRootLayout';

import { AdminLayout } from '../layout/AdminLayout';
import { api, trpcClient } from '../server/api';
import { theme } from '../theme/theme';

const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <UiRootLayout theme={theme} trpc={{ api, client: trpcClient }}>
    <AdminLayout>{children}</AdminLayout>
  </UiRootLayout>
);

export default RootLayout;
