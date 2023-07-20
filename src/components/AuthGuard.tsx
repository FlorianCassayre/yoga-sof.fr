import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { CssBaseline, LinearProgress } from '@mui/material';
import { UserRole } from '@prisma/client';

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const { data: session, status } = useSession();
  const loading = useMemo(() => status === 'loading', [status]);
  const hasPermission = useMemo(() => session && allowedRoles.includes(session.role), [session, allowedRoles]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || !hasPermission)) {
      // Redirect the user only if they are unauthenticated
      router.replace({ pathname: '/connexion', query: !session ? { r: router.asPath } : undefined });
    }
  }, [session, loading, hasPermission, router]);

  if (loading || !session || !hasPermission) { // SSR or loading
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
