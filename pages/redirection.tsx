import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UserType } from '../lib/common/all';

export default function Redirection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  useEffect(() => {
    // if (router.asPath.endsWith("#")) {
    //  router.push(router.pathname);
    // }

    if (!loading) {
      if (session === null) {
        router.push('/connexion');
      } else if (session.userType === UserType.Regular) {
        router.push('/inscription');
      } else if (session.userType === UserType.Admin) {
        router.push('/administration');
      } else {
        throw new Error();
      }
    }
  }, [router, status, session, loading]);

  return null; // Nothing to display in any case
}
