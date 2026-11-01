'use client';

import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { CircleUserRound, LogOut, Menu as MenuIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { signOutAction } from '../../features/auth/signOutAction';
import { useCurrentUser } from '../../features/user/useCurrentUser';
import { Sidebar } from './Sidebar';

export const AdminLayout = ({ children, siteUrl }: { children: ReactNode; siteUrl: string }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const user = useCurrentUser();

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
            <MenuIcon size={22} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Yoga-Sof
          </Typography>
          <Button
            color="inherit"
            onClick={(event) => setUserMenuAnchor(event.currentTarget)}
            startIcon={<CircleUserRound size={20} />}
          >
            {user?.name}
          </Button>
          <Menu
            anchorEl={userMenuAnchor}
            open={userMenuAnchor !== null}
            onClose={() => setUserMenuAnchor(null)}
          >
            {user && (
              <MenuItem
                component={Link}
                href={`/utilisateurs/${user.id}`}
                onClick={() => setUserMenuAnchor(null)}
              >
                <ListItemIcon>
                  <CircleUserRound size={18} />
                </ListItemIcon>
                Voir le profil
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={() => {
                setUserMenuAnchor(null);
                void signOutAction();
              }}
            >
              <ListItemIcon>
                <LogOut size={18} />
              </ListItemIcon>
              Se déconnecter
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        siteUrl={siteUrl}
      />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
