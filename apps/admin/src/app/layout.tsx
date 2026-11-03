import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { connexionUrl } from '@yoga-sof/ui/connexionUrl';
import { redirect } from 'next/navigation';

import { AdminProviders } from '../components/layout/AdminProviders';

const RootLayout = async ({ children }: LayoutProps<'/'>) => {
  const id = (await auth())?.user?.id;

  if (!id) {
    redirect(connexionUrl(process.env.NEXT_ADMIN_SITE_URL));
  }

  const allowed = await withTransaction((tx) => roleService.hasPermission(id, 'adminPanel', tx), {
    readOnly: true,
  });

  if (!allowed) {
    redirect(process.env.NEXT_PUBLIC_SITE_URL ?? '/');
  }

  return (
    <AdminProviders siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? '/'}>{children}</AdminProviders>
  );
};

export default RootLayout;
