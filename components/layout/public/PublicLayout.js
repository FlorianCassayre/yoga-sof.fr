import Head from 'next/head';
import { FooterLayout } from './FooterLayout';
import { NavigationLayout } from './NavigationLayout';

export function PublicLayout({ children, pathname, padNavbar }) {

  return (
    <div className="d-flex flex-column min-vh-100">
      <Head>
        <title>Yoga Sof</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavigationLayout pathname={pathname} />

      {padNavbar && (
        <div style={{ height: '56px' }} />
      )}

      {children}

      <FooterLayout />
    </div>
  );
}
