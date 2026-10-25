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
} from '@mui/material';
import { House } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CourseIcon } from '../features/course/CourseIcon';
import { UserIcon } from '../features/user/UserIcon';

export const APPBAR_HEIGHT = 64;
export const SIDEBAR_WIDTH = 260;

const NAV_ITEMS = [
  { href: '/seances', label: 'Séances', Icon: CourseIcon },
  { href: '/utilisateurs', label: 'Utilisateurs', Icon: UserIcon },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

interface SidebarContentProps {
  onNavigate?: () => void;
}

const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
  const pathname = usePathname();

  return (
    <Box component="nav" sx={{ height: '100%', py: 1.5 }}>
      <List>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const selected = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <ListItem key={href} disablePadding>
              <ListItemButton component={Link} href={href} selected={selected} onClick={onNavigate}>
                <ListItemIcon>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component="a" href={SITE_URL} onClick={onNavigate}>
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
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
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
        <SidebarContent onNavigate={onMobileClose} />
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
        <SidebarContent />
      </Drawer>
    </Box>
  );
};
