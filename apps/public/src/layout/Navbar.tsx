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

import { CONTACT_INFO } from '../config';
import { NATURAL_PALETTE } from '../theme';
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
        elevation={0}
        sx={{
          bgcolor: isScrolled ? 'rgba(253, 252, 248, 0.94)' : 'rgba(253, 252, 248, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: isScrolled
            ? `1px solid ${NATURAL_PALETTE.border}`
            : '1px solid transparent',
          transition: 'all 0.3s ease-in-out',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', height: { xs: 70, md: 80 } }}
          >
            {/* Brand Logo */}
            <Box
              component="a"
              href="#"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Logo />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Cormorant Variable", Georgia, serif',
                    fontWeight: 700,
                    fontSize: { xs: '1.35rem', sm: '1.55rem' },
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    color: 'text.primary',
                  }}
                >
                  Yoga-Sof
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    display: 'block',
                  }}
                >
                  Hésingue
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation Links */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 3.5,
              }}
            >
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
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    position: 'relative',
                    py: 0.5,
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>

            {/* Right Actions */}
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
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  px: 1.5,
                }}
              >
                {CONTACT_INFO.phone}
              </Button>

              <Button
                id="btn-reserve-nav"
                variant="contained"
                size="small"
                // TODO onClick
                startIcon={<UserRound size={14} />}
                sx={{
                  px: 2.5,
                  py: 0.9,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                Espace pratiquant
              </Button>
            </Stack>

            {/* Mobile Actions */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', display: { xs: 'flex', lg: 'none' } }}
            >
              <IconButton
                id="btn-toggle-mobile-menu"
                onClick={() => setMobileMenuOpen(true)}
                color="inherit"
                aria-label="Ouvrir le menu"
                sx={{ color: 'text.primary' }}
              >
                <Menu size={24} />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'background.default',
              p: 3,
              borderBottom: `1px solid ${NATURAL_PALETTE.border}`,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem' }}
          >
            Menu Yoga-Sof
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu">
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
                <ListItemText
                  primary={link.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.95rem',
                      },
                    },
                  }}
                />
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
            sx={{ py: 1.25, borderRadius: 9999 }}
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
            sx={{ py: 1.25, borderRadius: 9999 }}
          >
            Réserver mon cours d'essai (10€)
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};
