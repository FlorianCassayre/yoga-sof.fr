'use client';

import { Button, Stack, Typography } from '@mui/material';
import { COURSE_TYPE_LABELS } from '@yoga-sof/core';
import { dateTimeFormatter } from '@yoga-sof/ui/dateTimeFormatter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { api } from '../../server/api';
import { VisibilityChip } from './visibility/VisibilityChip';

interface CoursePageProps {
  id: string;
}

export const CoursePage = ({ id }: CoursePageProps) => {
  const course = api.course.get.useQuery({ id });

  if (course.isPending) {
    return null;
  }

  if (!course.data) {
    notFound();
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5">Séance</Typography>
        <Button component={Link} href={`/seances/${id}/edition`} variant="contained">
          Modifier
        </Button>
      </Stack>
      <Stack spacing={0.5}>
        <Typography>Type : {COURSE_TYPE_LABELS[course.data.type]}</Typography>
        <Typography>Début : {dateTimeFormatter.format(course.data.startsAt)}</Typography>
        <Typography>Fin : {dateTimeFormatter.format(course.data.endsAt)}</Typography>
        <Typography>Capacité : {course.data.capacity}</Typography>
        <Typography>Inscrits : {course.data.registeredCount}</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>Visibilité :</Typography>
          <VisibilityChip visibility={course.data.visibility} />
        </Stack>
        {course.data.internalNotes.length > 0 && (
          <Typography>Notes : {course.data.internalNotes}</Typography>
        )}
      </Stack>
    </Stack>
  );
};
