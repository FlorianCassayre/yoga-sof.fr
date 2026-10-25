import { Box, Button, Card, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Calendar, CheckCircle2, Clock, MapPin, Sparkles, Users } from 'lucide-react';

import { NATURAL_PALETTE } from '../../theme/palette';
import { COURSES } from '../course/courses';

const MetaItem = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
    <Icon size={14} color={NATURAL_PALETTE.moss} />
    <Typography variant="caption" sx={{ color: 'text.primary' }}>
      {label}
    </Typography>
  </Stack>
);

export const HomeCoursesSection = () => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'adulte':
        return 'Adultes & Seniors';
      case 'enfant':
        return 'Enfants 6-14 ans';
      case 'parent-enfant':
        return 'Duo Parent-Enfant';
      case 'particulier':
        return 'Sur-Mesure & Entreprises';
      default:
        return 'Tous Niveaux';
    }
  };

  return (
    <Box
      id="cours"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: NATURAL_PALETTE.surfaceSubtle,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 780, mx: 'auto', mb: 7 }}
        >
          <Chip
            icon={<Sparkles size={14} color={NATURAL_PALETTE.moss} />}
            label="Nos Enseignements & Formats"
          />

          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Des cours adaptés à chaque{' '}
            <Box
              component="span"
              sx={{ fontStyle: 'italic', color: 'primary.main', fontWeight: 400 }}
            >
              âge et condition physique
            </Box>
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Des tout-petits aux adultes de tout âge, en effectifs très réduits pour garantir
            attention, sécurité et bienveillance.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {COURSES.map((course) => (
            <Grid size={{ xs: 12, md: 6 }} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'relative', height: 210 }}>
                  <Box
                    component="img"
                    src={course.image}
                    alt={course.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(44,48,34,0.3)' }} />
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Chip label={course.trialPrice} size="small" sx={{ bgcolor: '#FFFFFF' }} />
                  </Box>
                  <Box
                    sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, color: '#fff' }}
                  >
                    <Typography variant="overline">{getCategoryLabel(course.category)}</Typography>
                    <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                      {course.title}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', mb: 1 }}>
                    {course.subtitle}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2.5 }}>
                    {course.description}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                    {course.benefits.map((b, i) => (
                      <Stack direction="row" spacing={1} key={i} sx={{ alignItems: 'flex-start' }}>
                        <CheckCircle2 size={15} color={NATURAL_PALETTE.moss} />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.primary', fontWeight: 500 }}
                        >
                          {b}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: NATURAL_PALETTE.canvas, mb: 2.5 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <MetaItem icon={Users} label={course.groupSize} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetaItem icon={Clock} label={course.duration} />
                      </Grid>
                      <Grid size={{ xs: 12 }} sx={{ pt: 0.5 }}>
                        <MetaItem icon={MapPin} label={course.locationName} />
                      </Grid>
                    </Grid>
                  </Paper>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined">Détails</Button>
                    <Button variant="contained" startIcon={<Calendar />}>
                      Réserver
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
