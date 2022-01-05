import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { NavigationLayout } from './NavigationLayout';

export function PrivateLayout({ children, pathname }) {
  if (typeof window === 'undefined') { // SSR
    return null;
  }

  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if(!loading && !session) {
      router.push('/connexion');
    }
  }, [session, loading]);

  if (loading || !session) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>Yoga Sof</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavigationLayout pathname={pathname}>
        {children}
      </NavigationLayout>

    </div>
  );
}
