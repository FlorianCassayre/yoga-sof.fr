import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fontsource/nunito';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
