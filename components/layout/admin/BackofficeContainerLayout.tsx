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
import { useLocation, useMedia } from 'react-use';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { Avatar, IconButton, ListSubheader, Menu, MenuItem } from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import { LinkProps } from 'next/dist/client/link';
import { TypeSafePage } from 'next-type-safe-routes';

const drawerWidth = 240;

interface ProfileMenuItem {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface ProfileMenu {
  pictureUrl?: string;
  children: ProfileMenuItem[];
}

interface SideMenuItem {
  title: string;
  icon: React.ReactNode;
  url?: string & TypeSafePage;
  disabled?: boolean;
}

interface SideMenuCategory {
  title?: string;
  children: SideMenuItem[];
}

interface BackofficeContainerLayoutProps {
  title: string;
  url: string;
  menu: SideMenuCategory[];
  profileMenu: ProfileMenu;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const OptionalLink = ({ href, ...props }: Omit<LinkProps, 'href'> & { href?: LinkProps["href"], children: React.ReactNode }): JSX.Element =>
  href ? <Link href={href} {...props}>{props.children}</Link> : <>{props.children}</>;

export const BackofficeContainerLayout: React.FC<BackofficeContainerLayoutProps> =
  ({ title, url: titleUrl, menu, profileMenu, children, footer }) => {
  const isWide = useMedia('(min-width: 768px)', true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchorEl, setProfileProfileAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileProfileAnchorEl(event.currentTarget);
  };

  const state = useLocation();
  const longestMatchingUrl = useMemo(() => {
    const matches = menu.flatMap(category => category.children.map(({ url }) => url).filter(url => url && state.pathname?.startsWith(url))) as string[];
    matches.sort((a, b) => b.length - a.length);
    return matches.length > 0 ? matches[0] : null;
  }, [state, menu]);
  const isUrlSelected = useCallback((url: string) => longestMatchingUrl !== null && url === longestMatchingUrl, [longestMatchingUrl]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Ouvrir"
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            edge="start"
            sx={{ mr: 2, ...(isWide && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Link href={titleUrl} passHref>
            <Typography variant="h6" noWrap component="a" sx={{ textDecoration: 'none', color: 'inherit' }}>
              {title}
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          {!!profileMenu && (
            <>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {profileMenu.pictureUrl ? (
                  <Avatar alt="Avatar" src={profileMenu.pictureUrl} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={profileAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(profileAnchorEl)}
                onClose={() => setProfileProfileAnchorEl(null)}
              >
                {profileMenu.children.map(({ title, icon, onClick }, i) => (
                  <MenuItem key={i} onClick={() => {
                    setProfileProfileAnchorEl(null);
                    onClick && onClick();
                  }}>
                    <ListItemIcon>
                      {icon}
                    </ListItemIcon>
                    <ListItemText primary={title} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isWide ? "permanent" : undefined}
        open={isWide || isDrawerOpen}
        onClose={() => !isWide && setDrawerOpen(false)}
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
                    <OptionalLink key={j} href={url} passHref>
                      <ListItem disablePadding>
                        <ListItemButton selected={url !== undefined ? isUrlSelected(url) : false} disabled={disabled} onClick={() => setDrawerOpen(false)}>
                          <ListItemIcon>
                            {icon}
                          </ListItemIcon>
                          <ListItemText primary={itemTitle} />
                        </ListItemButton>
                      </ListItem>
                    </OptionalLink>
                  ))}
                </List>
                {i < menu.length - 1 && (
                  <Divider />
                )}
              </Fragment>
            ))}
        </Box>
        <List dense sx={{ mt: 'auto' }}>
          <ListItem>
            <ListItemText disableTypography>{footer}</ListItemText>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
