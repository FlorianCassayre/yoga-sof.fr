import '@fontsource/nunito/300.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/700.css';
//import '@fontsource/roboto';
import { createTheme, ThemeProvider, Link as MuiLink, Typography } from '@mui/material';
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
import { AppRouter } from '../server/controllers';
import { WithTRPCConfig } from '@trpc/next/src/withTRPC';
import { frFR } from '@mui/x-data-grid';
import { frFR as pickersfrFR } from '@mui/x-date-pickers';
import { frFR as corefrFR } from '@mui/material/locale';
import { FrontsiteContainer } from '../components/layout/public/FrontsiteContainer';
import { SnackbarProvider } from 'notistack';
import { InternalLink } from '../components/contents/common/InternalLink';
import { zodFrenchErrorMap } from '../common/zodFrenchErrorMap';
import { z } from 'zod';
import { fr } from 'date-fns/locale';
import superjson from 'superjson';

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Typography paragraph align="justify">{children}</Typography>
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
            <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
              <LayoutProvider router={router}>
                <Component {...pageProps} />
              </LayoutProvider>
            </SnackbarProvider>
          </SessionProvider>
        </MDXProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`; // Dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config: ({ ctx }): WithTRPCConfig<AppRouter> => {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;
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
      transformer: superjson,
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);