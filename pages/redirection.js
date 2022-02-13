import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { USER_TYPE_ADMIN, USER_TYPE_REGULAR } from '../lib/common';

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
        if(session.userType === USER_TYPE_REGULAR) {
          router.push('/inscription');
        } else if(session.userType === USER_TYPE_ADMIN) {
          router.push('/administration');
        } else {
          throw new Error();
        }
      }
    }
  }, [session, loading]);

  return null; // Nothing to display in any case
}
