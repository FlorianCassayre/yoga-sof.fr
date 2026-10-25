'use client';

import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Calendar, Menu, Phone, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CONTACT_INFO } from '../features/contact/contactInfo';
import { NATURAL_PALETTE } from '../theme/palette';
import { Logo } from './Logo';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/yoga', label: 'Le Yoga' },
    { href: '/seances', label: 'Informations pratiques' },
    { href: '/inscription', label: 'Inscription' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={isScrolled ? { borderBottom: '1px solid', borderColor: 'divider' } : undefined}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', height: { xs: 70, md: 80 } }}
          >
            <Box component="a" href="#" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Logo />
              <Box>
                <Typography variant="h5" sx={{ lineHeight: 1 }}>
                  Yoga-Sof
                </Typography>
                <Typography variant="overline" sx={{ display: 'block', lineHeight: 1.4 }}>
                  Hésingue
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', lg: 'flex' } }}>
              {navLinks.map((link) => (
                <Box
                  component="a"
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}
            >
              <Button
                component="a"
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                variant="text"
                size="small"
                startIcon={<Phone size={14} color={NATURAL_PALETTE.moss} />}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                {CONTACT_INFO.phone}
              </Button>

              <Button
                id="btn-reserve-nav"
                href="/connexion"
                variant="contained"
                size="small"
                startIcon={<UserRound size={14} />}
              >
                Espace pratiquant
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', display: { xs: 'flex', lg: 'none' } }}
            >
              <IconButton
                id="btn-toggle-mobile-menu"
                onClick={() => setMobileMenuOpen(true)}
                color="inherit"
              >
                <Menu size={24} />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{ paper: { sx: { p: 3 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Menu Yoga-Sof</Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <X size={22} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <List disablePadding>
          {navLinks.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                onClick={() => handleLinkClick(link.href)}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  '&:hover': { bgcolor: NATURAL_PALETTE.surfaceHighlight },
                }}
              >
                <ListItemText primary={link.label} />
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  →
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Button
            component="a"
            href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
            variant="outlined"
            fullWidth
            startIcon={<Phone size={16} color={NATURAL_PALETTE.moss} />}
          >
            Appeler Sophie ({CONTACT_INFO.phone})
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setMobileMenuOpen(false);
            }}
            startIcon={<Calendar size={16} />}
          >
            Réserver mon cours d'essai (10€)
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};
