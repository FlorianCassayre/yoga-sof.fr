import Head from 'next/head';
import { Breadcrumb } from 'react-bootstrap';
import { USER_TYPE_ADMIN } from '../../session';
import { AuthGuard } from '../../AuthGuard';
import { NavigationLayout } from './NavigationLayout';
import Link from 'next/link';

export function PrivateLayout({ children, pathname, breadcrumb }) {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_ADMIN]}>
      <div>
        <Head>
          <title>Yoga Sof</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <NavigationLayout pathname={pathname}>
          {breadcrumb && (
            <Breadcrumb>
              {breadcrumb.map(({ title, pathname: pathnameOther }, i) => pathnameOther && pathnameOther !== pathname ? (
                <Link key={i} href={pathnameOther} passHref>

                  <Breadcrumb.Item>{title}</Breadcrumb.Item>
                </Link>
              ) : (
                <Breadcrumb.Item key={i} active>{title}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}

          {children}
        </NavigationLayout>

      </div>
    </AuthGuard>
  );
}
