import '@fontsource/nunito/300.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/700.css';
import '@fontsource/roboto';
import { createTheme, ThemeProvider, Link as MuiLink } from '@mui/material';
import { withTRPC } from '@trpc/next';
import { SessionProvider } from 'next-auth/react';
import { MDXProvider } from '@mdx-js/react';
import { grey } from '@mui/material/colors';
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateFnsUtils from '@date-io/date-fns';
import { AppProps } from 'next/app';
import { Router } from 'next/router';
import { GuardedBackofficeContainer } from '../components/layout/admin/GuardedBackofficeContainer';
import { AppRouter } from '../lib/server/controllers';
import { WithTRPCConfig } from '@trpc/next/src/withTRPC';
import { frFR } from '@mui/x-data-grid';
import { frFR as pickersfrFR } from '@mui/x-date-pickers';
import { frFR as corefrFR } from '@mui/material/locale';
import { FrontsiteContainer } from '../components/layout/public/FrontsiteContainer';
import { SnackbarProvider } from 'notistack';
import { InternalLink } from '../components/contents/common/InternalLink';
import { zodFrenchErrorMap } from '../lib/client/zodFrenchErrorMap';
import { z } from 'zod';
import { fr } from 'date-fns/locale';

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-justify">{children}</p>
  );
}

const components = {
  p: Paragraph,
  a: InternalLink,
};

const theme = createTheme({
    typography: {
      fontFamily: 'Nunito',
    },
    palette: {
      background: {
        default: "#fcfcfc"
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: grey[800],
          },
        },
      },
    },
  },
  frFR,
  pickersfrFR,
  corefrFR);

z.setErrorMap(zodFrenchErrorMap);

interface LayoutProviderProps {
  router: Router;
  children: React.ReactNode;
}

const LayoutProvider = ({ router, children }: LayoutProviderProps): JSX.Element => {
  if (router.pathname === '/connexion' || router.pathname === '/redirection' || router.pathname === '/verification') {
    return (
      <>
        {children}
      </>
    );
  } else if (router.pathname.startsWith('/administration')) {
    return (
      <GuardedBackofficeContainer>
        {children}
      </GuardedBackofficeContainer>
    );
  } else {
    return (
      <FrontsiteContainer>
        {children}
      </FrontsiteContainer>
    );
  }
};

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <LocalizationProvider dateAdapter={DateFnsUtils} adapterLocale={fr}>
      <ThemeProvider theme={theme}>
        <MDXProvider components={components as any}>
          <SessionProvider>
            <SnackbarProvider maxSnack={3}>
              {/*<NotificationsProvider>
                <RefreshProvider>*/}
                  <LayoutProvider router={router}>
                    <Component {...pageProps} />
                  </LayoutProvider>
              {/*}</RefreshProvider>
              </NotificationsProvider>*/}
            </SnackbarProvider>
          </SessionProvider>
        </MDXProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default withTRPC<AppRouter>({
  config: ({ ctx }): WithTRPCConfig<AppRouter> => {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = 'http://localhost:3000/api/trpc';
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            retry: false,
            keepPreviousData: false,
            optimisticResults: false,
          },
          mutations: {
            retry: false,
          },
        },
      },
      url,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
