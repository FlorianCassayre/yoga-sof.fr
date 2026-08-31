'use client';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import { Footer } from '../layout/Footer';
import { Navbar } from '../layout/Navbar';
import { theme } from '../theme';

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
              color: 'text.primary',
            }}
          >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
