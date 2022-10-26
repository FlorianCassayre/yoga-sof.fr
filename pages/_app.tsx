import '@fontsource/nunito';
import '@fontsource/roboto';
import { createTheme, ThemeProvider } from '@mui/material';
import { withTRPC } from '@trpc/next';
import { SessionProvider } from 'next-auth/react';
import { MDXProvider } from '@mdx-js/react';
import { NotificationsProvider, RefreshProvider } from '../components/state';
import { grey } from '@mui/material/colors';
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateFnsUtils from '@date-io/date-fns';

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-justify">{children}</p>
  );
}

const components = {
  p: Paragraph,
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
});

interface MyAppProps {
  Component: React.Component & ((props: object) => JSX.Element);
  pageProps: Record<string, any>;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <LocalizationProvider dateAdapter={DateFnsUtils}>
      <ThemeProvider theme={theme}>
        <MDXProvider components={components as any}>
          <SessionProvider>
            <NotificationsProvider>
              <RefreshProvider>
                <Component {...pageProps} />
              </RefreshProvider>
            </NotificationsProvider>
          </SessionProvider>
        </MDXProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default withTRPC({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = 'http://localhost:3000/api/trpc';
    return {
      retries: 1,
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
