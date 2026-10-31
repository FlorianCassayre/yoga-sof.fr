'use client';

import { Stack, Typography } from '@mui/material';
import { COURSE_TYPE_LABELS, dateTimeFormatter } from '@yoga-sof/core';
import { CalendarPlus, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';

import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { CourseIcon } from './CourseIcon';
import { VisibilityChip } from './visibility/VisibilityChip';

interface CoursePageProps {
  id: string;
}

export const CoursePage = ({ id }: CoursePageProps) => {
  const course = api.course.get.useQuery({ id });

  if (course.isPending) {
    return null;
  }

  if (isNotFoundError(course.error)) {
    notFound();
  }

  if (!course.data) {
    return null;
  }

  return (
    <PageLayout
      icon={CourseIcon}
      title="Séance"
      actions={[
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/seances/${id}/edition` },
            {
              label: 'Inscrire des utilisateurs',
              icon: CalendarPlus,
              href: `/inscriptions/creation/${id}`,
              fab: true,
            },
          ],
        },
      ]}
    >
      <Stack spacing={3}>
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
        <Stack spacing={2}>
          <Typography variant="h6">Inscriptions</Typography>
          <CourseUserRegistrationGrid courseId={course.data.id} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Historique</Typography>
          <CourseUserRegistrationEventGrid courseId={course.data.id} />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
