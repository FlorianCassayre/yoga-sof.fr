'use client';

import { Box } from '@mui/material';
import { AppProvider } from '@yoga-sof/ui/AppProvider';

import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { theme } from '../theme/theme';

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <AppProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </AppProvider>
  );
};

export default RootLayout;
