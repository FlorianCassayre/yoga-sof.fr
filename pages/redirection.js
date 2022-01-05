import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Redirection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  useEffect(() => {
    //if (router.asPath.endsWith("#")) {
    //  router.push(router.pathname);
    //}

    if(!loading) {
      if(status === 'unauthenticated') {
        router.push('/connexion');
      } else {
        router.push('/administration'); // TODO: multiplex
      }
    }
  }, [session, loading]);

  return null; // Nothing to display in any case
}
