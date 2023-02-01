import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Assignment } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { CourseRegistrationEventGrid } from '../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../components/grid/grids/CourseRegistrationGrid';

export default function AdminCourseRegistrations() {
  return (
    <BackofficeContent
      title="Inscriptions"
      icon={<Assignment />}
      quickActions={[
        { icon: <Assignment />, name: 'Inscrire des utilisateurs à des séances', url: '/administration/inscriptions/creation' }
      ]}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Derniers mouvements
      </Typography>
      <Typography paragraph>
        Dernières inscriptions ou désinscriptions à des séances programmées.
      </Typography>
      <CourseRegistrationEventGrid />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Inscriptions actives
      </Typography>
      <Typography paragraph>
        Liste des inscriptions actives à des séances programmées.
        Vous pouvez vous rendre sur la page d'une séance ou d'un utilisateur afin de filtrer ces données.
      </Typography>
      <CourseRegistrationGrid />
    </BackofficeContent>
  );
}
