import React from 'react';
import { courses } from '../common/courses';
import { CourseType } from '@prisma/client';
import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import { CourseTypeNames } from '../../../lib/common/newCourse';
import Link from 'next/link';
import { Assignment } from '@mui/icons-material';
import { InformationTable } from '../../InformationTable';

interface CourseSectionProps {
  course: typeof courses[CourseType];
  imageUrl: string;
  children: React.ReactNode;
}

export const CourseSection: React.FC<CourseSectionProps> = ({ course, imageUrl, children }) => {
  const { type, anchor, isRegistrationOnline, notStarted, age, level, group, duration, price, location, stuff, registration } = course;

  const bullets: { title: string, content: React.ReactNode }[] = [];

  return (
    <Card elevation={4} sx={{ mt: 2, display: { xs: 'inherit', md: 'flex' } }} id={anchor}>
      <CardContent sx={{ flex: 1 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
          {CourseTypeNames[type]}
        </Typography>
        {children}
        {!notStarted && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={5}>
              <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
                Détails
              </Typography>
              <InformationTable rows={[
                { header: 'Âge', value: age },
                { header: 'Niveau', value: level },
                { header: 'Groupe', value: group },
                { header: 'Durée', value: duration },
                { header: 'Tarif', value: price },
              ]} />
            </Grid>
            <Grid item xs={12} sm={7}>
              <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
                Informations pratiques
              </Typography>
              <InformationTable rows={[
                { header: 'Dates', value: 'TODO' },
                { header: 'Lieu', value: location },
                { header: 'Matériel à amener', value: stuff },
                { header: 'Inscription', value: registration },
              ]} />
            </Grid>
          </Grid>
        )}
        {isRegistrationOnline && (
          <Box textAlign="center">
            <Link href="/inscription" passHref>
              <Button variant="outlined" startIcon={<Assignment />}>Inscription en ligne</Button>
            </Link>
          </Box>
        )}
      </CardContent>
      <CardMedia
        component="img"
        sx={{ width: { md: 200 }, height: { xs: 0, md: 'inherit' } }}
        image={imageUrl}
        alt={CourseTypeNames[type]}
      />
    </Card>
  );
};
