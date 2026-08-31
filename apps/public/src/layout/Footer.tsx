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
import { useState } from 'react';

import { CONTACT_INFO } from '../config';
import { NATURAL_PALETTE } from '../theme';
import { Logo } from './Logo';

export const Footer = () => {
  const [showMentions, setShowMentions] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: NATURAL_PALETTE.forest,
        pt: { xs: 8, md: 10 },
        pb: 6,
        borderTop: `1px solid ${NATURAL_PALETTE.mossDark}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={5}
          sx={{ pb: 6, borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}` }}
        >
          {/* Col 1: Brand & Presentation */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Logo />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.1 }}
                  >
                    Yoga-Sof
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: NATURAL_PALETTE.sageLight,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Hésingue
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body2"
                sx={{ color: '#C5C5B5', lineHeight: 1.6, fontSize: '0.8125rem' }}
              >
                Studio de Hatha Yoga et Yoga Sans Dégâts selon la méthode De Gasquet. Séances pour
                adultes en petits groupes (4-6 personnes), yoga enfants, ateliers parent-enfant.
              </Typography>

              <Stack direction="row" spacing={1.5}>
                <IconButton
                  component="a"
                  href={CONTACT_INFO.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  sx={{
                    bgcolor: NATURAL_PALETTE.mossDark,
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: 'primary.main' },
                  }}
                >
                  <Facebook size={16} />
                </IconButton>
                <IconButton
                  component="a"
                  href={CONTACT_INFO.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  sx={{
                    bgcolor: NATURAL_PALETTE.mossDark,
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: 'primary.main' },
                  }}
                >
                  <Instagram size={16} />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          {/* Col 2: Navigation Links */}
          <Grid size={{ xs: 6, md: 3, lg: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Navigation
            </Typography>
            <Stack spacing={1.25}>
              {[
                { href: '#methode', label: 'Méthode De Gasquet' },
                { href: '#cours', label: 'Nos Cours' },
                { href: '#planning', label: 'Planning Hebdo' },
                { href: '#tarifs', label: 'Tarifs & Carnets' },
                { href: '#sophie', label: 'Sophie Richaud' },
                { href: '#lieux', label: 'Lieux à Hésingue' },
                { href: '#contact', label: 'Contact & Inscription' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  underline="none"
                  sx={{ color: '#C5C5B5', fontSize: '0.8125rem', '&:hover': { color: '#FFFFFF' } }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 3: Practical Hours */}
          <Grid size={{ xs: 6, md: 3, lg: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Créneaux Principaux
            </Typography>
            <Stack spacing={1.5} sx={{ fontSize: '0.8125rem', color: '#C5C5B5' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}`,
                  pb: 0.75,
                }}
              >
                <Typography variant="caption" sx={{ color: 'inherit' }}>
                  Lundi/Mardi (Enfants)
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  17h15 - 18h15
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}`,
                  pb: 0.75,
                }}
              >
                <Typography variant="caption" sx={{ color: 'inherit' }}>
                  Mardi/Jeudi (Matin)
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  09h45 - 11h00
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}`,
                  pb: 0.75,
                }}
              >
                <Typography variant="caption" sx={{ color: 'inherit' }}>
                  Mercredi (Après-midi)
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  16h00 & 17h45
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${NATURAL_PALETTE.mossDark}`,
                  pb: 0.75,
                }}
              >
                <Typography variant="caption" sx={{ color: 'inherit' }}>
                  Jeudi (Fin d'aprèm)
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  16h30 - 17h45
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'inherit' }}>
                  Samedi (Parent-Enfant)
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  10h00 (Mensuel)
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Col 4: Contact & Locations */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Contact & Adresses
            </Typography>
            <Stack spacing={1.5} sx={{ fontSize: '0.8125rem', color: '#C5C5B5' }}>
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
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', pt: 0.5 }}>
                <Box
                  component={MapPin}
                  sx={{
                    width: 14,
                    height: 14,
                    color: NATURAL_PALETTE.moss,
                    mt: '2px',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}
                  >
                    Studio (adultes)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'inherit' }}>
                    8 rue des Moissonneurs, 68220 Hésingue
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Box
                  component={MapPin}
                  sx={{
                    width: 14,
                    height: 14,
                    color: NATURAL_PALETTE.moss,
                    mt: '2px',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}
                  >
                    La Comète (enfants)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'inherit' }}>
                    16 rue du 20 Novembre, 68220 Hésingue
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            fontSize: '0.75rem',
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
              sx={{
                color: 'inherit',
                textDecoration: 'underline',
                p: 0,
                minWidth: 'auto',
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Mentions Légales
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={scrollToTop}
              aria-label="Retour en haut de page"
              sx={{
                bgcolor: NATURAL_PALETTE.mossDark,
                color: '#FFFFFF',
                '&:hover': { bgcolor: 'primary.main' },
              }}
            >
              <ArrowUp size={14} />
            </IconButton>
          </Stack>
        </Box>
      </Container>

      {/* Legal Mentions Dialog */}
      <Dialog
        open={showMentions}
        onClose={() => setShowMentions(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Mentions Légales & Confidentialité
          </Typography>
          <IconButton onClick={() => setShowMentions(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">
              <Box component="strong" sx={{ color: 'text.primary' }}>
                Éditeur du site :
              </Box>{' '}
              Association Yoga-Sof (Loi 1901), domiciliée au 8 rue des Moissonneurs, 68220 Hésingue.
            </Typography>
            <Typography variant="body2">
              <Box component="strong" sx={{ color: 'text.primary' }}>
                Responsable de la publication :
              </Box>{' '}
              Sophie Richaud-Cassayre (contact@yoga-sof.fr - 06 58 48 33 45).
            </Typography>
            <Typography variant="body2">
              <Box component="strong" sx={{ color: 'text.primary' }}>
                Enseignements :
              </Box>{' '}
              Enseignement du Hatha Yoga et de la méthode Yoga Sans Dégâts certifiée par l'Institut
              De Gasquet (Paris).
            </Typography>
            <Typography variant="body2">
              <Box component="strong" sx={{ color: 'text.primary' }}>
                Données personnelles :
              </Box>{' '}
              Les informations transmises via les formulaires de contact et de réservation sont
              strictement destinées à la gestion des inscriptions et ne sont jamais cédées ni
              vendues à des tiers.
            </Typography>
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
