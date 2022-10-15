import '@fontsource/nunito';
import '@fontsource/roboto';
import { createTheme, ThemeProvider } from '@mui/material';
import { withTRPC } from '@trpc/next';
import { SessionProvider } from 'next-auth/react';
import { MDXProvider } from '@mdx-js/react';
import { NotificationsProvider, RefreshProvider } from '../components/state';
import { grey } from '@mui/material/colors';

function Paragraph({ children }) {
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
    }
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

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <MDXProvider components={components}>
        <SessionProvider>
          <NotificationsProvider>
            <RefreshProvider>
              <Component {...pageProps} />
            </RefreshProvider>
          </NotificationsProvider>
        </SessionProvider>
      </MDXProvider>
    </ThemeProvider>
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
