'use client';

import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: { md: 2 } }}
          >
            <Menu size={22} />
          </IconButton>
          <Typography variant="h6">Yoga-Sof</Typography>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
