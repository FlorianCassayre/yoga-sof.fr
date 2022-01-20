import Head from 'next/head';
import { Badge, Breadcrumb, Spinner } from 'react-bootstrap';
import { ErrorMessage } from '../../ErrorMessage';
import { USER_TYPE_ADMIN } from '../../session';
import { AuthGuard } from '../../AuthGuard';
import { NavigationLayout } from './NavigationLayout';
import Link from 'next/link';

export function PrivateLayout({ children, pathname }) {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_ADMIN]}>
      <div>
        <Head>
          <title>Administration Yoga Sof</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <NavigationLayout pathname={pathname}>
          {children}
        </NavigationLayout>

      </div>
    </AuthGuard>
  );
}
