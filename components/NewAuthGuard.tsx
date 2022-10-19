import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { UserType } from '../lib/common/all';

interface NewAuthGuardProps {
  allowedUserTypes: UserType[];
  children: React.ReactNode;
}

export const NewAuthGuard: React.FC<NewAuthGuardProps> = ({ allowedUserTypes, children }) => {
  const { data: session, status } = useSession();
  const loading = useMemo(() => status === 'loading', [status]);
  const hasPermission = useMemo(() => session && allowedUserTypes.includes(session.userType), [session, allowedUserTypes]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || !hasPermission)) {
      // TODO redirection
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

  return (
    <>
      {children}
    </>
  );
}
