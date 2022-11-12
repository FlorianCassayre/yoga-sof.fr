import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Dashboard } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { CourseModelCards } from '../../components/CourseModelCards';
import { CourseGrid } from '../../components/grid/grids/CourseGrid';
import { CourseRegistrationEventGrid } from '../../components/grid/grids/CourseRegistrationEventGrid';

const AdminHomeContent: React.FC = () => {
  return (
    <BackofficeContent
      title="Aperçu"
      icon={<Dashboard />}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Planning ordinaire
      </Typography>
      <CourseModelCards readOnly />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Prochaines séances
      </Typography>
      <CourseGrid future readOnly />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Dernières inscriptions et désinscriptions
      </Typography>
      <CourseRegistrationEventGrid readOnly />
    </BackofficeContent>
  );
};

export default function AdminHome() {
  return (
    <AdminHomeContent />
  );
}
