import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { UserType } from '../common/all';
import { CssBaseline, LinearProgress } from '@mui/material';

interface AuthGuardProps {
  allowedUserTypes: UserType[];
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedUserTypes, children }) => {
  const { data: session, status } = useSession();
  const loading = useMemo(() => status === 'loading', [status]);
  const hasPermission = useMemo(() => session && allowedUserTypes.includes(session.userType), [session, allowedUserTypes]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || !hasPermission)) {
      // Redirect the user only if they are unauthenticated
      router.replace({ pathname: '/connexion', query: !session ? { r: router.asPath } : undefined });
    }
  }, [session, loading, hasPermission, router]);

  if (typeof window === 'undefined') {
    // SSR
    return null;
  }

  if (loading || !session || !hasPermission) {
    return (
      <>
        <CssBaseline />
        <LinearProgress />
      </>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
