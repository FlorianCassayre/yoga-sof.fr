'use client';

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { House } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CourseIcon } from '../../features/course/CourseIcon';
import { CourseUserRegistrationIcon } from '../../features/courseUserRegistration/CourseUserRegistrationIcon';
import { DashboardIcon } from '../../features/dashboard/DashboardIcon';
import { MembershipIcon } from '../../features/membership/MembershipIcon';
import { SettingsIcon } from '../../features/settings/SettingsIcon';
import { UserIcon } from '../../features/user/UserIcon';

export const APPBAR_HEIGHT = 64;
export const SIDEBAR_WIDTH = 260;

const NAV_GROUPS = [
  {
    label: 'Planification',
    items: [
      { href: '/seances', label: 'Séances', Icon: CourseIcon },
      { href: '/inscriptions', label: 'Inscriptions', Icon: CourseUserRegistrationIcon },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { href: '/utilisateurs', label: 'Utilisateurs', Icon: UserIcon },
      { href: '/adhesions', label: 'Adhésions', Icon: MembershipIcon },
    ],
  },
  {
    label: 'Comptabilité',
    items: [],
  },
  {
    label: 'Administration',
    items: [{ href: '/parametres', label: 'Paramètres', Icon: SettingsIcon }],
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  siteUrl: string;
}

const SidebarContent = ({ onNavigate, siteUrl }: SidebarContentProps) => {
  const pathname = usePathname();

  return (
    <Box component="nav" sx={{ height: '100%', py: 1.5 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/"
            selected={pathname === '/'}
            onClick={onNavigate}
          >
            <ListItemIcon>
              <DashboardIcon size={18} />
            </ListItemIcon>
            <ListItemText primary="Aperçu" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      {NAV_GROUPS.map(({ label, items }) => (
        <List key={label} subheader={<ListSubheader>{label}</ListSubheader>}>
          {items.map(({ href, label: itemLabel, Icon }) => {
            const selected = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={href}
                  selected={selected}
                  onClick={onNavigate}
                >
                  <ListItemIcon>
                    <Icon size={18} />
                  </ListItemIcon>
                  <ListItemText primary={itemLabel} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      ))}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component="a" href={siteUrl} onClick={onNavigate}>
            <ListItemIcon>
              <House size={18} />
            </ListItemIcon>
            <ListItemText primary="Voir le site" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  siteUrl: string;
}

export const Sidebar = ({ mobileOpen, onMobileClose, siteUrl }: SidebarProps) => {
  return (
    <Box component="nav">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH },
        }}
      >
        <SidebarContent onNavigate={onMobileClose} siteUrl={siteUrl} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            top: APPBAR_HEIGHT,
            height: `calc(100% - ${APPBAR_HEIGHT}px)`,
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <SidebarContent siteUrl={siteUrl} />
      </Drawer>
    </Box>
  );
};
