import { Box, Button, Card, Container, Grid, Stack, Typography } from '@mui/material';
import { Calendar, Heart, MapPin, ShieldCheck } from 'lucide-react';

import { NATURAL_PALETTE } from '../../theme/palette';

export const HomeIntroductionSection = () => {
  return (
    <Box component="section" sx={{ pt: { xs: 14, md: 20 }, pb: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, lg: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={3}>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
                Retrouvez un dos libre & une respiration{' '}
                <Box
                  component="span"
                  sx={{ fontStyle: 'italic', color: 'primary.main', fontWeight: 400 }}
                >
                  profonde
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 580,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                }}
              >
                Hatha Yoga postural et préventif selon l'approche certifiée du{' '}
                <strong>Dr Bernadette de Gasquet</strong>. Séances en effectif réduit (4 à 6
                personnes) pour préserver vos articulations, apaiser le mental et renforcer en
                douceur.
              </Typography>

              <Button variant="contained" size="large" startIcon={<Calendar size={18} />}>
                Réserver un cours d'essai (10€)
              </Button>

              <Grid container spacing={2} sx={{ pt: 2 }}>
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Méthode De Gasquet',
                    subtitle: 'Sans pression abdominale néfaste',
                  },
                  {
                    icon: Heart,
                    title: 'Effectifs Réduits',
                    subtitle: '4 à 6 élèves par cours',
                  },
                  {
                    icon: MapPin,
                    title: 'Hésingue Centre',
                    subtitle: 'Alsace • 3 Frontières (Bâle)',
                  },
                ].map((pillar, i) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={i}>
                    <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <pillar.icon size={16} color={NATURAL_PALETTE.moss} />
                        <Typography variant="subtitle2">{pillar.title}</Typography>
                      </Stack>
                      <Typography variant="caption">{pillar.subtitle}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: 'relative', mx: 'auto', maxWidth: { xs: 440, lg: 'none' } }}>
              <Card
                sx={{
                  borderTopLeftRadius: 120,
                  borderTopRightRadius: 120,
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '4/5',
                  border: '10px solid white',
                }}
              >
                <Box
                  component="img"
                  src="/images/bouda-tailleur.jpg"
                  alt="Séance de yoga douce avec Sophie"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(44,48,34,0.7) 0%, rgba(44,48,34,0) 45%)',
                  }}
                />
                <Box sx={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: '#fff' }}>
                  <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                    Sophie Richaud-Cassayre
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Enseignante Certifiée Institut De Gasquet Paris & Hatha Yoga
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
