import Head from 'next/head';
import { USER_TYPE_ADMIN, USER_TYPE_REGULAR } from '../../session';
import { AuthGuard } from '../../AuthGuard';
import { NavigationLayout } from './NavigationLayout';

export function PrivateLayout({ children, pathname }) {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_ADMIN]}>
      <div>
        <Head>
          <title>Yoga Sof</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <NavigationLayout pathname={pathname}>
          {children}
        </NavigationLayout>

      </div>
    </AuthGuard>
  );
}
