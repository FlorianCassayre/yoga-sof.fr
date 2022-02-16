import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fontsource/nunito';
import { SessionProvider } from 'next-auth/react';
import { RefreshProvider } from '../state';

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <RefreshProvider>
        <Component {...pageProps} />
      </RefreshProvider>
    </SessionProvider>
  );
}

export default MyApp;
