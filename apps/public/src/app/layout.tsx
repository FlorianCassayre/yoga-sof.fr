'use client';

import { Box } from '@mui/material';
import { UiRootLayout } from '@yoga-sof/ui/UiRootLayout';

import { Footer } from '../layout/Footer';
import { Navbar } from '../layout/Navbar';
import { theme } from '../theme/theme';

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <UiRootLayout theme={theme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </UiRootLayout>
  );
};

export default RootLayout;
