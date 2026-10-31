import { auth } from '@yoga-sof/ui/auth';
import { connexionUrl } from '@yoga-sof/ui/connexionUrl';
import { redirect } from 'next/navigation';

import { AdminProviders } from '../components/layout/AdminProviders';

const RootLayout = async ({ children }: LayoutProps<'/'>) => {
  const session = await auth();

  if (!session) {
    redirect(connexionUrl(process.env.NEXT_ADMIN_SITE_URL));
  }

  return <AdminProviders>{children}</AdminProviders>;
};

export default RootLayout;
