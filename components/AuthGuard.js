import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

export function AuthGuard({ children, allowedUserTypes }) {
  const { data: session, status } = useSession();
  const loading = useMemo(() => status === 'loading', [status]);
  const hasPermission = useMemo(() => session && allowedUserTypes.includes(session.userType), [session, allowedUserTypes]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || !hasPermission)) {
      router.push('/connexion');
    }
  }, [session, loading, hasPermission, router]);

  if (typeof window === 'undefined') {
    // SSR
    return null;
  }

  if (loading || !session || !hasPermission) {
    return null;
  }

  return children;
}
