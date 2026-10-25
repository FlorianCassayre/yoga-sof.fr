'use client';

import { Stack, Typography } from '@mui/material';
import { CalendarPlus } from 'lucide-react';

import { CreateFab } from '../../components/CreateFab';
import { CourseGrid } from './CourseGrid';

export const CoursesPage = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Séances</Typography>
      <CourseGrid />
      <CreateFab
        items={[
          { icon: <CalendarPlus size={20} />, label: 'Nouvelle séance', href: '/seances/creation' },
        ]}
      />
    </Stack>
  );
};
