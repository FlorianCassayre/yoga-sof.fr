import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function AuthGuard({ children, allowedUserTypes }) {
  if (typeof window === 'undefined') { // SSR
    return null;
  }

  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const hasPermission = session && allowedUserTypes.includes(session.userType);
  const router = useRouter();

  useEffect(() => {
    if(!loading && (!session || !hasPermission)) {
      router.push('/connexion');
    }
  }, [session, loading]);

  if (loading || !session || !hasPermission) {
    return null;
  }

  return children;
}
