import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Assignment, Event, People, Person } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { UserGrid } from '../../../components/grid/grids/UserGrid';
import { CourseRegistrationGrid } from '../../../components/grid/grids/CourseRegistrationGrid';

export default function AdminCourseRegistrations() {
  return (
    <BackofficeContent
      title="Inscriptions"
      icon={<Assignment />}
      actions={[
        { icon: <Assignment />, name: 'Inscrire un utilisateur', url: '/administration/inscriptions/creation' }
      ]}
    >
      <Typography paragraph>
        Liste des inscriptions passées et futures à des séances programmées.
      </Typography>
      <CourseRegistrationGrid />
    </BackofficeContent>
  );
}
