'use client';

import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Calendar, CheckCircle2, Clock, MapPin, Sparkles, Users } from 'lucide-react';

import { COURSES } from '../config';
import { NATURAL_PALETTE } from '../theme';

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
        borderTop: `1px solid ${NATURAL_PALETTE.border}`,
        borderBottom: `1px solid ${NATURAL_PALETTE.border}`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack
          spacing={2}
          sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 780, mx: 'auto', mb: 7 }}
        >
          <Chip
            icon={<Sparkles size={14} color={NATURAL_PALETTE.moss} />}
            label="Nos Enseignements & Formats"
            sx={{
              bgcolor: NATURAL_PALETTE.surfaceHighlight,
              color: NATURAL_PALETTE.forest,
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          />

          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
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

        {/* Classes Grid */}
        <Grid container spacing={4}>
          {COURSES.map((course) => (
            <Grid size={{ xs: 12, md: 6 }} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${NATURAL_PALETTE.border}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(44, 48, 34, 0.08)',
                  },
                }}
              >
                {/* Image Header */}
                <Box sx={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={course.image}
                    alt={course.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(44,48,34,0.3)' }} />
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Chip
                      label={course.trialPrice}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.92)',
                        color: 'text.primary',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, color: '#fff' }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.85)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      {getCategoryLabel(course.category)}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {course.title}
                    </Typography>
                  </Box>
                </Box>

                {/* Card Body */}
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    {course.subtitle}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2.5 }}
                  >
                    {course.description}
                  </Typography>

                  {/* Highlights checklist */}
                  <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                    {course.benefits.map((b, i) => (
                      <Stack direction="row" spacing={1} key={i} sx={{ alignItems: 'flex-start' }}>
                        <SvgIcon>
                          <CheckCircle2 size={15} color={NATURAL_PALETTE.moss} />
                        </SvgIcon>

                        <Typography
                          variant="caption"
                          sx={{ color: 'text.primary', fontWeight: 500 }}
                        >
                          {b}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Quick Meta Info */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: NATURAL_PALETTE.canvas,
                      border: `1px solid ${NATURAL_PALETTE.border}`,
                      mb: 2.5,
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          <Users size={14} color={NATURAL_PALETTE.moss} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                          >
                            {course.groupSize}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          <Clock size={14} color={NATURAL_PALETTE.moss} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                          >
                            {course.duration}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ alignItems: 'center', pt: 0.5 }}
                        >
                          <MapPin size={14} color={NATURAL_PALETTE.moss} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {course.locationName}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Actions */}
                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" sx={{ py: 1.2, px: 2, flexShrink: 0 }}>
                      Détails
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Calendar />}
                      sx={{ py: 1.2, fontWeight: 700 }}
                    >
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
