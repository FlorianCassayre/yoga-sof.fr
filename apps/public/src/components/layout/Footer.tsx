'use client';

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowUp, Facebook, Instagram, Mail, MapPin, Phone, X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';

import { CONTACT_INFO } from '../../features/contact/contactInfo';
import { NATURAL_PALETTE } from '../../theme/palette';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { href: '#methode', label: 'Méthode De Gasquet' },
  { href: '#cours', label: 'Nos Cours' },
  { href: '#planning', label: 'Planning Hebdo' },
  { href: '#tarifs', label: 'Tarifs & Carnets' },
  { href: '#sophie', label: 'Sophie Richaud' },
  { href: '#lieux', label: 'Lieux à Hésingue' },
  { href: '#contact', label: 'Contact & Inscription' },
];

const SCHEDULE = [
  { label: 'Lundi/Mardi (Enfants)', value: '17h15 - 18h15' },
  { label: 'Mardi/Jeudi (Matin)', value: '09h45 - 11h00' },
  { label: 'Mercredi (Après-midi)', value: '16h00 & 17h45' },
  { label: 'Jeudi (Fin d\u2019aprèm)', value: '16h30 - 17h45' },
  { label: 'Samedi (Parent-Enfant)', value: '10h00 (Mensuel)' },
];

const LOCATIONS = [
  { name: 'Studio (adultes)', address: '8 rue des Moissonneurs, 68220 Hésingue' },
  { name: 'La Comète (enfants)', address: '16 rue du 20 Novembre, 68220 Hésingue' },
];

const MENTIONS = [
  {
    title: 'Éditeur du site :',
    text: 'Association Yoga-Sof (Loi 1901), domiciliée au 8 rue des Moissonneurs, 68220 Hésingue.',
  },
  {
    title: 'Responsable de la publication :',
    text: 'Sophie Richaud-Cassayre (contact@yoga-sof.fr - 06 58 48 33 45).',
  },
  {
    title: 'Enseignements :',
    text: "Enseignement du Hatha Yoga et de la méthode Yoga Sans Dégâts certifiée par l'Institut De Gasquet (Paris).",
  },
  {
    title: 'Données personnelles :',
    text: 'Les informations transmises via les formulaires de contact et de réservation sont strictement destinées à la gestion des inscriptions et ne sont jamais cédées ni vendues à des tiers.',
  },
];

const FooterTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="overline" sx={{ color: '#FFFFFF', display: 'block', mb: 2 }}>
    {children}
  </Typography>
);

const FooterIconButton = (
  props: ComponentProps<typeof IconButton> & {
    component?: 'a';
    href?: string;
    target?: string;
    rel?: string;
  },
) => (
  <IconButton
    {...props}
    size="small"
    sx={{
      bgcolor: NATURAL_PALETTE.mossDark,
      color: '#FFFFFF',
      '&:hover': { bgcolor: 'primary.main' },
    }}
  />
);

export const Footer = () => {
  const [showMentions, setShowMentions] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: NATURAL_PALETTE.forest,
        pt: { xs: 8, md: 10 },
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={5}
          sx={{ pb: 6, borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}` }}
        >
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Logo />
                <Box>
                  <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                    Yoga-Sof
                  </Typography>
                  <Typography variant="overline" sx={{ color: NATURAL_PALETTE.sageLight }}>
                    Hésingue
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" sx={{ color: NATURAL_PALETTE.mist }}>
                Studio de Hatha Yoga et Yoga Sans Dégâts selon la méthode De Gasquet. Séances pour
                adultes en petits groupes (4-6 personnes), yoga enfants, ateliers parent-enfant.
              </Typography>

              <Stack direction="row" spacing={1.5}>
                {[
                  { href: CONTACT_INFO.socials.facebook, icon: Facebook },
                  { href: CONTACT_INFO.socials.instagram, icon: Instagram },
                ].map(({ href, icon: Icon }) => (
                  <FooterIconButton
                    key={href}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon size={16} />
                  </FooterIconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3, lg: 2 }}>
            <FooterTitle>Navigation</FooterTitle>
            <Stack spacing={1.25}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  underline="none"
                  sx={{ color: NATURAL_PALETTE.mist, '&:hover': { color: '#FFFFFF' } }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3, lg: 3 }}>
            <FooterTitle>Créneaux Principaux</FooterTitle>
            <Stack spacing={1.5} sx={{ color: NATURAL_PALETTE.mist }}>
              {SCHEDULE.map(({ label, value }, i) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    ...(i < SCHEDULE.length - 1 && {
                      borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}`,
                      pb: 0.75,
                    }),
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'inherit' }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <FooterTitle>Contact & Adresses</FooterTitle>
            <Stack spacing={1.5} sx={{ color: NATURAL_PALETTE.mist }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Phone size={14} color={NATURAL_PALETTE.moss} />
                <Link
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                  underline="none"
                  sx={{ color: 'inherit', '&:hover': { color: '#FFFFFF' } }}
                >
                  {CONTACT_INFO.phone}
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Mail size={14} color={NATURAL_PALETTE.moss} />
                <Link
                  href={`mailto:${CONTACT_INFO.email}`}
                  underline="none"
                  sx={{ color: 'inherit', '&:hover': { color: '#FFFFFF' } }}
                >
                  {CONTACT_INFO.email}
                </Link>
              </Stack>
              {LOCATIONS.map(({ name, address }) => (
                <Stack key={name} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    component={MapPin}
                    sx={{ width: 14, height: 14, color: NATURAL_PALETTE.moss, mt: '2px' }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}
                    >
                      {name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'inherit' }}>
                      {address}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            color: NATURAL_PALETTE.sageLight,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'inherit' }}>
              Yoga-Sof
            </Typography>
            <Typography variant="caption" sx={{ color: 'inherit' }}>
              •
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowMentions(true)}
              sx={{ color: 'inherit', textDecoration: 'underline', p: 0, minWidth: 'auto' }}
            >
              Mentions Légales
            </Button>
          </Stack>

          <FooterIconButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ArrowUp size={14} />
          </FooterIconButton>
        </Box>
      </Container>

      <Dialog
        open={showMentions}
        onClose={() => setShowMentions(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { p: 1 } } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">Mentions Légales & Confidentialité</Typography>
          <IconButton onClick={() => setShowMentions(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: 'text.secondary' }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {MENTIONS.map(({ title, text }) => (
              <Typography key={title} variant="body2">
                <Box component="strong" sx={{ color: 'text.primary' }}>
                  {title}
                </Box>{' '}
                {text}
              </Typography>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setShowMentions(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
