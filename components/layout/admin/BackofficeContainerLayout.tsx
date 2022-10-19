import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useLocation, useMedia } from 'react-use';
import { Fragment, useCallback, useState } from 'react';
import { IconButton, ListSubheader } from '@mui/material';
import { Menu } from '@mui/icons-material';
import Link from 'next/link';

const drawerWidth = 240;

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  url?: string;
  disabled?: boolean;
}

interface MenuCategory {
  title?: string;
  children: MenuItem[];
}

interface BackofficeContainerLayoutProps {
  title: string;
  menu: MenuCategory[];
  children: React.ReactNode;
}

export const BackofficeContainerLayout: React.FC<BackofficeContainerLayoutProps> =
  ({ title, menu, children }) => {
  const isWide = useMedia('(min-width: 768px)');
  const [isOpen, setOpen] = useState(false);

  const state = useLocation();
  const isUrlSelected = useCallback((url: string) => state.pathname?.startsWith(url), []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Ouvrir"
            onClick={() => setOpen(!isOpen)}
            edge="start"
            sx={{ mr: 2, ...(isWide && { display: 'none' }) }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isWide ? "permanent" : undefined}
        open={isWide || isOpen}
        onClose={() => !isWide && setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {menu.map(({ title: categoryTitle, children }, i) => (
              <Fragment key={i}>
                <List subheader={categoryTitle ? <ListSubheader>{categoryTitle}</ListSubheader> : undefined}>
                  {children.map(({ title: itemTitle, icon, url, disabled }, j) => (
                    <ListItem key={j} disablePadding>
                      <ListItemButton selected={url !== undefined ? isUrlSelected(url) : false} disabled={disabled}>
                        <ListItemIcon>
                          {icon}
                        </ListItemIcon>
                        {url ? (
                          <Link href={url}>
                            <ListItemText primary={itemTitle} />
                          </Link>
                        ) : (
                          <ListItemText primary={itemTitle} />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {i < menu.length - 1 && (
                  <Divider />
                )}
              </Fragment>
            ))}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
