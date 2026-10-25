'use client';

import { Stack, Typography } from '@mui/material';

import { CourseForm } from './CourseForm';

export const CourseCreatePage = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Nouvelle séance</Typography>
      <CourseForm />
    </Stack>
  );
};
