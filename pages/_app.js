import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fontsource/nunito';
import { withTRPC } from '@trpc/next';
import { SessionProvider } from 'next-auth/react';
import { MDXProvider } from '@mdx-js/react';
import { NotificationsProvider, RefreshProvider } from '../state';

function Paragraph({ children }) {
  return (
    <p className="text-justify">{children}</p>
  );
}

const components = {
  p: Paragraph,
};

function MyApp({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <SessionProvider>
        <NotificationsProvider>
          <RefreshProvider>
            <Component {...pageProps} />
          </RefreshProvider>
        </NotificationsProvider>
      </SessionProvider>
    </MDXProvider>
  );
}

export default withTRPC(MyApp);
