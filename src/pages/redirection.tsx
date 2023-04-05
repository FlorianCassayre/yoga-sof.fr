import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { UserType } from '../common/all';
import { CssBaseline, LinearProgress } from '@mui/material';

export default function Redirection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  useEffect(() => {
    if (!loading) {
      if (session === null) {
        router.replace({ pathname: '/connexion', query: router.query.r ? { r: router.query.r } : undefined });
      } else {
        const defaultRedirections: Record<UserType, string> = {
          [UserType.Regular]: '/inscription',
          [UserType.Admin]: '/administration',
        };
        const { r: requestedRedirection } = router.query;
        // Prevent open redirect vulnerability
        let sanitizedRequestedRedirection: null | string = null;
        if (requestedRedirection && !Array.isArray(requestedRedirection)) {
          if (requestedRedirection.startsWith('/')) {
            sanitizedRequestedRedirection = `/${requestedRedirection}`;
          }
        }
        // Shortcut for admins
        if (session.userType === UserType.Admin && sanitizedRequestedRedirection && !sanitizedRequestedRedirection.startsWith('/administration')) {
          sanitizedRequestedRedirection = null;
        }
        const redirection =
          sanitizedRequestedRedirection ?? defaultRedirections[session.userType];
        router.replace(redirection);
      }
    }
  }, [router, status, session, loading]);

  return ( // Loading screen
    <>
      <CssBaseline />
      <LinearProgress />
    </>
  );
}
