'use client';

import { Stack, Typography } from '@mui/material';

import { CourseForm } from './CourseForm';

interface CourseEditPageProps {
  id: string;
}

export const CourseEditPage = ({ id }: CourseEditPageProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Modifier la séance</Typography>
      <CourseForm id={Number(id)} />
    </Stack>
  );
};
