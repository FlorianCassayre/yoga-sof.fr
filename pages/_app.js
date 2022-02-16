import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fontsource/nunito';
import { SessionProvider } from 'next-auth/react';
import { NotificationsProvider, RefreshProvider } from '../state';

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <NotificationsProvider>
        <RefreshProvider>
          <Component {...pageProps} />
        </RefreshProvider>
      </NotificationsProvider>
    </SessionProvider>
  );
}

export default MyApp;
